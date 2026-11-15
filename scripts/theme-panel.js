/* Theme customizer: launcher pill + slide-in panel. Choices persist in localStorage. */
import {
  THEMES, FONTS, THEME_KEY, accentVars, applyTheme, readTheme, writeJSON, createDialog, el,
} from './utils.js';

const ACCENTS = {
  '#f97316': 'Orange', '#ef5b5b': 'Coral', '#f5a524': 'Amber', '#10b981': 'Emerald', '#0ea5e9': 'Sky', '#6366f1': 'Indigo', '#a855f7': 'Violet', '#ec4899': 'Pink',
};
const root = document.documentElement;
const pageTheme = document.querySelector('meta[name="theme"]')?.content || 'ember';
const CHECK = '<svg class="tp-check" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="12" fill="currentcolor"/><path d="m7 12.500 3.200 3.200L17 9" fill="none" stroke-width="2.600" stroke-linecap="round" stroke-linejoin="round"/></svg>';

let state = readTheme();

function currentAccent() {
  const v = getComputedStyle(root).getPropertyValue('--accent-color').trim().toLowerCase();
  return v.length === 4 ? `#${[...v.slice(1)].map((c) => c + c).join('')}` : v;
}

const panel = createDialog('theme-panel', 'Customize theme');
panel.innerHTML = `<div class="tp-body">
  <header class="tp-head"><div><h2>Customize</h2><p>Make it yours. Saved in your browser.</p></div><button type="button" class="tp-close" aria-label="Close" autofocus>×</button></header>
  <section><h3>Theme</h3><div class="tp-themes">${Object.entries(THEMES).map(([k, n]) => `<button type="button" class="tp-theme" data-key="${k}" aria-pressed="false"><span class="tp-prev" data-theme="${k}"><i class="h"></i><i class="l"></i><i class="l s"></i><i class="b"></i></span>${CHECK}<span class="tp-name">${n}</span></button>`).join('')}</div></section>
  <section><h3>Accent colour</h3><div class="tp-swatches">${Object.entries(ACCENTS).map(([h, n]) => `<button type="button" class="tp-sw" data-accent="${h}" style="--c:${h}" aria-label="${n}" title="${n}" aria-pressed="false"></button>`).join('')}<label class="tp-sw tp-custom" title="Custom colour"><input type="color" name="accent" aria-label="Custom colour"></label></div><p class="tp-hex"></p></section>
  <section><h3>Text style</h3><div class="tp-fonts">${Object.entries(FONTS).map(([k, n]) => `<label class="tp-font" data-font="${k}"><input type="radio" name="font" value="${k}"><b>Aa</b><span>${n}</span></label>`).join('')}</div></section>
  <section><h3>Motion</h3><div class="tp-row"><span>Animations<small>Scroll and hover effects</small></span><button type="button" class="tp-switch" role="switch" aria-checked="true" aria-label="Animations"></button></div></section>
  <footer><button type="button" class="tp-reset">Reset to default</button></footer></div>`;

const fab = el('button', {
  type: 'button', class: 'theme-panel-toggle', 'aria-haspopup': 'dialog', 'aria-label': 'Customize theme',
});
fab.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentcolor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a9 9 0 1 0 0 18c1.400 0 2-1 2-2 0-1.500-1-1.600-1-2.800 0-1 .8-1.700 1.800-1.700H17a4 4 0 0 0 4-4c0-4-4-7.500-9-7.500Z"/><circle cx="7.500" cy="11" r="1" fill="currentcolor"/><circle cx="10.500" cy="7" r="1" fill="currentcolor"/><circle cx="15" cy="7.500" r="1" fill="currentcolor"/></svg><span>Customize</span>';

function apply() {
  applyTheme(state, pageTheme);
  const { theme } = root.dataset;
  panel.querySelectorAll('.tp-theme').forEach((b) => b.setAttribute('aria-pressed', b.dataset.key === theme));
  panel.querySelector(`[name=font][value=${state.font || (theme.startsWith('docs') ? 'modern' : 'classic')}]`).checked = true;
  const acc = currentAccent();
  panel.querySelectorAll('.tp-sw[data-accent]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.accent === acc));
  const custom = panel.querySelector('.tp-custom');
  const isCustom = !ACCENTS[acc] && !!state.vars;
  custom.classList.toggle('on', isCustom);
  custom.style.setProperty('--c', isCustom ? acc : 'transparent');
  panel.querySelector('[name=accent]').value = /^#[0-9a-f]{6}$/.test(acc) ? acc : '#6e6ff0';
  panel.querySelector('.tp-hex').textContent = `${state.vars ? ACCENTS[acc] || 'Custom' : 'Theme default'} · ${acc}`;
  panel.querySelector('.tp-switch').setAttribute('aria-checked', state.motion !== 'off');
  writeJSON(THEME_KEY, state);
}

panel.addEventListener('click', ({ target }) => {
  if (target.closest('.tp-close')) panel.close();
  const theme = target.closest('.tp-theme');
  const sw = target.closest('button.tp-sw');
  if (theme) state = { ...state, theme: theme.dataset.key, vars: undefined };
  if (sw) state = { ...state, vars: accentVars(sw.dataset.accent) };
  if (target.closest('.tp-switch')) state.motion = state.motion === 'off' ? 'on' : 'off';
  if (target.closest('.tp-reset')) state = {};
  if (target.closest('.tp-theme, button.tp-sw, .tp-switch, .tp-reset')) apply();
});
panel.addEventListener('input', ({ target: t }) => {
  if (t.name === 'accent' && /^#[0-9a-f]{6}$/i.test(t.value)) state.vars = accentVars(t.value.toLowerCase());
  if (t.name === 'font' && FONTS[t.value]) state.font = t.value;
  apply();
});
fab.addEventListener('click', () => panel.showModal());

document.body.append(fab, panel);
apply();
