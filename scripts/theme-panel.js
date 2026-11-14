/* Theme customizer: floating button + side panel. Choices persist in localStorage. */
const KEY = 'aurora-theme';
const THEMES = ['ember', 'light', 'midnight', 'forest', 'mono'];
const FONTS = ['classic', 'modern', 'mono', 'rounded', 'editorial'];
const root = document.documentElement;

let state = {};
try { state = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { /* none saved */ }

function accentVars(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
  return {
    '--link-color': hex,
    '--accent-color': hex,
    '--link-hover-color': `color-mix(in srgb, ${hex} 70%, #fff)`,
    '--on-accent': (r * 299 + g * 587 + b * 114) / 1000 > 150 ? '#1a0e07' : '#fff',
  };
}
const VARS = Object.keys(accentVars('#000000'));

function currentAccent() {
  const v = getComputedStyle(root).getPropertyValue('--accent-color').trim();
  return v.length === 4 ? `#${[...v.slice(1)].map((c) => c + c).join('')}` : v;
}

const label = (text, inner) => `<label>${inner}<span>${text}</span></label>`;
const panel = document.createElement('dialog');
panel.className = 'theme-panel';
panel.setAttribute('aria-label', 'Theme customizer');
panel.innerHTML = `
  <div class="theme-panel-head"><h2>Customize</h2><button type="button" class="theme-panel-close" aria-label="Close panel" autofocus>×</button></div>
  <fieldset><legend>Theme</legend><div class="theme-panel-themes">${THEMES.map((t) => `<button type="button" data-theme="${t}" aria-label="${t}" title="${t}"></button>`).join('')}</div></fieldset>
  <fieldset><legend>Accent color</legend>${label('Pick a color', '<input type="color" name="accent">')}</fieldset>
  <fieldset><legend>Font style</legend>${FONTS.map((f) => `<label data-font="${f}"><input type="radio" name="font" value="${f}"><span>Aa ${f}</span></label>`).join('')}</fieldset>
  <fieldset><legend>Motion</legend>${label('Animations', '<input type="checkbox" name="motion">')}</fieldset>
  <button type="button" class="button secondary theme-panel-reset">Reset</button>`;

const fab = document.createElement('button');
fab.type = 'button';
fab.className = 'theme-panel-toggle';
fab.setAttribute('aria-label', 'Customize theme');
fab.setAttribute('aria-haspopup', 'dialog');
fab.innerHTML = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentcolor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h9M19 7h1M4 17h1M11 17h9"/><circle cx="16" cy="7" r="2.500"/><circle cx="8" cy="17" r="2.500"/></svg>';

function apply() {
  root.dataset.theme = state.theme || 'ember';
  root.dataset.font = state.font || 'classic';
  if (state.motion === 'off') root.dataset.motion = 'off'; else delete root.dataset.motion;
  VARS.forEach((v) => root.style.removeProperty(v));
  Object.entries(state.vars || {}).forEach(([k, v]) => root.style.setProperty(k, v));
  panel.querySelectorAll('[data-theme]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.theme === root.dataset.theme));
  panel.querySelector(`[name=font][value=${root.dataset.font}]`).checked = true;
  panel.querySelector('[name=motion]').checked = state.motion !== 'off';
  panel.querySelector('[name=accent]').value = currentAccent();
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* storage blocked */ }
}

panel.addEventListener('click', (e) => {
  const { target } = e;
  if (target === panel || target.closest('.theme-panel-close')) panel.close();
  const swatch = target.closest('button[data-theme]');
  if (swatch) state = { ...state, theme: swatch.dataset.theme, vars: undefined };
  if (target.closest('.theme-panel-reset')) state = {};
  if (swatch || target.closest('.theme-panel-reset')) apply();
});
panel.addEventListener('input', ({ target: t }) => {
  if (t.name === 'accent') state.vars = accentVars(t.value);
  if (t.name === 'font') state.font = t.value;
  if (t.name === 'motion') state.motion = t.checked ? 'on' : 'off';
  apply();
});
fab.addEventListener('click', () => panel.showModal());

document.body.append(fab, panel);
apply();
