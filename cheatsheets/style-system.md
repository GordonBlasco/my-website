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

Both Blog and Field Notes entries use this layout. Do not create separate Blog
and Field Notes layouts unless their document structures genuinely diverge.

### Homepage

`src/pages/index.astro` uses `SiteLayout` directly because its intro/polaroid and
recent-post composition differ from a normal section page. Its width and spacing
still come from the same centralized CSS and tokens.

## Stylesheet structure

`src/styles/global.css` is imported once by `BaseHead.astro`. It imports the rest
of the style system in this order:

```css
@import "./tokens.css";
@import "./layout.css";
@import "./patterns.css";
@import "./content.css";
```

All pages receive these files through `SiteLayout` → `BaseHead`.

### `tokens.css`

The source of truth for design values:

- light and dark theme colors
- body and UI font stacks
- body and heading sizes
- reading-column width
- page gutter
- reusable spacing values
- dot-grid color
- theme-specific polaroid shadows

Change a token when the same design decision should update everywhere.

Important tokens:

```css
--background
--surface
--text
--muted
--accent
--border
--code-background
--background-dot
--font-body
--font-ui
--font-size-body
--font-size-h1
--font-size-h2
--font-size-h3
--content-width
--page-gutter
--content-end
```

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

### `patterns.css`

Contains reusable page-level compositions:

- `.page-heading`
- `.section-heading`
- `.post-list`
- homepage `.intro` and `.lede`
- publication groups, labels, entries, and metadata
- responsive stacking for lists, intro content, and publications

Blog and Field Notes lists share `.post-list`. Change it once to update both
indexes and the homepage recent-post list.

### `content.css`

Contains individual article and rich-content formatting:

- `.article-main` and `.prose`
- article title and dates
- callout disclaimers
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

The polaroid is an intentional exception: its paper and ink remain light like a
physical print, while its shadow colors inherit theme tokens.

## Dot-grid and reading-column behavior

The dot grid is a CSS radial gradient on `<body>`.

- Header and footer mask it with solid backgrounds.
- Reading columns become solid where content begins.
- The top gap between the header and page title remains transparent, allowing
  the grid to show there.
- `--content-start` controls both top padding and the exact grid-to-solid transition.

Desktop uses `4rem`; mobile uses `2.75rem`. `ArticleLayout` and `PageLayout`
consume the same values, which keeps their title baselines aligned.

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

- `Poloroid.astro`
- `LightboxCarousel.astro`

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

### Change the reading width

Edit `--content-width` in `tokens.css`. Header, footer, pages, and articles all
consume it.

### Change page-title vertical position

Edit `--content-start` in `global.css` and its mobile value. Keep the equivalent
article value in `content.css` synchronized.

### Change the space after page content

Edit `--content-end` in `tokens.css`. This controls the solid reading column's
bottom padding on both section pages and articles. Space between that column and
the footer then reveals the body's dot grid.

### Change Blog and Field Notes list spacing

Edit `.post-list li` in `patterns.css`.

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
- Avoid hard-coded colors outside `tokens.css`, except for physical-object styling
  such as the polaroid paper.
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
