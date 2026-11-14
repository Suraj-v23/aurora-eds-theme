/* Modal: one row. Column 1 = button label, column 2 = content shown in the dialog. */
export default function decorate(block) {
  const [label, content] = block.firstElementChild?.children || [];
  if (!label || !content) return;

  const dialog = document.createElement('dialog');
  dialog.className = 'modal-dialog';
  const close = document.createElement('button');
  close.type = 'button';
  close.className = 'modal-close';
  close.setAttribute('aria-label', 'Close');
  close.addEventListener('click', () => dialog.close());
  content.className = 'modal-content';
  dialog.append(close, content);
  // click on the backdrop closes the dialog
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) dialog.close();
  });

  const open = document.createElement('button');
  open.type = 'button';
  open.className = 'button primary';
  open.textContent = label.textContent.trim();
  open.addEventListener('click', () => dialog.showModal());

  block.replaceChildren(open, dialog);
}
