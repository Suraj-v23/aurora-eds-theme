/* Gallery: images become grid thumbnails; click opens a lightbox dialog (alt = caption). */
import {
  el, createDialog, openDialog,
} from '../../scripts/utils.js';

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
  dialog = createDialog('gallery-lightbox', 'Image viewer');
  dialog.append(el('figure', null, el('img', { alt: '' }), el('figcaption')));
  [['close', 'Close', '×'], ['prev', 'Previous image', '‹'], ['next', 'Next image', '›']].forEach(([c, label, ch]) => {
    dialog.append(el('button', {
      type: 'button',
      class: `gallery-btn gallery-${c}`,
      'aria-label': label,
      onclick: () => (c === 'close' ? dialog.close() : show(at + (c === 'next' ? 1 : -1))),
    }, ch));
  });
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') show(at + 1);
    if (e.key === 'ArrowLeft') show(at - 1);
  });
  document.body.append(dialog);
}

export default function decorate(block) {
  const imgs = [...block.querySelectorAll('img')];
  const list = document.createElement('ul');
  const own = imgs.map((img) => ({ src: img.currentSrc || img.src, alt: img.alt }));
  imgs.forEach((img, i) => {
    const btn = el('button', {
      type: 'button',
      'aria-haspopup': 'dialog',
      'aria-label': img.alt ? `Enlarge: ${img.alt}` : `Enlarge image ${i + 1}`,
    }, img.closest('picture') || img);
    btn.addEventListener('click', () => {
      if (!dialog) build();
      items = own;
      show(i);
      openDialog(dialog, btn);
    });
    list.append(el('li', null, btn));
  });
  block.replaceChildren(list);
}
