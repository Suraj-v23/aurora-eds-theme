/* Stats: each row = one stat. Column 1 = number, column 2 = label. */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.className = 'stats-item';
    const [value, label] = row.children;
    if (value) value.className = 'stats-value';
    if (label) label.className = 'stats-label';
  });
}
