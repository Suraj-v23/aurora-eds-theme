/*
 * Embed: one cell with a YouTube or Vimeo link (other hosts are not embedded).
 * Nothing is loaded from the video site until the visitor clicks play.
 */
import { el, embedFrame } from '../../scripts/utils.js';

export default function decorate(block) {
  const link = block.querySelector('a[href]');
  if (!link) return;
  const title = link.textContent.trim() || 'Play video';
  if (!embedFrame(link.href, title)) return;
  const play = el('button', { type: 'button', class: 'embed-play', 'aria-label': `Play: ${title}` }, el('span', null, title));
  play.addEventListener('click', () => block.replaceChildren(embedFrame(link.href, title)));
  block.replaceChildren(play);
}
