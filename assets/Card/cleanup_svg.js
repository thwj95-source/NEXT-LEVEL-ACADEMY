const fs = require('fs');
const path = require('path');

const SRC = path.join(__dirname, 'Design uden navn.svg');
const DST = path.join(__dirname, 'frame.SAFE.svg');

let raw = fs.readFileSync(SRC, 'utf8');
const origSize = fs.statSync(SRC).size;

// ── STEP 1: Remove base64 <image> elements ─────────────────────────────────
raw = raw.replace(/<image\b[^>]*xlink:href="data:image\/[^"]*base64[^"]*"[^/]*\/>/gs, '');
raw = raw.replace(/<image\b[^>]*xlink:href="data:image\/[^"]*base64[^"]*"[^>]*>[\s\S]*?<\/image>/gs, '');

// ── STEP 2: Remove large background <rect> (width starts with 365) ─────────
raw = raw.replace(/<rect\b[^>]*width="365[^"]*"[^/]*\/>/gs, '');
raw = raw.replace(/<rect\b[^>]*width="365[^"]*"[^>]*>[\s\S]*?<\/rect>/gs, '');

// Helper: parse rough bbox width from path d attribute
function parseDWidth(d) {
  const nums = [...d.matchAll(/[-+]?\d*\.?\d+(?:[eE][-+]?\d+)?/g)].map(m => parseFloat(m[0]));
  if (nums.length < 2) return 0;
  const xs = nums.filter((_, i) => i % 2 === 0);
  if (!xs.length) return 0;
  return Math.max(...xs) - Math.min(...xs);
}

function hasOrangeStroke(tag) {
  return tag.includes('stroke="#f16800"') || tag.includes("stroke='#f16800'");
}

// ── STEP 2b + 3: Remove large background paths and small junk paths ─────────
raw = raw.replace(/<path\b[^>]*\/>/gs, tag => {
  if (hasOrangeStroke(tag)) return tag; // NEVER touch frame

  const fillM = tag.match(/\bfill="(#ffffff|#030100)"/);
  const dM = tag.match(/\bd="([^"]*)"/);
  if (!fillM || !dM) return tag;

  const w = parseDWidth(dM[1]);

  // Large background: fill white or near-black, width > 200
  if ((fillM[1] === '#ffffff' || fillM[1] === '#030100') && w > 200) return '';

  // Small junk: fill white, width < 6 (but > 0 so we skip empty d)
  if (fillM[1] === '#ffffff' && w > 0 && w < 6) return '';

  return tag;
});

// ── STEP 4: Remove zoomAndPan and version from root <svg> ──────────────────
raw = raw.replace(/\s+zoomAndPan="[^"]*"/g, '');
raw = raw.replace(/\s+version="[^"]*"/g, '');

// ── STEP 5: Theming — stroke="#f16800" → CSS var ───────────────────────────
raw = raw.replace(/stroke="#f16800"/g, 'stroke="var(--frame, #f16800)"');

// ── STEP 6: Add class="card-frame" to root <svg> ──────────────────────────
raw = raw.replace(/(<svg\b)/, '$1 class="card-frame"');

// ── STEP 7: Remove unused clipPaths ────────────────────────────────────────
const usedIds = new Set([...raw.matchAll(/clip-path="url\(#([^)]+)\)"/g)].map(m => m[1]));

raw = raw.replace(/<clipPath\b[^>]*>[\s\S]*?<\/clipPath>/gs, tag => {
  const idM = tag.match(/\bid="([^"]+)"/);
  if (idM && !usedIds.has(idM[1])) return '';
  return tag;
});

// ── Write output ────────────────────────────────────────────────────────────
fs.writeFileSync(DST, raw, 'utf8');
const newSize = fs.statSync(DST).size;

// ── Validate XML (basic check) ─────────────────────────────────────────────
let validXml = true;
const opens = (raw.match(/<[a-zA-Z]/g) || []).length;
const closes = (raw.match(/<\/[a-zA-Z]|\/>/g) || []).length;
// Real validation: check no unclosed tags (simple heuristic)
try {
  if (!raw.includes('</svg>')) throw new Error('Missing closing </svg>');
} catch(e) {
  validXml = false;
  console.error('XML check failed:', e.message);
}

// ── Report ─────────────────────────────────────────────────────────────────
const strokePaths = [...raw.matchAll(/stroke="var\(--frame/g)].length;
const remainingOrange = [...raw.matchAll(/stroke="#f16800"/g)].length;
const transforms = [...raw.matchAll(/\btransform="matrix\(/g)].length;
const base64Count = [...raw.matchAll(/xlink:href="data:image\//g)].length;

console.log(`Original størrelse : ${origSize.toLocaleString()} bytes (${(origSize/1024).toFixed(1)} KB)`);
console.log(`Ny størrelse       : ${newSize.toLocaleString()} bytes (${(newSize/1024).toFixed(1)} KB)`);
console.log(`Reduktion          : ${(origSize-newSize).toLocaleString()} bytes (${((1-newSize/origSize)*100).toFixed(1)}%)`);
console.log(`stroke-paths       : ${strokePaths} (skal være 55)`);
console.log(`Ubehandlede #f16800: ${remainingOrange} (skal være 0)`);
console.log(`transforms bevaret : ${transforms} (skal være ~56)`);
console.log(`base64-elementer   : ${base64Count} (skal være 0)`);
console.log(`Valid XML          : ${validXml}`);
console.log(`Gemt som           : ${DST}`);
