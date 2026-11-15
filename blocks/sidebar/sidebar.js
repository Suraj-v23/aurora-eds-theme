import { decorateBlock, loadBlock } from '../../scripts/aem.js';

const trim = (p) => p.replace(/\/(index(\.html)?)?$/, '') || '/';

/** Scroll spy: marks the link whose heading is currently near the top. */
function spy(links) {
  const targets = new Map();
  links.forEach((a) => {
    if (trim(a.pathname) !== trim(window.location.pathname)) return;
    const el = document.getElementById(decodeURIComponent(a.hash.slice(1)));
    if (el) targets.set(el, a);
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
  targets.forEach((_, el) => observer.observe(el));
}

/** Filter box: hides links that don't match, Enter opens the first match. */
function addSearch(nav) {
  const wrap = document.createElement('div');
  wrap.className = 'docs-search';
  wrap.innerHTML = '<input type="search" placeholder="Search" aria-label="Search the menu" autocomplete="off"><p class="docs-empty" hidden>No matches</p>';
  const input = wrap.querySelector('input');
  const empty = wrap.querySelector('.docs-empty');
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
  nav.prepend(wrap);
}

/** Groups (heading or bold-only paragraph + list), current page, spy and mobile menu toggle. */
export function enhanceNav(nav) {
  nav.classList.add('docs-nav');
  [...nav.children].forEach((el) => {
    const strong = el.tagName === 'P' && el.children.length === 1 && el.firstElementChild.tagName === 'STRONG';
    if (/^H[1-6]$/.test(el.tagName) || (strong && !el.querySelector('a'))) el.classList.add('docs-label');
  });
  nav.querySelectorAll('a[href]').forEach((a) => {
    if (!a.hash && trim(a.pathname) === trim(window.location.pathname)) a.setAttribute('aria-current', 'page');
  });
  spy([...nav.querySelectorAll('a[href*="#"]')]);
  addSearch(nav);
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'docs-menu-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.textContent = 'Menu';
  toggle.addEventListener('click', () => toggle.setAttribute('aria-expanded', toggle.getAttribute('aria-expanded') !== 'true'));
  nav.before(toggle);
}

/** "On this page" mini table of contents from h2/h3 of the content. */
export function buildToc(root) {
  const heads = [...root.querySelectorAll('.default-content-wrapper :is(h2, h3), :scope > :is(h2, h3)')];
  if (heads.length < 2) return null;
  const nav = document.createElement('nav');
  nav.className = 'docs-toc';
  nav.setAttribute('aria-label', 'On this page');
  nav.innerHTML = '<p>On this page</p><ul></ul>';
  heads.forEach((h) => {
    if (!h.id) h.id = h.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const li = document.createElement('li');
    li.className = h.tagName.toLowerCase();
    const a = document.createElement('a');
    a.href = `#${h.id}`;
    a.textContent = h.textContent;
    li.append(a);
    nav.lastElementChild.append(li);
  });
  spy([...nav.querySelectorAll('a')]);
  return nav;
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
    const toc = !main.classList.contains('docs-wide') && buildToc(main);
    if (toc) {
      const right = document.createElement('aside');
      right.className = 'docs-aside docs-aside-toc';
      right.append(toc);
      main.append(right);
    }
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
  content.querySelectorAll('[data-nested]').forEach((el) => {
    el.className = el.dataset.nested;
    decorateBlock(el);
    loadBlock(el);
  });
  enhanceNav(nav);
  if (block.classList.contains('toc')) {
    const toc = buildToc(content);
    if (toc) block.append(toc);
  }
}
