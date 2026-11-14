/* Steps: each row = one step. Column 1 = title, column 2 = description. Auto-numbered. */
export default function decorate(block) {
  const list = document.createElement('ol');
  [...block.children].forEach((row) => {
    const [title, body] = row.children;
    const item = document.createElement('li');
    if (title) {
      title.className = 'steps-title';
      item.append(title);
    }
    if (body) {
      body.className = 'steps-body';
      item.append(body);
    }
    list.append(item);
  });
  block.replaceChildren(list);
}
