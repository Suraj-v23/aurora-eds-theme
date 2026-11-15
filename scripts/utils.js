/* Shared helpers for blocks and scripts. Import as '../../scripts/utils.js'. */

/**
 * Safe DOM builder. `on*` attrs become listeners, true sets an empty attribute,
 * false/null/undefined skip the attribute. Children: strings become text nodes
 * (never parsed as HTML), null/false are skipped, arrays are flattened.
 */
export function el(tag, attrs, ...kids) {
  const node = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => {
    if (v === null || v === undefined || v === false) return;
    if (/^on[a-z]/.test(k) && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else node.setAttribute(k, v === true ? '' : v);
  });
  node.append(...kids.flat(Infinity).filter((c) => c !== null && c !== undefined && c !== false));
  return node;
}

export const slugify = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Returns the url when it is http(s) or a relative/same-origin path, else ''. */
export function safeUrl(url) {
  try {
    const u = String(url).trim();
    return /^https?:$/.test(new URL(u, window.location.href).protocol) ? u : '';
  } catch { return ''; }
}

export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches
  || document.documentElement.dataset.motion === 'off';

export function readJSON(key, fallback = null) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

export function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage blocked */ }
}

/** Site index: [{path, title, desc}] from /query-index.json. Throws when unusable. */
export async function fetchIndex() {
  const resp = await fetch(`${window.hlx.codeBasePath}/query-index.json`);
  if (!resp.ok) throw new Error(resp.status);
  const { data } = await resp.json();
  if (!Array.isArray(data)) throw new Error('bad index');
  return data.filter((d) => d && safeUrl(d.path))
    .map((d) => ({ path: d.path, title: d.title || d.path, desc: d.description || '' }));
}

/** Modal <dialog> that closes on backdrop click. The caller appends it. */
export function createDialog(className, label) {
  const dialog = el('dialog', { class: className, 'aria-label': label });
  dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
  return dialog;
}

/** Opens a dialog modally; focus returns to `opener` when it closes. */
export function openDialog(dialog, opener) {
  dialog.showModal();
  dialog.addEventListener('close', () => opener?.focus(), { once: true });
}

/**
 * iframe for a YouTube or Vimeo link; null for any other host or scheme.
 * No sandbox: the players need scripts, same-origin and presentation, so it adds little.
 */
export function embedFrame(href, title) {
  let src = '';
  try {
    const u = new URL(href, window.location.href);
    const host = u.hostname.replace(/^(www|m)\./, '');
    const last = u.pathname.split('/').filter(Boolean).pop() || '';
    if (/^https?:$/.test(u.protocol)) {
      if (['youtube.com', 'youtu.be', 'youtube-nocookie.com'].includes(host)) {
        const id = u.searchParams.get('v') || last;
        if (/^[\w-]{6,20}$/.test(id)) src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
      } else if (['vimeo.com', 'player.vimeo.com'].includes(host) && /^\d+$/.test(last)) {
        src = `https://player.vimeo.com/video/${last}?autoplay=1`;
      }
    }
  } catch { /* invalid url */ }
  if (!src) return null;
  return el('iframe', {
    src,
    title,
    allow: 'autoplay; fullscreen; picture-in-picture',
    allowfullscreen: true,
    loading: 'lazy',
    referrerpolicy: 'strict-origin-when-cross-origin',
  });
}

/* Theme choices (localStorage `aurora-theme`), validated against allow-lists before use. */
export const THEME_KEY = 'aurora-theme';
export const THEMES = {
  ember: 'Ember', light: 'Light', midnight: 'Midnight', forest: 'Forest', mono: 'Mono', docs: 'Docs', 'docs-dark': 'Docs dark',
};
export const FONTS = {
  classic: 'Classic', modern: 'Modern', mono: 'Mono', rounded: 'Rounded', editorial: 'Editorial',
};

export function accentVars(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return {
    '--link-color': hex,
    '--accent-color': hex,
    '--link-hover-color': `color-mix(in srgb, ${hex} 70%, #fff)`,
    '--on-accent': (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#1a0e07' : '#fff',
  };
}

export function readTheme() {
  const s = readJSON(THEME_KEY, {});
  const out = {};
  if (Object.keys(THEMES).includes(s.theme)) out.theme = s.theme;
  if (Object.keys(FONTS).includes(s.font)) out.font = s.font;
  if (s.motion === 'off') out.motion = 'off';
  const hex = s.vars && s.vars['--accent-color'];
  if (typeof hex === 'string' && /^#[0-9a-f]{6}$/i.test(hex)) out.vars = accentVars(hex.toLowerCase());
  return out;
}

export function applyTheme(state, pageTheme) {
  const root = document.documentElement;
  if (state.theme || pageTheme) root.dataset.theme = state.theme || pageTheme;
  if (state.font) root.dataset.font = state.font; else delete root.dataset.font;
  if (state.motion === 'off') root.dataset.motion = 'off'; else delete root.dataset.motion;
  Object.keys(accentVars('#000000')).forEach((v) => root.style.removeProperty(v));
  Object.entries(state.vars || {}).forEach(([k, v]) => root.style.setProperty(k, v));
}
