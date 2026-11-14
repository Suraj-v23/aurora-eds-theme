/* Feature grid (bento): each row = one tile (icon, heading, text). Variants: wide, uniform. */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const tile = document.createElement('div');
    tile.className = 'feature-grid-tile';
    tile.append(...[...row.children].flatMap((cell) => [...cell.childNodes]));
    const first = tile.firstElementChild;
    if (first?.tagName === 'P' && (first.querySelector('.icon, img') || first.textContent.trim().length <= 2)) {
      first.className = 'feature-grid-icon';
    }
    row.replaceWith(tile);
  });
}
