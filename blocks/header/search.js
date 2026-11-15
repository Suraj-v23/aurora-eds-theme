import { loadCSS, getMetadata } from '../../scripts/aem.js';

const base = window.hlx.codeBasePath;
const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const text = (el, max = 160) => el.textContent.replace(/\s+/g, ' ').trim().slice(0, max);
let index;
let dialog;

/** Preferred source: the EDS query index ({data: [{path, title, description}]}). */
async function fromQueryIndex() {
  const resp = await fetch(`${base}/query-index.json`);
  const { data } = await resp.json();
  if (!Array.isArray(data) || !data.length) throw new Error('empty index');
  return data.map((d) => ({ path: d.path, title: d.title || d.path, desc: d.description || '' }));
}

/** Fallback: crawl the pages linked from the header nav and the sidebar fragments. */
async function crawl() {
  const frags = new Set([getMetadata('sidebar'), getMetadata('nav'), '/nav']);
  ['library-nav', 'docs-nav'].forEach((n) => [`${base}/${n}`, `${base}/drafts/${n}`].forEach((f) => frags.add(f)));
  const docs = [document];
  await Promise.all([...frags].filter(Boolean).map(async (f) => {
    try {
      const resp = await fetch(`${new URL(f, window.location.origin).pathname}.plain.html`);
      if (resp.ok) docs.push(new DOMParser().parseFromString(await resp.text(), 'text/html'));
    } catch (e) { /* fragment not available */ }
  }));
  const pages = new Set();
  docs.forEach((d) => d.querySelectorAll(docs[0] === d ? 'header nav a[href]' : 'a[href]').forEach((a) => {
    const u = new URL(a.getAttribute('href'), window.location.origin);
    if (u.origin === window.location.origin && !/\.\w+$/.test(u.pathname)) pages.add(u.pathname);
  }));
  const results = await Promise.all([...pages].slice(0, 15).map(async (path) => {
    try {
      const resp = await fetch(`${path.endsWith('/') ? `${path}index` : path}.plain.html`);
      if (!resp.ok) return [];
      const doc = new DOMParser().parseFromString(await resp.text(), 'text/html');
      const title = text(doc.querySelector('h1') || doc.body, 80) || path;
      const out = [{ path, title, desc: text(doc.querySelector('p:not(:has(> em:only-child))') || doc.body) }];
      doc.querySelectorAll('h2, h3').forEach((h) => {
        const next = h.nextElementSibling;
        out.push({
          path: `${path}#${h.id || slug(h.textContent)}`,
          title: text(h, 80),
          desc: next && next.tagName === 'P' ? text(next) : title,
        });
      });
      return out;
    } catch (e) { return []; }
  }));
  return results.flat();
}

async function load() {
  if (!index) {
    index = fromQueryIndex().catch(crawl).catch(() => []);
  }
  return index;
}

/** Wraps matched words in <mark>; built with DOM nodes so content is never parsed as HTML. */
function highlight(el, str, words) {
  el.textContent = '';
  if (!words.length) { el.textContent = str; return; }
  const re = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'ig');
  str.split(re).forEach((part, i) => {
    if (i % 2) el.append(Object.assign(document.createElement('mark'), { textContent: part }));
    else if (part) el.append(part);
  });
}

function search(entries, q) {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean);
  if (!words.length) return { words, hits: entries.filter((e) => !e.path.includes('#')).slice(0, 6) };
  const hits = entries.map((e) => {
    const t = e.title.toLowerCase();
    const hay = `${t} ${e.desc.toLowerCase()}`;
    if (!words.every((w) => hay.includes(w))) return null;
    let score = words.reduce((s, w) => s + (t.includes(w) ? 3 : 1) + (t.startsWith(w) ? 2 : 0), 0);
    if (!e.path.includes('#')) score += 1;
    return { e, score };
  }).filter(Boolean).sort((a, b) => b.score - a.score).slice(0, 20)
    .map((h) => h.e);
  return { words, hits };
}

function build() {
  dialog = document.createElement('dialog');
  dialog.className = 'site-search';
  dialog.setAttribute('aria-label', 'Search the site');
  dialog.innerHTML = `<div class="ss-bar">
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <input type="text" role="combobox" aria-expanded="true" aria-controls="ss-list" aria-autocomplete="list" placeholder="Search pages and headings" aria-label="Search" autocomplete="off" spellcheck="false">
      <kbd>Esc</kbd></div>
    <ul id="ss-list" role="listbox" aria-label="Results"></ul>
    <p class="ss-empty" hidden>No results</p>
    <p class="ss-hint" aria-hidden="true"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> open</span></p>
    <p class="ss-live" role="status" aria-live="polite"></p>`;
  const input = dialog.querySelector('input');
  const list = dialog.querySelector('ul');
  const empty = dialog.querySelector('.ss-empty');
  const live = dialog.querySelector('.ss-live');
  let active = -1;

  const select = (i) => {
    const items = [...list.children];
    if (!items.length) return;
    active = (i + items.length) % items.length;
    items.forEach((li, n) => li.setAttribute('aria-selected', n === active));
    input.setAttribute('aria-activedescendant', items[active].id);
    items[active].scrollIntoView({ block: 'nearest' });
  };

  const render = async () => {
    const { words, hits } = search(await load(), input.value.trim());
    list.textContent = '';
    hits.forEach((e, n) => {
      const li = document.createElement('li');
      li.id = `ss-${n}`;
      li.setAttribute('role', 'option');
      const a = document.createElement('a');
      a.href = e.path;
      a.tabIndex = -1;
      const [t, d, p] = ['strong', 'span', 'small'].map((tag) => a.appendChild(document.createElement(tag)));
      highlight(t, e.title, words);
      highlight(d, e.desc, words);
      p.textContent = e.path;
      li.append(a);
      list.append(li);
    });
    empty.hidden = hits.length > 0;
    list.hidden = !hits.length;
    live.textContent = hits.length ? `${hits.length} results` : 'No results';
    input.removeAttribute('aria-activedescendant');
    active = -1;
    if (hits.length) select(0);
  };

  input.addEventListener('input', render);
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); select(active + 1); }
    if (e.key === 'ArrowUp') { e.preventDefault(); select(active - 1); }
    if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      list.children[active].firstElementChild.click();
    }
  });
  list.addEventListener('click', () => dialog.close());
  list.addEventListener('mousemove', (e) => {
    const li = e.target.closest('li');
    if (li && li !== list.children[active]) select([...list.children].indexOf(li));
  });
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  dialog.render = render;
  document.body.append(dialog);
}

/** Opens the search dialog; `opener` gets focus back when it closes. */
export async function openSearch(opener) {
  if (!dialog) {
    await loadCSS(`${base}/blocks/header/search.css`);
    build();
  }
  if (dialog.open) return;
  dialog.showModal();
  const input = dialog.querySelector('input');
  input.select();
  dialog.render();
  dialog.addEventListener('close', () => opener?.focus(), { once: true });
}

export { search, slug };
