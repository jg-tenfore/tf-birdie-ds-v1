import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "@/components/app-chrome/app-shell";
import { ChartActionBar, newTableAction } from "@/components/screens/restaurant/table-chart-chrome";
import { TableChartRoom } from "@/components/screens/restaurant/table-chart-room";

/**
 * **Table Chart, laid out.** The same editor, over a real room.
 *
 * `Detached tables` stays the replica of what the shipping app draws — two flat
 * square tokens in an otherwise empty canvas. This shows the editor doing its
 * job: `bigroom` with its bar and stools, four-tops by the front, rounds in the
 * middle, the group tables at the back and the window side behind its half wall,
 * every table in the editor's idle fill with Table 15 selected.
 *
 * The side panel carries the room's totals, the selected table's shape, seats,
 * size and position, and the full table list. The phone's floor plan reads the
 * same `bigroom` seed, so the two screens show one room.
 */
const meta = {
    title: "App Screens/10-tablechart/Laid out",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <AppShell title="Table Chart" active="tablechart" topBarRight={newTableAction} actionBar={<ChartActionBar room="Main Dining" />}>
            <TableChartRoom room="bigroom" label="Main Dining" selectedId="t15" />
        </AppShell>
    ),
};
