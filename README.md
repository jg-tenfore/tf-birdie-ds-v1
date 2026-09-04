# Birdie POS — Tenfore Design System

The UI and UX reference for Tenfore's point-of-sale, designed for a **landscape Android tablet** and
documented as the specification for the eventual Expo app.

Three things are published from this repo.

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
| **Mobile Screens**    | The same eighteen folders at **402×797** — the handheld re-layout, folder for folder against `App Screens`, plus the handheld tipping flow.                            |
| **Flows**             | A second axis through the same components, organised by journey rather than by screen.                                                                                |
| **Sign in / Sign up** | The ways an operator gets into the terminal, PIN entry included.                                                                                                      |

Two things worth knowing about how to read it:

- **App Screens are an as-is replica, not a proposal.** They render in a separate theme sampled from
  screenshots of the live terminal, so they show what the app looks like today — including its typos
  and its inconsistencies, which are annotated where they appear. Everything outside that category is
  the target state.
- **Nothing is responsive.** Every story is composed at a fixed device size — 1280×800 for the
  counter terminal, 402×797 for the handheld. `Mobile Screens` is a genuine re-layout rather than
  the tablet reflowed, because a 390px order panel beside a content pane has no responsive path to a
  bottom-nav phone. The two categories mirror each other's folder names so they can be read side by
  side.

---

## 🏌️ Prototype — the counter terminal

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

## 📱 Prototype — the handheld

### **https://jg-tenfore.github.io/tf-birdie-ds-v1/prototype/mobile.html**

The same POS at **402×797**, and — this is the point — **the same store behind it**. One reducer, one
cart, one tee sheet. A sale rung up on the phone is the same object as a sale rung up on the
terminal, which is what makes the two comparable rather than merely similar.

**Same PIN: `1234`.**

It is a second application, not a responsive variant. `app/index.html` and `app/mobile.html` are two
Vite entries over one `store.tsx`; the mobile bundle is ~28 kB because it shares everything below the
screen and differs only above it.

What is different, and why:

- **Sign-in draws its own keypad.** The terminal assumes a hardware keyboard beside it. A POS that
  summons the OS keyboard puts numeric entry behind a QWERTY layout.
- **The order panel is a destination**, not a column — with the item count on the nav tab, so nobody
  has to switch just to check the cart landed.
- **Cash is presets, not a free-text field.** A money field on a phone is a mis-key waiting to happen.
- **Tipping exists here and nowhere else.** A tip needs the device to change hands, so the counter
  terminal has no tip flow at all.

### The tipping flow

Built from the Sept 4 call. The load-bearing detail is **where the tip sits in the sequence**:

```
employee taps PAY → customer taps card → processor authorises
  → HAND THE DEVICE OVER → customer picks a tip → approves   ← captured at total + tip
    → receipt choice → HAND THE DEVICE BACK
```

After authorisation, before capture. Ask earlier and a changed tip needs a second authorisation; ask
after the sale closes and it has to be voided and re-run. Both handoffs are explicit screens, and the
receipt step offers **email or nothing** — the device has no printer.

Documented state by state in Storybook under `Mobile Screens → Tipping`, including the one open
question: whether the tip is calculated on the subtotal or the total.

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
