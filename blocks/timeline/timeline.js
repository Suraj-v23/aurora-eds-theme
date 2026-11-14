/* Timeline: each row = one event. Column 1 = date, column 2 = title and text. */
export default function decorate(block) {
  const list = document.createElement('ol');
  [...block.children].forEach((row) => {
    const [date, body] = row.children;
    if (!date || !body) return;
    date.className = 'timeline-date';
    body.className = 'timeline-body';
    const item = document.createElement('li');
    item.append(date, body);
    list.append(item);
  });
  block.replaceChildren(list);
}
