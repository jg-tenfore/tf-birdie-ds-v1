import type { Meta, StoryObj } from "@storybook/react-vite";

import { MobileProShop } from "@/components/mobile/screens/mobile-pro-shop";

/**
 * **Mobile Screens — 1-proshop.** The golf-merchandise register at phone width.
 * Compare against `App Screens → 1-proshop`.
 *
 * The 24-tile category grid becomes a 24-row list; the order panel becomes a
 * bottom-nav destination; POP moves into the overflow, still red.
 */
const meta = {
    title: "Mobile Screens/1-proshop",
    parameters: { layout: "centered", replica: true, viewport: { defaultViewport: "mobile" } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Nothing rung up, Scan Mode off, the full category list. */
export const EmptyOrder: Story = { name: "Empty order", render: () => <MobileProShop /> };

/**
 * Two lines on the order, with the totals stack and the green `Total Owed`
 * band — the same rows in the same order as the landscape order panel, simply
 * at full width instead of in a 390px column.
 */
export const ItemsInOrder: Story = { name: "Items in order", render: () => <MobileProShop tab="order" withOrder /> };

/**
 * **Scan Mode on.** Barcode input routes straight to the order, so the category
 * list has nothing to do and says so.
 *
 * The switch keeps its slate track: the shipping app never overrode
 * `colorAccent`, and that is transcribed rather than corrected.
 */
export const ScanMode: Story = { name: "Scan Mode on", render: () => <MobileProShop scanMode /> };

/**
 * **Overflow menu.** POP, Player Search and Print Receipt.
 *
 * POP opens the cash drawer and touches nothing else — exactly the kind of
 * action worth a deliberate second tap on a device you can drop.
 */
export const OverflowMenu: Story = { name: "Overflow menu", render: () => <MobileProShop sheet="overflow" /> };
