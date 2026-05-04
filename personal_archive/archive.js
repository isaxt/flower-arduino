  const BOARDS = [
    'board1.png','board2.png','board3.png','board4.png',
    'board5.png','board6.png','board7.png','board8.png'
  ];

  const grid = document.getElementById('board-grid');

  BOARDS.forEach((filename, i) => {
    const src = `breadboards/${filename}`;

    const card = document.createElement('div');
    card.className = 'board-card';

    const img = document.createElement('img');
    img.src = src;
    img.alt = `Board ${i + 1}`;
    img.loading = 'lazy';

    const meta = document.createElement('div');
    meta.className = 'card-meta';
    meta.innerHTML = `
      <span class="label">board_${String(i + 1).padStart(2, '0')}</span>
      <span class="hint">click to enlarge · right-click to save</span>
    `;

    card.appendChild(img);
    card.appendChild(meta);
    card.addEventListener('click', () => openLightbox(src, `board_${String(i+1).padStart(2,'0')}`));
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