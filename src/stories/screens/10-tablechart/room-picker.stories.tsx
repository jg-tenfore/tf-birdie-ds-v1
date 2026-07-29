import Box from "@mui/material/Box";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "@/components/app-chrome/app-shell";
import { RoomPickerSheet, chartRooms } from "@/components/screens/restaurant/table-chart-canvas";
import { ChartActionBar, newTableAction } from "@/components/screens/restaurant/table-chart-chrome";
import { AntlerEmptyState } from "@/components/screens/restaurant/tables-shared-parts";

/**
 * Choosing a room.
 *
 * The middle button raises the full room list straight over the canvas, with no
 * scrim. SAVE greys out while the picker is open. These eleven rooms are the
 * ones configured on the reference device.
 */
const meta = {
    title: "App Screens/10-tablechart/Room picker",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <Box sx={{ position: "relative" }}>
            <AppShell
                title="Table Chart"
                active="tablechart"
                topBarRight={newTableAction}
                actionBar={<ChartActionBar room="[Detached Tables]" saveTone="disabled" />}
            >
                <AntlerEmptyState message="No active tables." />
            </AppShell>
            <RoomPickerSheet rooms={chartRooms} />
        </Box>
    ),
};
