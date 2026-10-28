# Handoff: apply this redesign to cryox.co

This repo is a static design preview of a cryox.co refresh (live at https://evanapplegate.github.io/cryo_clone/). The production site is a separate React/Tailwind app. **Port the design into the production codebase; do not copy these HTML files over it.** Every value below is in `docs/css/site.css` and `docs/js/site.js` if you need more detail.

Suggested prompt for the site owner's agent:

> Read https://github.com/evanapplegate/cryo_clone, starting with HANDOFF.md. Apply that redesign to my site: colors, type, layout, copy changes, page restructure and the D3 charts and map. Skip anything HANDOFF.md says not to port. Show me the plan before making changes.

## 1. Color: two colors only

Every color on the site, including charts and the map, is a tint or shade of one orange and one blue, on a warm off-white page.

| Token | Hex | Use |
|---|---|---|
| orange | `#E76830` | primary buttons, highlights, non-CryoPaint chart bars |
| orange-dark | `#B9501F` | button hover, text on orange tint |
| orange-tint | `#F8DCCB` | small tags |
| blue | `#2D60A4` | CryoPaint in every chart, links |
| blue-dark | `#1E4373` | link hover |
| blue-tint | `#D9E3F0` | CryoPaint highlight row, map countries with customers |
| ink | `#13253F` | text, dark bands, footer |
| ink-2 | `#576273` | secondary text |
| bg | `#F4F2EE` | page background |
| surface | `#FBFAF8` | cards |
| rule | `#DCD7CE` | dividers and borders |

## 2. Shape

- Corner radius is **2px everywhere**: buttons, cards, tags, images.
- About 90% of the old pills and badges are gone. The few tags left are small, 2px-radius, sentence case.

## 3. Type: one family, fixed hierarchy

Inter only (400/500/600/700), with tabular numerals for figures.

| Role | Size | Line height | Tracking | Weight |
|---|---|---|---|---|
| H1 (display) | `clamp(2.5rem, 1.6rem + 3.6vw, 4.25rem)` | 1.02 | -0.03em | 700 |
| H2 | `clamp(1.75rem, 1.35rem + 1.6vw, 2.5rem)` | 1.1 | -0.022em | 700 |
| H3 | 1.25rem | 1.3 | -0.01em | 600 |
| Body | 1.0625rem | 1.6 | 0 | 400 |
| Small | 0.875rem | 1.5 | 0 | 400 |

- **No all-caps text and no eyebrow labels above headings**, anywhere. That includes chart labels, table headers and footer headings.
- Buttons use the body font at weight 600, 1rem.
- Max content width 1160px. Side gutter `clamp(16px, 4vw, 40px)`. Section padding `clamp(64px, 9vw, 120px)` top and bottom, with a 1px rule between sections.

## 4. Brand details

- **Logo:** the ".co" box is cropped off; the wordmark reads "CRYO X", in ink in the header and bg color in the footer (`docs/img/logo-*.png`, made by `tools/prep_images.py`).
- **Background sun:** `docs/img/sun.svg`, an engraving-style sun drawn entirely in `#E8E3D9`. It's 30vw wide, centered on the page's top-left corner so only its bottom-right quarter shows, sits behind all content, and rotates once every 120 seconds (stopped under `prefers-reduced-motion`). The header is transparent at the top of the page so the sun shows, then fills with bg at 92% opacity plus blur once the page scrolls.

## 5. Homepage: decluttered

New order, top to bottom:

1. **Hero.** Copy changes:
   - Headline: "Paint that cools surfaces up to **15°F below** air temperature." ("15°F below" in orange)
   - Intro: "Made-in-Ohio CryoPaint® reflects 94% of sunlight and can run cooler than the shade, even in full sun."
   - Buttons: "Buy a gallon for ~~$275~~ $250" (orange) and "Try a $20 sample" (outlined)
   - Line under the buttons: "Shipping internationally • Bulk and wholesale pricing on request." ("on request" links to the contact page)
   - Thermal photo on the right, with a caption.
2. **Tested, awarded, and used worldwide:** Popular Science award card, Action Lab video card (click to load the YouTube embed), ratings row, customer map.
3. **How CryoPaint compares:** range bar chart. The test conditions, method and full source list sit in one collapsible "Conditions and Sources" section below it.
4. **CryoPaint vs. insulation:** 24-hour line chart with two callouts below.
5. **Cooling with physics, not power:** two points ("Reflects almost all sunlight", "Radiates heat to space") with no 01/02 numerals, plus the diagram.
6. **Pricing:** sample vs. gallon cards.
7. **Closing banner** (ink background).

Removed from the homepage: the 94% / 90% / 15°F stats strip, the eyebrow labels, the Amazon line in the hero, and the other sections listed below.

## 6. Content moved off the homepage

- **To About:** About-us blurbs, Benefits, Built for the real world (applications), the industry logo wall, the 1,500-hour UV test, plus the existing About content (timeline, products, partnerships and press, mission).
- **To FAQ:** When CryoPaint works best (conditions, each with an impact tag), How much paint to use (rate table and notes), plus all 62 existing Q&As regrouped into seven sections: The basics; Performance; Buildings, insulation and equipment; Vehicles, RVs and gear; Surfaces and application; Durability and care; Buying and support. A filter box at the top replaces the chatbot search. See `docs/faq.html` for the grouping, or `FAQ_GROUPS` in `tools/build.py`.

## 7. Charts and map (D3 v7)

All of them are in `docs/js/site.js` and redraw on resize. The two charts switch to a phone layout under 640px and animate once when scrolled into view (no animation under reduced motion). The diagram has a phone layout under 520px; the map just scales.

- **How CryoPaint compares:** horizontal range bars from 80°F to 180°F, a dashed line for 100°F air temperature, CryoPaint row highlighted in blue tint. On phones, labels sit above each bar. The data is the `ROOFS` array.
- **CryoPaint vs. insulation:** illustrative, with no temperature numbers on the axis. The insulation curve is a lagged average of air temperature plus solar gain; CryoPaint tracks air temperature minus a fixed offset. Night is shaded. The note reads "CryoPaint surfaces stay at ~15°F below air temp, day and night".
- **How radiative cooling works:** flat bands for space, atmosphere and surface; wavy 8–13 µm heat arrow to space; sunlight arrow with reflected arrows; gently twinkling stars.
- **Customer map:** Natural Earth projection without Antarctica, using `world-atlas@2` countries-110m. Dots come from `docs/data/customers.json` (lon/lat, extracted from the old map image). Countries containing a dot are filled blue tint; dots are orange.

## 8. Do NOT port

- **The text control panel** (`docs/js/panel.js` and the `#type-panel` CSS). It's a design-review tool; the values it was used to pick are already the defaults above.
- `<meta name="robots" content="noindex">` and the canonical links pointing at cryox.co. They only exist so the preview doesn't compete with the real site in search.
- The `?static` URL switch, the `tools/` build scripts and the `vendor/` copies of D3 and topojson. Use npm packages instead.
- Links to cryox.co pages that aren't in this preview (Product, guides, Contact, policies). Keep the production routes.

## 9. Check when done

Desktop and 375px phone width: no horizontal scroll, no console errors, all four graphics render, and no all-caps text or radius above 2px anywhere.
