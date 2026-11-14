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
  const heading = document.createElement('h2');
  const label = document.createElement('span');
  label.className = 'animated-text-before';
  label.textContent = before.textContent.trim();
  const stage = document.createElement('span');
  stage.className = 'animated-text-words';
  stage.setAttribute('aria-hidden', 'true');
  stage.setAttribute('aria-live', 'off');
  stage.innerHTML = list.map((w, i) => `<span${i ? '' : ' class="active"'}></span>`).join('');
  [...stage.children].forEach((el, i) => { el.textContent = list[i]; });
  const sr = document.createElement('span');
  sr.className = 'animated-text-sr';
  sr.textContent = ` ${list.join(', ')}`;
  heading.append(label, ' ', stage, sr);
  block.replaceChildren(heading);

  let current = 0;
  if (list.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  setInterval(() => {
    if (document.documentElement.dataset.motion === 'off') return;
    stage.children[current].classList.remove('active');
    current = (current + 1) % list.length;
    stage.children[current].classList.add('active');
  }, 2500);
}
