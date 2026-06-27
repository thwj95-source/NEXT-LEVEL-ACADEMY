$src = Join-Path $PSScriptRoot "frame.clean.svg"
$xml = [xml](Get-Content $src -Raw -Encoding UTF8)

function Get-Fill($node) {
    $n = $node
    while ($n -ne $null -and $n.NodeType -eq [System.Xml.XmlNodeType]::Element) {
        $f = $n.GetAttribute("fill")
        if ($f -and $f -ne "") { return $f }
        $s = $n.GetAttribute("style")
        if ($s -match "fill:([^;]+)") { return $Matches[1].Trim() }
        $n = $n.ParentNode
    }
    return "inherited/none"
}

function Get-BBox($d) {
    $rx   = [System.Text.RegularExpressions.Regex]("[0-9]+\.?[0-9]*")
    $nums = $rx.Matches($d) | ForEach-Object { [double]$_.Value }
    if ($nums.Count -lt 2) { return @{W=0;H=0;Area=0} }
    $xs = @(); $ys = @()
    for ($i = 0; $i+1 -lt $nums.Count; $i += 2) { $xs += $nums[$i]; $ys += $nums[$i+1] }
    $w = ($xs | Measure-Object -Maximum).Maximum - ($xs | Measure-Object -Minimum).Minimum
    $h = ($ys | Measure-Object -Maximum).Maximum - ($ys | Measure-Object -Minimum).Minimum
    $w = [math]::Abs($w); $h = [math]::Abs($h)
    return @{ W=[math]::Round($w,1); H=[math]::Round($h,1); Area=[math]::Round($w*$h,0) }
}

$CARD = 405.75 * 406.5
$rows = [System.Collections.ArrayList]::new()
$allEls = @($xml.GetElementsByTagName("path")) + @($xml.GetElementsByTagName("rect"))

foreach ($el in $allEls) {
    $tag  = $el.LocalName
    $fill = Get-Fill $el
    $bb   = @{W=0;H=0;Area=0}
    $dLen = 0

    if ($tag -eq "path") {
        $d    = $el.GetAttribute("d")
        $dLen = $d.Length
        $bb   = Get-BBox $d
    } elseif ($tag -eq "rect") {
        $rw = try { [double]($el.GetAttribute("width"))  } catch { 0 }
        $rh = try { [double]($el.GetAttribute("height")) } catch { 0 }
        $bb = @{ W=[math]::Round($rw,1); H=[math]::Round($rh,1); Area=[math]::Round($rw*$rh,0) }
    }

    $pct = [math]::Round($bb.Area / $CARD * 100, 2)

    $cls = if     ($pct -gt 15)                         { "BACKGROUND" }
           elseif ($bb.W -gt 320 -or $bb.H -gt 320)    { "BACKGROUND" }
           elseif ($bb.Area -lt 1 -and $tag -eq "path") { "ARTIFACT"   }
           elseif ($bb.Area -lt 2000 -and $bb.W -lt 80) { "FRAME"      }
           else                                          { "UNSURE"     }

    [void]$rows.Add([PSCustomObject]@{
        Tag   = $tag
        Class = $cls
        Fill  = $fill
        W     = $bb.W
        H     = $bb.H
        Area  = $bb.Area
        Pct   = "$pct%"
        DLen  = $dLen
    })
}

"=== CLASSIFICATION SUMMARY ==="
$rows | Group-Object Class | Sort-Object Name |
    ForEach-Object { "$($_.Name): $($_.Count)" }
"Total elements: $($rows.Count)"

""
"=== FILLS BY CATEGORY ==="
foreach ($g in ($rows | Group-Object Class | Sort-Object Name)) {
    "$($g.Name):"
    $g.Group | Group-Object Fill | Sort-Object Count -Desc |
        ForEach-Object { "  $($_.Count)x  $($_.Name)" }
    ""
}

"=== TOP 20 LARGEST (bounding-box area) ==="
$rows | Sort-Object Area -Desc | Select-Object -First 20 |
    Format-Table Tag,Class,Fill,W,H,Pct -AutoSize

"=== FRAME paths ==="
$rows | Where-Object { $_.Class -eq "FRAME" } |
    Format-Table Tag,Fill,W,H,Pct,DLen -AutoSize

"=== UNSURE paths ==="
$rows | Where-Object { $_.Class -eq "UNSURE" } |
    Format-Table Tag,Fill,W,H,Pct,DLen -AutoSize

$art = ($rows | Where-Object { $_.Class -eq "ARTIFACT" } | Measure-Object).Count
"ARTIFACT count: $art (sub-1-unit Canva render junk)"
