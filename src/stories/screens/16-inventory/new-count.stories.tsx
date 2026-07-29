import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "@/components/app-chrome/app-shell";
import { CountActionBar, RefreshAction } from "@/components/screens/operations/inventory-chrome";
import { InventoryNewCountForm } from "@/components/screens/operations/inventory-new-count-form";

/**
 * The new-count form behind "+". Only two inputs, and SAVE is enabled before a
 * title has been entered.
 */
const meta = {
    title: "App Screens/16-inventory/New count",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <AppShell title="Inventory Count" active="inventory" topBarRight={<RefreshAction />} actionBar={CountActionBar}>
            <InventoryNewCountForm category="Merchandise" />
        </AppShell>
    ),
};
