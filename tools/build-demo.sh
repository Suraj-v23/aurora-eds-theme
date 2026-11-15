#!/bin/sh
# Builds a static copy of the demo pages (drafts/) for GitHub Pages.
# Usage: sh tools/build-demo.sh /repo-name
set -e
BASE="${1:-/aurora-eds-theme}"
OUT=_site

rm -rf "$OUT"
mkdir -p "$OUT/library" "$OUT/docs" "$OUT/developer" "$OUT/drafts"
cp -R blocks scripts styles icons favicon.ico "$OUT/"
cp -R drafts/media "$OUT/drafts/"

# GitHub Pages serves the site under /repo-name, so prefix every root-relative path
fix() { sed -e "s#=\"/#=\"$BASE/#g" "$1" > "$2"; }
fix drafts/index.html "$OUT/index.html"
fix drafts/library.html "$OUT/library/index.html"
fix drafts/docs.html "$OUT/docs/index.html"
fix drafts/developer.html "$OUT/developer/index.html"
fix drafts/developer-nav.plain.html "$OUT/drafts/developer-nav.plain.html"
fix drafts/docs-nav.plain.html "$OUT/drafts/docs-nav.plain.html"
fix drafts/library-nav.plain.html "$OUT/drafts/library-nav.plain.html"
fix drafts/nav.plain.html "$OUT/drafts/nav.plain.html"
fix drafts/footer.plain.html "$OUT/drafts/footer.plain.html"

# site search index: one entry per page plus one per h2/h3 (path#slug), with the base prefix
node - "$OUT" "$BASE" <<'JS'
const fs = require('fs');
const [out, base] = process.argv.slice(2);
const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const strip = (h) => h.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const data = [];
[['index', '/'], ['library', '/library'], ['docs', '/docs'], ['developer', '/developer']].forEach(([f, p]) => {
  const html = fs.readFileSync(`drafts/${f}.html`, 'utf8');
  const path = base + p;
  const title = strip((html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || f);
  const description = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1] || '';
  data.push({ path, title, description });
  const re = /<h([23])([^>]*)>([\s\S]*?)<\/h\1>(\s*<p>([\s\S]*?)<\/p>)?/g;
  let m;
  while ((m = re.exec(html))) {
    const text = strip(m[3]);
    const id = (m[2].match(/id="([^"]*)"/) || [])[1] || slug(text);
    data.push({ path: `${path}#${id}`, title: text, description: m[5] ? strip(m[5]).slice(0, 160) : title });
  }
});
fs.writeFileSync(`${out}/query-index.json`, JSON.stringify({ total: data.length, offset: 0, limit: data.length, data }));
JS
touch "$OUT/.nojekyll"
echo "Built $OUT for base $BASE"
