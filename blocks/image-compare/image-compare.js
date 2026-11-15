/* Image compare: two images (before, after) in any cells. A range input drives the reveal. */
export default function decorate(block) {
  const [before, after] = [...block.querySelectorAll('img')];
  if (!after) return;
  const stage = document.createElement('div');
  stage.className = 'image-compare-stage';
  const over = document.createElement('div');
  over.className = 'image-compare-after';
  over.append(after);
  const handle = document.createElement('span');
  handle.className = 'image-compare-handle';
  handle.setAttribute('aria-hidden', 'true');
  const range = document.createElement('input');
  range.type = 'range';
  range.min = 0;
  range.max = 100;
  range.value = 50;
  range.setAttribute('aria-label', `Reveal: ${before.alt || 'before'} on the left, ${after.alt || 'after'} on the right`);
  const set = () => stage.style.setProperty('--pos', `${range.value}%`);
  range.addEventListener('input', set);
  set();
  stage.append(before, over, handle, range);
  block.replaceChildren(stage);
}
