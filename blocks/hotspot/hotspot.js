/* Hotspot: row 1 = image. Other rows: x (%), y (%), content shown in the popover. */
export default function decorate(block) {
  const [first, ...rows] = [...block.children];
  const img = first?.querySelector('img');
  if (!img) return;
  const stage = document.createElement('div');
  stage.className = 'hotspot-stage';
  stage.append(img);
  let open;
  const close = (focus) => {
    if (!open) return;
    open.pin.setAttribute('aria-expanded', 'false');
    open.pop.hidden = true;
    if (focus) open.pin.focus();
    open = null;
  };
  rows.forEach((row, i) => {
    const [x, y, content] = [...row.children];
    if (!content || Number.isNaN(parseFloat(x.textContent))) return;
    const id = `hotspot-${Math.random().toString(36).slice(2, 7)}-${i}`;
    const pin = document.createElement('button');
    pin.type = 'button';
    pin.className = 'hotspot-pin';
    pin.setAttribute('aria-expanded', 'false');
    pin.setAttribute('aria-controls', id);
    pin.setAttribute('aria-label', (content.querySelector('strong, h3, h4') || content).textContent.trim().slice(0, 60));
    const pop = document.createElement('div');
    pop.className = 'hotspot-pop';
    pop.id = id;
    pop.hidden = true;
    pop.append(...content.childNodes);
    [pin, pop].forEach((el) => {
      el.style.setProperty('--x', `${parseFloat(x.textContent)}%`);
      el.style.setProperty('--y', `${parseFloat(y.textContent)}%`);
    });
    if (parseFloat(y.textContent) < 40) pop.classList.add('below');
    pin.addEventListener('click', () => {
      const was = open?.pin === pin;
      close();
      if (was) return;
      pin.setAttribute('aria-expanded', 'true');
      pop.hidden = false;
      open = { pin, pop };
    });
    stage.append(pin, pop);
  });
  stage.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(true); });
  document.addEventListener('click', (e) => { if (!stage.contains(e.target)) close(); });
  block.replaceChildren(stage);
}
