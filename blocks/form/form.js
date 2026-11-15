/* Form: rows = Label | Type (text, email, textarea, select, checkbox) | Required | Options.
   Last row: submit | Button label | https://endpoint. Without an endpoint it only shows a demo message. */
import { slugify as slug } from '../../scripts/utils.js';

/** Submit target: https (or same-origin) only; null otherwise. */
function endpointUrl(raw) {
  try {
    const u = new URL(raw, window.location.href);
    return u.protocol === 'https:' || u.origin === window.location.origin ? u : null;
  } catch { return null; }
}

export default function decorate(block) {
  const form = document.createElement('form');
  form.noValidate = true;
  let submit = { label: 'Send', endpoint: '' };
  const fields = [];
  [...block.children].forEach((row, i) => {
    const [l, t, r, o] = [...row.children].map((c) => c.textContent.trim());
    if (!l) return;
    if (l.toLowerCase() === 'submit') {
      submit = { label: t || 'Send', endpoint: row.children[2]?.querySelector('a')?.href || r || '' };
      return;
    }
    const type = (t || 'text').toLowerCase();
    const id = `form-${slug(l)}-${i}`;
    const wrap = document.createElement('div');
    wrap.className = `form-field form-${type}`;
    const label = document.createElement('label');
    label.htmlFor = id;
    label.textContent = l;
    const err = document.createElement('span');
    err.className = 'form-error';
    err.id = `${id}-err`;
    let el;
    if (type === 'textarea') el = document.createElement('textarea');
    else if (type === 'select') {
      el = document.createElement('select');
      el.append(new Option('Choose...', ''));
      (o || '').split(',').map((s) => s.trim()).filter(Boolean).forEach((s) => el.append(new Option(s, s)));
    } else {
      el = document.createElement('input');
      el.type = ['email', 'checkbox'].includes(type) ? type : 'text';
    }
    Object.assign(el, { id, name: slug(l) });
    const required = /^(yes|true|x|required|\*)$/i.test(r || '');
    if (required) { el.required = true; label.append(' *'); }
    el.setAttribute('aria-describedby', err.id);
    wrap.append(...(type === 'checkbox' ? [el, label, err] : [label, el, err]));
    form.append(wrap);
    fields.push({
      el, label: l, required, type,
    });
  });

  const status = document.createElement('p');
  status.className = 'form-status';
  status.setAttribute('role', 'status');
  const btn = document.createElement('button');
  btn.type = 'submit';
  btn.className = 'button primary';
  btn.textContent = submit.label;
  form.append(btn, status);

  const check = ({ el, required, type }) => {
    const v = type === 'checkbox' ? el.checked : el.value.trim();
    let msg = '';
    if (required && !v) msg = type === 'checkbox' ? 'Please tick this box.' : 'This field is required.';
    else if (type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'Enter a valid email address.';
    el.setAttribute('aria-invalid', !!msg);
    document.getElementById(`${el.id}-err`).textContent = msg;
    return !msg;
  };
  fields.forEach((f) => f.el.addEventListener('input', () => f.el.getAttribute('aria-invalid') === 'true' && check(f)));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'form-status';
    const bad = fields.filter((f) => !check(f));
    if (bad.length) {
      status.textContent = 'Please fix the highlighted fields.';
      status.classList.add('error');
      bad[0].el.focus();
      return;
    }
    const data = Object.fromEntries(fields.map((f) => [f.el.name, f.type === 'checkbox' ? f.el.checked : f.el.value.trim()]));
    if (submit.endpoint) {
      btn.disabled = true;
      try {
        const url = endpointUrl(submit.endpoint);
        if (!url) throw new Error('endpoint must be https');
        const resp = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
          credentials: url.origin === window.location.origin ? 'same-origin' : 'omit',
          referrerPolicy: 'strict-origin-when-cross-origin',
        });
        if (!resp.ok) throw new Error(resp.status);
      } catch (err) {
        btn.disabled = false;
        status.textContent = 'Sorry, something went wrong. Please try again.';
        status.classList.add('error');
        return;
      }
      btn.disabled = false;
    }
    form.reset();
    status.textContent = submit.endpoint ? 'Thanks! Your message was sent.' : 'Thanks! (Demo form: nothing was sent.)';
    status.classList.add('ok');
  });
  block.replaceChildren(form);
}
