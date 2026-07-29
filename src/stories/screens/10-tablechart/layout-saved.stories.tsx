import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "@/components/app-chrome/app-shell";
import { SaveConfirmationBanner, TableChartCanvas } from "@/components/screens/restaurant/table-chart-canvas";
import { ChartActionBar, newTableAction } from "@/components/screens/restaurant/table-chart-chrome";

/**
 * After SAVE.
 *
 * A green confirmation band pushes the canvas down and stays until the next
 * navigation. Table 10 sits where it was dropped, and SAVE is live again.
 */
const meta = {
    title: "App Screens/10-tablechart/Layout saved",
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
            subBar={<SaveConfirmationBanner message="Table layout saved successfully!" />}
            actionBar={<ChartActionBar room="banquet" />}
        >
            <TableChartCanvas tables={[{ label: "10", x: 803, y: 372 }]} />
        </AppShell>
    ),
};
