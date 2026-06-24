# Liquid Technologies — Design System

A design system distilled from the **"CEO Portfolio page.fig"** Figma file: the
executive landing page for **Hadi Tabani**, Founder & CEO of **Liquid Technologies**
(and Director at Tabani Corp). It captures the site's tokens, components, brand
voice, and a full-page recreation so new pages, decks, and mocks stay on-brand.

> **Source of truth:** the attached Figma file *CEO Portfolio page* (page
> `Web Version 2.1`, node `1:1963`). The uploaded `uploads/1 (2).zip` was **not
> accessible** in this workspace — see Caveats. All values below were extracted
> from the Figma virtual filesystem (`fig_*` tools), not from public references.

---

## What the company is

Liquid Technologies is an **AI-native services company** — design, engineering,
cloud, and data — that builds and deploys AI-first solutions for enterprises.
The portfolio site positions its founder as a technology entrepreneur, AI
strategist, investor, and board advisor, with a clear thesis: *build globally
competitive products from Pakistan, for the world.* Featured ventures include
**Liquid Technologies**, **Vidan AI** (video intelligence), **Element Data /
HALO AI** (healthcare data intelligence), and **Sally / Finance AI** (agentic
finance intelligence).

The single product surface in scope is the **executive portfolio / marketing
landing page**.

---

## CONTENT FUNDAMENTALS — how the copy is written

- **Voice:** confident, outcome-driven, plain-spoken. Sells *business results*,
  not technology for its own sake ("measurable business outcomes rather than
  technology for its own sake").
- **Person:** mostly **we / our** for the company ("Why we build…", "What we're
  building toward"), **third-person** for the founder ("Hadi brings a rare
  combination…", "Hadi Tabani is the Founder & CEO…"). Direct **you/your** in
  product copy ("your workflow", "your existing systems").
- **Casing:** sentence case everywhere, including headlines and buttons
  ("Book a strategy call", "Send me the portfolio"). Eyebrows are the one
  exception — UPPERCASE with wide tracking ("THE JOURNEY", "AWARDS & RECOGNITION").
- **Headlines** are short, declarative, and end with a period — almost like
  statements: *"From Karachi to Houston." · "Recognition for building and for
  shipping." · "What we're building toward."*
- **Punctuation:** em dashes for asides ("— and helping position Pakistan…"),
  ampersands in labels ("Finance & Banking", "Awards & recognition").
- **CTAs** use an arrow glyph: "Download the Executive Profile →",
  "Send me the portfolio →".
- **No emoji.** Tone is executive and credible; numbers do the bragging
  ($100M+, 150+, 15+ years).
- **Reassurance microcopy** is friendly and human: "We respect your inbox.
  No spam — unsubscribe anytime."

---

## VISUAL FOUNDATIONS

- **Color:** an electric-to-navy **blue** is the entire brand (`#005FE3`
  primary, deepening to `#00347D`/`#213D79`). Neutrals are near-black ink
  (`#060606`) on white. Accents — **gold** (awards/stars), **red**, **magenta**
  (Sally) — appear only in tiny doses. Two full-bleed **dark** bands
  (`#0A0E14`) and one deep-**green** Finance AI feature card provide contrast.
- **Type:** **Marcellus** (serif) for every display headline and big numeral —
  elegant, editorial, the signature move. **Poppins** for body and UI,
  **Roboto / Roboto Condensed** for nav and the logo wordmark, **Inter** for
  fine print. Big serif headlines over small sans body is the core rhythm.
- **Layout:** centered max-width container (~1274px), generous ~96px section
  rhythm, alternating light/dark sections. Headlines are centered except in
  dark sections where they go left-aligned.
- **Backgrounds:** mostly clean white with soft radial blue washes; **full-bleed
  photographic** moments (the Karachi→Houston panorama, product screenshots,
  award photos). No repeating textures.
- **Shape language:** **fully-rounded pills** for every button, the nav, and
  role tags; **soft 16–25px radii** for cards and panels. The hero portrait sits
  on a gradient **rounded-arch** shape (200px top radius).
- **Cards:** white with soft, low-opacity ambient shadows
  (`0 12px 40px rgba(0,0,0,.08)`); dark cards use a 1px translucent white
  hairline border instead of shadow.
- **Shadows:** soft and layered, never harsh. Blue CTAs carry a colored glow
  (`0 14px 34px rgba(0,95,227,.28)`).
- **Glass / blur:** the floating nav is frosted — translucent blue fill +
  `backdrop-filter: blur(16px)` + hairline border.
- **Gradients:** used on the primary "Schedule Now" pill and hero arch
  (`#376EF4 → #00A2EA`) and on deep CTA fills (`#005FE3 → #00347D`). Tasteful,
  blue-only — never rainbow or purple.
- **Imagery vibe:** crisp studio portraits on white; cinematic dark product
  shots; cool, optimistic, slightly futuristic. Award photos are warm-lit.
- **Motion / states:** restrained. Buttons lift 1px and darken on hover; FAQ
  rows expand with a rotating + glyph. No bounce, no looping decoration.

---

## ICONOGRAPHY

- The Figma file pulls icons from **multiple open icon sets** — primarily
  **jam-icons** (outline & logos: arrow-right, plus, circle, close, world, plus
  social glyphs), with a few from **iconoir** (cancel, euro) and **bootstrap**
  (medium, tiktok). Field icons (search, clear) are bespoke.
- These are **stroke/outline SVGs**, not an icon font, and not emoji. Social
  icons in the footer are simple monochrome marks.
- A subset was extracted to `assets/icons/` as an icon-data module
  (`icon-data.js` + `Icon.jsx`, names in `Icon.d.ts`). **Note:** the jam-icons
  collapsed into a single entry on extraction (shared layer naming) — see
  Caveats. For new work, prefer a CDN outline set (e.g. **Lucide**, matching the
  thin-stroke style) and keep glyphs monochrome.
- The **logo** is a blue→cyan→green gradient mark beside a stacked
  `LIQUID / TECHNOLOGIES` wordmark (Roboto Condensed). Recreated as the `Logo`
  component (the original raster mark in Figma was a near-empty gradient blob).

---

## Index / manifest

**Foundations**
- `styles.css` — global entry point (import this). `@import`s everything below.
- `tokens/colors.css` · `tokens/typography.css` · `tokens/spacing.css` ·
  `tokens/fonts.css` (Google Fonts: Marcellus, Poppins, Roboto, Inter).

**Components** (`components/`, React, exported on `window.DesignSystem_1a3afa`)
- `core/` — `Button`, `Badge`, `Card`, `SectionHeading`, `Stat`
- `forms/` — `Input`, `Select`
- `navigation/` — `NavBar` (frosted nav capsule)
- `brand/` — `Logo` (primary lockup), `LogoColored` (generic partner marks),
  `assets/icons/Icon` (extracted icon set)

**UI kit**
- `ui_kits/portfolio-site/index.html` — full-page recreation of the CEO portfolio
  landing page (nav → hero → message+stats → journey → product portfolio →
  recognition → vision → Finance AI → portfolio request form → contact → FAQ →
  footer). Self-contained; links `styles.css`.

**Specimen cards** (`guidelines/`) — Colors (blue / neutral / accent), Type
(display / body), Spacing (radii / shadows / scale) for the Design System tab.

**Skill**
- `SKILL.md` — makes this folder usable as a downloadable Agent Skill.

---

## Caveats

- **`uploads/1 (2).zip` was not accessible** in this workspace (the uploads
  directory read back empty). If it contains brand fonts, the real logo, or
  additional screens, please re-attach it.
- **Fonts are loaded via Google Fonts** `@import`, not bundled `@font-face`
  files — all four families are exact matches, so no visual substitution, but
  the compiler reports "0 fonts." Provide the licensed font binaries if you want
  them shipped with the system.
- **Icon extraction is partial** — the jam-icons set collapsed to one entry on
  materialize. Re-extract individually or adopt a CDN set if you need the full
  glyph range.
- **`LogoColored`** are *generic placeholder* partner logos from the Figma file
  (viewio, metablu, etc.) — not real Liquid Technologies brand assets.
- Some product/stat copy (the "Why we build" paragraph, journey node labels, two
  of the four stats) was lightly paraphrased to match tone where the Figma text
  was vector-rendered or truncated.
