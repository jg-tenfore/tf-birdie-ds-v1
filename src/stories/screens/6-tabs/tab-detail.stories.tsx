import CategoryIcon from "@mui/icons-material/Category";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { MenuBrowser } from "@/components/screens/restaurant/quick-order-parts";
import { SeatPanel, dinnerTiles, editorTitle } from "@/components/screens/restaurant/tabs-story-parts";

/**
 * A tab opened into the order editor.
 *
 * The screen title becomes a pipe-delimited breadcrumb — table, order id,
 * customer — and the canvas is the same menu browser Quick Order uses. The bar
 * now carries two green buttons at once: SAVE CHANGES and PAY are equally
 * weighted, though only one of them ends the transaction.
 */
const meta = {
    title: "App Screens/6-tabs/Tab detail",
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
        </AppShell>
    ),
};
