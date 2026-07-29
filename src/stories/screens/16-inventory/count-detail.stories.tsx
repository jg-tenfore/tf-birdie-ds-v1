import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "@/components/app-chrome/app-shell";
import { CountActionBar, RefreshAction } from "@/components/screens/operations/inventory-chrome";
import { InventoryCountDetail, accessoriesCountLines } from "@/components/screens/operations/inventory-count-detail";

/**
 * An open count. The title bar reads "{count id} - {count title}", products are
 * grouped under a dark section band, and each line shows the expected quantity
 * beside the counted one. Expected reads 0.0 throughout here, which is what the
 * device shows when the catalogue has no on-hand figure to compare against.
 */
const meta = {
    title: "App Screens/16-inventory/Count detail",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <AppShell title="3484 - 78987" active="inventory" topBarRight={<RefreshAction withScanner />} actionBar={CountActionBar}>
            <InventoryCountDetail section="Accessories" lines={accessoriesCountLines} />
        </AppShell>
    ),
};
