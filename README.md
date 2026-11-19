# Nguyen Vo — Art Studio landing page (v2)

Purpose: make visitors feel the effort and originality. Immersive and interactive first, sales second.

## Run it
Open `index.html` in a browser. If the preview tool shows it unstyled, serve the folder instead:

```bash
cd "/Users/nguyenvo/Documents/Website Portfolio" && python3 -m http.server 8765
```
then open http://localhost:8765

## Files
- `index.html` — structure
- `css/style.css` — styling
- `js/main.js` — all interaction (no libraries)
- `v1-landing.html` — the earlier lime/pill version, kept as a backup

## What's in it
1. **Loader** — counter with rotating words, curtain reveal
2. **Hero** — live WebGL shader, letters repel the cursor, click for a ripple
3. **Ribbon** — tilted marquee
4. **Rules** — old design rules struck through, replaced by your own
5. **Manifesto** — words light up as you scroll
6. **Exhibits** — horizontal scroll gallery, five live generative pieces that react to the cursor
7. **Process** — count-up stats and a "studio.log" of the making-of
8. **Playground** — open-world sandbox of chrome objects to drag, throw, stack and click (drawing removed in v12)
9. **Footer** — outlined name with a cursor spotlight

Also: custom cursor with labels, HUD (time, coordinates, section, scroll %), scramble-text links.

## Mobile
- Full-screen menu (Menu / Close button, top right) replaces the desktop nav
- Hero shader drifts on its own; touch it to steer it, tap for a ripple
- Exhibits become a swipe carousel with snap; touching a piece disturbs it
- Playground objects can be dragged by touch; the object tray scrolls sideways
- Lighter shader resolution and fewer particles for battery and performance
- Hover-only effects are disabled on touch screens

## Tablet
- Portrait (iPad, ~761–1100px wide): bigger hero title, hero list returns, gallery pieces sized to the width so they never fill the whole screen
- Landscape (~901–1200px wide): tighter title so the ribbon never clips it, full top nav
- Gallery pieces now scale from one variable (`--h` in `.gallery`), so aspect ratios hold on every device

## Palette — Chrome + Signal (v3)
Light (pearl) is the default. The "Dark" switch in the top bar flips to void and remembers the choice.

| Token | Light | Dark | Role |
|---|---|---|---|
| `--bg` | `#F4F3F0` pearl | `#0A0A0B` void | Page |
| `--bg-2` | `#E8E8E6` mist | `#121315` | Gallery, playground |
| `--fg` | `#0A0A0B` | `#ECECEA` | Text |
| `--fg-2` | `#6E7176` | `#8D9095` | Muted text |
| `--signal` | `#F2540A` | `#F2540A` | The only accent — keep it rare |
| `--chrome` | silver gradient | same | Chrome text fills |

Hero shader is liquid mercury, with an orange rim only near the cursor. All tokens are at the top of `css/style.css`.
The previous lime version is kept in `archive/`.

## Typography — Cyber / Swiss (v4)
- **Inter Tight** (800/700): uppercase display, tight tracking — hero name, section headlines, manifesto, footer
- **Archivo Expanded** (300–400, width 125): the wide accent face, replacing the old serif italics ("RULES I BROKE.", "EXPERIMENTS", "THE MEDIUM.")
- **DM Mono**: system labels, framed in brackets like `[ HOUSE RULES — Nº 01 ]` (add class `lbl` to any label)
- Chrome text uses `--chrome-text`: gunmetal in light mode, bright chrome in dark mode
- The whole type layer is the "TYPOGRAPHY v4" block at the bottom of `css/style.css`; the pre-typography version is in `archive/`

## Chrome objects (v6) — replaced the v5 sigils
- Two 3D brushed-chrome slabs built from six CSS faces (no images): engraved type, screws, hard floor shadow
- "RULE BREAKER" slab under the Rules headline (desktop only); "MADE BY HAND" slab in the Process header
- Both tilt toward the cursor and a light sheen slides across the face (gentle sway on touch screens)
- Edit the engraved text directly in `index.html` (`.slab` blocks); styles are "CHROME SLABS v6" in `css/style.css`
- Kept from v5: thorn crown on the hero badge, thorn crop-marks on gallery frames. `tools/sigil.py` is no longer used.

## Name font
- "NGUYEN VO" (hero + footer) uses **Syncopate** 700, a wide luxury-futuristic face
- Hero tagline: "Re-Imagine Cos-Mix Gallery"; gallery headline: "Experiments in disobedience."

## Theme switch (v7)
- 3D neumorphic pill (inspired by the "3D Neumorphic Pill Toggle Switch" on freefrontend.com, rebuilt from scratch in this palette)
- Pearl track pressed into the page; chrome ball-bearing knob with a glowing orange core; it rolls (with a little overshoot) to the right for dark mode, and squashes when pressed
- Sun mark in light mode, moon in dark; real `role="switch"` with `aria-checked`, keyboard focus ring, remembers your choice
- Lives outside the HUD (`.theme-switch` in `index.html`) so the HUD's color-inverting blend doesn't turn the orange blue; styles are "THEME SWITCH v7" in `css/style.css`

## Footer brand lockup (v8)
- Your name is replaced in the footer by a brand lockup styled after the "FRAME Visual Collective" reference
- Wordmark: **Kaushan Script** run through an SVG liquid filter (`#liquid`: turbulence + goo) so the strokes look like poured ink; four drips grow out of the letters when the footer scrolls in; hovering makes it ripple and melt
- Lockup: "MAKE MEMORIES. NOT CONTENT.", extended orange "VISUAL COLLECTIVE" (Archivo wide black), then "EST. 2026 / FILM • PHOTO • DESIGN" (orange bullets)
- Wording comes from the reference image and is a placeholder until you choose your own brand name
- Styles: "BRAND LOCKUP v8" in `css/style.css`

## Turntable (v9) — replaced the Process chrome slab
- Clear acrylic record player built entirely in CSS 3D: acrylic plinth with chrome edge reflections, stacked chrome platter, grooved orange vinyl with a label, tonearm, dust cover hinged open, and a clear speaker cube
- The needle drops and the record spins when it scrolls into view; click (or Enter/Space) to pause or play; speaker drivers pulse while playing; the deck turns with your cursor
- Markup: `#turntable` in `index.html`; styles: "TURNTABLE v9" in `css/style.css`.

## CD player (v10) — replaced the Rules chrome slab
- Wall-mounted clear CD player (Muji-style) in CSS 3D: white/graphite shell, acrylic glass front, speaker grille, iridescent orange "Rule breaker" CD with chrome hub, pull cord with an orange bead
- Starts silent; pull the cord (click, or Enter/Space) to spin it, pull again to stop; tilts with the cursor like the turntable
- Desktop only (hidden under 900px, like the slab it replaced); scales to 80% on short screens
- Markup: `#cdp` in `index.html`; styles: "CD PLAYER v10" in `css/style.css`. Both chrome slabs are now retired.

## Open-world objects (v11) — playground sandbox
- A tray of 11 chrome Y2K objects drawn in SVG (heart, sparkle, flower medallion, button, lucky 7, Esc key, push pin, moon, gummy bear, orange cherries, liquid drop). They are rendered with a real lighting filter (`#chromeF`), and the light direction follows the cursor, so the reflections slide as you move
- Drag an object out of the tray (or tap it to toss one in); drag, throw, and they bounce off walls and push each other; "Gravity: on" drops everything into a pile above the tray
- Click reactions: heart beats, sparkle spins and throws sparks, flower spins, button flips, 7 rolls like a slot, bear and cherries jiggle (cherries hop), drop splashes, push pin pins itself in place (orange ring), moon toggles dark mode, Esc clears every other object
- Clear removes all objects; Save PNG exports the scene (background + objects). The paint canvas, color swatches, mirror and draw mode were removed in v12
- Up to 36 objects at once (oldest fades out); objects are 108px on desktop and 72px on phones
- Code: "OPEN-WORLD OBJECTS" in `js/main.js`; styles "OPEN-WORLD OBJECTS v11" in `css/style.css`

## Placeholders to edit
- Name "Nguyen Vo" (guessed), email `hello@yourdomain.com`, social links (`href="#"`)
- Stats in `index.html` (`data-count`: 412 hours, 87 iterations, 14 versions, 1) — make them true to you
- `studio.log` lines and the six rules — rewrite in your own voice
- Hero tagline, "Est. 2026", the five exhibit titles
