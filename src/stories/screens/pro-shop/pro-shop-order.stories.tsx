import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CategoryIcon from "@mui/icons-material/Category";
import PersonIcon from "@mui/icons-material/Person";
import ReplayIcon from "@mui/icons-material/Replay";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { OrderLineRow, OrderPanel, OrderPanelEmpty, type OrderLineItem } from "@/components/app-chrome/order-panel";
import { ProShopCatalog } from "@/components/screens/pro-shop/pro-shop-catalog";
import { ProShopOverflowMenu } from "@/components/screens/pro-shop/pro-shop-overflow-menu";
import { appColors } from "@/theme/app-replica-tokens";
import { golfBalls, mens } from "@/data/store-catalog";
import { storeImage } from "@/utils/asset-url";

/**
 * **Pro Shop Order** — the app's default selling screen.
 *
 * The left panel is the order in progress; the right side is a six-across grid
 * of merchandise categories, each of which drills into its own product list.
 * The bottom bar mixes navigation (TEE SHEET), order operations (RESET, POP,
 * ANONYMOUS, COMBOS) and the tender button in one row, so PAY sits next to
 * RESET with nothing separating them.
 *
 * Reproduced from `references/072926/1-proshop/`.
 */
const meta = {
    title: "App Screens/Pro Shop/Pro Shop Order",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const orderLines: OrderLineItem[] = [
    {
        id: "balls",
        name: "Pro V1 — dozen",
        qty: 1,
        price: "$54.99",
        meta: ["SKU 100482", "6 left"],
        image: storeImage(golfBalls[0]?.path ?? ""),
    },
    {
        id: "polo",
        name: "Bennet Polo — M",
        qty: 1,
        price: "$74.00",
        meta: ["SKU 220913", "2 left"],
        image: storeImage(mens[0]?.path ?? ""),
    },
    { id: "range", name: "Range Balls — Large", qty: 2, price: "$18.00", meta: ["SKU 900110", "24 left"] },
];

/** Subtotal / tax / total block pinned under the line list. */
const OrderTotals = () => (
    <Box sx={{ borderTop: "1px solid", borderColor: appColors.divider, px: 2, py: 1.5 }}>
        {[
            ["Subtotal", "$146.99"],
            ["Tax", "$8.82"],
        ].map(([label, amount]) => (
            <Stack key={label} direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{label}</Typography>
                <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{amount}</Typography>
            </Stack>
        ))}
        <Stack direction="row" sx={{ justifyContent: "space-between", mt: 1 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 500 }}>Total</Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 500 }}>$155.81</Typography>
        </Stack>
    </Box>
);

/**
 * The bottom bar. PAY is grey until the order has a line on it, which is the
 * only affordance telling staff the order is still empty.
 */
const Actions = ({ payLabel = "Pay $0.00", payEnabled = false }: { payLabel?: string; payEnabled?: boolean }) => (
    <>
        <ActionButton icon={<CalendarMonthIcon />}>Tee Sheet</ActionButton>
        <ActionButton icon={<ReplayIcon />}>Reset</ActionButton>
        <ActionButton icon={<SaveAltIcon />}>Pop</ActionButton>
        <ActionButton icon={<PersonIcon />}>Anonymous</ActionButton>
        <ActionButton icon={<CategoryIcon />}>Combos</ActionButton>
        <ActionButton icon={<ShoppingCartIcon />} tone={payEnabled ? "primary" : "disabled"}>
            {payLabel}
        </ActionButton>
    </>
);

/** Opening state: nothing rung up, Scan Mode off, the full category grid. */
export const EmptyOrder: Story = {
    name: "Empty order",
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
            actionBar={<Actions />}
        >
            <ProShopCatalog />
        </AppShell>
    ),
};

/**
 * Scan Mode on. Barcode input goes straight onto the order, so the tile grid
 * stays visible but is no longer the way items get added.
 */
export const ScanMode: Story = {
    name: "Scan Mode on",
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
            actionBar={<Actions />}
        >
            <ProShopCatalog scanMode />
        </AppShell>
    ),
};

/** Lines on the order: the panel fills, and PAY turns green with the total. */
export const ItemsInOrder: Story = {
    name: "Items in order",
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
            actionBar={<Actions payLabel="Pay $155.81" payEnabled />}
        >
            <ProShopCatalog />
        </AppShell>
    ),
};

/**
 * The app-bar overflow. Refresh re-pulls the catalog, Add Cash Payout records
 * money leaving the drawer, and Quick Tab opens a tab without a customer.
 */
export const OverflowMenu: Story = {
    name: "Overflow menu",
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
                actionBar={<Actions />}
            >
                <ProShopCatalog />
            </AppShell>
            <ProShopOverflowMenu />
        </Box>
    ),
};
