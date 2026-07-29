import Box from "@mui/material/Box";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { ListTopActions } from "@/components/screens/operations/inventory-chrome";
import { InventoryCategoryMenu, InventoryCountList, inventoryCountRows } from "@/components/screens/operations/inventory-count-list";

/**
 * The category scope, open. It is a full-bleed dark sheet floating over the
 * list rather than a popover anchored to the bar, and the bar itself stays
 * visible beneath it.
 */
const meta = {
    title: "App Screens/16-inventory/Category picker open",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <Box sx={{ position: "relative", height: "100vh" }}>
            <AppShell
                title="Inventory Counts"
                active="inventory"
                topBarRight={<ListTopActions />}
                actionBar={<ActionButton grow={1}>Merchandise</ActionButton>}
            >
                <InventoryCountList rows={inventoryCountRows} />
            </AppShell>
            <InventoryCategoryMenu selected="Merchandise" />
        </Box>
    ),
};
