/* Testimonials: each row = one quote. Column 1 = quote, column 2 = name and role. */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [quote, author] = row.children;
    const figure = document.createElement('figure');
    const blockquote = document.createElement('blockquote');
    if (quote) blockquote.append(...quote.childNodes);
    figure.append(blockquote);
    if (author) {
      const caption = document.createElement('figcaption');
      caption.append(...author.childNodes);
      figure.append(caption);
    }
    row.replaceWith(figure);
  });
}
