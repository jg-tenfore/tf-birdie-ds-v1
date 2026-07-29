# Birdie POS — Tenfore Design System

The UI and UX reference for Tenfore's point-of-sale. Built on **Material UI v9**, designed for a
**landscape Android tablet**, and documented in Storybook as the specification for the eventual
Expo app.

**Live:** https://jg-tenfore.github.io/tf-birdie-ds-v1/

## Quick start

```bash
npm install
npm run storybook      # http://localhost:6020
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run storybook` | Dev server on port 6020 |
| `npm run build-storybook` | Builds Storybook into `dist/storybook` |
| `npm run build-site` | Assembles the landing page, logos, and prototypes into `dist` |
| `npm run build` | Both of the above — what CI runs |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run format` | Prettier |

## What's here

```
src/
├── theme/
│   ├── tokens.ts          # raw values: palette, touch targets, layout, type scale
│   └── birdie-theme.ts    # the MUI theme — encodes the tablet rules as defaults
├── components/
│   └── app-chrome/        # the persistent POS frame
├── stories/
│   ├── introduction.mdx
│   ├── foundations/       # Colors, Typography, Spacing & Layout, Radius & Elevation,
│   │                      # Touch Targets, Icons, Logos
│   ├── components/        # Actions, Forms, Feedback & Status, Layout & Structure,
│   │                      # Media & Visuals, Navigation
│   └── app-chrome/
└── utils/
logos/                     # Tenfore marks, served at /logos
site/                      # GitHub Pages landing page
scripts/build-site.mjs     # assembles dist/
prototypes/                # (optional) drop a static prototype dir here to publish it
```

## The constraint

Every screen is a **landscape tablet**, 1280×800 reference. No portrait, no phone breakpoint, no
responsive collapse to a hamburger. Three rules follow:

- **48dp touch floor.** Nothing tappable is smaller. Primary actions 56dp, tender keys 64dp,
  irreversible actions 80dp. Hover is never load-bearing.
- **Height is scarce.** Chrome is capped at 136px (64 app bar + 72 action bar). The page never
  scrolls; regions scroll internally.
- **16px body minimum.** Buttons are sentence case. Brand green is reserved for *the* action.

These are enforced in `src/theme/birdie-theme.ts` as MUI component defaults, so a screen built from
plain MUI components is tablet-correct without anyone remembering the rules.

## Deployment

Pushing to `main` triggers `.github/workflows/deploy-pages.yml`, which typechecks, builds, and
publishes to GitHub Pages:

- `/` — landing page with links to Storybook and prototypes
- `/storybook/` — the built Storybook
- `/prototypes/<name>/` — anything placed in `prototypes/`

## Adding a prototype

Drop a self-contained static build into `prototypes/<name>/`, then add a card to the Prototypes
grid in `site/index.html`. `build-site.mjs` copies every directory under `prototypes/` as-is.

## Related

- **Buck** — Tenfore's Untitled UI + Tailwind system: https://jg-tenfore.github.io/tf-buck-ds-v1/
- **Fox** — the original design system these share a palette with
