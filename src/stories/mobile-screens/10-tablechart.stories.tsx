import type { Meta, StoryObj } from "@storybook/react-vite";

import { MobileCreateTable, MobileTableChart } from "@/components/mobile/screens/mobile-table-chart";
import { detachedTokens } from "@/components/screens/restaurant/table-chart-chrome";

/**
 * **Mobile Screens — 10-tablechart.** Compare against `App Screens →
 * 10-tablechart`. This is the hardest extrapolation in the category and the one
 * with the largest honest gap.
 *
 * ## The phone does not get the editor
 *
 * Table Chart is not a list that happens to be drawn spatially — it **is** the
 * spatial thing. You drag a 95×80 token to where the table actually stands, and
 * the whole value of the result is the x/y you dragged it to. That needs a
 * canvas big enough to be a room (the tablet places tokens at x≈800), a drag
 * that is not also a scroll, and two hands on a device that is sitting still.
 * A phone gives none of the three.
 *
 * **So the visual editor stays a tablet capability, and that is stated rather
 * than faked.** A squashed floor plan that technically renders at 402px would
 * be worse than not shipping it, because it would look like the capability
 * exists. The screen itself says so, in a line under the list.
 *
 * ## What the phone does get
 *
 * The **roster** — the half of this screen that is not spatial. Which rooms
 * exist, which tables are in the room you picked, adding one, saving. A runner
 * can confirm Table 10 is in *banquet*; they cannot say where in it.
 *
 * One thing the list does better: the tablet token clips its label at both ends
 * (`Detached 27699` renders as `ached 276`). A row gives it the full width.
 */
const meta = {
    title: "Mobile Screens/10-tablechart",
    parameters: { layout: "fullscreen", replica: true },
    /**
     * Portrait, only here.
     *
     * Storybook 10 reads the viewport from **globals**;
     * `parameters.viewport.defaultViewport` is the Storybook 7 API and is
     * silently ignored.
     */
    globals: { viewport: { value: "mobile", isRotated: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The `[Detached Tables]` room. The same two tokens the tablet draws, listed —
 * and legible, which they are not inside a 95px token.
 */
export const DetachedTables: Story = {
    name: "Detached tables",
    render: () => <MobileTableChart room="[Detached Tables]" tables={detachedTokens} />,
};

/**
 * Choosing a room. The tablet raises a dark panel straight over the canvas with
 * no scrim; here it is the category's bottom sheet, which is the same list from
 * where a thumb already is. All eleven configured rooms, in the app's order.
 * SAVE greys out while it is open, exactly as on the tablet.
 */
export const RoomPicker: Story = {
    name: "Room picker",
    render: () => <MobileTableChart room="[Detached Tables]" picker canSave={false} />,
};

/**
 * A room with nothing in it. SET UP TABLES is the same action as NEW TABLE,
 * surfaced where the eye already is; SAVE stays disabled until the layout
 * changes.
 */
export const EmptyRoom: Story = { name: "Empty room", render: () => <MobileTableChart room="banquet" canSave={false} /> };

/**
 * NEW TABLE. A 550px dialog becomes a full screen — the category's fourth rule
 * — and the dialog's SAVE becomes the full-width primary, still slate. The new
 * table lands unsaved; the chart's own SAVE commits the layout.
 */
export const CreateTable: Story = { name: "Create table", render: () => <MobileCreateTable /> };

/**
 * After SAVE. The same green confirmation band, pushing the list down rather
 * than the canvas.
 */
export const LayoutSaved: Story = {
    name: "Layout saved",
    render: () => <MobileTableChart room="banquet" tables={[{ label: "10", x: 803, y: 372 }]} saved />,
};
