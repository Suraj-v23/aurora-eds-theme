#!/bin/sh
# Builds a static copy of the demo pages (drafts/) for GitHub Pages.
# Usage: sh tools/build-demo.sh /repo-name
set -e
BASE="${1:-/aurora-eds-theme}"
OUT=_site

rm -rf "$OUT"
mkdir -p "$OUT/library" "$OUT/docs" "$OUT/drafts"
cp -R blocks scripts styles icons favicon.ico "$OUT/"
cp -R drafts/media "$OUT/drafts/"

# GitHub Pages serves the site under /repo-name, so prefix every root-relative path
fix() { sed -e "s#=\"/#=\"$BASE/#g" "$1" > "$2"; }
fix drafts/index.html "$OUT/index.html"
fix drafts/library.html "$OUT/library/index.html"
fix drafts/docs.html "$OUT/docs/index.html"
fix drafts/docs-nav.plain.html "$OUT/drafts/docs-nav.plain.html"
fix drafts/library-nav.plain.html "$OUT/drafts/library-nav.plain.html"
fix drafts/nav.plain.html "$OUT/drafts/nav.plain.html"
fix drafts/footer.plain.html "$OUT/drafts/footer.plain.html"
touch "$OUT/.nojekyll"
echo "Built $OUT for base $BASE"
