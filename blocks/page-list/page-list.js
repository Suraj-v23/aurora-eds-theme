/* Page list: cards from /query-index.json (fallback: links authored in the block).
   Config rows: filter | /path-prefix, limit | 6, search | on. */
const KEYS = ['filter', 'limit', 'search'];

async function fetchPages() {
  const resp = await fetch(`${window.hlx.codeBasePath}/query-index.json`);
  const { data } = await resp.json();
  return data.filter((d) => d.path && !d.path.includes('#'))
    .map((d) => ({ path: d.path, title: d.title || d.path, desc: d.description || '' }));
}

export default async function decorate(block) {
  const cfg = {};
  const authored = [];
  [...block.children].forEach((row) => {
    const [a, b] = [...row.children];
    const key = a?.textContent.trim().toLowerCase();
    if (KEYS.includes(key) && b) cfg[key] = b.textContent.trim();
    else {
      const link = row.querySelector('a[href]');
      if (link) authored.push({ path: link.getAttribute('href'), title: link.textContent.trim(), desc: [...row.children].filter((c) => !c.contains(link)).map((c) => c.textContent.trim()).join(' ') });
    }
  });
  let pages;
  try { pages = await fetchPages(); } catch (e) { pages = authored; }
  if (!pages.length) pages = authored;
  const limit = parseInt(cfg.limit, 10) || 6;
  const pool = pages.filter((p) => !cfg.filter || p.path.startsWith(cfg.filter));

  const list = document.createElement('ul');
  const empty = document.createElement('p');
  empty.className = 'page-list-empty';
  empty.textContent = 'No pages found';
  const render = (q = '') => {
    const hits = pool.filter((p) => `${p.title} ${p.desc}`.toLowerCase().includes(q.toLowerCase())).slice(0, limit);
    list.replaceChildren(...hits.map((p) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = p.path;
      a.innerHTML = '<h3></h3><p></p><small></small>';
      a.querySelector('h3').textContent = p.title;
      a.querySelector('p').textContent = p.desc;
      a.querySelector('small').textContent = p.path;
      li.append(a);
      return li;
    }));
    empty.hidden = hits.length > 0;
  };
  render();
  block.replaceChildren();
  if (/^(on|true|yes)$/i.test(cfg.search || '')) {
    const input = document.createElement('input');
    input.type = 'search';
    input.placeholder = 'Filter pages';
    input.setAttribute('aria-label', 'Filter pages');
    input.addEventListener('input', () => render(input.value.trim()));
    block.append(input);
  }
  block.append(list, empty);
}
