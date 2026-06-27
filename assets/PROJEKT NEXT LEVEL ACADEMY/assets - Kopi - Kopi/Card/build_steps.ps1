$dir   = $PSScriptRoot
$clean = Join-Path $dir "frame.clean.svg"
$step1 = Join-Path $dir "frame.step1.svg"
$red   = Join-Path $dir "frame.redtest.svg"

# ── helpers ────────────────────────────────────────────────────────────────────

function Get-BBoxArea($el) {
    if ($el.LocalName -eq "rect") {
        $w = try { [double]($el.GetAttribute("width"))  } catch { 0 }
        $h = try { [double]($el.GetAttribute("height")) } catch { 0 }
        return $w * $h
    }
    $d = $el.GetAttribute("d")
    if (-not $d) { return 0 }
    $rx   = [System.Text.RegularExpressions.Regex]("[0-9]+\.?[0-9]*")
    $nums = $rx.Matches($d) | ForEach-Object { [double]$_.Value }
    if ($nums.Count -lt 2) { return 0 }
    $xs = @(); $ys = @()
    for ($i = 0; $i+1 -lt $nums.Count; $i += 2) { $xs += $nums[$i]; $ys += $nums[$i+1] }
    $w = [math]::Abs(($xs | Measure-Object -Max).Maximum - ($xs | Measure-Object -Min).Minimum)
    $h = [math]::Abs(($ys | Measure-Object -Max).Maximum - ($ys | Measure-Object -Min).Minimum)
    return $w * $h
}

function Classify($el) {
    $tag  = $el.LocalName
    $area = Get-BBoxArea $el
    $CARD = 405.75 * 406.5
    $pct  = $area / $CARD * 100
    if ($tag -eq "rect") {
        $w = try { [double]($el.GetAttribute("width")) } catch { 0 }
        $h = try { [double]($el.GetAttribute("height")) } catch { 0 }
        if ($w -gt 320 -or $h -gt 320) { return "BACKGROUND" }
    }
    if ($pct -gt 15)                         { return "BACKGROUND" }
    if ($area -lt 1 -and $tag -eq "path")    { return "ARTIFACT"   }
    $d = $el.GetAttribute("d")
    $nums = if ($d) { ([System.Text.RegularExpressions.Regex]("[0-9]+\.?[0-9]*")).Matches($d) | ForEach-Object { [double]$_.Value } } else { @() }
    $w = 0
    if ($nums.Count -ge 2) {
        $xs = @(); for ($i=0; $i+1 -lt $nums.Count; $i+=2) { $xs += $nums[$i] }
        $w = [math]::Abs(($xs | Measure-Object -Max).Maximum - ($xs | Measure-Object -Min).Minimum)
    }
    if ($area -lt 2000 -and $w -lt 80)       { return "FRAME"      }
    return "UNSURE"
}

function Save-Xml($xml, $path) {
    $ws = New-Object System.Xml.XmlWriterSettings
    $ws.Indent = $true; $ws.IndentChars = "  "; $ws.NewLineChars = "`n"
    $ws.OmitXmlDeclaration = $false
    $ws.Encoding = [System.Text.UTF8Encoding]::new($false)
    $w = [System.Xml.XmlWriter]::Create($path, $ws)
    $xml.WriteTo($w); $w.Close()
}

# ── STEP 1: remove ARTIFACTs + oversized rects ────────────────────────────────

$xml1 = [xml](Get-Content $clean -Raw -Encoding UTF8)
$allEls = @($xml1.GetElementsByTagName("path")) + @($xml1.GetElementsByTagName("rect"))

$removedArtifact = 0; $removedBgRect = 0; $kept = 0
$toRemove = [System.Collections.ArrayList]::new()

foreach ($el in $allEls) {
    $cls = Classify $el
    if ($cls -eq "ARTIFACT") {
        [void]$toRemove.Add($el); $removedArtifact++
    } elseif ($cls -eq "BACKGROUND" -and $el.LocalName -eq "rect") {
        [void]$toRemove.Add($el); $removedBgRect++
    } else {
        $kept++
    }
}
foreach ($el in $toRemove) { $el.ParentNode.RemoveChild($el) | Out-Null }

Save-Xml $xml1 $step1
$sz1 = [math]::Round((Get-Item $step1).Length / 1024, 1)

"=== STEP 1 DONE: frame.step1.svg ==="
"  Removed ARTIFACT paths : $removedArtifact"
"  Removed oversized rects: $removedBgRect"
"  Elements kept           : $kept"
"  File size               : $sz1 KB"
""

# ── STEP 2: red-test copy with colour coding ──────────────────────────────────

$xml2    = [xml](Get-Content $step1 -Raw -Encoding UTF8)
$allEls2 = @($xml2.GetElementsByTagName("path")) + @($xml2.GetElementsByTagName("rect"))

$cntF=0; $cntB=0; $cntU=0
foreach ($el in $allEls2) {
    $cls = Classify $el
    switch ($cls) {
        "FRAME"      { $el.SetAttribute("fill","#ff0000"); $cntF++ }
        "BACKGROUND" { $el.SetAttribute("fill","#0000ff"); $cntB++ }
        "UNSURE"     { $el.SetAttribute("fill","#00ff00"); $cntU++ }
    }
}

Save-Xml $xml2 $red
$sz2 = [math]::Round((Get-Item $red).Length / 1024, 1)

"=== STEP 2 DONE: frame.redtest.svg ==="
"  FRAME paths coloured red   (#ff0000): $cntF"
"  BACKGROUND paths blue      (#0000ff): $cntB"
"  UNSURE paths green         (#00ff00): $cntU"
"  File size                           : $sz2 KB"
""

# ── verify originals untouched ────────────────────────────────────────────────

"=== ORIGINALS UNTOUCHED ==="
foreach ($f in @("4.svg","3.svg","2.svg","frame.clean.svg")) {
    $p = Join-Path $dir $f
    "  $f : $([math]::Round((Get-Item $p).Length/1024,1)) KB"
}
