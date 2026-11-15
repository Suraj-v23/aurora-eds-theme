/* Video: row 1 = video URL (mp4, YouTube or Vimeo) + optional poster image. Loads only on click. */
function iframeSrc(href) {
  const u = new URL(href);
  if (u.hostname.includes('youtu')) {
    return `https://www.youtube-nocookie.com/embed/${u.searchParams.get('v') || u.pathname.split('/').pop()}?autoplay=1`;
  }
  if (u.hostname.includes('vimeo.com')) return `https://player.vimeo.com/video/${u.pathname.split('/').pop()}?autoplay=1`;
  return u.href;
}

export default function decorate(block) {
  const cell = block.firstElementChild;
  const poster = block.querySelector('img');
  const raw = block.querySelector('a[href]')?.href || cell?.textContent.trim();
  let url;
  try { url = new URL(raw, window.location.href).href; } catch (e) { return; }
  const title = poster?.alt || 'Play video';
  const play = document.createElement('button');
  play.type = 'button';
  play.className = 'video-play';
  play.setAttribute('aria-label', title);
  if (poster) play.append(poster.closest('picture') || poster);
  play.insertAdjacentHTML('beforeend', '<span class="video-icon" aria-hidden="true"></span>');
  play.addEventListener('click', () => {
    let player;
    if (/\.(mp4|webm|ogg|m4v)(\?|#|$)/i.test(url)) {
      player = document.createElement('video');
      Object.assign(player, {
        src: url, controls: true, autoplay: true, playsInline: true,
      });
      if (poster) player.poster = poster.currentSrc || poster.src;
    } else {
      player = document.createElement('iframe');
      player.src = iframeSrc(url);
      player.allow = 'autoplay; fullscreen; picture-in-picture';
      player.allowFullscreen = true;
    }
    player.title = title;
    block.replaceChildren(player);
    player.focus();
  });
  block.replaceChildren(play);
}
