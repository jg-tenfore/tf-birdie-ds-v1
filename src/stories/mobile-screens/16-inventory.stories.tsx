import type { Meta, StoryObj } from "@storybook/react-vite";

import {
    MobileInventoryCountDetail,
    MobileInventoryCountList,
    MobileInventoryNewCount,
} from "@/components/mobile/screens/mobile-inventory";

/**
 * **Mobile Screens — 16-inventory.** Physical stock counts against the product
 * catalogue, laid out for a phone. Compare against `App Screens →
 * 16-inventory`.
 *
 * Same fixtures — `inventoryCountRows`, `accessoriesCountLines` and
 * `inventoryCategories` are imported from the tablet's own components. What
 * changes is that both of this screen's tables stack: the count list's
 * `1fr 1.15fr 1.4fr` grid becomes title-over-meta, and the count detail's
 * three-pair run becomes name + counted quantity over SKU and expected.
 */
const meta = {
    title: "Mobile Screens/16-inventory",
    parameters: { layout: "fullscreen", replica: true },
    globals: { viewport: { value: "mobile", isRotated: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * **Count list.** Saved counts, newest first.
 *
 * The tablet gives each row 76px and three columns — 108 / 124 / 151px at this
 * width, where `7/20/2026 11:35 AM` alone measures ~130px and the *title* is
 * the cell that truncates first. Here the title leads and the other two cells
 * join beneath it as `92 products · 7/20/2026 11:35 AM`, in 64dp rather than
 * 76.
 *
 * The slate bar at the foot is unchanged in kind: on tablet it is the sole
 * button in the action bar and it is not an action either — it is the product
 * category the list is scoped to. `+` left the app bar for the floating pill,
 * because a 32px glyph beside a hamburger and an overflow reads as chrome.
 */
export const CountList: Story = {
    name: "Count list",
    render: () => <MobileInventoryCountList />,
};

/**
 * **Count detail.** Count 3484 - 78987, Accessories section.
 *
 * The tablet prints a 22px product name over `SKU: … Expected: 0.0 Actual:
 * 65.0` — ~330px of pairs that wrap inside 402px minus insets, and a pair run
 * that wraps breaks between a label and its value.
 *
 * So the row stacks with **Actual leading** on the trailing edge: it is the
 * figure the operator just counted and the only one on the row that changes.
 * SKU and Expected drop to the secondary line, still paired with their labels.
 *
 * The scanner and REFRESH came out of the app bar's right side — it is already
 * holding a back arrow and a two-part title — and became the secondary row,
 * where a thumb can reach a trigger it fires a hundred times a count.
 *
 * No thumbnails, and that is deliberate: `posImage` is strict, and none of
 * these nine reference names has an exact catalogue entry. See the component
 * docs.
 */
export const CountDetail: Story = {
    name: "Count detail",
    render: () => <MobileInventoryCountDetail />,
};

/**
 * **New count.** The form behind `+`.
 *
 * Two fields, and the tablet's odd asymmetry does not come with them: there the
 * `Product Category` label is left-aligned while its value is centred with the
 * caret pinned to the far right inset, which puts ~400px between a value and
 * its own control. At 402px that gap is gone regardless, so both fields become
 * the same left-aligned filled row — label above value — that
 * `8-reservations` uses.
 *
 * `SAVE` is still enabled before a title is entered. That is the shipping app's
 * behaviour, and re-laying out a screen is not the place to quietly fix it.
 */
export const NewCount: Story = {
    name: "New count",
    render: () => <MobileInventoryNewCount />,
};

/**
 * **Category picker open.** Merchandise / Food and Beverage / Alcohol.
 *
 * The tablet already draws this as a floating sheet rather than a popover —
 * `left: 8, right: 8, bottom: 80`, slate, three 64px rows over the list, with
 * the scope bar still visible underneath. That is a bottom sheet built by hand,
 * so on a phone it becomes the real one: same three categories, same order,
 * with the current scope marked by a check rather than by position.
 */
export const CategoryPickerOpen: Story = {
    name: "Category picker open",
    render: () => <MobileInventoryCountList picker />,
};
