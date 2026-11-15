/* Page list: cards from /query-index.json (fallback: links authored in the block).
   Config rows: filter | /path-prefix, limit | 6, search | on. */
import { el, safeUrl, fetchIndex } from '../../scripts/utils.js';

const KEYS = ['filter', 'limit', 'search'];

export default async function decorate(block) {
  const cfg = {};
  const authored = [];
  [...block.children].forEach((row) => {
    const [a, b] = [...row.children];
    const key = a?.textContent.trim().toLowerCase();
    if (KEYS.includes(key) && b) cfg[key] = b.textContent.trim();
    else {
      const link = row.querySelector('a[href]');
      if (link && safeUrl(link.getAttribute('href'))) authored.push({ path: link.getAttribute('href'), title: link.textContent.trim(), desc: [...row.children].filter((c) => !c.contains(link)).map((c) => c.textContent.trim()).join(' ') });
    }
  });
  let pages;
  try { pages = (await fetchIndex()).filter((p) => !p.path.includes('#')); } catch (e) { pages = authored; }
  if (!pages.length) pages = authored;
  const limit = parseInt(cfg.limit, 10) || 6;
  const pool = pages.filter((p) => !cfg.filter || p.path.startsWith(cfg.filter));

  const list = document.createElement('ul');
  const empty = document.createElement('p');
  empty.className = 'page-list-empty';
  empty.textContent = 'No pages found';
  const render = (q = '') => {
    const hits = pool.filter((p) => `${p.title} ${p.desc}`.toLowerCase().includes(q.toLowerCase())).slice(0, limit);
    list.replaceChildren(...hits.map((p) => el('li', null, el('a', { href: safeUrl(p.path) }, el('h3', null, p.title), el('p', null, p.desc), el('small', null, p.path)))));
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
