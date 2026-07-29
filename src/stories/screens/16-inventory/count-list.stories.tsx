import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { ListTopActions } from "@/components/screens/operations/inventory-chrome";
import { InventoryCountList, inventoryCountRows } from "@/components/screens/operations/inventory-count-list";

/**
 * Saved counts, newest first. The bottom bar is not an action — it is the
 * product-category scope for the list, rendered as a full-width slate bar.
 */
const meta = {
    title: "App Screens/16-inventory/Count list",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <AppShell
            title="Inventory Counts"
            active="inventory"
            topBarRight={<ListTopActions />}
            actionBar={<ActionButton grow={1}>Merchandise</ActionButton>}
        >
            <InventoryCountList rows={inventoryCountRows} />
        </AppShell>
    ),
};
