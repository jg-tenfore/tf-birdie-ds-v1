import type { Meta, StoryObj } from "@storybook/react-vite";

import { MobileCreateReservation, MobileReservationsDay } from "@/components/mobile/screens/mobile-reservations";

/**
 * **Mobile Screens — 8-reservations.** The restaurant's book for one day, laid
 * out for a phone. Compare against `App Screens → 8-reservations`.
 *
 * Both screens narrow by giving up columns: the day list drops a six-column
 * header band that has nothing left to label, and the create form unpairs its
 * six side-by-side fields into six full-width rows. The slate date band
 * survives both, because *which day* is the one thing this screen is about.
 */
const meta = {
    title: "Mobile Screens/8-reservations",
    parameters: { layout: "fullscreen", replica: true },
    globals: { viewport: { value: "mobile", isRotated: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * **Day list.** A day with nothing booked.
 *
 * `ColumnHeaderBand` spreads `Time / Party / First Name / Last Name / Email /
 * Phone` evenly — 67px a column here, in which `First Name` does not fit at the
 * band's own 17px, never mind `weston.farnsworth@tenfore.golf` at ~230px
 * underneath it. A header band labels columns; once a booking stacks into time
 * and party over name / email / phone, there are no columns to label, so the
 * band goes rather than staying as decoration.
 *
 * The tablet keeps that band visible on an empty day so the shape of the list
 * reads before any rows exist. On a phone that argument dies with the columns.
 *
 * `ADD RESERVATION` came out of the app bar — 13px with its letterspacing is
 * ~135px, a third of the bar — and became the floating pill. `BACK`, the only
 * button in the tablet's action bar, is the leading affordance, so this screen
 * has no action tray and the empty state gets the whole canvas at
 * `MobileEmpty`'s 88px mark rather than `AntlerEmptyState`'s 216×200, which
 * would be a quarter of the 725dp available.
 */
export const DayList: Story = {
    render: () => <MobileReservationsDay />,
};

/**
 * **Create Reservation.**
 *
 * The tablet pairs the fields — time beside guests, First beside Last, Email
 * beside Phone. At 402px minus the form's insets a pair gives each field
 * ~185px, and `Enter number of guests` is ~180px at 17px *before* the field's
 * own 32px of padding. So all six take the full width: 6 × 54dp still fits the
 * 725dp canvas with the customer heading and a pinned action tray, which is why
 * nothing had to be cut.
 *
 * `Customer Info --------` and `Golf Course Customer ID 0` were side by side.
 * The trailing dashes are a rule drawn in text, and there is nothing left to
 * rule off once the pairs stack, so the label becomes the section heading and
 * the resolved ID sits under it — still above the four lookups it describes,
 * each keeping its magnifier because these search the golf course record rather
 * than accept typed text.
 *
 * The date is inherited from the day list rather than asked for again, and the
 * same band on both screens is what makes that read as inheritance.
 * `SAVE RESERVATION` takes the full width; `BACK` is the app bar's arrow.
 */
export const CreateReservation: Story = {
    render: () => <MobileCreateReservation />,
};
