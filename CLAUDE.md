# Birdie POS Design System

## Project Overview

The UI/UX reference for **Birdie**, Tenfore's point-of-sale. This repo is a **specification, not a
shipping app** — the product will be built in Expo/React Native, and this Storybook exists so the
layout, spacing, type, color, and interaction rules are settled and testable before they are
translated to native.

Stack:

- **React 19** + **TypeScript**
- **Material UI v9** with the **Emotion** style engine and CSS theme variables
- **Storybook 10** (`@storybook/react-vite`)
- **Vite 8**

Sibling systems: **Buck** (`tf-buck-ds-v1`) and **Fox** (`tf-fox-ds-v1`) — Untitled UI + Tailwind +
React Aria. Birdie shares their brand palette but **none** of their component stack. Do not port
Untitled UI, Tailwind, or React Aria code into this repo.

## THE CONSTRAINT

**Every screen is a landscape Android tablet.** Reference device: **1280×800**. There is no
portrait layout, no phone breakpoint, and no responsive collapse to a hamburger menu.

When writing any component or screen here:

1. **48dp is the touch floor.** Nothing tappable goes below it. Use the `touchTarget` tiers:
   `min` 48 (icon buttons, rows, tabs) · `comfortable` 56 (default) · `large` 64 (tender keys,
   product tiles) · `critical` 80 (Charge, Void, Refund). Size tracks the cost of a mis-tap.
2. **Height is the scarce resource.** 800px total, 136px of it chrome. The page never scrolls —
   regions scroll internally. Never add vertical chrome without removing some.
3. **Body text starts at 16px.** Never 14px. Buttons are sentence case, never ALL CAPS.
4. **Hover is never load-bearing.** A finger has no hover. Tooltips and hover-reveal actions are
   progressive enhancement only; no flow may depend on one to be discoverable.
5. **Adjacent targets need ≥8px of gap.**

## TWO THEMES — do not conflate them

This repo holds two distinct visual systems, and mixing them is the easiest way to do real damage.

| | `birdieTheme` (`src/theme/birdie-theme.ts`) | `appReplicaTheme` (`src/theme/app-replica-theme.ts`) |
| --- | --- | --- |
| Represents | **Target state** — the design system | **Current state** — the shipping app, as-is |
| Applies to | Foundations, Components, App Chrome | `App Screens/*` only |
| Buttons | Sentence case | ALL CAPS (MD2) |
| Radius | 10–14px | 4px |
| Touch floor | 48dp enforced | Not enforced — documents what ships |
| Tokens | `tokens.ts` | `app-replica-tokens.ts` |

`.storybook/preview.tsx` switches on `context.title.startsWith("App Screens")` — **stories must not wrap
themselves in a `ThemeProvider`.**

`App Screens/*` are a pixel-faithful replica of the shipping app, transcribed from screenshots in
`references/072926/`. When editing them, match the screenshots — do not "improve" them toward the
design system, and do not copy their patterns (ALL CAPS, 4px radii, sub-48dp targets) back into
`Components/*`.

### The shipping app's chrome

`src/components/app-chrome/app-shell.tsx` reproduces it: hamburger **flyout drawer** (not a rail),
order panel on the **left**, and a bottom bar of equal-width slate `ActionButton`s — green for the
confirming action, red for POP, grey when disabled. Nav destinations and the identity block live in
`nav-items.ts`.

`pos-shell.tsx` is the *design-system* shell (permanent 88dp rail, right-hand order panel) and is
used by `App Chrome/POS Shell`. The two are intentionally different; don't merge them.

### Product imagery

`store/` holds 105 real product photos with `manifest.csv` metadata. `npm run generate:catalog`
derives `src/data/store-catalog.ts` from it — **that file is generated, don't hand-edit.** Images are
served at `/store-images`; resolve with `storeImage(product.path)`. There is no food or beverage
photography; those tiles use inline SVG placeholders.

## Theme is the deliverable

`src/theme/birdie-theme.ts` encodes the rules above as MUI component defaults — a plain `<Button>`
is 56dp, a plain `<IconButton>` is 48dp, a plain `<TextField>` is 56dp. **Prefer fixing the theme
over adding `sx` overrides to individual screens.** When this gets ported to Expo, the theme ports
first.

`src/theme/tokens.ts` holds raw values. Import from there rather than hard-coding numbers.

## Conventions

### File naming — kebab-case

```
✅ pos-shell.tsx, birdie-theme.ts, touch-targets.stories.tsx
❌ PosShell.tsx, birdieTheme.ts, TouchTargets.stories.tsx
```

Applies to every file type: components, stories, styles, scripts, configs.

### Imports

Use the `@/` alias for anything under `src/`:

```typescript
import { PosShell } from "@/components/app-chrome/pos-shell";
import { layout, touchTarget } from "@/theme/tokens";
```

Import MUI components from their deep paths (`@mui/material/Button`), not the barrel — it keeps
Storybook's dev bundle fast.

### Static assets

Never hard-code `/logos/...`. The deployed Storybook lives under a repo subpath, so absolute paths
404 on Pages while working fine locally. Use:

```typescript
import { assetUrl } from "@/utils/asset-url";
<img src={assetUrl("logos/tf-square-color.svg")} />;
```

### MUI v9 gotcha — no system props on Stack

v9 removed system props from `Stack`. `alignItems`, `justifyContent`, `flexWrap`, `rowGap`, and
friends are **not** accepted as direct props any more — they must go in `sx`:

```typescript
// ❌ v7 style — fails to typecheck in v9
<Stack direction="row" alignItems="center" justifyContent="space-between">

// ✅ v9
<Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
```

`direction`, `spacing`, `divider`, and `useFlexGap` remain real props. Most MUI examples online are
still v5–v7 and will hit this.

### MUI v9 gotcha — legacy `*Outline` icons removed

v9 deleted 23 icon exports ending in `Outline` (no "d") because they duplicated their `Outlined`
counterparts:

```typescript
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline"; // ❌ gone in v9
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined"; // ✅
```

Affects `CheckCircleOutline`, `MailOutline`, `DeleteOutline`, `InfoOutline`, `ErrorOutline`,
`HelpOutline`, `PersonOutline`, `PeopleOutline`, `StarOutline`, `LockOutline`, and 13 more. Theme
variants (`DeleteOutlineSharp`, `InfoOutlineRounded`) are unaffected.

### Components MUI documents but does not ship

`NumberField` and `Menubar` appear in the MUI docs sidebar marked NEW, but they are **recipes built
on Base UI** (`@base-ui/react`), not exports of `@mui/material` — and they are not in `@mui/lab`
either. Don't try to import them.

- **Number Field** — Birdie composes one from `TextField` + `IconButton`; see
  `Components/Forms/Number Field`. Base UI's spinner arrows are ~16px and break the 48dp floor.
- **Menubar** — deliberately not built. A desktop menubar needs two-level hover, which a finger
  can't do. Use the nav rail for destinations and an overflow `Menu` for secondary actions.

`@mui/lab` is **not** a dependency. Don't add it without a specific need — v9 moved `LoadingButton`
into `Button` (`loading` prop), which was the main reason to reach for it.

### Styling

Use the `sx` prop and semantic palette tokens — `bgcolor: "background.paper"`, `color:
"text.secondary"`, `borderColor: "divider"` — never raw hex or `grey[300]` in a screen. Raw ramp
values belong in `tokens.ts` only. Everything must work in both light and dark; check with the
Theme toolbar control.

## Story organization

The taxonomy mirrors the Buck design system so the two read the same way. Sort order is set in
`.storybook/preview.tsx`.

| Category | Contents |
| --- | --- |
| `Introduction` | The intro MDX page |
| `Foundations/*` | Colors, Typography, Spacing & Layout, Radius & Elevation, Touch Targets, Icons, Logos |
| `Components/*` | Actions · Forms · Feedback & Status · Layout & Structure · Charts & Data · Media & Visuals · Navigation |
| `App Chrome/*` | The persistent POS frame |
| `App Screens/*` | Register · Tickets · Payments · Tee Sheet · F & B · Pro Shop · Customers · Reports · Settings |
| `Sign in ∕ Sign up/*` | Log in · PIN Unlock · Sign up · Forgot password · Verification |

**The separator in `Sign in ∕ Sign up` is `∕` (U+2215 division slash), not `/`.** A real slash would
split it into two nested sidebar folders. Copy the string from `preview.tsx` rather than retyping it.

Auth has two distinct layers, and stories should respect the split: **terminal sign-in** (email +
password, run once by a manager) and **operator PIN unlock** (4-digit, run dozens of times a shift).
A forgotten PIN is cleared by a shift lead on the spot — it never goes through the email flow.

When adding a story:

- Title it `Components/<Category>/<Name>` — put it in an existing category rather than inventing one.
- File goes in `src/stories/components/<category-kebab>/<name>.stories.tsx`.
- `parameters: { layout: "fullscreen" }` for anything screen- or panel-shaped; the preview default
  is already fullscreen.
- Write the doc comment as *why this is shaped this way for a POS*, not *what the component is*.
  The audience is whoever builds the Expo version.

`Charts & Data` is reserved in the sort order but has no stories yet — no charting library is
installed. Add `@mui/x-charts` when the first one is needed.

## Storybook

```bash
npm run storybook   # port 6020
npm run build       # dist/storybook + landing page — what CI deploys
npm run typecheck
```

Toolbar: **Theme** switches light/dark; **viewport** switches between the five reference
landscape devices (`src/theme/tokens.ts` → `devices`). All are landscape by design — there is
deliberately no portrait entry.

## Deployment

`main` → `.github/workflows/deploy-pages.yml` → GitHub Pages:

- `/` landing page (`site/index.html`)
- `/storybook/`
- `/prototypes/<name>/` — anything dropped into `prototypes/`

Storybook's production `base` is `/tf-birdie-ds-v1/storybook/`, set in `.storybook/main.ts`. If the
repo is ever renamed, that string and the README links must change together.

## Git

Commits and GitHub operations in this repo use **jg-tenfore** (`justin.girard@tenfore.golf`), set
as local repo config. The global git identity is a different account — do not rely on it.
