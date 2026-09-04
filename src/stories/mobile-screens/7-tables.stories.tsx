import type { Meta, StoryObj } from "@storybook/react-vite";

import { MobileTableOrder, MobileTables } from "@/components/mobile/screens/mobile-tables";

/**
 * **Mobile Screens — 7-tables.** Compare against `App Screens → 7-tables`.
 *
 * **This is the one screen that could not simply narrow.** The tablet's Tables
 * screen is a floor plan — tables positioned in a room, drawn to scale. A
 * spatial view does not narrow: shrink the room to 402px and every table is too
 * small to hit; crop it and you hide the half you were not looking at.
 *
 * The references do not try, and neither does this. **Choosing which table you
 * are serving is not something this layout does** — it assumes you arrived with
 * a table in hand, which is what happens when the phone is a runner's device and
 * the terminal is the host's. Worth deciding deliberately rather than
 * discovering later.
 */
const meta = {
    title: "Mobile Screens/7-tables",
    parameters: { layout: "centered", replica: true, viewport: { defaultViewport: "mobile" } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** The product browser for a table — categories, each drilling into a sub-list. */
export const Default: Story = { name: "Menu — categories", render: () => <MobileTables /> };

/** The same browser, flat: rows that add straight to the order. */
export const Flat: Story = { name: "Menu — flat product list", render: () => <MobileTables flat /> };

/** Drilled into Beers. */
export const Drilled: Story = { name: "Drilled into Beers", render: () => <MobileTables drilled /> };

/**
 * **The seated table order.** Structurally identical to `6-tabs`' detail, and
 * it shares the components — on the device they are the same screen with a
 * different title, and a second implementation would drift.
 */
export const SeatedOrder: Story = { name: "Seated order", render: () => <MobileTableOrder /> };

/** The same order, fired. */
export const Fired: Story = { name: "Table fired", render: () => <MobileTableOrder fired /> };
