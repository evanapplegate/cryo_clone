# cryo_clone

Design refresh of cryox.co. Live preview: https://evanapplegate.github.io/cryo_clone/

- `docs/` is the published site (GitHub Pages, main branch, /docs).
- Edit pages in `tools/pages/` and shared header/footer in `tools/partials/`, then run `python3 tools/build.py`.
- FAQ entries are generated from `tools/faq_ld.json`.
- Palette: orange `#E76830`, blue `#2D60A4`, background `#F4F2EE` (tokens in `docs/css/site.css`).
- Charts and map: D3, in `docs/js/site.js`. Customer dots in `docs/data/customers.json` (extracted from the old raster map by `tools/extract_dots.py`).
