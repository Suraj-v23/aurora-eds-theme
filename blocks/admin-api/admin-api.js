/* Admin API helper: builds a curl command only. It never calls the API and never takes a token.
   Optional rows: org | name, site | name, ref | main, path | /. */
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

const q = (s) => `'${String(s).replace(/'/g, "'\\''")}'`; // shell single-quote

export default function decorate(block) {
  const cfg = {};
  [...block.children].forEach((row) => {
    const [k, v] = [...row.children].map((c) => c.textContent.trim());
    if (k && v) cfg[k.toLowerCase()] = v;
  });
  const id = (n) => `admin-api-${n}-${Math.random().toString(36).slice(2, 6)}`;
  const f = {};
  block.innerHTML = '';
  const form = document.createElement('div');
  form.className = 'admin-api-form';
  const field = (name, label, el) => {
    el.id = id(name);
    const w = document.createElement('div');
    const l = document.createElement('label');
    l.htmlFor = el.id;
    l.textContent = label;
    w.append(l, el);
    f[name] = el;
    form.append(w);
    return w;
  };
  [['org', 'Org', cfg.org || '', 'your-org'], ['site', 'Site', cfg.site || '', 'your-site'], ['ref', 'Ref', cfg.ref || 'main', 'main'], ['path', 'Path', cfg.path || '', '/docs/page']].forEach(([n, l, v, ph]) => {
    const i = document.createElement('input');
    Object.assign(i, {
      type: 'text', value: v, placeholder: ph, autocomplete: 'off', spellcheck: false,
    });
    field(n, l, i);
  });
  const op = document.createElement('select');
  Object.entries(OPS).forEach(([k, v]) => op.append(new Option(v[0], k)));
  field('op', 'Operation', op);
  const email = document.createElement('input');
  Object.assign(email, { type: 'email', placeholder: 'person@example.com', autocomplete: 'off' });
  const emailWrap = field('email', 'User email', email);
  const role = document.createElement('select');
  ROLES.forEach((r) => role.append(new Option(r, r)));
  role.value = 'author';
  const roleWrap = field('role', 'Role', role);

  const out = document.createElement('div');
  out.className = 'admin-api-out';
  out.innerHTML = '<div class="admin-api-meta"><span class="admin-api-method"></span><span class="admin-api-explain"></span></div><pre><code></code></pre><div class="admin-api-actions"><button type="button" class="button secondary">Copy</button><a target="_blank" rel="noopener noreferrer" href="https://www.aem.live/docs/admin.html">Admin API documentation</a><span role="status"></span></div><p class="admin-api-note">This page only builds the command. Never paste a token here: set it in your shell as <code>AEM_TOKEN</code>.</p>';
  const code = out.querySelector('code');
  const copy = out.querySelector('button');
  const state = out.querySelector('[role="status"]');

  const update = () => {
    const [, method, why] = OPS[op.value];
    const enc = (s) => encodeURIComponent((s || '').trim());
    const org = enc(f.org.value) || '{org}';
    const site = enc(f.site.value) || '{site}';
    const ref = enc(f.ref.value) || 'main';
    let path = (f.path.value || '').trim().replace(/^\/+/, '').split('/').map(encodeURIComponent)
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
    if (adding) f.site.closest('div').hidden = true;
    else f.site.closest('div').hidden = false;
    let cmd = `curl${method === 'GET' ? '' : ` -X ${method}`} ${q(url)} \\\n  -H "x-auth-token: $AEM_TOKEN"`;
    if (adding) {
      const body = JSON.stringify({ email: email.value.trim() || 'person@example.com', roles: [role.value] });
      cmd += ` \\\n  -H 'Content-Type: application/json' \\\n  --data ${q(body)}`;
    }
    code.textContent = cmd;
    out.querySelector('.admin-api-method').textContent = method;
    out.querySelector('.admin-api-method').dataset.method = method;
    out.querySelector('.admin-api-explain').textContent = why;
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
  block.append(form, out);
  update();
}
