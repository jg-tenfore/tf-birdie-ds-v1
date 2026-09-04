import type { Meta, StoryObj } from "@storybook/react-vite";

import { MobileEventOrder, MobileEventsList } from "@/components/mobile/screens/mobile-events";

/**
 * **Mobile Screens — 15-events.** Pick a tournament, then sell against its tab.
 * Compare against `App Screens → 15-events`.
 *
 * Two screens on tablet and two here, but they narrow for opposite reasons. The
 * picker is a two-column table that has to stack. The order screen is the
 * order-panel-beside-grid layout that has to split into bottom-nav destinations
 * — the same break `5-quickorder` and `1-proshop` hit, resolved the same way.
 */
const meta = {
    title: "Mobile Screens/15-events",
    parameters: { layout: "fullscreen", replica: true },
    globals: { viewport: { value: "mobile", isRotated: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * **Event list.** The picker.
 *
 * On tablet this is two centred columns — ID and name, `flex: 1` each, so about
 * 645px per column — which is why
 * `A Awesome Service Charge Test II (Electric Bugaloo)` fits at 50 characters
 * without truncating. Split 402px the same way and the name gets 201px, roughly
 * 24 characters, and six of the fifteen events clip.
 *
 * So the ID drops to the secondary line and the name takes the full ~370px:
 * about 44 characters, and only the one 50-character row ellipsizes. The
 * centring goes with it — centred text in a narrow column fights its own
 * ellipsis, and a left rag is what a phone list reads down.
 *
 * **The missing search field is preserved, not fixed.** The shipping list is
 * unfiltered, unsorted by date, and puts a 2026 member-guest next to a row
 * literally named `asdf`; operators scroll. That is worse on a phone than on a
 * tablet, and it is still a product decision rather than a layout one — so it
 * is flagged here and left alone, the way `5-quickorder` leaves the defects it
 * inherited.
 */
export const EventList: Story = {
    name: "Event list",
    render: () => <MobileEventsList />,
};

/**
 * **Event order.** The Pro Shop selling surface bound to an event tab.
 *
 * A 390px order panel holding eight lines, a twelve-tile category grid, and the
 * Scan Mode switch floating above the grid's top-right corner. **Categories**
 * and **Tab** become the two bottom-nav destinations; open the *Tab* tab to see
 * the eight lines the panel held.
 *
 * Three specific trades:
 *
 * - **Tiles become rows.** A 96×96 tile plus its label is ~96px; four across
 *   402px leaves an 88px label column, in which `Japanese Cuisine` and
 *   `Miscellaneous` both wrap to three lines. The row gives the label the full
 *   width and keeps the photograph as a 44dp thumbnail.
 * - **The quantity badge moves.** On tablet it is a 22×20 dark chip pinned to
 *   the corner of a 52×44 product image. At 44dp the thumbnail is smaller than
 *   the chip's tablet footprint, so quantity moves to the secondary line as
 *   `Qty 11` — legible rather than decorative.
 * - **BACK / ADD PAYMENT becomes one primary.** Back is the app bar's job. It
 *   stays `ADD PAYMENT` rather than `PAY`, because an event tab is settled in
 *   instalments — and it deliberately carries **no amount**, even though
 *   `MobilePrimary` can hold one, because the tablet screen shows no running
 *   total for the tab and putting one on the button would be inventing a figure.
 */
export const EventOrder: Story = {
    name: "Event order",
    render: () => <MobileEventOrder />,
};
