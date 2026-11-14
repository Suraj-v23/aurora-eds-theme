import { decorateBlock, loadBlock } from '../../scripts/aem.js';

/* Sidebar: cell 1 = #links (sticky nav), cell 2 = content.
   Raw HTML in cell 2 can nest blocks via data-nested="name". */
export default function decorate(block) {
  const [navCell, content] = block.firstElementChild?.children || [];
  if (!navCell || !content) return;
  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'On this page');
  nav.append(...navCell.childNodes);
  content.className = 'sidebar-content';
  block.replaceChildren(nav, content);
  content.querySelectorAll('[data-nested]').forEach((el) => {
    el.className = el.dataset.nested;
    decorateBlock(el);
    loadBlock(el);
  });

  const links = [...nav.querySelectorAll('a[href*="#"]')];
  const targets = new Map();
  links.forEach((a) => {
    const el = document.getElementById(decodeURIComponent(a.hash.slice(1)));
    if (el) targets.set(el, a);
  });
  const observer = new IntersectionObserver((entries) => {
    entries.filter((e) => e.isIntersecting).forEach((e) => {
      links.forEach((l) => l.removeAttribute('aria-current'));
      targets.get(e.target).setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '0px 0px -75% 0px' });
  targets.forEach((_, el) => observer.observe(el));
}
