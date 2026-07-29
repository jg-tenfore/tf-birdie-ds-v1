import CategoryIcon from "@mui/icons-material/Category";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { OrderPanel, OrderPanelEmpty } from "@/components/app-chrome/order-panel";
import { Menu } from "@/components/screens/restaurant/quick-order-story-parts";

/**
 * The landing state: nothing rung up yet.
 *
 * The order panel is an antler watermark over "No items in order.", the menu
 * opens on the Dinner set, and both BACK and PAY are greyed. COMBOS is present
 * here — it is the only state in the reference set that shows PLAYER SEARCH and
 * COMBOS at the same time, which is why the bar carries five buttons.
 */
const meta = {
    title: "App Screens/5-quickorder/Empty order",
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
                    <OrderPanelEmpty />
                </OrderPanel>
            }
            actionBar={
                <>
                    <ActionButton tone="disabled">Back</ActionButton>
                    <ActionButton>Player Search</ActionButton>
                    <ActionButton icon={<CategoryIcon />}>Combos</ActionButton>
                    <ActionButton>Open Food</ActionButton>
                    <ActionButton tone="disabled">Pay</ActionButton>
                </>
            }
        >
            <Menu />
        </AppShell>
    ),
};
