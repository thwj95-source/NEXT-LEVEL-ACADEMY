import re
import os
import xml.etree.ElementTree as ET

SRC = r"C:\Users\45297\Desktop\ClaudeCodeTest\FootballIQ — Find din spillertype_files\assets\Card\Design uden navn.svg"
DST = r"C:\Users\45297\Desktop\ClaudeCodeTest\FootballIQ — Find din spillertype_files\assets\Card\frame.SAFE.svg"

NS = {
    'svg': 'http://www.w3.org/2000/svg',
    'xlink': 'http://www.w3.org/1999/xlink',
}
ET.register_namespace('', 'http://www.w3.org/2000/svg')
ET.register_namespace('xlink', 'http://www.w3.org/1999/xlink')
ET.register_namespace('xml', 'http://www.w3.org/XML/1998/namespace')

# We work on raw text for reliable attribute manipulation,
# then parse for counting/validation.

with open(SRC, 'r', encoding='utf-8') as f:
    raw = f.read()

orig_size = os.path.getsize(SRC)

# ── STEP 1: Remove base64 <image> elements ─────────────────────────────────
raw = re.sub(r'<image\b[^>]*xlink:href="data:image/[^"]*base64[^"]*"[^/]*/>', '', raw, flags=re.DOTALL)
raw = re.sub(r'<image\b[^>]*xlink:href="data:image/[^"]*base64[^"]*"[^>]*>.*?</image>', '', raw, flags=re.DOTALL)

# ── STEP 2: Remove large background <rect> elements (width starts with 365) ─
raw = re.sub(r'<rect\b[^>]*width="365[^"]*"[^/]*/>', '', raw, flags=re.DOTALL)
raw = re.sub(r'<rect\b[^>]*width="365[^"]*"[^>]*>.*?</rect>', '', raw, flags=re.DOTALL)

# ── STEPS 3 & 4 (bbox-based): Parse and remove paths by fill + bbox ────────
# We'll use a parse-based approach for path removal.
# Re-parse after text cleanup so far.
tree = ET.parse(SRC)  # parse original for bbox logic; we'll apply removals to raw later
root_orig = tree.getroot()

SVG_NS = 'http://www.w3.org/2000/svg'

def get_attr(el, *names):
    for n in names:
        v = el.get(n)
        if v: return v
        v = el.get('{http://www.w3.org/2000/svg}' + n)
        if v: return v
    return None

def parse_d_bbox_width(d):
    """Rough bounding-box width from path d attribute (absolute coords only)."""
    nums = re.findall(r'[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?', d)
    nums = [float(x) for x in nums]
    if len(nums) < 2:
        return 0
    xs = nums[::2]
    if not xs:
        return 0
    return max(xs) - min(xs)

def has_stroke_f16800(el):
    stroke = el.get('stroke', '')
    style = el.get('style', '')
    return '#f16800' in stroke or '#f16800' in style

# Collect path IDs to remove (large background fills, small junk)
ids_to_remove = set()

for el in root_orig.iter(f'{{{SVG_NS}}}path'):
    if has_stroke_f16800(el):
        continue  # NEVER touch frame paths
    fill = el.get('fill', '')
    d = el.get('d', '')
    width = parse_d_bbox_width(d)
    # Step 2b: large background (fill white or near-black, bbox > 200)
    if fill in ('#ffffff', '#030100') and width > 200:
        uid = el.get('id')
        if uid:
            ids_to_remove.add(uid)
    # Step 3: small junk (fill white, bbox < 6)
    if fill == '#ffffff' and 0 < width < 6:
        uid = el.get('id')
        if uid:
            ids_to_remove.add(uid)

# Remove those elements from raw by id
for uid in ids_to_remove:
    # self-closing
    raw = re.sub(rf'<path\b[^>]*\bid="{re.escape(uid)}"[^/]*/>', '', raw, flags=re.DOTALL)
    # open/close
    raw = re.sub(rf'<path\b[^>]*\bid="{re.escape(uid)}"[^>]*>.*?</path>', '', raw, flags=re.DOTALL)

# Also remove large background paths WITHOUT id (match by fill + large d coords)
# We do this carefully: only paths with fill="#ffffff" or fill="#030100", no stroke="#f16800"
def remove_anon_large_bg_paths(text):
    def replacer(m):
        tag = m.group(0)
        if 'stroke="#f16800"' in tag or "stroke='#f16800'" in tag:
            return tag  # protect frame
        fill_m = re.search(r'\bfill="(#ffffff|#030100)"', tag)
        if not fill_m:
            return tag
        d_m = re.search(r'\bd="([^"]*)"', tag)
        if not d_m:
            return tag
        w = parse_d_bbox_width(d_m.group(1))
        if w > 200:
            return ''
        return tag
    return re.sub(r'<path\b[^>]*/>', replacer, text, flags=re.DOTALL)

raw = remove_anon_large_bg_paths(raw)

# Small junk anonymous paths (fill=#ffffff, bbox < 6)
def remove_anon_small_junk_paths(text):
    def replacer(m):
        tag = m.group(0)
        if 'stroke="#f16800"' in tag or "stroke='#f16800'" in tag:
            return tag
        fill_m = re.search(r'\bfill="#ffffff"', tag)
        if not fill_m:
            return tag
        d_m = re.search(r'\bd="([^"]*)"', tag)
        if not d_m:
            return tag
        w = parse_d_bbox_width(d_m.group(1))
        if 0 < w < 6:
            return ''
        return tag
    return re.sub(r'<path\b[^>]*/>', replacer, text, flags=re.DOTALL)

raw = remove_anon_small_junk_paths(raw)

# ── STEP 5: Remove zoomAndPan and version from <svg> tag ───────────────────
raw = re.sub(r'\s+zoomAndPan="[^"]*"', '', raw)
raw = re.sub(r'\s+version="[^"]*"', '', raw)

# ── STEP 6: Theming — replace stroke="#f16800" with CSS var ────────────────
raw = raw.replace('stroke="#f16800"', 'stroke="var(--frame, #f16800)"')

# ── STEP 7: Add class="card-frame" to root <svg> tag ───────────────────────
raw = re.sub(r'(<svg\b)', r'\1 class="card-frame"', raw, count=1)

# ── STEP 8: Remove unused clipPaths ────────────────────────────────────────
# Find all clip-path references
used_ids = set(re.findall(r'clip-path="url\(#([^)]+)\)"', raw))

def remove_unused_clippath(text, used):
    def replacer(m):
        cp_id = re.search(r'\bid="([^"]+)"', m.group(0))
        if cp_id and cp_id.group(1) not in used:
            return ''
        return m.group(0)
    return re.sub(r'<clipPath\b[^>]*>.*?</clipPath>', replacer, text, flags=re.DOTALL)

raw = remove_unused_clippath(raw, used_ids)

# ── Write output ────────────────────────────────────────────────────────────
with open(DST, 'w', encoding='utf-8') as f:
    f.write(raw)

new_size = os.path.getsize(DST)

# ── Validation & reporting ──────────────────────────────────────────────────
try:
    tree2 = ET.fromstring(raw)
    valid_xml = True
except ET.ParseError as e:
    valid_xml = False
    print(f"XML ERROR: {e}")

# Count stroke-paths (now with CSS var)
stroke_paths = len(re.findall(r'<path\b[^>]*stroke="var\(--frame', raw))
# Also count any remaining #f16800 (should be 0)
remaining_orange = len(re.findall(r'stroke="#f16800"', raw))
# Count transforms
transforms = len(re.findall(r'\btransform="matrix\(', raw))
# Count base64 images
base64_count = len(re.findall(r'xlink:href="data:image/', raw))

print(f"Original størrelse : {orig_size:,} bytes ({orig_size/1024:.1f} KB)")
print(f"Ny størrelse       : {new_size:,} bytes ({new_size/1024:.1f} KB)")
print(f"Reduktion          : {orig_size - new_size:,} bytes ({(1 - new_size/orig_size)*100:.1f}%)")
print(f"stroke-paths       : {stroke_paths} (skal være 55)")
print(f"Ubehandlede #f16800: {remaining_orange} (skal være 0)")
print(f"transforms bevaret : {transforms} (skal være ~56)")
print(f"base64-elementer   : {base64_count} (skal være 0)")
print(f"Valid XML          : {valid_xml}")
print(f"Gemt som           : {DST}")
