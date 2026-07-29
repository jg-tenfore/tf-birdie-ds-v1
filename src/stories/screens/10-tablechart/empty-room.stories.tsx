import Button from "@mui/material/Button";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "@/components/app-chrome/app-shell";
import { ChartActionBar, newTableAction } from "@/components/screens/restaurant/table-chart-chrome";
import { AntlerEmptyState } from "@/components/screens/restaurant/tables-shared-parts";
import { appColors, appRadius } from "@/theme/app-replica-tokens";

/**
 * A room with nothing in it yet.
 *
 * SET UP TABLES is the same action as NEW TABLE, surfaced where the eye
 * already is. SAVE stays disabled until the layout changes.
 */
const meta = {
    title: "App Screens/10-tablechart/Empty room",
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
            actionBar={<ChartActionBar room="banquet" saveTone="disabled" />}
        >
            <AntlerEmptyState
                message="No active tables."
                action={
                    <Button sx={{ bgcolor: appColors.slate, borderRadius: `${appRadius.button}px`, px: 3, minHeight: 44 }}>
                        Set Up Tables
                    </Button>
                }
            />
        </AppShell>
    ),
};
