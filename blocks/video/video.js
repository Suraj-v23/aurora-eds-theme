/* Video: row 1 = video URL (mp4, YouTube or Vimeo) + optional poster image. Loads only on click. */
import { el, safeUrl, embedFrame } from '../../scripts/utils.js';

export default function decorate(block) {
  const poster = block.querySelector('img');
  const raw = block.querySelector('a[href]')?.href || block.firstElementChild?.textContent;
  const url = safeUrl(raw); // http(s) only
  const isFile = /\.(mp4|webm|ogg|m4v)(\?|#|$)/i.test(url);
  const title = poster?.alt || 'Play video';
  if (!url || (!isFile && !embedFrame(url, title))) return;
  const play = el('button', { type: 'button', class: 'video-play', 'aria-label': title });
  if (poster) play.append(poster.closest('picture') || poster);
  play.append(el('span', { class: 'video-icon', 'aria-hidden': 'true' }));
  play.addEventListener('click', () => {
    const player = isFile
      ? el('video', {
        controls: true,
        autoplay: true,
        playsinline: true,
        src: url,
        poster: poster && (poster.currentSrc || poster.src),
        title,
      })
      : embedFrame(url, title);
    block.replaceChildren(player);
    player.focus();
  });
  block.replaceChildren(play);
}
