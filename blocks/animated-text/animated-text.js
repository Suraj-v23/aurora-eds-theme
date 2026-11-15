import { el, prefersReducedMotion } from '../../scripts/utils.js';

/* Animated text: row 1 = text before, row 2 = words to cycle (list, lines or paragraphs). */
const words = (cell) => {
  const items = [...cell.querySelectorAll('li, p')];
  return (items.length ? items.map((i) => i.textContent) : cell.textContent.split(/[,\n]/))
    .map((w) => w.trim()).filter(Boolean);
};

export default function decorate(block) {
  const [before, rest] = [...block.children].map((row) => row.firstElementChild);
  if (!before || !rest) return;
  const list = words(rest);
  const stage = el(
    'span',
    { class: 'animated-text-words', 'aria-hidden': 'true', 'aria-live': 'off' },
    list.map((w, i) => el('span', { class: i ? null : 'active' }, w)),
  );
  block.replaceChildren(el(
    'h2',
    null,
    el('span', { class: 'animated-text-before' }, before.textContent.trim()),
    ' ',
    stage,
    el('span', { class: 'animated-text-sr' }, ` ${list.join(', ')}`),
  ));

  let current = 0;
  if (list.length < 2) return;
  setInterval(() => {
    if (prefersReducedMotion()) return;
    stage.children[current].classList.remove('active');
    current = (current + 1) % list.length;
    stage.children[current].classList.add('active');
  }, 2500);
}
