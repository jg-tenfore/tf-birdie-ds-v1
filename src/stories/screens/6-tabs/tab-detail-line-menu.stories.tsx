import CategoryIcon from "@mui/icons-material/Category";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { MenuBrowser, PopoverMenu } from "@/components/screens/restaurant/quick-order-parts";
import { SeatPanel, dinnerTiles, editorTitle } from "@/components/screens/restaurant/tabs-story-parts";

/**
 * The per-line menu inside a tab.
 *
 * Six commands, where Quick Order's equivalent menu offers three. Fire, Move,
 * and Split are the seat-and-kitchen operations that only exist once an order
 * belongs to a table. The menu spills over the menu grid and covers the first
 * category tile, and has no scrim.
 */
const meta = {
    title: "App Screens/6-tabs/Tab detail — line menu",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <AppShell
            title={editorTitle}
            active="tabs"
            orderPanel={<SeatPanel />}
            actionBar={
                <>
                    <ActionButton>Done</ActionButton>
                    <ActionButton icon={<CategoryIcon />}>Combos</ActionButton>
                    <ActionButton>Open Food</ActionButton>
                    <ActionButton tone="primary">Save Changes</ActionButton>
                    <ActionButton tone="primary">Pay</ActionButton>
                </>
            }
        >
            <MenuBrowser categories={["All", "Dinner", "19th Hole Menu"]} active="Dinner" tiles={dinnerTiles} />
            <PopoverMenu items={["Fire", "Move", "Split", "Edit", "Discount", "Delete"]} sx={{ top: 208, left: 326, width: 196 }} />
        </AppShell>
    ),
};
