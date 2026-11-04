# Website style and layout cheatsheet

This document describes where layout and formatting live, how pages inherit them,
and where to make common design changes.

## Layout hierarchy

Every page ultimately uses the same outer layout:

```text
SiteLayout
├── PageLayout
│   ├── Blog index
│   ├── Field Notes index
│   ├── Publications
│   └── About
├── ArticleLayout
│   ├── Blog entries
│   ├── Field Notes entries
│   └── Runi page
└── Homepage (uses SiteLayout directly)
```

### `src/layouts/SiteLayout.astro`

The universal document shell. It owns:

- `<html>`, `<head>`, and `<body>`
- metadata through `BaseHead.astro`
- the shared header/navigation
- the shared footer
- the slot where each page supplies its `<main>` content

If something must appear on every page, it generally belongs here or in one of
the components imported here.

### `src/layouts/PageLayout.astro`

The shared layout for top-level sections. It supplies:

- the standard reading column
- the page `<h1>`
- the short introductory sentence
- identical title position and top spacing

Blog, Field Notes, Publications, and About all use this layout.

### `src/layouts/ArticleLayout.astro`

The shared layout for individual content entries. It supplies:

- the same reading-column width and title position as `PageLayout`
- the article `<h1>`
- publication and update dates
- the `.prose` content wrapper

The header has two forms, chosen by whether the entry has a `cover`. Blog
entries get the full-width title, the rule, and a mono date line. Library
entries get a `.book-head` grid instead: the cover is the top-left corner of
the page and a `.book-facts` catalogue card sits beside it — Title / Author /
Category / Published / Pages / Last read / Posted / Updated, all in the same
mono label-and-value rows. Every row is conditional, so a field the entry
lacks leaves no gap. The title is a row of that card, not a display heading, so a book page
carries no large title anywhere; the cover does that work. It is still the
`<h1>`, set in the ledger's mono a size up and in `--heading`. There is no
title rule on these pages, and `publicationDate` is surfaced nowhere else.

Both Blog and Field Notes entries use this layout. Do not create separate Blog
and Field Notes layouts unless their document structures genuinely diverge.

### Homepage

`src/pages/index.astro` uses `SiteLayout` directly because its intro/matted-photo
and recent-post composition differ from a normal section page. Its width and spacing
still come from the same centralized CSS and tokens.

## Stylesheet structure

`src/styles/global.css` is imported once by `BaseHead.astro`. It imports the rest
of the style system in this order:

```css
@import "./fonts.css";
@import "./tokens.css";
@import "./layout.css";
@import "./patterns.css";
@import "./content.css";
```

All pages receive these files through `SiteLayout` → `BaseHead`.

### `tokens.css`

The source of truth for design values:

- light and dark theme colors
- heading, body, and mono font stacks
- body, heading, meta, and label sizes
- reading-column width
- page gutter
- reusable spacing values
- dot-grid color
- photo-mat and note-card colors
- the ledger date-column width

Change a token when the same design decision should update everywhere.

Important tokens:

```css
--background            /* the paper */
--surface               /* manila by day, steel by night */
--text
--heading               /* headings sit brighter than body text in dark mode */
--muted                 /* mono meta: dates, captions, labels — not intro copy */
--accent                /* folder green by day, kraft tab by night */
--border
--background-dot
--link                  /* ink; differs from --accent in dark mode */
--link-underline        /* the soft underline under links */
--code-background       /* steel olive in BOTH themes */
--code-text
--code-inline-background
--mat                   /* photo and cover mat */
--card                  /* note/callout card */
--font-heading          /* IBM Plex Serif 600 */
--font-body             /* IBM Plex Sans 400 */
--font-mono             /* IBM Plex Mono, meta and labels only */
--font-size-body
--font-size-h1
--font-size-h2
--font-size-h3
--font-size-meta
--font-size-label
--content-width
--page-gutter
--content-end
--shadow-soft
--ledger-date-width
```

### `fonts.css`

Declares the six self-hosted IBM Plex faces in `public/fonts/`.

These are hand-written `@font-face` rules rather than Astro's `<Font>`
component, and must stay that way: `<Font>` emits an inline `<style>` block,
and the CSP in `netlify.toml` sets `style-src 'self'` with no
`'unsafe-inline'`, so the browser would drop the rules and silently fall back
to system fonts in production while still looking correct in `astro dev`.

IBM Plex Sans is a variable font, so each style is one file declared across
`font-weight: 100 700`. Serif and Mono are static instances, one file per
weight. Do not pin a single weight against the variable file — the browser
will not interpolate and headings will render at the wrong weight.

Mono is reserved for dates, captions, and small uppercase labels. Do not set
body copy or headings in it.

### `global.css`

Contains site-wide element defaults and the basic reading column:

- box sizing
- root font scaling
- body typography and line height
- dot-grid background
- default `<main>` width and vertical spacing
- heading defaults
- paragraphs and lists
- links
- images
- rules and blockquotes
- inline and block code
- screen-reader-only utility
- global mobile typography

Avoid page-specific selectors here. Put reusable UI patterns in `patterns.css`
and article-specific rules in `content.css`.

### `layout.css`

Contains the outer chrome shared by pages:

- flex-based sticky-footer document flow
- header and navigation
- site name and theme toggle
- active navigation state
- footer and social links
- header/footer mobile stacking

The header and footer use solid `--background` colors, so the body dot grid does
not appear behind them.

The masthead sits on the paper like the rest of the page and is closed with a
2px `--accent` rule — folder green by day, kraft gold by night. Colour, not
weight, is what marks it as chrome. Two things have been tried here and
rejected: a heavy `--heading` rule, which read as a second black bar a few lines
above the page heading's own rule, and a filled `--surface` panel, which put a
slab of colour across the top of the page.

A serif wordmark sits on the left and a mono index on the right: the nav links
and the footer's social links share one treatment (uppercase, `0.75rem`,
`0.08em` tracking), so the two ends of the page rhyme. The current section is
marked with `--heading` text over a 2px `--accent` underline, which reads as a
tab without reintroducing folder tabs.

The theme switch shows both a sun and a moon at once and brings the active one
forward. Both are inline SVG on `currentColor`, sized at `1em`. They used to be
the ☀ and ☾ characters, which sit outside the self-hosted Latin subset and so
came from whatever face the platform fell back to -- and iOS serves U+2600 from
the colour emoji font, so phones got a cartoon sun while desktop got a
monochrome one. Any future chrome mark should be drawn for the same reason;
keep chrome *text* inside the subset.

### Rule weights

Three weights, heaviest to lightest. Use the lightest one that reads:

| Weight | Where |
| --- | --- |
| `2px var(--accent)` | under the masthead, and under the active nav link |
| `1.5px var(--heading)` | section headings, publication group labels, the article title rule |
| `1px var(--border)` | between ledger rows, the footer's top rule, and anywhere else a divider is needed |

There is exactly one heavy horizontal rule in view at a time, and it belongs to
the content: the one under a section heading. The masthead's rule is accent
coloured rather than heavy, and the footer closes with a plain hairline. Do not
reintroduce a `--heading` rule in either place.

### `patterns.css`

Contains reusable page-level compositions:

- `.page-heading`
- `.section-heading`
- `.post-list` — the ledger rows
- homepage `.intro` and `.lede`
- publication groups, labels, entries, and metadata
- responsive stacking for lists, intro content, and publications

`.post-list` rows are ledger rows: a fixed mono date column on the left, then
the title, with a hairline rule between rows. The date comes first in the
markup, so on narrow screens it stacks above the title without needing `order`.

Blog and Library lists share `.post-list`. Change it once to update both
indexes and the homepage recent-post list. The Library page's own list view is
separate and still puts its "Last read" date on the right.

### `content.css`

Contains individual article and rich-content formatting:

- `.article-main` and `.prose`
- article title and dates
- callout disclaimers (the note card)
- the `.book-head` cover-and-ledger grid, and the cover mat
- screenshot sizing
- content-specific dividers
- article mobile spacing

Both Blog and Field Notes entries inherit these rules through `ArticleLayout`.

## Theme inheritance

Theme colors are CSS custom properties on `:root` in `tokens.css`.

The priority is:

1. A saved `data-theme="light"` or `data-theme="dark"` choice
2. The operating system's `prefers-color-scheme`
3. Dark theme fallback

`public/theme-init.js` reads only the `theme` key from `localStorage`, accepts
only `light` or `dark`, and applies it to `<html data-theme="…">`. The header
toggle writes the same constrained values.

To edit a theme, update all corresponding color tokens in both its explicit
`data-theme` block and its default/system-preference block. Keep semantic token
names: components should use `var(--text)` rather than hard-coded theme colors.

Three photo components exist; `MattedPhoto.astro` is the one in use, on both
the homepage and the Runi page, and it mounts the print on the themed mat
(`--mat`). The other two are kept but unused: `Poloroid.astro` carries its own
fixed light paper, black border and hard layered shadow in both themes rather
than global tokens — that is the point of it — and `Poloroid2.astro` is the
same format rebuilt on `--mat` and `--shadow-soft`. All three take the same
`src` / `alt` / `caption` props, and the homepage sizes whichever is imported
through `.intro figure` in `patterns.css`, so switching is one import line. Code
blocks are the one deliberate
oddity: they use steel olive in *both* themes, so a code block is light-on-dark
even on the cream page. That is intended, not a bug. Inline `code` uses
`--code-inline-background` instead so it stays on the paper.

## Charts

The Library's Plots view stacks two charts, both in `src/components/charts/`:

- `PublicationScatter.astro` — publication year, fiction and non-fiction as two
  labelled lanes of dots. x from `yearScale()` in `charts/scale.ts`.
- `PagesReadArea.astro` — pages finished per month, stacked and accumulated.
  x from `monthScale()`.

They are on **different x axes**, so nothing should be read across between
them. The month labels are what signals that, now that the captions are short
titles; keep them legible. What the two charts do share is `PAD_L`/`PAD_R`, so
their plot areas line up down the page.

`.plot-caption` is a **short title**, two words, not a paragraph — "Publication
year", "Cumulative pages". It is set in `--heading` rather than `--muted`
because the lane labels right below it share the same mono uppercase type and
would otherwise be indistinguishable from it. There is **no rule between the
figures**; the gap and the titles separate them.

If you add another chart on publication year, give it `yearScale()` rather than
its own domain: a book then sits at the same place in both, and the pair reads
as one figure you can scan down instead of two unrelated pictures.

Its axis runs **whole calendar years**, January to December, so January sits
where January sits and a quiet stretch looks like one. Months that have not
happened yet are **axis only**: labelled, but no area, no marker and no table
row, because a flat line across the rest of the year would claim a total that
nothing has been read against. Past months with nothing finished *are* drawn,
flat.

Shared chrome, marks and the tooltip live in `src/styles/charts.css`, and the
one tooltip script is in `library/index.astro` — it walks every `.plot-frame`
on the page, so a new chart needs no script of its own.

- **One ink, not two.** The palette is deliberately low-chroma, and no two of
  its hues clear the colour-vision separation threshold against each other, so
  category is carried by **mark shape** — filled disc for fiction, open ring
  for non-fiction — and every mark is `--accent`. The first chart adds lane
  position on top of that. Do not "fix" this by introducing a second chart
  hue; re-facet instead.
- **Axes label themselves in place.** Tick values sit just above their own
  gridline at the left, so a chart needs no y gutter — which matters because x
  is a percentage and a gutter would have to be pixels. The top rule carries
  the unit (`3,500 pages`) instead of a separate axis label.
- **No viewBox.** The SVG sets `width="100%"` with x positions as percentages
  and y positions, radii and type in CSS pixels. A viewBox would scale the type
  down with the chart and leave it unreadable on a phone.
- **No text inside the SVG that a viewBox would shrink**, and no inline styles
  anywhere: marks use presentation attributes, everything else is in the scoped
  stylesheet, so the strict CSP still holds.
- The tooltip is moved with a `transform`, never with `left`. An absolutely
  positioned box shrinks to fit the space left of its containing block's edge,
  so a title near the right edge would collapse to one word per line.
- Marks carry a 2px ring in `--background` so near-neighbours stay separate at
  phone width, and books within ~3.5% of the span are nudged off the row.
- **One `<details>` data table serves both plots**, in `library/index.astro`,
  not one per chart: the two are readings of the same rows, so per-chart tables
  just repeat each other. Columns are Published, Title, Category, Pages, Month
  read. It is the text equivalent of both charts, so nothing is hover-only and
  no column may be dropped to fit — at phone width it sits in a
  `.table-scroll` wrapper and scrolls sideways instead. The table's `min-width`
  is under the 680px column, so no scrollbar appears on desktop.
- **The area chart is built from rects, not a path.** SVG `d` and `points` do
  not accept percentages — only `x`/`width` do — so a path cannot be fluid
  without a viewBox. A cumulative step area happens to *be* a row of
  rectangles, one per month, with the top edge traced as separate treads and
  risers. Everything in it is axis-aligned, so `shape-rendering: crispEdges`
  turns off antialiasing and removes the seams where abutting rects meet.
- **Steps, not a curve.** A book counts on the month it was finished; nothing
  is known about which pages were turned when, and a smoothed line would invent
  it. Months with nothing finished stay in and read as flat.
- The stack's second series is **hatched, not a second hue** — same one-ink
  rule. The hatch is an SVG `<pattern>` whose line is styled from
  `charts.css`, so it themes with everything else, and a 2px `--background`
  rule separates the two fills.
- Month binning is **UTC** (`getUTCMonth`). Frontmatter dates parse to UTC
  midnight, so reading local months would file the 1st under the month before.
- A month readout is a `<g class="pt pt-plain" tabindex="0">`, not an `<a>`:
  the shared tooltip script keys on `.pt` and a `.dot` child, and `.pt-plain`
  drops the pointer cursor because a month is not a link.

Fiction vs non-fiction comes from the required `category` field in the library
schema, not from `topics`: `topics` is a free tag list and most entries carry
only `book`.

`pages` is optional and filled in by `scripts/fetch-page-counts.mjs`, which
queries Open Library (no key) and writes the count into frontmatter. Run it on
demand — `node scripts/fetch-page-counts.mjs`, with `--dry-run` to preview or
`--refresh` to redo entries that already have a count. It is deliberately not
part of `astro build`: a page count never changes, and a build that calls a
third-party API cannot run offline and can fail because someone else's service
is down. It scores candidates on title, author and year rather than taking the
first row, matches initials against spelled-out names, searches both the full
and pre-colon title, and drops anything outside 8–5000 pages.

## Dot-grid and reading-column behavior

The dot grid is a CSS radial gradient on `<body>`. Think of it as the desk the
page sits on: it shows in the margins beside the reading column and nowhere else.

- `main` and `.prose` are solid `--background` for their whole height, so no
  dots appear inside the reading column — including in the gap between the
  masthead and the page title.
- `.site-header` and `footer` are transparent; the masthead panel and
  `.footer-inner` paint themselves. The grid therefore runs unbroken down both
  margins from the very top of the page.
- The gap between the end of the content column and the footer is deliberate,
  and does show the grid.

`--content-start` controls the top padding above a page or article title.
Desktop uses `2.5rem`; mobile uses `2rem`. `ArticleLayout` and `PageLayout`
consume the same values, which keeps their title baselines aligned. It no longer
has anything to do with where the grid stops.

If title alignment changes, update `--content-start` rather than adding a margin
to an individual page.

## Responsive structure

The site uses two current breakpoint boundaries:

- `600px` for global/article typography and vertical spacing
- `520px` for structural stacking of navigation, post lists, homepage intro,
  publications, and footer

When adding a new responsive rule, prefer one of these existing boundaries.
If the intermediate 521–600 px range becomes cramped, standardize the structural
rules on 600 px rather than introducing a third breakpoint.

The reading column always uses:

```css
width: min(var(--content-width), calc(100% - (2 * var(--page-gutter))));
```

This preserves the centralized width on desktop and safe gutters on mobile.

## Scoped component CSS

Most styling is centralized. Scoped `<style>` blocks remain only for genuinely
self-contained visual widgets:

- `MattedPhoto.astro`
- `Poloroid.astro` and `Poloroid2.astro` (both currently unused)
- `LightboxCarousel.astro`
- `library/index.astro` (the cover grid and view toggle)

The chart components in `charts/` have no scoped styles at all; they share
`src/styles/charts.css`.

These components may still consume global theme tokens. Keep unique mechanics
inside the component, but move any pattern reused elsewhere into the appropriate
central stylesheet.

Astro scoped styles can outrank a global rule with equal specificity because of
generated scope attributes and source order. If a page must override a scoped
component, use a deliberate, slightly more specific selector rather than
`!important`.

## Common editing recipes

### Change the site palette

Edit the light and dark color blocks in `tokens.css`.

### Change all typography

Edit the font and font-size tokens in `tokens.css`. Element behavior such as line
height and heading margins lives in `global.css`.

To change the actual typefaces, replace the files in `public/fonts/` and the
`@font-face` rules in `fonts.css`, then update the preloads in `BaseHead.astro`.
Keep the faces self-hosted; see the `fonts.css` note above.

### Change the reading width

Edit `--content-width` in `tokens.css`. Header, footer, pages, and articles all
consume it, and no page overrides it — Library used to widen itself to 880px
(1040px above 1120px), which left its title starting to the left of the wordmark
and disagreeing with its own entry pages. Keep it that way: if a page needs more
room, size the content inside the column rather than redefining the column.

### Change page-title vertical position

Edit `--content-start` in `global.css` and its mobile value. Keep the equivalent
article value in `content.css` synchronized.

### Change the space after page content

Edit `--content-end` in `tokens.css`. This controls the solid reading column's
bottom padding on both section pages and articles. Space between that column and
the footer then reveals the body's dot grid.

### Change the space above a page or article title

Edit `--content-start` in `global.css` (for `main`) and keep the matching value
in `content.css` (for `.prose`) in sync, including both mobile overrides.
The gap below a page's title and intro is `.page-heading`'s `margin-bottom` in
`patterns.css`; Library overrides it down, because a control row follows the
intro there rather than prose.

### Change Blog and Library list spacing

Edit `.post-list li` in `patterns.css`. To change the width of the mono date
column, edit `--ledger-date-width` in `tokens.css`.

### Change navigation or footer layout

Edit `layout.css`; change the actual links/content in the corresponding Astro
component.

### Add a top-level page

Use `PageLayout`:

```astro
---
import PageLayout from "../layouts/PageLayout.astro";
---

<PageLayout
  title="Page title"
  description="Metadata description"
  intro="Visible introductory sentence."
>
  <p>Page content.</p>
</PageLayout>
```

### Add an article collection entry

The dynamic Blog and Field Notes routes already wrap entries in `ArticleLayout`.
Add the MDX file to the appropriate content directory and use fields accepted by
`src/content.config.ts`.

## Cascade rules to remember

- Theme tokens inherit from `<html>` into every component.
- Global element rules apply unless a class-based pattern is more specific.
- Pattern and content classes should be preferred over page-local styles.
- Source order matters when selector specificity is equal.
- Avoid hard-coded colors outside `tokens.css`. There are no longer any
  exceptions to this.
- Avoid inline `style` attributes; they bypass the centralized system and conflict
  with the site's strict Content Security Policy.
- Avoid `!important`; fix ownership or selector specificity instead.

## Validation after style changes

Run:

```bash
npm run build
```

For local review:

```bash
npm run dev
```

Check at minimum:

- homepage
- Blog and Field Notes indexes
- one Blog entry
- one Field Notes entry with the lightbox
- Publications
- About
- light and dark themes
- a viewport below 520 px

After any change touching fonts or inline styles, confirm the build output has
no inline `<style>` blocks and no `style="..."` attributes, since the CSP
forbids both:

```bash
grep -rc "<style" dist/*.html
grep -rn 'style="' dist/*.html
```
