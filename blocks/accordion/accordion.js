/* Accordion: each row = one item. Column 1 = question, column 2 = answer. */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [label, body] = row.children;
    if (!label || !body) return;
    const summary = document.createElement('summary');
    summary.append(...label.childNodes);
    body.className = 'accordion-body';
    const details = document.createElement('details');
    details.append(summary, body);
    row.replaceWith(details);
  });
}
