import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import BoltIcon from "@mui/icons-material/Bolt";
import CategoryIcon from "@mui/icons-material/Category";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { OrderLineRow, OrderPanel, SeatBand, type OrderLineItem } from "@/components/app-chrome/order-panel";
import { MergeTablesDialog, RestaurantTablesFloor, type FloorTable } from "@/components/screens/restaurant/tables-floor";
import { foodTile } from "@/components/screens/restaurant/tables-food-image";
import { TablesProductBrowser } from "@/components/screens/restaurant/tables-product-browser";
import { EdgeLabel, ScrimOverlay } from "@/components/screens/restaurant/tables-shared-parts";
import { appColors } from "@/theme/app-replica-tokens";

/**
 * **Tables** — table service.
 *
 * Two screens share the nav item. The floor lists every open table in the
 * selected room; opening one lands on the order, where the left panel is
 * divided into seats so a check can be split by cover. The app bar carries the
 * whole identity of the order as a breadcrumb: table, order ID, customer.
 *
 * Replicated as-is from `references/072926/7-tables/`.
 */
const meta = {
    title: "App Screens/7-tables",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const burger: OrderLineItem = {
    id: "burger-1",
    name: "Open Burger",
    qty: 1,
    price: "$4.66",
    meta: ["25", "25"],
    image: foodTile("Hamburgers"),
};

const splitBurger: OrderLineItem = {
    ...burger,
    id: "burger-2",
    hasTimer: true,
    note: "Split between seats 1, and 3….",
};

/**
 * A seated order.
 *
 * Seat bands are solid colour bars assigned by seat index, and every line under
 * a band belongs to that cover. Seat 2 has ordered nothing yet, so its band
 * stands alone. The second Open Burger is shared: it carries the timer glyph
 * and a note naming the seats it is split across.
 */
export const SeatedOrder: Story = {
    render: () => (
        <AppShell
            title="Table Detached 27699 | Order ID 4252110 | Kyler Brooksby"
            active="tables"
            orderPanel={
                <OrderPanel>
                    <SeatBand label="Seat 1" color={appColors.seat[0]} collapsible />
                    <OrderLineRow line={burger} />
                    <Divider />
                    <SeatBand label="Seat 2" color={appColors.seat[1]} />
                    <Divider />
                    <SeatBand label="Seat 3" color={appColors.seat[2]} />
                    <OrderLineRow line={splitBurger} />
                </OrderPanel>
            }
            actionBar={
                <>
                    <ActionButton>Done</ActionButton>
                    <ActionButton>
                        <EdgeLabel icon={<CategoryIcon sx={{ fontSize: 22 }} />}>Combos</EdgeLabel>
                    </ActionButton>
                    <ActionButton>Open Food</ActionButton>
                    <ActionButton tone="primary">Save</ActionButton>
                    <ActionButton tone="primary">Pay</ActionButton>
                </>
            }
        >
            <TablesProductBrowser
                chips={[{ label: "All" }, { label: "Dinner", active: true }, { label: "19th Hole Menu" }]}
                tiles={["Beer", "Appetizers", "Sandwiches", "Hamburgers"]}
            />
        </AppShell>
    ),
};

const detachedTables: FloorTable[] = [{ name: "Detached 27699", customer: "Kyler Brooksby", total: "$11.94", x: 0, y: 0 }];

const FloorActionBar = () => (
    <>
        <ActionButton tone="disabled">Back</ActionButton>
        <ActionButton>
            <EdgeLabel transform="none">[Detached Tables]</EdgeLabel>
        </ActionButton>
        <ActionButton>
            <EdgeLabel icon={<CreditCardIcon sx={{ fontSize: 24 }} />}>Tabs</EdgeLabel>
        </ActionButton>
        <ActionButton>
            <EdgeLabel icon={<BoltIcon sx={{ fontSize: 24 }} />}>Quick Order</EdgeLabel>
        </ActionButton>
    </>
);

/**
 * The floor for the current room.
 *
 * Tables render at their chart coordinates. `[Detached Tables]` is the fallback
 * room for tables with no chart position, so its cards pile into the top-left
 * corner. The room name is the middle bottom-bar button, and BACK is dead
 * because this screen is the entry point.
 */
export const RestaurantTables: Story = {
    render: () => (
        <AppShell title="Restaurant Tables" active="tables" actionBar={<FloorActionBar />}>
            <RestaurantTablesFloor tables={detachedTables} />
        </AppShell>
    ),
};

/**
 * Merging two tables.
 *
 * Dropping one table's card on another raises this dialog. The tokens are drawn
 * where they were dropped — touching, still clipping their own labels — and
 * SAVE combines the two orders onto one check.
 */
export const MergeTables: Story = {
    render: () => (
        <Box>
            <AppShell title="Restaurant Tables" active="tables" actionBar={<FloorActionBar />}>
                <RestaurantTablesFloor tables={detachedTables} />
            </AppShell>
            <ScrimOverlay>
                <MergeTablesDialog tables={["Detached 58829", "Detached 27699"]} />
            </ScrimOverlay>
        </Box>
    ),
};
