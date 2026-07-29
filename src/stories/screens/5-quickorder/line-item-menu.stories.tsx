import CategoryIcon from "@mui/icons-material/Category";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { OrderPanel } from "@/components/app-chrome/order-panel";
import { PopoverMenu, QuickOrderLineRow } from "@/components/screens/restaurant/quick-order-parts";
import { Menu, pearlBeerImage } from "@/components/screens/restaurant/quick-order-story-parts";

/**
 * Long-pressing an order line.
 *
 * Edit / Discount / Delete, anchored to the line. The menu is a plain popup
 * with no scrim behind it and no header naming the line it acts on, so once it
 * is open there is nothing on screen tying "Delete" to Pearl Beer specifically.
 */
const meta = {
    title: "App Screens/5-quickorder/Line item menu",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <AppShell
            title="Quick Order"
            active="quickorder"
            orderPanel={
                <OrderPanel>
                    <QuickOrderLineRow line={{ name: "Pearl Beer", price: "$60.00", image: pearlBeerImage, qty: 5 }} />
                </OrderPanel>
            }
            actionBar={
                <>
                    <ActionButton tone="disabled">Back</ActionButton>
                    <ActionButton icon={<CategoryIcon />}>Combos</ActionButton>
                    <ActionButton>Open Food</ActionButton>
                    <ActionButton tone="primary">Pay</ActionButton>
                </>
            }
        >
            <Menu />
            <PopoverMenu items={["Edit", "Discount", "Delete"]} sx={{ top: 137, left: 305, width: 112 }} />
        </AppShell>
    ),
};
