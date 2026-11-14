/*
 * Embed: one cell with a YouTube or Vimeo link (any other https link loads as-is).
 * Nothing is loaded from the video site until the visitor clicks play.
 */
function embedUrl(href) {
  const url = new URL(href);
  if (url.hostname.includes('youtu')) {
    const id = url.searchParams.get('v') || url.pathname.split('/').pop();
    return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
  }
  if (url.hostname.includes('vimeo.com')) {
    return `https://player.vimeo.com/video/${url.pathname.split('/').pop()}?autoplay=1`;
  }
  return url.href;
}

export default function decorate(block) {
  const link = block.querySelector('a[href]');
  if (!link) return;
  const title = link.textContent.trim() || 'Play video';
  const play = document.createElement('button');
  play.type = 'button';
  play.className = 'embed-play';
  play.setAttribute('aria-label', `Play: ${title}`);
  const label = document.createElement('span');
  label.textContent = title;
  play.append(label);
  play.addEventListener('click', () => {
    const frame = document.createElement('iframe');
    frame.src = embedUrl(link.href);
    frame.title = title;
    frame.allow = 'autoplay; fullscreen; picture-in-picture';
    frame.allowFullscreen = true;
    block.replaceChildren(frame);
  });
  block.replaceChildren(play);
}
