import Box from "@mui/material/Box";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "@/components/app-chrome/app-shell";
import { CreateTableDialog } from "@/components/screens/restaurant/table-chart-canvas";
import { ChartActionBar, newTableAction } from "@/components/screens/restaurant/table-chart-chrome";
import { AntlerEmptyState, ScrimOverlay } from "@/components/screens/restaurant/tables-shared-parts";

/**
 * NEW TABLE.
 *
 * Two free-text fields — the table's number and its cover count — over a slate
 * SAVE. The new token lands on the canvas unsaved; the bottom-bar SAVE is what
 * commits the layout.
 */
const meta = {
    title: "App Screens/10-tablechart/Create table",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <Box>
            <AppShell
                title="Table Chart"
                active="tablechart"
                topBarRight={newTableAction}
                actionBar={<ChartActionBar room="banquet" saveTone="disabled" />}
            >
                <AntlerEmptyState message="No active tables." />
            </AppShell>
            <ScrimOverlay opacity={0.8}>
                <CreateTableDialog />
            </ScrimOverlay>
        </Box>
    ),
};
