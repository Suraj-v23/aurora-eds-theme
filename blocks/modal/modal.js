import { el, createDialog } from '../../scripts/utils.js';

/* Modal: one row. Column 1 = button label, column 2 = content shown in the dialog. */
export default function decorate(block) {
  const [label, content] = block.firstElementChild?.children || [];
  if (!label || !content) return;

  const dialog = createDialog('modal-dialog'); // backdrop click closes it
  content.className = 'modal-content';
  dialog.append(el('button', {
    type: 'button', class: 'modal-close', 'aria-label': 'Close', onclick: () => dialog.close(),
  }), content);

  const open = el('button', { type: 'button', class: 'button primary', onclick: () => dialog.showModal() }, label.textContent.trim());

  block.replaceChildren(open, dialog);
}
