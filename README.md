# Birdie POS — Tenfore Design System

The UI and UX reference for Tenfore's point-of-sale, designed for a **landscape Android tablet** and
documented as the specification for the eventual Expo app.

Two things are published from this repo.

---

## 📕 Storybook — the design system

### **https://jg-tenfore.github.io/tf-birdie-ds-v1/storybook/**

The specification. Every token, component and screen state documented in isolation, so a decision
gets made once and then referenced rather than re-argued.

| Section               | What's in it                                                                                                                                                          |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Foundations**       | Color, typography, spacing & layout, radius & elevation, touch targets, icons, logos — the raw values everything else is built from.                                   |
| **Components**        | The interactive kit, grouped by job: Actions, Forms, Feedback & Status, Layout & Structure, Media & Visuals, Navigation.                                               |
| **App Chrome**        | The persistent frame — app bar, drawer navigation, order panel, bottom action bar. The parts that never leave the screen.                                              |
| **App Screens**       | Every screen of the shipping app, numbered `1-proshop` through `17-shift` to match how the product is actually organised. Multi-state screens get one story per state. |
| **Sign in / Sign up** | The ways an operator gets into the terminal, PIN entry included.                                                                                                      |

Two things worth knowing about how to read it:

- **App Screens are an as-is replica, not a proposal.** They render in a separate theme sampled from
  screenshots of the live terminal, so they show what the app looks like today — including its typos
  and its inconsistencies, which are annotated where they appear. Everything outside that category is
  the target state.
- **Nothing is responsive.** Every story is composed at 1280×800 landscape. There is no portrait
  layout and no phone breakpoint, because the hardware has neither.

---

## 🏌️ Prototype — a working POS

### **https://jg-tenfore.github.io/tf-birdie-ds-v1/prototype/**

A point-of-sale you can actually operate, not a set of linked screenshots. It holds state: a ticket
started in the Pro Shop is the same ticket you hold as a tab, reopen at a table, and tender at
checkout.

**Sign in with PIN `1234`.**

What works end to end:

- **Selling** — browse the retail catalogue or the 19th Hole kitchen menu, ring items, change
  quantities, hold a ticket, ring a combo up as its component lines.
- **Tee sheet** — move between days, jump back to today, book and check in a tee time, push a round
  straight onto a ticket. The date bar turns orange when you are not looking at today.
- **Restaurant** — tabs, tables laid out by room, quick order, seat assignment.
- **Checkout** — the seven-tab tender surface: credit, cash, gift card, raincheck, check, member
  account and room charge. Cash computes change; the sale closes and appears in Order Lookup.
- **Court and bay sheets** for the non-golf resources.

It exists to answer the questions Storybook can't: whether a flow holds together across screens, how
many taps a real transaction takes, and where the app makes an operator stop and think.

---

## Working on it

```bash
npm install
npm run storybook      # design system → http://localhost:6020
npm run dev:app        # prototype     → http://localhost:5180
```

| Script              | What it does                                                  |
| ------------------- | ------------------------------------------------------------- |
| `npm run storybook` | Storybook dev server                                          |
| `npm run dev:app`   | Prototype dev server                                          |
| `npm run build`     | Builds both plus the landing page into `dist/` — what CI runs |
| `npm run typecheck` | `tsc --noEmit`                                                |
| `npm run smoke`     | Playwright pass over the prototype's flows                    |
| `npm run format`    | Prettier                                                      |

```
src/
├── theme/            # tokens, plus two themes: the target state and the as-is replica
├── components/       # app chrome and the screen components the stories compose
├── data/             # product and menu catalogues, generated from store/images
├── stories/          # Foundations, Components, App Chrome, App Screens, Sign in / Sign up
└── utils/
app/                  # the prototype — routes, the POS store, and its screens
site/                 # the landing page
scripts/              # site assembly, catalogue generators, the smoke test
```

## The constraint

Every screen is a **landscape tablet**, 1280×800 reference. No portrait, no phone breakpoint, no
responsive collapse to a hamburger. Three rules follow:

- **48dp touch floor.** Nothing tappable is smaller. Primary actions 56dp, tender keys 64dp,
  irreversible actions 80dp. Hover is never load-bearing.
- **Height is scarce.** Chrome is capped at 136px (64 app bar + 72 action bar). The page never
  scrolls; regions scroll internally.
- **16px body minimum.** Buttons are sentence case. Brand green is reserved for _the_ action.

These are encoded in `src/theme/birdie-theme.ts` as component defaults, so a screen built from stock
components is tablet-correct without anyone having to remember the rules.

## Deployment

Pushing to `main` runs `.github/workflows/deploy-pages.yml`, which typechecks, builds and publishes
to GitHub Pages:

- `/` — landing page
- `/storybook/` — the design system
- `/prototype/` — the working POS
