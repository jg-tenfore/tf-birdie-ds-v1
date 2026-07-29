import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { StatusBanner } from "@/components/screens/restaurant/quick-order-parts";
import { PotatoSkinsDetail, twoLineOrder } from "@/components/screens/restaurant/quick-order-story-parts";

/**
 * Editing an item: modifier groups.
 *
 * Selecting a line swaps the canvas for a detail pane — photo, name,
 * description, a running total, a quantity stepper, a note field, then the
 * modifier groups as underlined tabs. The bottom bar collapses to a single
 * full-width BACK, so there is no way to pay from inside item edit.
 *
 * The green band is the confirmation left over from saving order notes; it
 * stays up rather than auto-dismissing.
 */
const meta = {
    title: "App Screens/5-quickorder/Item modifiers — cheeses",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <AppShell
            title="Quick Order"
            active="quickorder"
            subBar={<StatusBanner message="Order Notes Saved!" />}
            orderPanel={twoLineOrder}
            actionBar={<ActionButton>Back</ActionButton>}
        >
            <PotatoSkinsDetail activeGroup="Cheeses" />
        </AppShell>
    ),
};
