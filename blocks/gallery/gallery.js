/* Gallery: images become grid thumbnails; click opens a lightbox dialog (alt = caption). */
let dialog;
let items = [];
let at = 0;

function show(n) {
  at = (n + items.length) % items.length;
  const { src, alt } = items[at];
  dialog.querySelector('img').src = src;
  dialog.querySelector('img').alt = alt;
  dialog.querySelector('figcaption').textContent = alt ? `${alt} (${at + 1} / ${items.length})` : `${at + 1} / ${items.length}`;
}

function build() {
  dialog = document.createElement('dialog');
  dialog.className = 'gallery-lightbox';
  dialog.setAttribute('aria-label', 'Image viewer');
  dialog.innerHTML = '<figure><img alt=""><figcaption></figcaption></figure>';
  [['close', 'Close', '×'], ['prev', 'Previous image', '‹'], ['next', 'Next image', '›']].forEach(([c, label, ch]) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `gallery-btn gallery-${c}`;
    b.setAttribute('aria-label', label);
    b.textContent = ch;
    b.addEventListener('click', () => {
      if (c === 'close') dialog.close();
      else show(at + (c === 'next' ? 1 : -1));
    });
    dialog.append(b);
  });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(at + 1);
    if (e.key === 'ArrowLeft') show(at - 1);
  });
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  document.body.append(dialog);
}

export default function decorate(block) {
  const imgs = [...block.querySelectorAll('img')];
  const list = document.createElement('ul');
  const own = imgs.map((img) => ({ src: img.currentSrc || img.src, alt: img.alt }));
  imgs.forEach((img, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-label', img.alt ? `Enlarge: ${img.alt}` : `Enlarge image ${i + 1}`);
    btn.append(img.closest('picture') || img);
    btn.addEventListener('click', () => {
      if (!dialog) build();
      items = own;
      show(i);
      dialog.showModal();
      dialog.addEventListener('close', () => btn.focus(), { once: true });
    });
    const li = document.createElement('li');
    li.append(btn);
    list.append(li);
  });
  block.replaceChildren(list);
}
