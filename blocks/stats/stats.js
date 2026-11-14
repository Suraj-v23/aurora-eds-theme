/* Stats: each row = one stat. Column 1 = number, column 2 = label. Numbers count up. */
function countUp(el) {
  const match = el.textContent.trim().match(/^(\D*)(\d+)(.*)$/s);
  if (!match || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const [, prefix, digits, suffix] = match;
  const target = Number(digits);
  const start = performance.now();
  const tick = (now) => {
    const progress = Math.min((now - start) / 900, 1);
    el.textContent = `${prefix}${Math.round(target * (1 - (1 - progress) ** 3))}${suffix}`;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

export default function decorate(block) {
  const values = [];
  [...block.children].forEach((row) => {
    row.className = 'stats-item';
    const [value, label] = row.children;
    if (value) {
      value.className = 'stats-value';
      values.push(value);
    }
    if (label) label.className = 'stats-label';
  });
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();
    values.forEach(countUp);
  });
  observer.observe(block);
}
