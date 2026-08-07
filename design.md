# TOD Public Portal Design System

Status: extracted from the current production portal and repository on 2026-08-06.

This document records the existing visual language of the public TOD portal. It is the design constraint for future animal-first conversion work: information architecture and copy may change, but typography, color, spacing, sizing, and component character should remain consistent unless this document is intentionally revised.

## Scope and sources

Included:

- Public homepage, impact, mission, support, header, footer, and shared public components.
- Default off-white theme plus the optional lavender and black themes.
- Desktop measurements at a 1280 × 720 viewport and mobile measurements at 390 × 844.

Excluded:

- Admin/CMS styling, which has a separate visual system.
- The unused legacy stylesheet at `styles/globals.css`.
- Content strategy, donation claims, and impact-verification rules; those belong in the animal-first product specification.

Primary sources:

- `app/globals.css`
- `app/layout.tsx`
- `components/Header.tsx`
- `components/Footer.tsx`
- `components/AnimatedSection.tsx`
- `components/ThemeProvider.tsx`
- `components/ThemeSwitcher.tsx`
- Rendered production pages at `https://www.theopendraft.com/`

## Design character

TOD uses a quiet editorial style: warm neutral surfaces, dark stone text, restrained borders, generous whitespace, rounded cards, and typography-led hierarchy. The interface should feel calm, sincere, human, and direct. It should not become a brightly colored charity template or a dense SaaS dashboard.

Core characteristics:

- Warm off-white canvas rather than pure white.
- Near-black stone text rather than hard black.
- Muted stone accent rather than a saturated brand color.
- Bold Manrope display headings paired with readable DM Sans body copy.
- Thin one-pixel borders and little or no shadow on content cards.
- Pill-shaped primary navigation actions and CTAs.
- Large vertical separation between narrative sections.

## Color system

### Default: off-white

| Token | Value | Intended use |
|---|---:|---|
| `--color-bg` | `#F8F7F1` | Page canvas and quiet surfaces |
| `--color-text-primary` | `#292524` | Headings, primary copy, primary buttons |
| `--color-text-secondary` | `#57534E` | Body copy, labels, supporting information |
| `--color-border` | `#D6D3D1` | One-pixel borders, rules, muted fills |
| `--color-accent` | `#A8A29E` | Highlights, selected borders, small emphasis |
| `--color-card-bg` | `#FFFFFF` | Elevated content cards |
| `--destructive` | `#EF4444` | Errors and destructive actions only |
| `--destructive-foreground` | `#FFFFFF` | Text/icons on destructive fills |

Rendered default colors:

- Page background: `rgb(248, 247, 241)`.
- Primary text: `rgb(41, 37, 36)`.
- Secondary text: `rgb(87, 83, 78)`.
- Border: `rgb(214, 211, 209)`.
- Card: `rgb(255, 255, 255)`.

### Lavender theme

| Token | Value |
|---|---:|
| Background | `#F5F3FF` |
| Primary text | `#312E81` |
| Secondary text | `#4338CA` |
| Border | `#C7D2FE` |
| Accent | `#818CF8` |
| Card | `#EEF2FF` |

### Black theme

| Token | Value |
|---|---:|
| Background | `#030712` |
| Primary text | `#F9FAFB` |
| Secondary text | `#D1D5DB` |
| Border | `#374151` |
| Accent | `#9CA3AF` |
| Card | `#1F2937` |

### Color rules

- Use semantic CSS variables, never duplicate theme hex values inside public components.
- Primary CTAs use primary text as the fill and page background as the label color.
- Secondary CTAs remain transparent with a one-pixel border.
- White is reserved for cards in the default theme; it is not the page canvas.
- Accent is for small highlights, selected states, and supporting emphasis. It should not dominate an entire screen.
- Status colors must communicate state, not decoration.

## Typography

Fonts are loaded with `next/font` in `app/layout.tsx`.

| Role | Family | Weights loaded | Usage |
|---|---|---|---|
| Display/headings | Manrope | 400, 700, 800 | `font-heading`, page and section headings |
| Body/content | DM Sans | 400, 500, 700 | Body copy, buttons, cards, forms |
| Navigation/system | Inter | 400, 500, 700 | Desktop header and navigation |
| Code/monospace | Geist Mono | package default | Technical/code content |

The live portal renders DM Sans as the body font. Although the base CSS contains an Inter fallback declaration, the body variable resolves to DM Sans in production and should be treated as authoritative.

### Type scale

| Role | Mobile | Desktop | Weight | Line height | Tracking |
|---|---:|---:|---:|---:|---:|
| Hero display | 36px | 60px | 800 | 40px mobile / 60px desktop | `-0.02em` |
| Major section heading | 30–36px | 36px | 800 | about 1.2–1.3 | `-0.02em` |
| Standard section heading | 24px | 30px | 700–800 | about 1.3 | `-0.02em` |
| Card heading | 20px | 20–24px | 700 | about 1.3 | `-0.02em` |
| Hero/body lead | 18px | 20px | 400 | 29.25px mobile / 32.5px desktop | normal |
| Body | 15px | 16px | 400 | 24px mobile / 25.6px desktop | normal |
| Small/body support | 14px | 14px | 400–500 | 20px | normal |
| Eyebrow/metadata | 12px | 12px | 500–700 | 16px | wide/widest when uppercase |

### Typography rules

- Use Manrope only for headings and brand/display moments.
- Use DM Sans for paragraphs, controls, forms, prices, and cards.
- Use Inter for navigation chrome.
- Hero headings may use weight 800; ordinary headings should use 700.
- Keep body paragraphs at a comfortable `1.6`–`1.625` line height.
- Keep headings at `-0.02em` tracking; do not apply negative tracking to body copy.
- Use uppercase only for short eyebrow labels and plan names.

## Spacing system

The public portal primarily follows Tailwind's four-pixel base scale.

| Token | Value | Common use |
|---|---:|---|
| 1 | 4px | Fine adjustment, toggle inset |
| 2 | 8px | Tight gaps, label spacing |
| 3 | 12px | Button vertical padding, compact gaps |
| 4 | 16px | Base page gutter, paragraph spacing |
| 5 | 20px | Navigation horizontal padding |
| 6 | 24px | Mobile card padding, component gaps |
| 8 | 32px | Desktop card padding, grid gaps |
| 10 | 40px | Control-to-content separation |
| 12 | 48px | Heading-to-grid separation |
| 16 | 64px | Page vertical padding |
| 20 | 80px | Major content separation |
| 24 | 96px | Footer separation |
| 32 | 128px | Primary narrative section separation |

Spacing rules:

- Public pages use `px-4 sm:px-6 lg:px-8` for horizontal gutters.
- Fixed-header pages begin at approximately `pt-32` (128px).
- Standard page vertical padding is `py-16` (64px).
- Long-form homepage and impact sections commonly use `mt-32` (128px).
- Related blocks inside a section use 24–48px separation.
- Cards use 24px padding on mobile and 32px on desktop.
- Standard grids use 32px gaps; narrative two-column layouts may use 48px.

## Layout and sizing

### Breakpoints

The portal uses Tailwind defaults:

| Prefix | Minimum width |
|---|---:|
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

### Containers

- Global pages use a centered responsive `container`.
- Reading/hero content: `max-w-3xl` (768px) or `max-w-4xl` (896px).
- Wider impact grids: `max-w-5xl` (1024px).
- Forms and toggles: `max-w-xs` (320px) to `max-w-md` (448px).
- Supporting text: usually `max-w-2xl` (672px).
- Do not run paragraph text across the full desktop container.

### Grid behavior

- Cards stack into one column by default.
- Most three-card groups become three columns at `md` (768px).
- Narrative image/text groups become two columns at `md`.
- Footer becomes three columns at `md`.
- CTA button groups stack on mobile and become horizontal at `sm`.

## Shape, borders, and elevation

| Element | Radius | Border | Shadow |
|---|---:|---|---|
| Primary/secondary CTA | Full pill | 0–1px | None |
| Standard control/button | 8–10px | 0–1px | None |
| Standard content card | 8–10px | 1px | None |
| Prominent/stat card | 16px | 1px | None |
| Modal | 16px | 1px | Large only for modal separation |
| Floating/scrolled header | 16px | Optional | `shadow-lg` |
| Photo/media | 8–12px | Usually none | Optional restrained shadow |

Base radius is `0.5rem` (8px), exposed as `--radius`. The live support cards render at 10px because they use the Tailwind `rounded-lg` utility; the homepage community card renders at 16px with `rounded-2xl`.

Border rules:

- Use one-pixel `--color-border` borders by default.
- Selected or featured cards may use `--color-accent` as the border.
- Avoid heavy outlines and stacked border-plus-shadow treatments.
- Content cards should rely on surface and border before shadow.

## Component specifications

### Primary CTA

- Fill: `--color-text-primary`.
- Label: `--color-bg`.
- Font: DM Sans, 15px mobile / 16px desktop, weight 500.
- Padding: 12px vertical, 32px horizontal for major CTAs.
- Radius: full pill.
- Hover: opacity reduction, not a new color.

### Secondary CTA

- Transparent background.
- One-pixel `--color-border` border.
- Primary text label.
- On hover, invert to the primary fill and page-background label.
- Same sizing as the paired primary CTA.

### Standard action button

- Font: DM Sans 16px, weight 500.
- Padding: 12px vertical, 24px horizontal.
- Radius: 10px.
- Full width inside pricing cards.

### Content card

- Background: `--color-card-bg` for elevation or `--color-bg` for quieter cards.
- Border: one pixel using `--color-border`.
- Radius: 10px standard; 16px for prominent grouped content.
- Padding: 24px mobile, 32px desktop.
- Default shadow: none.

### Header

- Desktop height: 96px outer region with a 64px inner navigation row.
- Desktop appears at `md` and above; mobile header appears below `md`.
- Brand and display navigation use Inter.
- Desktop header becomes a rounded, shadowed pill after scrolling.
- Mobile header height: 80px.
- Mobile navigation opens below the header as a full-width panel.

### Footer

- Top separation: 96px.
- Top border: one pixel.
- Vertical padding: 48px.
- One column on mobile, three columns from `md`.
- Grid gap: 32px.

### Theme switcher

- Three 24px circular controls.
- Lavender, black, and off-white options.
- Fixed at the lower-left on desktop and hidden there on mobile.
- Selected state uses a two-pixel primary-text border.

## Motion and interaction

- Global interactive transition: 500ms using `cubic-bezier(0.4, 0, 0.2, 1)`.
- Theme background transition: 700ms ease-in-out.
- Section entrance: 1000ms ease-out, beginning 48px below or to either side.
- Fade: 200–300ms.
- Fade upward: 400ms with a 10px translation.
- Floating cards: 6s ease-in-out infinite with an 8px vertical range.
- Header scroll state: 300–500ms.
- Hover scale should be restrained and limited to small controls or avatars.

Future work should add a `prefers-reduced-motion` path before expanding animation use. Donation and trust-critical content must remain readable without waiting for an entrance animation.

## Accessibility baseline

- A skip-to-content link is present and becomes visible on focus.
- Links, buttons, inputs, textareas, and selects receive a two-pixel accent focus outline with a two-pixel offset.
- Interactive controls should retain a visible focus state in all three themes.
- Body text should not fall below 15px on mobile.
- Touch targets should be at least 44px high even when their visible icon is smaller.
- Do not communicate payment state, errors, or selection using color alone.
- Decorative images require empty alt text; impact evidence requires factual alt text.

## Responsive reference measurements

### Desktop: 1280 × 720

- Hero H1/H2: Manrope 60/60px, weight 800.
- Hero lead: DM Sans 20px, approximately 32.5px line height.
- Primary hero CTA: 12px × 32px padding.
- Main content width: 896px.
- Community card: 768px wide, 32px padding, 16px radius.
- Support heading: 60/60px.
- Support cards: approximately 277px wide, 32px padding, 10px radius.

### Mobile: 390 × 844

- Body: DM Sans 15/24px.
- Hero H1/H2: Manrope 36/40px, weight 800.
- Hero lead: DM Sans 18px, approximately 29.25px line height.
- Page content width after gutters: 358px.
- Community card: 358px wide, 24px padding, 16px radius.
- Primary CTA keeps 12px × 32px padding and stacks with its secondary CTA.
- Desktop header is hidden; the 80px mobile header is shown.

## Preservation rules for the animal-first redesign

The following are fixed unless this document is revised deliberately:

1. Keep the three-theme token system.
2. Keep Manrope, DM Sans, Inter, and Geist Mono in their existing roles.
3. Keep the warm off-white default canvas and stone palette.
4. Keep the 4px spacing base and existing container widths.
5. Keep thin borders, low-shadow cards, and restrained elevation.
6. Keep pill CTAs and 8–16px card radii.
7. Keep the existing desktop/mobile breakpoints and page gutters.
8. New donation components must consume semantic tokens rather than introduce hard-coded colors.
9. New copy may change hierarchy and meaning, but must fit the documented type scale.
10. Real feeding evidence should become the visual focus; interface chrome should remain quiet.

## Known inconsistencies to resolve carefully

These are observations, not permission to restyle the portal broadly:

- Base heading sizes in CSS are sometimes overridden by larger Tailwind classes; rendered page measurements are authoritative for existing hero screens.
- `styles/globals.css` defines a separate shadcn-style palette, but the active public layout imports `app/globals.css`.
- Global `transition: all` is broader than necessary and may animate layout-affecting properties.
- Entrance and infinite animations do not yet provide a complete reduced-motion alternative.
- The support page uses 10px standard card radii while some homepage cards use 8px or 16px. Preserve the component-level distinction rather than forcing a single radius everywhere.

## Change-control checklist

Before merging future public-portal UI work:

- [ ] Uses only the documented font families and roles.
- [ ] Uses semantic theme variables for public colors.
- [ ] Follows the 4px spacing scale.
- [ ] Matches the documented mobile and desktop type scale.
- [ ] Keeps text within the appropriate max-width.
- [ ] Uses the correct button or card shape.
- [ ] Works in off-white, lavender, and black themes.
- [ ] Preserves keyboard focus visibility.
- [ ] Checks 390px mobile and 1280px desktop layouts.
- [ ] Avoids adding motion without a reduced-motion behavior.

