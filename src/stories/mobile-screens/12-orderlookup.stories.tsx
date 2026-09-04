import type { Meta, StoryObj } from "@storybook/react-vite";

import { MobileOrderLookup } from "@/components/mobile/screens/mobile-order-lookup";

/**
 * **Mobile Screens — 12-orderlookup.** Find a past order by ID, by payment ID,
 * or by what was on it. Compare against `App Screens → 12-orderlookup`.
 *
 * The luckiest screen in this category. `OrderLookupField` on tablet hardcodes
 * `width: 402` — half of the right-hand column — which happens to be exactly
 * the width of this phone. The fields need no narrowing at all; they only need
 * to stop sitting beside something.
 */
const meta = {
    title: "Mobile Screens/12-orderlookup",
    parameters: { layout: "fullscreen", replica: true },
    globals: { viewport: { value: "mobile", isRotated: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * **Search.** The screen as it opens — scope set to today's date and the
 * signed-in course, nothing pre-filled.
 *
 * The tablet is symmetric: scope on the left, the three ways in on the right,
 * two `flex: 1` halves of 1290px. Here they stack in reading order, scope
 * first — scoping to the wrong day and *then* typing an order ID is the failure
 * this arrangement exists to prevent.
 *
 * **The course picker becomes a row.** `The Dunes of Delgado PROD` is set at
 * 28px on tablet, about 340px of type before the dropdown arrow, centred in a
 * 645px column. It does not fit here beside an icon with 16px gutters, so it
 * becomes a row: the course as the title, the tablet's `Golf Course` caption as
 * the secondary line, and a `>` where the arrow was.
 *
 * **The date button transfers almost verbatim.** A 402px slate block with a
 * calendar glyph pinned left and the date in 14px caps *is* `MobileSecondary`
 * with an icon — same fill, same casing, same tracking. It was already sized
 * for this width.
 *
 * **The three fields keep their words and lose their air.** Same captions, same
 * placeholders, same order, still alternatives rather than combining filters.
 * The 48px gaps between them were buying air in a tall column and would push
 * the third field below the fold here; the captions move from centred above the
 * field to inside it, matching the filled-field pattern `MobileOpenFood` set.
 *
 * **Three action buttons become two.** `BACK / PRINT SNAPSHOT / SEARCH` at
 * 402px is 134px each, and `PRINT SNAPSHOT` needs about 150. BACK is the app
 * bar's job. PRINT SNAPSHOT stays visible as a secondary rather than hiding in
 * the overflow, because it is not a search at all — it prints the day's summary
 * for the scope above without searching. SEARCH commits, so it takes the full
 * width.
 *
 * And the **white canvas is kept**. This screen sits on `appColors.surface`
 * rather than the grey every other screen uses, which is unusual enough in the
 * shipping app to carry over rather than normalise. A re-layout does not get to
 * tidy up a background.
 */
export const Search: Story = {
    render: () => <MobileOrderLookup />,
};
