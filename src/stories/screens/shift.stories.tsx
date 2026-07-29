import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import CloseIcon from "@mui/icons-material/Close";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { ShiftCloseOutForm, ShiftHistoryTable, shiftHistoryRows } from "@/components/screens/operations/shift-summary";

/**
 * Shift — close out the till and review past shifts.
 *
 * Transcribed from `references/072926/17-shift/`. The left half is the
 * close-out form for the shift currently open on this device; the right half is
 * the full shift history for the account, with the open shift on top (its End
 * and End Cash cells read "----").
 *
 * Two things the screen shows as-is: the history table is wider than the space
 * beside the form, so "End Check" is clipped at the screen edge, and END SHIFT
 * is a red destructive action that is live even with the cash total left blank.
 */
const meta = {
    title: "App Screens/17-shift",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The screen as it opens on an active shift: Ending Cash Total untouched (so
 * its label still sits large on the baseline) and Ending Check Total prefilled
 * with 0.
 */
export const OpenShift: Story = {
    render: () => (
        <AppShell
            title="Shift"
            active="shift"
            topBarRight={<Box />}
            actionBar={
                <>
                    <ActionButton grow={1} icon={<ChevronLeftIcon />}>
                        Back
                    </ActionButton>
                    <ActionButton grow={1} tone="danger" icon={<CloseIcon />}>
                        End Shift
                    </ActionButton>
                </>
            }
        >
            <Stack direction="row" sx={{ minHeight: "100%", bgcolor: "#fff" }}>
                <ShiftCloseOutForm userName="Test Test Account" shiftDate="7/29/2026 8:51 AM" endingCheckTotal="0" />
                <ShiftHistoryTable rows={shiftHistoryRows} />
            </Stack>
        </AppShell>
    ),
};
