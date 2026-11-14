/* Breadcrumb: authored links (cell or list item), else built from the URL path. */
const title = (s) => decodeURIComponent(s).replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

export default function decorate(block) {
  const nodes = block.querySelectorAll('li').length ? block.querySelectorAll('li') : block.querySelectorAll(':scope > div > div');
  let items = [...nodes].map((n) => ({ text: n.textContent.trim(), href: n.querySelector('a')?.href })).filter((i) => i.text);
  if (!items.length) {
    const parts = window.location.pathname.replace(/\.html$/, '').split('/').filter(Boolean);
    items = [{ text: 'Home', href: '/' }, ...parts.map((p, i) => ({
      text: title(p),
      href: `/${parts.slice(0, i + 1).join('/')}`,
    }))];
  }
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  const list = document.createElement('ol');
  items.forEach(({ text, href }, i) => {
    const li = document.createElement('li');
    if (i === items.length - 1) {
      li.textContent = text;
      li.setAttribute('aria-current', 'page');
    } else if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = text;
      li.append(a);
    } else {
      li.textContent = text;
    }
    list.append(li);
  });
  nav.append(list);
  block.replaceChildren(nav);
}
