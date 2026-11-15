/* Countdown: cell 1 = target date/time (e.g. 2030-01-01 09:00), cell 2 = label,
   cell 3 (optional) = text shown when finished. */
export default function decorate(block) {
  const [dateCell, labelCell, doneCell] = [...(block.firstElementChild?.children || [])];
  const target = Date.parse((dateCell?.textContent || '').trim().replace(' ', 'T'));
  if (Number.isNaN(target)) return;
  const label = labelCell?.textContent.trim() || '';
  const done = doneCell?.textContent.trim() || 'It has started!';
  const units = ['days', 'hours', 'minutes', 'seconds'];
  block.innerHTML = `<p class="countdown-label"></p><div class="countdown-grid" role="timer" aria-label="Time remaining">${
    units.map((u) => `<div><strong data-u="${u}">0</strong><span>${u}</span></div>`).join('')}</div>`;
  block.querySelector('.countdown-label').textContent = label;
  const grid = block.querySelector('.countdown-grid');
  let timer;
  const tick = () => {
    const left = Math.max(0, Math.floor((target - Date.now()) / 1000));
    if (!left) {
      grid.textContent = done;
      clearInterval(timer);
      return;
    }
    const v = [left / 86400, (left / 3600) % 24, (left / 60) % 60, left % 60];
    units.forEach((u, i) => {
      const n = String(Math.floor(v[i])).padStart(i ? 2 : 1, '0');
      grid.querySelector(`[data-u="${u}"]`).textContent = n;
    });
  };
  timer = setInterval(tick, 1000);
  tick();
}
