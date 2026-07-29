import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "@/components/app-chrome/app-shell";
import { TableChartCanvas } from "@/components/screens/restaurant/table-chart-canvas";
import { ChartActionBar, detachedTokens, newTableAction } from "@/components/screens/restaurant/table-chart-chrome";

/**
 * The `[Detached Tables]` room.
 *
 * Tokens are fixed-size dark squares with a single centered label. The label is
 * never shortened or wrapped — "Detached 27699" simply loses both ends to the
 * token's edges, which is why chart tables are normally numbered.
 */
const meta = {
    title: "App Screens/10-tablechart/Detached tables",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <AppShell
            title="Table Chart"
            active="tablechart"
            topBarRight={newTableAction}
            actionBar={<ChartActionBar room="[Detached Tables]" />}
        >
            <TableChartCanvas tables={detachedTokens} />
        </AppShell>
    ),
};
