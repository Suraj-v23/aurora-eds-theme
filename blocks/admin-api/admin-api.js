/* Admin API helper: builds a curl command only. It never calls the API and never takes a token.
   Optional rows: org | name, site | name, ref | main, path | /. */
import { el } from '../../scripts/utils.js';

const HOST = 'https://admin.hlx.page';
const ROLES = ['admin', 'author', 'publish', 'develop', 'basic_author', 'basic_publish', 'config', 'config_admin'];
const OPS = {
  status: ['Status', 'GET', 'Reads the status of a page: its preview, live and code state.'],
  preview: ['Preview', 'POST', 'Fetches the latest content from its source and updates the preview.'],
  publish: ['Publish', 'POST', 'Publishes the current preview of the page to live.'],
  unpublish: ['Unpublish (live DELETE)', 'DELETE', 'Removes the page from live. The preview stays.'],
  cache: ['Purge cache', 'POST', 'Purges the page from the live CDN cache.'],
  code: ['Code sync', 'POST', 'Syncs code from GitHub (org = owner, site = repo). End the path with * for a whole folder.'],
  config: ['Read site config', 'GET', 'Returns the configuration of the site.'],
  users: ['Read org users', 'GET', 'Lists the users of the organisation and their roles.'],
  adduser: ['Add org user', 'POST', 'Adds or updates a user of the organisation with a role. Needs config write permission.'],
};

// accepted input shapes: anything else is ignored (placeholder shown) and the field flagged
const PATTERNS = {
  org: /^[\w.-]+$/, site: /^[\w.-]+$/, ref: /^[\w.-]+$/, path: /^[\w.~/*-]*$/, email: /^[^\s@'"\\]+@[^\s@'"\\]+\.[^\s@'"\\]+$/,
};

const q = (s) => `'${String(s).replace(/'/g, "'\\''")}'`; // shell single-quote

export default function decorate(block) {
  const cfg = {};
  [...block.children].forEach((row) => {
    const [k, v] = [...row.children].map((c) => c.textContent.trim());
    if (k && v) cfg[k.toLowerCase()] = v;
  });
  const uid = Math.random().toString(36).slice(2, 6);
  const f = {};
  const form = el('div', { class: 'admin-api-form' });
  const field = (name, label, input) => {
    input.id = `admin-api-${name}-${uid}`;
    const w = el('div', null, el('label', { for: input.id }, label), input);
    f[name] = input;
    form.append(w);
    return w;
  };
  [['org', 'Org', cfg.org || '', 'your-org'], ['site', 'Site', cfg.site || '', 'your-site'], ['ref', 'Ref', cfg.ref || 'main', 'main'], ['path', 'Path', cfg.path || '', '/docs/page']].forEach(([n, l, v, ph]) => {
    field(n, l, el('input', {
      type: 'text', value: v, placeholder: ph, autocomplete: 'off', spellcheck: 'false',
    }));
  });
  const op = el('select', null, Object.entries(OPS).map(([k, v]) => new Option(v[0], k)));
  field('op', 'Operation', op);
  const email = el('input', { type: 'email', placeholder: 'person@example.com', autocomplete: 'off' });
  const emailWrap = field('email', 'User email', email);
  const role = el('select', null, ROLES.map((r) => new Option(r, r)));
  role.value = 'author';
  const roleWrap = field('role', 'Role', role);

  const state = el('span', { role: 'status' });
  const copy = el('button', { type: 'button', class: 'button secondary' }, 'Copy');
  const code = el('code');
  const method = el('span', { class: 'admin-api-method' });
  const explain = el('span', { class: 'admin-api-explain' });
  const out = el(
    'div',
    { class: 'admin-api-out' },
    el('div', { class: 'admin-api-meta' }, method, explain),
    el('pre', null, code),
    el(
      'div',
      { class: 'admin-api-actions' },
      copy,
      el('a', { target: '_blank', rel: 'noopener noreferrer', href: 'https://www.aem.live/docs/admin.html' }, 'Admin API documentation'),
      state,
    ),
    el('p', { class: 'admin-api-note' }, 'This page only builds the command. Never paste a token here: set it in your shell as ', el('code', null, 'AEM_TOKEN'), '.'),
  );

  // trimmed value if it matches its pattern, else '' (and the field is flagged)
  const clean = (input, name) => {
    const v = input.value.trim();
    const ok = !v || PATTERNS[name].test(v);
    input.setAttribute('aria-invalid', !ok);
    return ok ? v : '';
  };

  const update = () => {
    const [, verb, why] = OPS[op.value];
    const enc = (s) => encodeURIComponent(s);
    const org = enc(clean(f.org, 'org')) || '{org}';
    const site = enc(clean(f.site, 'site')) || '{site}';
    const ref = enc(clean(f.ref, 'ref')) || 'main';
    let path = clean(f.path, 'path').replace(/^\/+/, '').split('/').map(encodeURIComponent)
      .join('/')
      .replace('%2A', '*');
    if (op.value === 'code' && !path) path = '*';
    const seg = {
      status: 'status', preview: 'preview', publish: 'live', unpublish: 'live', cache: 'cache', code: 'code',
    }[op.value];
    let url;
    if (seg) url = `${HOST}/${seg}/${org}/${site}/${ref}/${path}`;
    else if (op.value === 'config') url = `${HOST}/config/${org}/sites/${site}.json`;
    else url = `${HOST}/config/${org}/users.json`;
    const adding = op.value === 'adduser';
    emailWrap.hidden = !adding;
    roleWrap.hidden = !adding;
    f.path.closest('div').hidden = !seg;
    f.ref.closest('div').hidden = !seg;
    f.site.closest('div').hidden = adding;
    let cmd = `curl${verb === 'GET' ? '' : ` -X ${verb}`} ${q(url)} \\\n  -H "x-auth-token: $AEM_TOKEN"`;
    if (adding) {
      const body = JSON.stringify({ email: clean(email, 'email') || 'person@example.com', roles: [role.value] });
      cmd += ` \\\n  -H 'Content-Type: application/json' \\\n  --data ${q(body)}`;
    }
    code.textContent = cmd;
    method.textContent = verb;
    method.dataset.method = verb;
    explain.textContent = why;
  };
  form.addEventListener('input', update);
  copy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(code.textContent);
      state.textContent = 'Copied';
    } catch (e) {
      const r = document.createRange();
      r.selectNodeContents(code);
      window.getSelection().removeAllRanges();
      window.getSelection().addRange(r);
      state.textContent = 'Press Ctrl/Cmd+C to copy';
    }
    setTimeout(() => { state.textContent = ''; }, 2500);
  });
  block.replaceChildren(form, out);
  update();
}
