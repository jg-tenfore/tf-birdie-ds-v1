import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "@/components/app-chrome/app-shell";
import { OrderLineRow, OrderPanel } from "@/components/app-chrome/order-panel";
import { ProShopCatalog } from "@/components/screens/pro-shop/pro-shop-catalog";
import { OrderTotals, ProShopActions, orderLines } from "@/components/screens/pro-shop/pro-shop-order-parts";

/** Lines on the order: the panel fills, and PAY turns green with the total. */
const meta = {
    title: "App Screens/1-proshop/Items in order",
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
                <>
                    <OrderPanel>
                        {orderLines.map((line, index) => (
                            <Box key={line.id}>
                                {index > 0 && <Divider />}
                                <OrderLineRow line={line} />
                            </Box>
                        ))}
                    </OrderPanel>
                    <OrderTotals />
                </>
            }
            actionBar={<ProShopActions payLabel="Pay $155.81" payEnabled />}
        >
            <ProShopCatalog />
        </AppShell>
    ),
};
