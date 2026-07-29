import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "@/components/app-chrome/app-shell";
import { OrderPanel, OrderPanelEmpty } from "@/components/app-chrome/order-panel";
import { ProShopCatalog } from "@/components/screens/pro-shop/pro-shop-catalog";
import { ProShopActions } from "@/components/screens/pro-shop/pro-shop-order-parts";

/** Opening state: nothing rung up, Scan Mode off, the full category grid. */
const meta = {
    title: "App Screens/1-proshop/Empty order",
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
            <ProShopCatalog />
        </AppShell>
    ),
};
