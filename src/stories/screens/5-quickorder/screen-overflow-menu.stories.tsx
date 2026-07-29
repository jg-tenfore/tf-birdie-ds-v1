import Stack from "@mui/material/Stack";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { OrderPanel } from "@/components/app-chrome/order-panel";
import { AdditionalNotesField, ItemDetailHeader, PopoverMenu, QuickOrderLineRow } from "@/components/screens/restaurant/quick-order-parts";
import { pearlBeerImage, potatoSkinsImage } from "@/components/screens/restaurant/quick-order-story-parts";

/**
 * The app-bar overflow menu.
 *
 * Four order-scoped commands, one of which — "Quick Tab" — converts the whole
 * quick order into a tab. They sit in the same ⋮ menu as "Refresh Menu", a
 * housekeeping action, with nothing to separate a destructive item like
 * "Cancel Quick Order" from a harmless one.
 */
const meta = {
    title: "App Screens/5-quickorder/Screen overflow menu",
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
                    <QuickOrderLineRow line={{ name: "Pearl Beer", price: "$12.00", image: pearlBeerImage, qty: 1, selected: true }} />
                    <QuickOrderLineRow line={{ name: "Potato Skins", price: "$13.98", image: potatoSkinsImage, qty: 1 }} />
                </OrderPanel>
            }
            actionBar={<ActionButton>Back</ActionButton>}
        >
            <Stack spacing={2} sx={{ px: 1.5, pt: 2.5 }}>
                <ItemDetailHeader name="Pearl Beer" image={pearlBeerImage} total="$12.00" qty={1} />
                <AdditionalNotesField />
            </Stack>

            <PopoverMenu
                items={["Quick Tab", "Refresh Menu", "Remove All Discounts", "Cancel Quick Order"]}
                sx={{ top: 36, right: 32, width: 205 }}
            />
        </AppShell>
    ),
};
