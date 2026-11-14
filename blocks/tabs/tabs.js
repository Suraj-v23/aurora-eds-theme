/* Tabs: each row = one tab. Column 1 = tab label, column 2 = panel content. */
let count = 0;

export default function decorate(block) {
  count += 1;
  const id = `tabs-${count}`;
  const list = document.createElement('div');
  list.className = 'tabs-list';
  list.setAttribute('role', 'tablist');
  const tabs = [];

  [...block.children].forEach((row, i) => {
    const [label, panel] = row.children;
    if (!label || !panel) return;
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'tabs-tab';
    tab.id = `${id}-tab-${i}`;
    tab.textContent = label.textContent.trim();
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', `${id}-panel-${i}`);
    panel.className = 'tabs-panel';
    panel.id = `${id}-panel-${i}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    tabs.push({ tab, panel });
    list.append(tab);
    row.replaceWith(panel);
  });

  const select = (index, focus) => tabs.forEach(({ tab, panel }, i) => {
    const on = i === index;
    tab.setAttribute('aria-selected', on);
    tab.tabIndex = on ? 0 : -1;
    panel.hidden = !on;
    if (on && focus) tab.focus();
  });

  tabs.forEach(({ tab }, i) => {
    tab.addEventListener('click', () => select(i));
    tab.addEventListener('keydown', (e) => {
      const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (!step) return;
      e.preventDefault();
      select((i + step + tabs.length) % tabs.length, true);
    });
  });

  block.prepend(list);
  select(0);
}
