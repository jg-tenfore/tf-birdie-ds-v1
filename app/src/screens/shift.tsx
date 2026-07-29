import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { appColors } from "@/theme/app-replica-tokens";
import { Shell } from "../pos-shell";
import { money, useActions, useStore } from "../store";

/**
 * Shift, from `references/072926/17-shift/`.
 *
 * Two halves that barely talk to each other. On the left is the shift being
 * closed: who is on it, when it opened, and the two counts the operator has to
 * key before END SHIFT means anything. On the right is the shift history table.
 *
 * Two things about it are faithful rather than accidental:
 *
 *   - The app bar has no account text, no LOG OUT and no hamburger — just the
 *     word "Shift". You get out with BACK.
 *   - The history table is wider than the pane and the last column is cut off
 *     mid-word ("End Checl"), with nothing to scroll it. That is what the device
 *     does. It is reproduced rather than fixed, because a "helpfully" scrollable
 *     table would hide a real problem: on this screen you cannot read the check
 *     total you are being asked to reconcile against.
 */

/** A filled MD2-style field. The label sits inside when there is no value. */
const CountField = ({ label, value }: { label: string; value?: string }) => (
    <Box
        sx={{
            bgcolor: appColors.fieldFill,
            borderBottom: `1px solid ${appColors.textSecondary}`,
            px: 2,
            pt: value ? 1 : 0,
            pb: value ? 0.75 : 0,
            minHeight: 72,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
        }}
    >
        <Typography sx={{ fontSize: value ? 13 : 20, color: value ? appColors.textSecondary : appColors.textPrimary }}>{label}</Typography>
        {value && <Typography sx={{ fontSize: 20 }}>{value}</Typography>}
    </Box>
);

interface ShiftRow {
    id: string;
    start: string;
    end: string;
    startCash: string;
    endCash: string;
    endCheck: string;
}

/** Column widths are fixed so the last one runs past the pane, as it does. */
const COLUMNS: { key: keyof ShiftRow; label: string; width: number }[] = [
    { key: "id", label: "ID:", width: 95 },
    { key: "start", label: "Start", width: 152 },
    { key: "end", label: "End", width: 154 },
    { key: "startCash", label: "Start Cash", width: 98 },
    { key: "endCash", label: "End Cash", width: 98 },
    // Runs ~28px past the right edge, so the header reads "End Chec".
    { key: "endCheck", label: "End Check", width: 148 },
];

/** Closed shifts on the reference device, newest first, verbatim. */
const HISTORY: ShiftRow[] = [
    { id: "19299", start: "6/7/2025 7:21 AM", end: "7/22/2026 2:00 AM", startCash: "$0.00", endCash: "$0.00", endCheck: "$0.00" },
    { id: "16773", start: "4/29/2025 10:01 AM", end: "7/22/2026 2:00 AM", startCash: "$400.00", endCash: "$0.00", endCheck: "$0.00" },
    { id: "15692", start: "4/10/2025 8:28 AM", end: "7/22/2026 2:00 AM", startCash: "$400.00", endCash: "$0.00", endCheck: "$0.00" },
    { id: "15657", start: "4/9/2025 11:34 AM", end: "7/22/2026 2:00 AM", startCash: "$400.00", endCash: "$0.00", endCheck: "$0.00" },
    { id: "13587", start: "2/7/2025 3:36 PM", end: "7/22/2026 2:00 AM", startCash: "$10000.00", endCash: "$0.00", endCheck: "$0.00" },
];

const OPEN_SHIFT_ID = "43766";
const SHIFT_STARTED = "7/29/2026 8:51 AM";

export const ShiftScreen = () => {
    const { state, paidTickets } = useStore();
    const { endShift } = useActions();
    const navigate = useNavigate();

    const takings = paidTickets.reduce((s, t) => s + t.lines.reduce((n, l) => n + l.qty * l.unitPrice, 0) * 1.06, 0);

    // The open shift is the first row and has no end values yet — the app prints
    // four dashes rather than leaving the cell blank.
    const openRow: ShiftRow = {
        id: OPEN_SHIFT_ID,
        start: SHIFT_STARTED,
        end: state.shiftOpen ? "----" : "7/29/2026 5:00 PM",
        startCash: money(100),
        endCash: state.shiftOpen ? "----" : money(100 + takings),
        endCheck: state.shiftOpen ? "----" : money(0),
    };

    const rows = [openRow, ...HISTORY];

    return (
        <Shell
            title="Shift"
            active="shift"
            topBarRight={null}
            actionBar={
                <>
                    <ActionButton icon={<ArrowBackIosNewIcon />} onClick={() => navigate(-1)}>
                        Back
                    </ActionButton>
                    <ActionButton
                        icon={<CloseIcon />}
                        tone={state.shiftOpen ? "destructive" : "disabled"}
                        onClick={() => state.shiftOpen && endShift()}
                    >
                        {state.shiftOpen ? "End shift" : "Shift ended"}
                    </ActionButton>
                </>
            }
        >
            <Stack direction="row" sx={{ height: "100%", minHeight: 0, bgcolor: "#fff" }}>
                {/* Closing pane. Everything is centred in the column, not left-aligned. */}
                <Stack sx={{ width: "44%", flexShrink: 0, px: 5, pt: 7 }}>
                    <Typography sx={{ fontSize: 16, color: appColors.textSecondary, textAlign: "center" }}>User Name</Typography>
                    <Typography sx={{ fontSize: 22, textAlign: "center", mt: 1.5 }}>{state.operator?.name ?? "Test Test Account"}</Typography>

                    <Typography sx={{ fontSize: 16, color: appColors.textSecondary, textAlign: "center", mt: 5 }}>Shift Date</Typography>
                    <Typography sx={{ fontSize: 22, textAlign: "center", mt: 1.5 }}>{SHIFT_STARTED}</Typography>

                    <Stack sx={{ gap: 1.5, mt: 6 }}>
                        <CountField label="Ending Cash Total" />
                        <CountField label="Ending Check Total" value="0" />
                    </Stack>
                </Stack>

                {/*
                 * History pane. `overflow: hidden` rather than `auto` — the table
                 * is deliberately allowed to run off the edge, as it does on the
                 * device. See the note at the top of the file.
                 */}
                <Box sx={{ flex: 1, minWidth: 0, overflow: "hidden", pt: 3 }}>
                    <Box sx={{ width: COLUMNS.reduce((n, c) => n + c.width, 0) }}>
                        <Stack direction="row">
                            {COLUMNS.map((c) => (
                                <Typography key={c.key} sx={{ width: c.width, flexShrink: 0, fontSize: 17, textAlign: "right", pr: 2 }}>
                                    {c.label}
                                </Typography>
                            ))}
                        </Stack>

                        {/* No row dividers — the rows are separated by air alone. */}
                        {rows.map((row) => (
                            <Stack key={row.id} direction="row" sx={{ mt: 7 }}>
                                {COLUMNS.map((c) => (
                                    <Typography key={c.key} sx={{ width: c.width, flexShrink: 0, fontSize: 17, textAlign: "right", pr: 2 }}>
                                        {row[c.key]}
                                    </Typography>
                                ))}
                            </Stack>
                        ))}
                    </Box>
                </Box>
            </Stack>
        </Shell>
    );
};
