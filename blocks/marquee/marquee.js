/* Marquee: each cell (text or image) is one item in a looping row. Variant: reverse. */
export default function decorate(block) {
  const list = document.createElement('ul');
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    if (!cell.textContent.trim() && !cell.querySelector('picture')) return;
    const item = document.createElement('li');
    item.append(...cell.childNodes);
    list.append(item);
  });
  const copy = list.cloneNode(true);
  copy.setAttribute('aria-hidden', 'true');
  copy.className = 'marquee-copy';
  block.replaceChildren(list, copy);
}
