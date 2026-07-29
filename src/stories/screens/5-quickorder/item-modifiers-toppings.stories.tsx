import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { StatusBanner } from "@/components/screens/restaurant/quick-order-parts";
import { PotatoSkinsDetail, twoLineOrder } from "@/components/screens/restaurant/quick-order-story-parts";

/**
 * The second modifier group.
 *
 * Toppings are free-standing toggles, not a single choice, but they are drawn
 * with radio circles — the same control the Cheeses group uses for what is a
 * genuine either/or.
 */
const meta = {
    title: "App Screens/5-quickorder/Item modifiers — toppings",
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
            <PotatoSkinsDetail activeGroup="Toppings" />
        </AppShell>
    ),
};
