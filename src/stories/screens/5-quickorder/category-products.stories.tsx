import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { OrderPanel } from "@/components/app-chrome/order-panel";
import { CategoryHeaderCard, MenuCanvas, MenuProductList, QuickOrderLineRow } from "@/components/screens/restaurant/quick-order-parts";
import { pearlBeerImage } from "@/components/screens/restaurant/quick-order-story-parts";

/**
 * Drilled into a category.
 *
 * Tapping a menu tile replaces the whole browsing surface — search field, menu
 * chips, and grid all disappear — with a narrow single column: the category
 * name over its products. There is no visible way back other than the BACK
 * button, which has now turned from grey to active.
 */
const meta = {
    title: "App Screens/5-quickorder/Category products",
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
                    <QuickOrderLineRow line={{ name: "Pearl Beer", price: "$12.00", image: pearlBeerImage, qty: 1 }} />
                </OrderPanel>
            }
            actionBar={
                <>
                    <ActionButton>Back</ActionButton>
                    <ActionButton>Player Search</ActionButton>
                    <ActionButton>Open Food</ActionButton>
                    <ActionButton tone="primary">Pay</ActionButton>
                </>
            }
        >
            <MenuCanvas>
                <CategoryHeaderCard label="Drafts" />
                <MenuProductList products={[{ name: "Pearl Beer", price: "$12.00", image: pearlBeerImage }]} />
            </MenuCanvas>
        </AppShell>
    ),
};
