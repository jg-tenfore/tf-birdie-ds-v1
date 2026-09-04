import type { Meta, StoryObj } from "@storybook/react-vite";

import { MobileTeeSheet } from "@/components/mobile/screens/mobile-tee-sheet";
import {
    MobileCartSignOut,
    MobileCreateRaincheck,
    MobileEditReservation,
    MobileNotes,
    MobileReservationHistory,
    MobileTeeTimeDetail,
} from "@/components/mobile/screens/mobile-tee-time";

/**
 * **Mobile Screens — 2-teesheet.** Compare against `App Screens → 2-teesheet`.
 *
 * The hardest screen in the app to narrow. A tee sheet row is one tee time with
 * **four playing positions across**: ~290px each on a 1280px tablet, **~95px
 * each** at 402 — narrower than the price alone.
 *
 * So the grid **transposes**. The tee time becomes a full-width band and its
 * positions stack beneath it, and consecutive open positions collapse to a
 * single row so an empty sheet is not four times taller than a full one.
 *
 * **What the phone gives up:** Multi view and Back 9 exist on tablet to compare
 * courses, or the front and back nine, *at a glance*. Three columns cannot exist
 * in 402px — that is 32px per position — so both become switchers. The data
 * survives; the comparison does not, and no layout recovers it at this width.
 */
const meta = {
    title: "Mobile Screens/2-teesheet",
    parameters: { layout: "fullscreen", replica: true },
    globals: { viewport: { value: "mobile", isRotated: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * **List view** — the transposed agenda, and the primary view.
 *
 * The 5:58 PM foursome reads top to bottom instead of left to right, each
 * position keeping its tone stripe, its glyphs and its price. The four empty
 * times around it are one row each rather than four.
 */
export const ListView: Story = { name: "List view", render: () => <MobileTeeSheet view="list" /> };

/**
 * **List view — tee time menu.** Squeeze, Clear, Clone, Move Player(s).
 *
 * The tablet anchors this to a gear in the row's right-hand column. Six options
 * anchored to a row at this width covers the row, so it comes up as a sheet —
 * with `Clear Time` in the app's own red, because it is the one that destroys
 * something.
 */
export const TeeTimeMenu: Story = { name: "List view — tee time menu", render: () => <MobileTeeSheet view="list" overlay="menu" /> };

/**
 * **List view — course picker.** Three courses, from the date bar.
 *
 * A dropdown on tablet, a sheet here. Same three options, same order.
 */
export const CoursePicker: Story = { name: "List view — course picker", render: () => <MobileTeeSheet view="list" overlay="course" /> };

/**
 * **Grid view** — the phone's version of "denser".
 *
 * Grid exists on tablet to trade detail for density. A phone cannot show *more*
 * detail than List already does, so the honest phone version of denser is
 * **less per row**: one row per tee time, a four-segment occupancy bar, the
 * count, and the money. A whole evening fits without scrolling.
 *
 * Shrinking the type instead would have produced a grid nobody can tap.
 */
export const GridView: Story = { name: "Grid view", render: () => <MobileTeeSheet view="grid" /> };

/**
 * **Multi view — three courses.** A course switcher.
 *
 * Three columns of tee times cannot exist in 402px, and this is not a close
 * call: three columns of four positions is **32px per position**. The phone
 * shows one course at a time and names which, with the banner saying so rather
 * than leaving a reviewer to wonder where the other two went.
 */
export const MultiView: Story = { name: "Multi view — three courses", render: () => <MobileTeeSheet view="multi" /> };

/**
 * **Back 9 view — front and back.** A Front / Back toggle.
 *
 * Same impossibility as Multi, one column fewer. The toggle keeps both nines
 * reachable and loses the side-by-side read, which on tablet is the entire
 * reason the view exists.
 */
export const BackNineView: Story = { name: "Back 9 view — front and back", render: () => <MobileTeeSheet view="back9" /> };

/**
 * **Tee time detail — foursome.**
 *
 * Four players, mixed paid and unpaid, one carrying a raincheck bolt. Tap any
 * row for its actions.
 *
 * The meta line — holes, both fee names, the reservation id, the points — wraps
 * to two lines rather than truncating. The fee names are how a starter checks
 * the right rate was applied, so the horizontal alignment is what gives, not
 * the content.
 */
export const DetailFoursome: Story = { name: "Tee time detail — foursome", render: () => <MobileTeeTimeDetail variant="foursome" /> };

/**
 * **Tee time detail — the action sheet.**
 *
 * Seven actions in a row need ~700px. They move into a per-player sheet, and
 * the set is **not trimmed** — which actions a reservation offers is meaningful,
 * since a paid round offers Clone and Print where an unpaid one offers Cancel
 * and No Show.
 */
export const DetailActions: Story = {
    name: "Tee time detail — player actions",
    render: () => <MobileTeeTimeDetail variant="foursome" sheetOpen />,
};

/** **Tee time detail — paid pair.** Both rows carry Customer and Group notes. */
export const DetailPaidPair: Story = { name: "Tee time detail — paid pair", render: () => <MobileTeeTimeDetail variant="paid-pair" /> };

/**
 * **Tee time detail — open time.** Nobody booked.
 *
 * The screen keeps its full chrome, as the tablet does, so a starter can book
 * into it rather than backing out to find another way in.
 */
export const DetailOpenTime: Story = { name: "Tee time detail — open time", render: () => <MobileTeeTimeDetail variant="open-time" /> };

/** **Dialog — reservation history.** A centred card on tablet; a screen here. */
export const DialogHistory: Story = { name: "Dialog — reservation history", render: () => <MobileReservationHistory /> };

/**
 * **Dialog — customer notes.**
 *
 * A dialog whose whole purpose is a text area cannot afford to be a card inside
 * 402px, so it takes the screen and the text area gets the full width.
 */
export const DialogCustomerNotes: Story = { name: "Dialog — customer notes", render: () => <MobileNotes title="Customer Notes" /> };

/** **Dialog — group notes.** */
export const DialogGroupNotes: Story = { name: "Dialog — group notes", render: () => <MobileNotes title="Group Notes" /> };

/** **Dialog — tee time notes.** */
export const DialogTeeTimeNotes: Story = { name: "Dialog — tee time notes", render: () => <MobileNotes title="Tee Time Notes" /> };

/**
 * **Edit reservation — fees.**
 *
 * Two fee groups side by side on tablet is 2 × 200px here, so they stack — and
 * because they stack, each group's subtotal now sits directly under the options
 * that produce it, which is arguably clearer than the original.
 *
 * `SAVE FEES TO ALL` stays separate from `SAVE`: it applies the selection to
 * every player on the tee time, which is a different act.
 */
export const EditReservationFees: Story = { name: "Edit reservation — fees", render: () => <MobileEditReservation /> };

/**
 * **Cart sign out.**
 *
 * The one screen the phone arguably does *better*. The waiver is 60 words that
 * the tablet sets beside a signature box; here it gets the full width above one.
 *
 * The commit stays disabled until both the cart number and the tick are in, and
 * says which is missing rather than just greying out.
 */
export const CartSignOut: Story = { name: "Cart sign out", render: () => <MobileCartSignOut /> };

/** The same screen once both are in. */
export const CartSignOutComplete: Story = { name: "Cart sign out — ready", render: () => <MobileCartSignOut complete /> };

/**
 * **Create raincheck.**
 *
 * The tablet puts **eighteen hole radios in two ragged rows**. Eighteen ~32px
 * targets do not survive 402px, and this number sets a refund amount.
 *
 * So the holes become a stepper — the same control the raincheck work settled
 * on for the same value in
 * [Aug 31 → 5](?path=/story/flows-rainchecks-aug-31-5-issue-the-group--the-screen)
 * — with the credit and the percentage directly above it, so the money is
 * always visible beside the number producing it.
 *
 * Move the stepper and watch $72.22 change.
 */
export const CreateRaincheck: Story = { name: "Create raincheck", render: () => <MobileCreateRaincheck /> };
