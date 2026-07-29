import Box from "@mui/material/Box";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "@/components/app-chrome/app-shell";
import { OrderPanel, OrderPanelEmpty } from "@/components/app-chrome/order-panel";
import { ProShopCatalog } from "@/components/screens/pro-shop/pro-shop-catalog";
import { ProShopActions } from "@/components/screens/pro-shop/pro-shop-order-parts";
import { ProShopOverflowMenu } from "@/components/screens/pro-shop/pro-shop-overflow-menu";

/**
 * The app-bar overflow. Refresh re-pulls the catalog, Add Cash Payout records
 * money leaving the drawer, and Quick Tab opens a tab without a customer.
 */
const meta = {
    title: "App Screens/1-proshop/Overflow menu",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <Box sx={{ position: "relative", height: "100vh" }}>
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
                <ProShopCatalog />
            </AppShell>
            <ProShopOverflowMenu />
        </Box>
    ),
};
