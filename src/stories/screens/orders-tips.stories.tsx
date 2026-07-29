import Box from "@mui/material/Box";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import PrintIcon from "@mui/icons-material/Print";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { DayTotalsStrip, dayTotalLabels, paymentColumns } from "@/components/screens/restaurant/orders-tips-totals";
import { AntlerEmptyState, ColumnHeaderBand, EdgeLabel } from "@/components/screens/restaurant/tables-shared-parts";

/**
 * **Orders & Tips** — end-of-shift reconciliation.
 *
 * The navy strip totals the day; the ledger below it lists every tippable
 * payment so a server can enter tips against them. POP pops the cash drawer,
 * TIP OUT distributes, and the two green buttons print the day and shift
 * reports. The date button in the middle of the bar is what changes the day.
 *
 * Replicated as-is from `references/072926/9-ordersTips/`.
 */
const meta = {
    title: "App Screens/9-ordersTips",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * A day with no tippable payments.
 *
 * The totals strip keeps its full height with every label in place and no
 * figures under them — the app prints no zeros, so an untraded day reads as a
 * row of headings over empty space.
 */
export const NoTippablePayments: Story = {
    render: () => (
        <AppShell
            title="Orders & Tips"
            active="orderstips"
            subBar={
                <Box sx={{ flexShrink: 0 }}>
                    <DayTotalsStrip totals={dayTotalLabels.map((label) => ({ label }))} />
                    {/* Seven columns pack left; the rest of the width stays empty. */}
                    <ColumnHeaderBand columns={paymentColumns} trailingSpace={2.2} />
                </Box>
            }
            actionBar={
                <>
                    <ActionButton>
                        <EdgeLabel icon={<ChevronLeftIcon sx={{ fontSize: 30 }} />}>Back</EdgeLabel>
                    </ActionButton>
                    <ActionButton tone="danger">
                        <EdgeLabel icon={<FileDownloadOutlinedIcon sx={{ fontSize: 26 }} />}>Pop</EdgeLabel>
                    </ActionButton>
                    <ActionButton>Tip Out</ActionButton>
                    <ActionButton>Wednesday, July 29 2026</ActionButton>
                    <ActionButton tone="primary">
                        <EdgeLabel icon={<PrintIcon sx={{ fontSize: 26 }} />}>Day Report</EdgeLabel>
                    </ActionButton>
                    <ActionButton tone="primary">
                        <EdgeLabel icon={<PrintIcon sx={{ fontSize: 26 }} />}>Shift Report</EdgeLabel>
                    </ActionButton>
                </>
            }
        >
            <AntlerEmptyState message="No tippable payments exist for this day." />
        </AppShell>
    ),
};
