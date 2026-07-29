import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "@/components/app-chrome/app-shell";
import { OrderPanel, OrderPanelEmpty } from "@/components/app-chrome/order-panel";
import { ProShopCatalog } from "@/components/screens/pro-shop/pro-shop-catalog";
import { ProShopActions } from "@/components/screens/pro-shop/pro-shop-order-parts";

/**
 * Scan Mode on. Barcode input goes straight onto the order, so the tile grid
 * stays visible but is no longer the way items get added.
 */
const meta = {
    title: "App Screens/1-proshop/Scan Mode on",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <AppShell
            title="Pro Shop Order"
            active="proshop"
            accountLabel="TEST TEST ACCOUNT"
            orderPanel={
                <OrderPanel>
                    <OrderPanelEmpty />
                </OrderPanel>
            }
            actionBar={<ProShopActions />}
        >
            <ProShopCatalog scanMode />
        </AppShell>
    ),
};
