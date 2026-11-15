import { el } from './utils.js';

const S = /"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`/.source;
const NUM = /\b\d[\d.]*\b/.source;
const LANGS = {
  js: [['comment', /\/\/.*|\/\*[\s\S]*?\*\//.source], ['string', S], ['number', NUM],
    ['keyword', /\b(?:const|let|var|function|return|if|else|for|while|import|export|from|default|await|async|new|class|try|catch|throw|of|in|typeof|true|false|null|undefined)\b/.source]],
  css: [['comment', /\/\*[\s\S]*?\*\//.source], ['string', S], ['number', /#[0-9a-f]{3,8}\b|\b\d[\d.]*(?:px|rem|em|%|vw|ch|ms|s)?/i.source],
    ['keyword', /@[\w-]+|--?[\w-]+(?=\s*:)/.source], ['tag', /var\(|\bclamp\(|color-mix\(/.source]],
  html: [['comment', /<!--[\s\S]*?-->/.source], ['tag', /<\/?[\w-]+|\/?>/.source], ['string', S], ['keyword', /[\w:-]+(?==)/.source]],
  bash: [['comment', /(?:^|\s)#.*/.source], ['string', S], ['tag', /\$\{[^}]*\}|\$\w+/.source],
    ['keyword', /(?:^|\s)--?[a-z][\w-]*|\b(?:export|cd|if|then|fi|for|do|done|in|echo|curl|npm|npx|git|node)\b/.source]],
  json: [['keyword', /"(?:\\.|[^"\\\n])*"(?=\s*:)/.source], ['string', S], ['number', NUM], ['keyword', /\b(?:true|false|null)\b/.source]],
  yaml: [['comment', /#.*/.source], ['keyword', /^[ \t-]*[\w.-]+(?=:(?:\s|$))/.source], ['string', S], ['number', NUM]],
};
const ALIAS = {
  javascript: 'js', mjs: 'js', sh: 'bash', shell: 'bash', zsh: 'bash', htm: 'html', xml: 'html', yml: 'yaml',
};

/** Splits code into text nodes and token spans (no HTML parsing of the code). */
function highlight(code, rules) {
  const re = new RegExp(rules.map(([, p]) => `(${p})`).join('|'), 'gm');
  const out = [];
  let last = 0;
  [...code.matchAll(re)].forEach((m) => {
    if (!m[0]) return;
    const type = rules[m.slice(1).findIndex((g) => g !== undefined)][0];
    out.push(code.slice(last, m.index), el('span', { class: `tk-${type}` }, m[0]));
    last = m.index + m[0].length;
  });
  out.push(code.slice(last));
  return out;
}

function guess(code) {
  if (/^\s*</.test(code)) return 'html';
  if (/^\s*[{[]/.test(code)) return 'json';
  if (/^\s*(?:\$|curl|npm|npx|git|export|cd)\b/.test(code)) return 'bash';
  return '';
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const t = el('textarea', { readonly: true, style: 'position:fixed;opacity:0' });
    t.value = text;
    document.body.append(t);
    t.select();
    document.execCommand('copy');
    t.remove();
  }
}

/** Wraps every <pre> with a header bar (language label, Copy button) and highlights it. */
export default function decorateCodeBlocks(main) {
  main.querySelectorAll('pre').forEach((pre) => {
    if (pre.parentElement.classList.contains('code-block')) return;
    const code = pre.querySelector('code') || pre;
    let text = code.textContent.replace(/\n$/, '');
    const cls = [...code.classList, ...pre.classList].find((c) => c.startsWith('language-'));
    const hint = text.match(/^(?:\/\/|#|<!--)\s*lang:\s*(\w+)[ \t]*(?:-->)?\n/);
    if (hint) text = text.slice(hint[0].length);
    const raw = (cls ? cls.slice(9) : hint?.[1] || guess(text)).toLowerCase().replace(/[^a-z0-9+#-]/g, '').slice(0, 16);
    const lang = ALIAS[raw] || raw;
    code.replaceChildren(...(LANGS[lang] ? highlight(text, LANGS[lang]) : [text]));
    if (code === pre) pre.replaceChildren(el('code', null, ...pre.childNodes));
    const label = el('span', { 'aria-live': 'polite' }, 'Copy');
    const btn = el('button', { type: 'button', class: 'code-copy', 'aria-label': 'Copy code' }, el('span', { class: 'icon icon-copy' }), el('span', { class: 'icon icon-check' }), label);
    btn.addEventListener('click', async () => {
      await copyText(text);
      btn.classList.add('copied');
      label.textContent = 'Copied';
      setTimeout(() => { btn.classList.remove('copied'); label.textContent = 'Copy'; }, 1500);
    });
    const bar = el('div', { class: 'code-bar' }, el('span', { class: 'code-lang' }, raw || 'code'), btn);
    const wrap = el('div', { class: 'code-block' }, bar);
    pre.replaceWith(wrap);
    wrap.append(pre);
  });
}
