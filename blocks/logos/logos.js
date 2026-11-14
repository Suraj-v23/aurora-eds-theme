/* Logos: put each logo (image or company name) in its own cell. Rows and columns are flattened. */
export default function decorate(block) {
  const list = document.createElement('ul');
  block.querySelectorAll(':scope > div > div').forEach((cell) => {
    if (!cell.textContent.trim() && !cell.querySelector('picture')) return;
    const item = document.createElement('li');
    item.append(...cell.childNodes);
    list.append(item);
  });
  block.replaceChildren(list);
}
