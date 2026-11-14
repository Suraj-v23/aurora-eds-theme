/* Carousel: each row = one slide. Optional image column, then content column. */
export default function decorate(block) {
  const track = document.createElement('ul');
  track.className = 'carousel-track';
  track.tabIndex = 0;

  [...block.children].forEach((row) => {
    const slide = document.createElement('li');
    slide.className = 'carousel-slide';
    [...row.children].forEach((cell) => {
      if (!cell.textContent.trim() && !cell.querySelector('picture')) return;
      const imageOnly = cell.children.length === 1 && cell.querySelector('picture');
      cell.className = imageOnly ? 'carousel-image' : 'carousel-body';
      slide.append(cell);
    });
    track.append(slide);
  });

  const button = (label, direction) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = `carousel-button carousel-${direction < 0 ? 'prev' : 'next'}`;
    el.setAttribute('aria-label', label);
    el.addEventListener('click', () => {
      const step = track.firstElementChild?.getBoundingClientRect().width || track.clientWidth;
      track.scrollBy({ left: direction * (step + 24), behavior: 'smooth' });
    });
    return el;
  };

  const nav = document.createElement('div');
  nav.className = 'carousel-nav';
  nav.append(button('Previous slide', -1), button('Next slide', 1));
  block.replaceChildren(track, nav);
}
