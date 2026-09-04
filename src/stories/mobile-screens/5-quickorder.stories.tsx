import type { Meta, StoryObj } from "@storybook/react-vite";

import { MobileItemDetail, MobileOpenFood, MobileQuickOrder } from "@/components/mobile/screens/mobile-quick-order";

/**
 * **Mobile Screens — 5-quickorder.** The counter-service path, laid out for a
 * phone. Compare against `App Screens → 5-quickorder`.
 *
 * The same design system, the same fixtures, the same words. What changes is
 * arrangement: the tile grid becomes a list, the order panel becomes a
 * bottom-nav destination, the five-button action bar becomes one primary, and
 * the anchored menus become bottom sheets.
 */
const meta = {
    title: "Mobile Screens/5-quickorder",
    parameters: { layout: "fullscreen", replica: true },
    /**
     * Portrait, only here.
     *
     * Storybook 10 reads the viewport from **globals**, not from
     * `parameters.viewport.defaultViewport` — that is the Storybook 7 API and is
     * silently ignored, which is how every one of these stories was opening on
     * the 1280x800 tablet while rendering a 402px frame inside it.
     *
     * Set on the meta rather than in `preview.tsx` so it stays scoped to this
     * category: `initialGlobals` there keeps every other story on `tablet10`,
     * and the POS has no portrait mode outside these screens.
     */
    globals: { viewport: { value: "mobile", isRotated: false } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * **Empty order.** The opening state — nothing rung up.
 *
 * The product list is where the six-across tile grid was. Tap **Order** in the
 * bottom nav to see the empty order; the tablet shows both at once, and this is
 * the trade that width forces.
 */
export const EmptyOrder: Story = {
    name: "Empty order",
    render: () => <MobileQuickOrder />,
};

/**
 * **Items in order.** Two lines on the order, and the primary action appears.
 *
 * Note where the total went: onto the button. `PAY $28.65` rather than `PAY`,
 * because the landscape screen had a totals stack in the order panel to carry
 * it and this one does not.
 *
 * The attached-customer row above the nav carries the item count, so the
 * operator can see there are two lines without leaving the menu.
 */
export const ItemsInOrder: Story = {
    name: "Items in order",
    render: () => <MobileQuickOrder tab="order" withOrder />,
};

/**
 * **Combos.** The second bottom-nav destination.
 *
 * On tablet, COMBOS is a button in the action bar that swaps the content pane.
 * Here it is a destination, which is the same idea with the affordance moved to
 * where a phone keeps navigation.
 */
export const Combos: Story = {
    render: () => <MobileQuickOrder combos />,
};

/**
 * **Line item menu.** Edit / Discount / Delete.
 *
 * The tablet anchors this next to the line's kebab. At 402px an anchored menu
 * covers the row it acts on, so it comes up from the bottom — same three
 * options, same order, destructive still red.
 */
export const LineItemMenu: Story = {
    name: "Line item menu",
    render: () => <MobileQuickOrder tab="order" withOrder sheet="line" />,
};

/**
 * **Screen overflow menu.** Quick Tab / Refresh Menu / Remove All Discounts /
 * Cancel Quick Order.
 *
 * Same treatment, from the app bar's ⋮ rather than a line's.
 */
export const OverflowMenu: Story = {
    name: "Screen overflow menu",
    render: () => <MobileQuickOrder sheet="overflow" />,
};

/**
 * **Item detail with modifiers.** What the tablet's right-hand editor pane
 * becomes.
 *
 * A screen rather than a pane, because there is no second column for it to open
 * beside. `X` abandons and `Save` commits, both in the app bar. The modifier
 * chips became checkbox rows — chips at this width wrap to one per line anyway,
 * so the row is the honest form of the same control.
 */
export const ItemModifiers: Story = {
    name: "Item modifiers — cheeses",
    render: () => <MobileItemDetail group="Cheeses" />,
};

/** The same editor on its second modifier group. */
export const ItemModifiersToppings: Story = {
    name: "Item modifiers — toppings",
    render: () => <MobileItemDetail group="Toppings" />,
};

/**
 * **Open Food.** A tablet dialog that became a screen.
 *
 * A 640px centred card cannot shrink into 402px and still hold a name, a
 * radio pair, a notes box and a price. So it takes the whole screen, and the
 * commit is the full-width primary.
 */
export const OpenFood: Story = {
    name: "Open food",
    render: () => <MobileOpenFood />,
};
