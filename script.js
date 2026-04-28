  /* ─────────────────────────────────────────────
     Asset lists — matches your actual file names.
     Place all PNGs in the same folder as this HTML
     file (or update IMAGE_PATH below).
  ───────────────────────────────────────────── */
  const IMAGE_PATH = './assets/'; 

  const FLOWER_NAMES = [
    'flower_1','flower_2','flower_3','flower_4','flower_5','flower_6',
    'flower_7','flower_8','flower_9','flower_10','flower_11','flower_12',
    'flower_13','flower_14','flower_15','flower_16','flower_17','flower_18',
    'flower_19','flower_20','flower_21'
  ];

  const ARDUINO_NAMES = [
    'arudino_1','arudino_2','arudino_3','arudino_4','arudino_5','arudino_6',
    'arudino_7','arudino_8','arudino_9','arudino_10','arudino_11','arudino_12',
    'arudino_13','arudino_14','arudino_15','arudino_16','arudino_17','arudino_18',
    'arudino_19','arudino_20','arudino_21','arudino_22','arudino_23','arudino_24',
    'arudino_25','arudino_26'
  ];

  const BREADBOARD_SRC = IMAGE_PATH + 'bread_board.png';

  /* ─────────────────────────────────────────────
     Image cache — load each PNG once
  ───────────────────────────────────────────── */
  const imgCache = {};

  function loadImg(src) {
    if (imgCache[src]) return imgCache[src];
    const p = new Promise(resolve => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null); // gracefully skip missing files
      img.src = src;
    });
    imgCache[src] = p;
    return p;
  }

  function preloadAll() {
    loadImg(BREADBOARD_SRC);
    FLOWER_NAMES.forEach(n => loadImg(IMAGE_PATH + n + '.png'));
    ARDUINO_NAMES.forEach(n => loadImg(IMAGE_PATH + n + '.png'));
  }

  /* ─────────────────────────────────────────────
     Utility helpers
  ───────────────────────────────────────────── */
  function getRand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* ─────────────────────────────────────────────
     Canvas setup
  ───────────────────────────────────────────── */
  const canvas = document.getElementById('board-canvas');
  const ctx    = canvas.getContext('2d');

async function setupCanvas() {
  const wrap = canvas.parentElement;
  const bbImg = await loadImg(BREADBOARD_SRC);

  const width = wrap.clientWidth;

  if (bbImg) {
    const aspect = bbImg.height / bbImg.width;
    canvas.width = width;
    canvas.height = width * aspect;
  } else {
    // fallback if image fails
    canvas.width = width;
    canvas.height = width * 0.75;
  }
}

  /* ─────────────────────────────────────────────
     Layout generation
     Each item stores: src, x, y, drawW, drawH, rotation
  ───────────────────────────────────────────── */
  let currentLayout = null;

  function generateLayout(flowerCount, arduinoCount) {
    const W = canvas.width, H = canvas.height;

    // Safe zone: keep items within the board grid area
    // The breadboard image has a border ~8% on each side
    const PAD_X = W * 0.10;
    const PAD_Y = H * 0.10;
    const left  = PAD_X;
    const right  = W - PAD_X;
    const top    = PAD_Y;
    const bottom = H - PAD_Y;

    const MIN_DIST = Math.min(W, H) * 0.16;
    const placed   = [];

    function tryPlace(sizeW, sizeH, attempts = 50) {
      const halfW = sizeW / 2, halfH = sizeH / 2;
      for (let i = 0; i < attempts; i++) {
        const x = left  + halfW + Math.random() * (right  - left  - sizeW);
        const y = top   + halfH + Math.random() * (bottom - top   - sizeH);
        const tooClose = placed.some(p => Math.hypot(p.x - x, p.y - y) < MIN_DIST);
        if (!tooClose) { placed.push({ x, y }); return { x, y }; }
      }
      return null;
    }

    const items = [];
    const baseSize = Math.min(W, H) * 0.22;

    // Flowers
    for (let i = 0; i < flowerCount; i++) {
      const scale  = 0.9 + Math.random() * 0.6;
      const drawW  = baseSize * scale;
    //   const drawH  = baseSize * scale;
      const approxH = drawW; // rough estimate for spacing
const pos = tryPlace(drawW, approxH);
      if (!pos) continue;
      items.push({
        type:     'flower',
        src:      IMAGE_PATH + getRand(FLOWER_NAMES) + '.png',
        x:        pos.x,
        y:        pos.y,
        drawW,
        // drawH,
        rotation: Math.random() * Math.PI * 2
      });
    }

    // Arduino parts
    for (let i = 0; i < arduinoCount; i++) {
      const scale  = 0.8 + Math.random() * 0.5;
      const drawW  = baseSize * scale;
    //   const drawH  = baseSize * scale;
      const approxH = drawW; // rough estimate for spacing
const pos = tryPlace(drawW, approxH);
      if (!pos) continue;
      items.push({
        type:     'arduino',
        src:      IMAGE_PATH + getRand(ARDUINO_NAMES) + '.png',
        x:        pos.x,
        y:        pos.y,
        drawW,
        // drawH,
        rotation: (Math.floor(Math.random() * 4)) * (Math.PI / 2)
      });
    }

    return items;
  }

  /* ─────────────────────────────────────────────
     Pixelation effect
  ───────────────────────────────────────────── */
  function applyPixelation(pixelSize) {
    if (pixelSize <= 1) return;
    const W = canvas.width, H = canvas.height;
    const src = ctx.getImageData(0, 0, W, H);
    const sd  = src.data;
    const out = ctx.createImageData(W, H);
    const od  = out.data;

    for (let y = 0; y < H; y += pixelSize) {
      for (let x = 0; x < W; x += pixelSize) {
        const i = (y * W + x) * 4;
        const r = sd[i], g = sd[i+1], b = sd[i+2], a = sd[i+3];
        for (let py = 0; py < pixelSize && y + py < H; py++) {
          for (let px = 0; px < pixelSize && x + px < W; px++) {
            const oi = ((y + py) * W + (x + px)) * 4;
            od[oi] = r; od[oi+1] = g; od[oi+2] = b; od[oi+3] = a;
          }
        }
      }
    }
    ctx.putImageData(out, 0, 0);
  }

  /* ─────────────────────────────────────────────
     Main render
  ───────────────────────────────────────────── */
  async function render(layout, pixelVal) {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Draw breadboard background
    const bbImg = await loadImg(BREADBOARD_SRC);
    if (bbImg) {
      ctx.drawImage(bbImg, 0, 0, W, H);
    } else {
      // Fallback drawn breadboard if image missing
      drawFallbackBoard(W, H);
    }

    if (!layout) return;

    // Draw each item
// 1. Draw Arduino parts FIRST (background layer)
for (const item of layout) {
  if (item.type !== 'arduino') continue;

  const img = await loadImg(item.src);
  if (!img) continue;

  const aspect = img.height / img.width;
  const drawH = item.drawW * aspect;

  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.rotate(item.rotation);
  ctx.drawImage(img, -item.drawW / 2, -drawH / 2, item.drawW, drawH);
  ctx.restore();
}

// 2. Draw flowers SECOND (top layer)
for (const item of layout) {
  if (item.type !== 'flower') continue;

  const img = await loadImg(item.src);
  if (!img) continue;

  const aspect = img.height / img.width;
  const drawH = item.drawW * aspect;

  ctx.save();
  ctx.translate(item.x, item.y);
  ctx.rotate(item.rotation);
  ctx.drawImage(img, -item.drawW / 2, -drawH / 2, item.drawW, drawH);
  ctx.restore();
}

    // Apply pixelation last
    const pixelSize = Math.floor(pixelVal * 1.2) + 1;
    if (pixelSize > 2) applyPixelation(pixelSize);
  }

  /* ─────────────────────────────────────────────
     Fallback breadboard (if bread_board.png is missing)
  ───────────────────────────────────────────── */
  function drawFallbackBoard(W, H) {
    ctx.fillStyle = '#c8a464';
    ctx.fillRect(0, 0, W, H);

    const rows = 30, cols = 60;
    const padH = W * 0.05, padV = H * 0.08;
    const cellW = (W - padH * 2) / cols;
    const cellH = (H - padV * 2) / rows;

    ctx.fillStyle = 'rgba(0,0,0,0.18)';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = padH + c * cellW + cellW * 0.35;
        const y = padV + r * cellH + cellH * 0.35;
        ctx.beginPath();
        ctx.arc(x, y, Math.min(cellW, cellH) * 0.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const railPad = H * 0.04;
    [railPad, H - railPad].forEach((y, idx) => {
      ctx.strokeStyle = idx === 0 ? '#c03030' : '#2050c0';
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = 0.6;
      ctx.beginPath(); ctx.moveTo(padH, y); ctx.lineTo(W - padH, y); ctx.stroke();
      ctx.globalAlpha = 1;
    });
  }

  /* ─────────────────────────────────────────────
     Archive
  ───────────────────────────────────────────── */
  const archiveBoards = [];

function saveToArchive() {
    const fv = parseInt(document.getElementById('flower-slider').value);
    const av = parseInt(document.getElementById('arduino-slider').value);
    const pv = parseInt(document.getElementById('pixel-slider').value);

    const thumb = document.createElement('canvas');
    const thumbW = 360;
    const thumbH = Math.round(thumbW * (canvas.height / canvas.width)); // ← auto height
    thumb.width  = thumbW;
    thumb.height = thumbH;
    thumb.getContext('2d').drawImage(canvas, 0, 0, thumbW, thumbH);

    archiveBoards.unshift({
      dataUrl: thumb.toDataURL('image/png'),
      fv, av, pv,
      ts: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
    });

    renderArchive();
  }

  function renderArchive() {
    const grid  = document.getElementById('archive-grid');
    const empty = document.getElementById('empty-msg');

    if (archiveBoards.length === 0) {
      empty.style.display = 'block';
      grid.style.display  = 'none';
      return;
    }

    empty.style.display = 'none';
    grid.style.display  = 'grid';
    grid.innerHTML = '';

    archiveBoards.forEach(board => {
      const card = document.createElement('div');
      card.className = 'archive-card';

      const img = document.createElement('img');
      img.src = board.dataUrl;
      img.alt = `Board saved at ${board.ts}`;

      const meta = document.createElement('div');
      meta.className = 'card-meta';
      meta.innerHTML = `
        <span class="ts">${board.ts}</span>
        <span class="stats">F:${board.fv} · A:${board.av} · dB:${board.pv}</span>
      `;

      // Click to download this archive entry
      card.addEventListener('click', () => {
        const a = document.createElement('a');
        a.href     = board.dataUrl;
        a.download = `breadboard-life-${board.ts.replace(/[/:, ]/g, '-')}.png`;
        a.click();
      });

      card.appendChild(img);
      card.appendChild(meta);
      grid.appendChild(card);
    });
  }

  /* ─────────────────────────────────────────────
     Controls & event wiring
  ───────────────────────────────────────────── */
  function getSliders() {
    return {
      fv: parseInt(document.getElementById('flower-slider').value),
      av: parseInt(document.getElementById('arduino-slider').value),
      pv: parseInt(document.getElementById('pixel-slider').value)
    };
  }

  function updateLabels(fv, av, pv) {
    document.getElementById('flower-val').textContent = fv;
    document.getElementById('arduino-val').textContent = av;
    document.getElementById('pixel-val').textContent  = pv;
  }

  async function regenerate() {
    await setupCanvas();
    const { fv, av, pv } = getSliders();
    updateLabels(fv, av, pv);
    currentLayout = generateLayout(fv, av);
    await render(currentLayout, pv);
  }

  async function update() {
    const { fv, av, pv } = getSliders();
    updateLabels(fv, av, pv);
    if (!currentLayout) { await regenerate(); return; }
    await render(currentLayout, pv);
  }

  document.getElementById('flower-slider').addEventListener('input', update);
  document.getElementById('arduino-slider').addEventListener('input', update);
  document.getElementById('pixel-slider').addEventListener('input', update);

  document.getElementById('randomize-btn').addEventListener('click', regenerate);
  document.getElementById('archive-btn').addEventListener('click', saveToArchive);

  document.getElementById('download-btn').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href     = canvas.toDataURL('image/png');
    a.download = 'breadboard-life.png';
    a.click();
  });

  window.addEventListener('resize', regenerate);

  /* ─────────────────────────────────────────────
     Init
  ───────────────────────────────────────────── */
  preloadAll();
  regenerate();