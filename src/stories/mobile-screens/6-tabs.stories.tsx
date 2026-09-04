import type { Meta, StoryObj } from "@storybook/react-vite";

import { MobileTabDetail, MobileTabListing, MobileTabOpenFood } from "@/components/mobile/screens/mobile-tabs";

/**
 * **Mobile Screens — 6-tabs.** Compare against `App Screens → 6-tabs`.
 *
 * The listing's four table columns stack into two lines. The seat bands need no
 * adaptation at all — a coloured full-width band is already the narrowest way to
 * group a list.
 */
const meta = {
    title: "Mobile Screens/6-tabs",
    parameters: { layout: "centered", replica: true, viewport: { defaultViewport: "mobile" } },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * **Tab listing.** Name on top, the operator/order/timestamp/card metadata
 * joined into one secondary line, amount hard right.
 *
 * Nothing is dropped — the reading order turns from left-to-right into
 * top-to-bottom, which is the reliable move when a table has to narrow.
 */
export const TabListing: Story = { name: "Tab listing", render: () => <MobileTabListing /> };

/** **Tab detail.** Seats, lines and PAY. */
export const TabDetail: Story = { name: "Tab detail", render: () => <MobileTabDetail /> };

/**
 * **Tab detail — line menu.** Fire / Move / Split / Edit / Discount / Delete.
 *
 * Six options is too many for an anchored menu at this width, and it is exactly
 * what a bottom sheet is for.
 */
export const TabDetailLineMenu: Story = { name: "Tab detail — line menu", render: () => <MobileTabDetail sheet="line" /> };

/** **Tab detail — combos.** The combo list, as rows rather than tiles. */
export const TabDetailCombos: Story = { name: "Tab detail — combos", render: () => <MobileTabDetail tab="menus" combos /> };

/**
 * **The menu, and a drill-down.** `Beers ›` opens a sub-list rather than
 * swapping a tile grid in place.
 *
 * The chevron is load-bearing: a row either adds to the order or goes
 * somewhere, and at this width there is no room for a second convention to say
 * which.
 */
export const TabDetailMenu: Story = { name: "Tab detail — menu", render: () => <MobileTabDetail tab="menus" /> };

/** The drilled-in list. */
export const TabDetailDrilled: Story = { name: "Tab detail — drilled into Beers", render: () => <MobileTabDetail tab="menus" drilled /> };

/** **Tab detail — open food.** A tablet dialog that became a screen. */
export const TabDetailOpenFood: Story = { name: "Tab detail — open food", render: () => <MobileTabOpenFood /> };
