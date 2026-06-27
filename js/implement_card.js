const fs = require('fs');
const path = require('path');

const ROOT     = __dirname;
const HTML_IN  = path.join(ROOT, 'quiz-result-standalone.html');
const SVG_PATH = path.join(ROOT, 'assets', 'Card', 'frame.SAFE.svg');

let html = fs.readFileSync(HTML_IN, 'utf8');

// Read SVG — strip optional XML declaration
let svgRaw = fs.readFileSync(SVG_PATH, 'utf8').trim();
svgRaw = svgRaw.replace(/^<\?xml[^?]*\?>\s*/i, '');

// Helper: use function replacement to avoid special-$ issues
function rep(src, oldStr, newStr) {
  const idx = src.indexOf(oldStr);
  if (idx === -1) { console.error('MARKER NOT FOUND: ' + oldStr.slice(0, 60)); process.exit(1); }
  return src.slice(0, idx) + newStr + src.slice(idx + oldStr.length);
}

// ════════════════════════════════════════════════════════
// A — Font links (Bebas Neue + Rajdhani) before </head>
// ════════════════════════════════════════════════════════
html = rep(html, '</head>',
`  <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@500;600;700&display=swap" rel="stylesheet">
</head>`);

// ════════════════════════════════════════════════════════
// B — New CSS — appended before </style>
// ════════════════════════════════════════════════════════
const NEW_CSS = `
    /* ============================================================
       FOOTBALLIQ — SPILLERKORT  |  Mobil-first: 390px
       ============================================================ */

    /* --- Tier CSS-variable --- */
    [data-tier="bronze"] {
      --frame:           #c8893a;
      --frame-secondary: #a06028;
      --frame-glow:      rgba(200,137,58,0.55);
      --card-bg-a:       #3d1f06;
      --card-bg-b:       #180900;
      --text-hi:         #f2d48a;
      --text-lo:         rgba(242,212,138,0.60);
    }
    [data-tier="silver"] {
      --frame:           #b4c8d8;
      --frame-secondary: #7a96aa;
      --frame-glow:      rgba(180,200,216,0.45);
      --card-bg-a:       #1c2830;
      --card-bg-b:       #081016;
      --text-hi:         #d0e4f4;
      --text-lo:         rgba(208,228,244,0.60);
    }
    [data-tier="gold"] {
      --frame:           #e8bf38;
      --frame-secondary: #c09010;
      --frame-glow:      rgba(232,191,56,0.65);
      --card-bg-a:       #3a2200;
      --card-bg-b:       #180e00;
      --text-hi:         #fde888;
      --text-lo:         rgba(253,232,136,0.60);
    }
    [data-tier="elite"] {
      --frame:           #b06ae8;
      --frame-secondary: #7a34c0;
      --frame-glow:      rgba(176,106,232,0.70);
      --card-bg-a:       #1e0838;
      --card-bg-b:       #0a0320;
      --text-hi:         #dfb8ff;
      --text-lo:         rgba(223,184,255,0.60);
    }
    [data-tier="legend"] {
      --frame:           #ff5a24;
      --frame-secondary: #cc2800;
      --frame-glow:      rgba(255,90,36,0.80);
      --card-bg-a:       #3a0800;
      --card-bg-b:       #160200;
      --text-hi:         #ff9a72;
      --text-lo:         rgba(255,154,114,0.60);
    }

    /* --- Scene --- */
    .result-scene {
      display: flex;
      justify-content: center;
      padding: 2.5rem 1rem 3rem;
    }

    /* --- Card wrapper --- */
    .card-wrapper {
      position: relative;
      width: min(280px, 72vw);
      aspect-ratio: 304.5 / 305.25;
      background: linear-gradient(
        155deg,
        var(--card-bg-a, #3a2200) 0%,
        var(--card-bg-b, #180e00) 100%
      );
      border-radius: 3px;
      filter:
        drop-shadow(0 0 10px var(--frame-glow, rgba(232,191,56,.6)))
        drop-shadow(0 0 30px color-mix(in srgb, var(--frame-glow, rgba(232,191,56,.6)) 40%, transparent));
      transition: filter .35s ease, transform .35s ease;
    }
    .card-wrapper:hover {
      filter:
        drop-shadow(0 0 18px var(--frame-glow))
        drop-shadow(0 0 48px color-mix(in srgb, var(--frame-glow) 55%, transparent));
      transform: translateY(-4px) scale(1.018);
    }

    /* --- Lag 1: radial top-gloed --- */
    .card-bg-glow {
      position: absolute; inset: 0;
      background: radial-gradient(
        ellipse 85% 52% at 50% 0%,
        color-mix(in srgb, var(--frame, #e8bf38) 16%, transparent),
        transparent 62%
      );
      border-radius: 3px;
      z-index: 1;
      pointer-events: none;
    }

    /* --- Lag 2: SVG kortramme --- */
    .card-frame {
      position: absolute; top: 0; left: 0;
      width: 100%; height: 100%;
      z-index: 2;
      pointer-events: none;
    }

    /* --- Lag 3: indhold --- */
    .card-content {
      position: absolute; inset: 0;
      z-index: 3;
      font-family: 'Rajdhani', 'Arial Narrow', Arial, sans-serif;
      color: var(--text-hi, #fde888);
    }

    /* OVR + position */
    .card-meta {
      position: absolute;
      top: 9%; left: 9%;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      line-height: 1;
      gap: 2px;
    }
    .card-ovr {
      font-family: 'Bebas Neue', Impact, sans-serif;
      font-size: clamp(1.9rem, 10vw, 2.7rem);
      color: var(--text-hi);
      letter-spacing: -1px;
      text-shadow: 0 0 8px color-mix(in srgb, var(--frame) 55%, transparent);
      line-height: 1;
    }
    .card-pos {
      font-size: clamp(0.55rem, 2.8vw, 0.75rem);
      font-weight: 700;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      color: var(--text-hi);
      opacity: 0.85;
    }

    /* Spillerbillede */
    .card-player-zone {
      position: absolute;
      top: 3%; left: 50%;
      transform: translateX(-50%);
      width: 60%; height: 55%;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }
    .card-player-img-wrap {
      height: 100%;
      display: flex;
      align-items: flex-end;
      justify-content: center;
    }
    .card-player-img {
      max-height: 100%; max-width: 100%;
      object-fit: contain;
      filter: drop-shadow(0 4px 12px rgba(0,0,0,0.55));
    }
    .card-player-fallback {
      height: 82%;
      color: var(--text-hi);
    }

    /* Bund-sektion */
    .card-lower {
      position: absolute;
      bottom: 5%; left: 0; right: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 3px;
      padding: 0 8%;
    }

    .card-name-wrap {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1px;
      width: 100%;
    }
    .card-name {
      font-size: clamp(0.75rem, 3.8vw, 1rem);
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: var(--text-hi);
      text-align: center;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }
    .card-tagline {
      font-size: clamp(0.42rem, 2vw, 0.58rem);
      font-weight: 500;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: var(--text-lo);
      text-align: center;
    }

    /* Stats 2x3 */
    .card-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: repeat(2, auto);
      column-gap: 6px;
      row-gap: 1px;
      width: 100%;
      margin-top: 4px;
    }
    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
      line-height: 1.1;
    }
    .sv {
      font-family: 'Bebas Neue', Impact, sans-serif;
      font-size: clamp(0.72rem, 3.6vw, 0.98rem);
      color: var(--text-hi);
      letter-spacing: 0.5px;
    }
    .sl {
      font-size: clamp(0.35rem, 1.7vw, 0.48rem);
      font-weight: 600;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: var(--text-lo);
    }

    /* Tier badge */
    .tier-badge {
      font-size: clamp(0.38rem, 1.6vw, 0.5rem);
      font-weight: 700;
      letter-spacing: 3px;
      text-transform: uppercase;
      color: var(--frame);
      opacity: 0.72;
      margin-top: 3px;
    }
`;
html = rep(html, '  </style>', NEW_CSS + '\n  </style>');

// ════════════════════════════════════════════════════════
// C — Replace card section with new FIFA card + inlined SVG
// ════════════════════════════════════════════════════════
const CARD_START = '  <!-- SVG clip-path: octagonal card shape used by .card-placeholder and .card-inner -->';
const CARD_END   = '  </div><!-- /centering flex -->';

const startIdx = html.indexOf(CARD_START);
const endIdx   = html.indexOf(CARD_END);
if (startIdx === -1) { console.error('CARD_START not found'); process.exit(1); }
if (endIdx   === -1) { console.error('CARD_END not found');   process.exit(1); }

const NEW_CARD = `  <!-- ===== FOOTBALLIQ SPILLERKORT ===== -->
  <section class="result-scene">
    <div class="card-wrapper" id="playerCard" data-tier="gold">

      <!-- LAG 1: Radial top-gloed bag SVG -->
      <div class="card-bg-glow"></div>

      <!-- LAG 2: SVG Kortramme -->
      ${svgRaw}

      <!-- LAG 3: Dynamisk kortindhold -->
      <div class="card-content">

        <!-- Venstre top: OVR + position -->
        <div class="card-meta">
          <div class="card-ovr" id="cardOvr">75</div>
          <div class="card-pos" id="cardPos">MID</div>
        </div>

        <!-- Center: Spillerbillede / fallback-silhuet -->
        <div class="card-player-zone">
          <div class="card-player-img-wrap">
            <img id="cardPlayerImg"
                 src="assets/Card/silhouette.png"
                 onerror="this.style.display='none';this.nextElementSibling.style.display='block'"
                 alt="Spiller"
                 class="card-player-img" />
            <!-- CSS-silhuet fallback hvis billede mangler -->
            <svg class="card-player-fallback" style="display:none"
                 viewBox="0 0 100 130" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="50" cy="22" rx="15" ry="17" fill="currentColor" opacity="0.38"/>
              <path d="M28 130 Q32 68 50 60 Q68 68 72 130Z" fill="currentColor" opacity="0.32"/>
              <path d="M34 88 L18 110 M66 88 L82 110"
                    stroke="currentColor" stroke-width="7"
                    stroke-linecap="round" opacity="0.28"/>
            </svg>
          </div>
        </div>

        <!-- Bund: navn, tagline, stats, tier-badge -->
        <div class="card-lower">

          <div class="card-name-wrap">
            <div class="card-name"    id="cardName">SPILLERNAVN</div>
            <div class="card-tagline" id="cardTagline">Din spillertype</div>
          </div>

          <!-- Stats 2 raekker x 3 kolonner -->
          <div class="card-stats" id="cardStats">
            <div class="stat"><span class="sv" id="s1v">&#x2014;</span><span class="sl" id="s1l">PAS</span></div>
            <div class="stat"><span class="sv" id="s2v">&#x2014;</span><span class="sl" id="s2l">DRI</span></div>
            <div class="stat"><span class="sv" id="s3v">&#x2014;</span><span class="sl" id="s3l">SHO</span></div>
            <div class="stat"><span class="sv" id="s4v">&#x2014;</span><span class="sl" id="s4l">VIS</span></div>
            <div class="stat"><span class="sv" id="s5v">&#x2014;</span><span class="sl" id="s5l">FYS</span></div>
            <div class="stat"><span class="sv" id="s6v">&#x2014;</span><span class="sl" id="s6l">DEF</span></div>
          </div>

          <div class="tier-badge" id="tierBadge">GOLD</div>

        </div>
      </div><!-- /card-content -->
    </div><!-- /card-wrapper -->
  </section>
  <!-- ===== /FOOTBALLIQ SPILLERKORT ===== -->`;

html = html.slice(0, startIdx) + NEW_CARD + '\n' + html.slice(endIdx + CARD_END.length);

// ════════════════════════════════════════════════════════
// D — Null-guard old card DOM writes (elements no longer exist)
// ════════════════════════════════════════════════════════
const OLD_DOM_WRITES = `  document.getElementById('card-ovr').textContent       = OVR;
  document.getElementById('card-pos').textContent       = tp.pos;
  document.getElementById('card-emoji').textContent     = tp.emoji;
  document.getElementById('card-name').textContent      = tp.name.toUpperCase();
  document.getElementById('card-tagline').textContent   = identity.words;
  document.getElementById('card-stats-grid').innerHTML  = CARD_STATS.map(function(s) {
    return '<div><div class="card-stat-lbl">' + s.lbl + '</div><div class="card-stat-val">' + s.val + '</div></div>';
  }).join('');`;

const NEW_DOM_WRITES = `  var _g; // null-guard: old card elements removed, new card uses initCard()
  if ((_g = document.getElementById('card-ovr')))        _g.textContent = OVR;
  if ((_g = document.getElementById('card-pos')))        _g.textContent = tp.pos;
  if ((_g = document.getElementById('card-emoji')))      _g.textContent = tp.emoji;
  if ((_g = document.getElementById('card-name')))       _g.textContent = tp.name.toUpperCase();
  if ((_g = document.getElementById('card-tagline')))    _g.textContent = identity.words;
  if ((_g = document.getElementById('card-stats-grid'))) _g.innerHTML = CARD_STATS.map(function(s) {
    return '<div><div class="card-stat-lbl">' + s.lbl + '</div><div class="card-stat-val">' + s.val + '</div></div>';
  }).join('');`;

html = rep(html, OLD_DOM_WRITES, NEW_DOM_WRITES);

// ════════════════════════════════════════════════════════
// E — initCard script before </body>
// ════════════════════════════════════════════════════════
const INIT_CARD_SCRIPT = `<script>
/* ============================================================
   FOOTBALLIQ — Kortdata fra sessionStorage
   Tier-thresholds: bronze<65, silver 65-74,
   gold 75-83, elite 84-89, legend 90+
   ============================================================ */
(function initCard() {
  var card = document.getElementById('playerCard');
  if (!card) return;

  function getTier(ovr) {
    if (ovr >= 90) return 'legend';
    if (ovr >= 84) return 'elite';
    if (ovr >= 75) return 'gold';
    if (ovr >= 65) return 'silver';
    return 'bronze';
  }
  var TIER_LABELS = {
    bronze:'BRONZE', silver:'SILVER', gold:'GOLD',
    elite:'ELITE', legend:'LEGEND'
  };

  /* Tilpas noeglenavn til hvad quizzen faktisk gemmer.
     Falder tilbage paa fiq_quiz_result hvis footballiq_* mangler. */
  var fallback = null;
  try { fallback = JSON.parse(sessionStorage.getItem('fiq_quiz_result') || 'null'); } catch(e) {}

  var ovr     = parseInt(sessionStorage.getItem('footballiq_ovr') || (fallback && fallback.ovr) || '75', 10);
  var name    = (sessionStorage.getItem('footballiq_name')    || 'SPILLER').toUpperCase();
  var pos     = (sessionStorage.getItem('footballiq_pos')     || 'MID').toUpperCase();
  var tagline = sessionStorage.getItem('footballiq_tagline')  || 'Din spillertype';
  var stats   = null;
  try { stats = JSON.parse(sessionStorage.getItem('footballiq_stats') || 'null'); } catch(e) {}

  var tier = getTier(ovr);
  card.setAttribute('data-tier', tier);

  function el(id) { return document.getElementById(id); }
  el('cardOvr').textContent     = ovr;
  el('cardPos').textContent     = pos;
  el('cardName').textContent    = name;
  el('cardTagline').textContent = tagline;
  el('tierBadge').textContent   = TIER_LABELS[tier];

  /* Stats — format: [{val:82, lbl:"PAS"}, ...] (6 elementer) */
  if (Array.isArray(stats) && stats.length >= 6) {
    for (var i = 1; i <= 6; i++) {
      el('s' + i + 'v').textContent = stats[i-1] ? stats[i-1].val : '—';
      el('s' + i + 'l').textContent = stats[i-1] ? stats[i-1].lbl : '—';
    }
  }

  /* Intro-animation */
  Object.assign(card.style, {
    opacity: '0',
    transform: 'scale(0.88) translateY(24px)',
    transition: 'none'
  });
  requestAnimationFrame(function() {
    requestAnimationFrame(function() {
      Object.assign(card.style, {
        opacity: '1',
        transform: 'scale(1) translateY(0)',
        transition: 'opacity .55s ease, transform .55s cubic-bezier(0.34,1.56,0.64,1)'
      });
    });
  });
})();
</script>`;

html = rep(html, '</body>', INIT_CARD_SCRIPT + '\n</body>');

// ════════════════════════════════════════════════════════
// Write output
// ════════════════════════════════════════════════════════
fs.writeFileSync(HTML_IN, html, 'utf8');

const finalSize = fs.statSync(HTML_IN).size;
console.log('Implementering gennemfoen!');
console.log('HTML stoerrelse: ' + (finalSize / 1024).toFixed(1) + ' KB');
console.log('Alle 5 trin (A-E) anvendt.');
