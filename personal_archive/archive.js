const BOARDS = [
  { file: 'board1.png', date: '3/26/2026' },
  { file: 'board2.png', date: '3/27/2026' },
  { file: 'board3.png', date: '3/28/2026' },
  { file: 'board4.png', date: '3/29/2026' },
  { file: 'board5.png', date: '3/30/2026' },
  { file: 'board6.png', date: '3/31/2026' },
  { file: 'board7.png', date: '4/1/2026'  },
  { file: 'board8.png', date: '4/2/2026'  },
];
const grid = document.getElementById('board-grid');

BOARDS.forEach(({ file, date }) => {
  const src = `breadboards/${file}`;

  const card = document.createElement('div');
  card.className = 'board-card';

  const img = document.createElement('img');
  img.src = src;
  img.alt = `Board from ${date}`;
  img.loading = 'lazy';

  const meta = document.createElement('div');
  meta.className = 'card-meta';
  meta.innerHTML = `
    <span class="label">${date}</span>
    <span class="hint">click to enlarge</span>
  `;

  card.appendChild(img);
  card.appendChild(meta);
  card.addEventListener('click', () => openLightbox(src, date));
  grid.appendChild(card);
});

// Lightbox
const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lightbox-img');
const lbLabel  = document.getElementById('lightbox-label');

function openLightbox(src, label) {
  lbImg.src = src;
  lbLabel.textContent = label;
  lightbox.classList.add('open');
}

document.getElementById('lightbox-close').addEventListener('click', () => {
  lightbox.classList.remove('open');
});

lightbox.addEventListener('click', e => {
  if (e.target === lightbox) lightbox.classList.remove('open');
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') lightbox.classList.remove('open');
});