import type { Meta, StoryObj } from "@storybook/react-vite";

import { MobileOrdersTips } from "@/components/mobile/screens/mobile-orders-tips";

/**
 * **Mobile Screens — 9-ordersTips.** End-of-shift reconciliation, laid out for
 * a phone. Compare against `App Screens → 9-ordersTips`.
 *
 * The widest screen in the set — seven totals across, seven ledger columns, six
 * action buttons — and therefore the one where all four narrowing rules fire at
 * once.
 */
const meta = {
    title: "Mobile Screens/9-ordersTips",
    parameters: { layout: "fullscreen", replica: true },
    globals: { viewport: { value: "mobile", isRotated: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * **No tippable payments.** A day with nothing to reconcile.
 *
 * **The totals strip rewraps rather than shrinking.** `DayTotalsStrip` is
 * `repeat(7, 1fr)` — 183px a cell on tablet, **57px** here, against
 * `Total Discounts` at ~98px and `Total Payments` at ~93px. Five of the seven
 * labels would wrap or clip. The cell composition is fine; there are just too
 * many per row, so the grid goes to two columns and the same seven cells wrap
 * to four rows at 201px each. The last row holds one cell and is left as it
 * falls — stretching `Total Tips` to full width would make it read as a summary
 * of the six above it.
 *
 * **It still prints no zeros.** An untraded day is a grid of labels over empty
 * space, exactly as the tablet capture shows, which is why the strip declares a
 * height instead of sizing to its content.
 *
 * **Which number leads a ledger row.** `Payment ID / Order ID / Time /
 * Customer / Payment / Amount / Tip` is 45px a column at this width. It stacks,
 * and the value that leads is **Amount** — not Tip, which is the field being
 * entered and so cannot also be what identifies the row you are typing into,
 * and not Payment ID, which identifies a row to the system rather than to a
 * server. Customer leads line 1 with Amount trailing, `Payment · Time · Order
 * ID · Payment ID` joins line 2, and Tip is the row's own control. The header
 * band that named those columns is dropped for the same reason as on
 * `8-reservations`.
 *
 * **Six buttons become four affordances.** `BACK / POP / TIP OUT / Wednesday,
 * July 29 2026 / DAY REPORT / SHIFT REPORT` is 67px a button here, and
 * `Wednesday, July 29 2026` is 22 characters. BACK is the app bar's arrow; the
 * date is not an action at all and becomes the slate day band `8-reservations`
 * already uses; POP keeps its red and TIP OUT its slate as the secondary row;
 * DAY REPORT — the one thing here that closes something — takes the full-width
 * green; SHIFT REPORT moves into the overflow, because a day report is printed
 * once at close and a shift report is printed per server on demand, so the
 * rarer of the two prints is the one that moves.
 */
export const NoTippablePayments: Story = {
    render: () => <MobileOrdersTips />,
};
