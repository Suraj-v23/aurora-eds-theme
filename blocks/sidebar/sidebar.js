import { decorateBlock, loadBlock } from '../../scripts/aem.js';
import { el, slugify } from '../../scripts/utils.js';

const trim = (p) => p.replace(/\/(index(\.html)?)?$/, '') || '/';

/** Scroll spy: marks the link whose heading is currently near the top. */
function spy(links) {
  const targets = new Map();
  links.forEach((a) => {
    if (trim(a.pathname) !== trim(window.location.pathname)) return;
    const t = document.getElementById(decodeURIComponent(a.hash.slice(1)));
    if (t) targets.set(t, a);
  });
  if (!targets.size) return;
  let active;
  const observer = new IntersectionObserver((entries) => {
    const hit = entries.filter((e) => e.isIntersecting).pop();
    const link = hit && targets.get(hit.target);
    if (!link || link === active) return;
    active?.removeAttribute('aria-current');
    link.setAttribute('aria-current', 'true');
    active = link;
  }, { rootMargin: '0px 0px -75% 0px' });
  targets.forEach((_, t) => observer.observe(t));
}

/** Filter box: hides links that don't match, Enter opens the first match. */
function addSearch(nav) {
  const input = el('input', {
    type: 'search', placeholder: 'Search', 'aria-label': 'Search the menu', autocomplete: 'off',
  });
  const empty = el('p', { class: 'docs-empty', hidden: true }, 'No matches');
  const items = [...nav.querySelectorAll('li')];
  const filter = () => {
    const q = input.value.trim().toLowerCase();
    items.forEach((li) => { li.hidden = !!q && !li.textContent.toLowerCase().includes(q); });
    nav.querySelectorAll('.docs-label').forEach((label) => {
      const list = label.nextElementSibling;
      label.hidden = !!q && !!list && !list.querySelector('li:not([hidden])');
    });
    empty.hidden = !q || !!nav.querySelector('li:not([hidden]) a');
  };
  input.addEventListener('input', filter);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') nav.querySelector('li:not([hidden]) a')?.click();
    if (e.key === 'Escape') { input.value = ''; filter(); }
  });
  nav.prepend(el('div', { class: 'docs-search' }, input, empty));
}

/** Groups (heading or bold-only paragraph + list), current page, spy and mobile menu toggle. */
export function enhanceNav(nav) {
  nav.classList.add('docs-nav');
  [...nav.children].forEach((c) => {
    const strong = c.tagName === 'P' && c.children.length === 1 && c.firstElementChild.tagName === 'STRONG';
    if (/^H[1-6]$/.test(c.tagName) || (strong && !c.querySelector('a'))) c.classList.add('docs-label');
  });
  nav.querySelectorAll('a[href]').forEach((a) => {
    if (!a.hash && trim(a.pathname) === trim(window.location.pathname)) a.setAttribute('aria-current', 'page');
  });
  spy([...nav.querySelectorAll('a[href*="#"]')]);
  addSearch(nav);
  const toggle = el('button', {
    type: 'button', class: 'docs-menu-toggle', 'aria-expanded': 'false', onclick: () => toggle.setAttribute('aria-expanded', toggle.getAttribute('aria-expanded') !== 'true'),
  }, 'Menu');
  nav.before(toggle);
}

/** "On this page" mini table of contents from h2/h3 of the content. */
export function buildToc(root) {
  const heads = [...root.querySelectorAll('.default-content-wrapper :is(h2, h3), :scope > :is(h2, h3)')];
  if (heads.length < 2) return null;
  const nav = el('nav', { class: 'docs-toc', 'aria-label': 'On this page' }, el('p', null, 'On this page'), el('ul', null, heads.map((h) => {
    if (!h.id) h.id = slugify(h.textContent.trim());
    return el('li', { class: h.tagName.toLowerCase() }, el('a', { href: `#${h.id}` }, h.textContent));
  })));
  spy([...nav.querySelectorAll('a')]);
  return nav;
}

/** Hover "#" links on h2/h3 of the content (ids are added when missing). */
function addAnchors(main) {
  main.querySelectorAll('.default-content-wrapper :is(h2, h3)').forEach((h) => {
    if (!h.id) h.id = slugify(h.textContent.trim());
    h.append(el('a', { class: 'docs-anchor', href: `#${h.id}`, 'aria-label': `Link to section ${h.textContent.trim()}` }, '#'));
  });
}

/** Previous / next links from the page links of the nav, in nav order. */
function addPager(main, nav) {
  const pages = [];
  nav.querySelectorAll('a[href]').forEach((a) => {
    if (!a.hash && !pages.some((p) => trim(p.pathname) === trim(a.pathname))) pages.push(a);
  });
  const i = pages.findIndex((a) => trim(a.pathname) === trim(window.location.pathname));
  const link = (a, cls, label) => a && el('a', { href: a.getAttribute('href'), class: cls }, el('small', null, label), a.textContent.trim());
  const [prev, next] = [pages[i - 1], pages[i + 1]];
  const last = main.querySelector(':scope > .section:last-of-type');
  if (i < 0 || !last || (!prev && !next)) return;
  last.append(el('div', { class: 'default-content-wrapper' }, el('nav', { class: 'docs-pager', 'aria-label': 'Previous and next pages' }, link(prev, 'prev', 'Previous'), link(next, 'next', 'Next'))));
}

/** Page-level docs layout: nav fragment on the left, content, TOC on the right. */
export async function docsLayout(main, path) {
  try {
    // eslint-disable-next-line import/no-cycle
    const { loadFragment } = await import('../fragment/fragment.js');
    const frag = await loadFragment(path);
    if (!frag) throw new Error('no nav');
    const nav = document.createElement('nav');
    nav.setAttribute('aria-label', 'Documentation');
    nav.append(...frag.querySelectorAll('.default-content-wrapper > *'));
    const aside = document.createElement('aside');
    aside.className = 'docs-aside';
    aside.append(nav);
    main.prepend(aside);
    enhanceNav(nav);
    addPager(main, nav);
    const toc = !main.classList.contains('docs-wide') && buildToc(main);
    if (toc) {
      const right = document.createElement('aside');
      right.className = 'docs-aside docs-aside-toc';
      right.append(toc);
      main.append(right);
    }
    addAnchors(main);
  } catch (e) {
    main.classList.remove('docs-layout');
  }
}

/* Sidebar: cell 1 = #links (sticky nav), cell 2 = content. Variants: docs, toc.
   Raw HTML in cell 2 can nest blocks via data-nested="name". */
export default function decorate(block) {
  const [navCell, content] = block.firstElementChild?.children || [];
  if (!navCell || !content) return;
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Navigation');
  nav.append(...navCell.childNodes);
  content.className = 'sidebar-content';
  block.replaceChildren(nav, content);
  content.querySelectorAll('[data-nested]').forEach((n) => {
    n.className = n.dataset.nested;
    decorateBlock(n);
    loadBlock(n);
  });
  enhanceNav(nav);
  if (block.classList.contains('toc')) {
    const toc = buildToc(content);
    if (toc) block.append(toc);
  }
}
