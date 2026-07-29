import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { appColors } from "@/theme/app-replica-tokens";

/**
 * The Shift screen: close-out form on the left, shift history on the right.
 *
 * From `references/072926/17-shift/`. The two sides do not share a scroll or a
 * grid — the left is a narrow centred form, the right is a wide table whose
 * last column ("End Check") is clipped by the screen edge, exactly as shipped.
 */

export interface ShiftHistoryRow {
    id: string;
    start: string;
    /** "----" when the shift is still open. */
    end: string;
    startCash: string;
    endCash: string;
    endCheck: string;
}

/** A read-only label/value pair in the left form. */
const FormReadout = ({ label, value }: { label: string; value: string }) => (
    <Stack sx={{ alignItems: "center", gap: 1.5 }}>
        <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>{label}</Typography>
        <Typography sx={{ fontSize: 21, color: appColors.textPrimary }}>{value}</Typography>
    </Stack>
);

/**
 * A Material *filled* input. Empty, the label sits large on the baseline; with
 * a value it shrinks to a caption above it. Both states are on this screen.
 */
const FilledField = ({ label, value }: { label: string; value?: string }) => (
    <Stack
        sx={{
            height: 50,
            bgcolor: "#E2E2E2",
            borderBottom: "1px solid",
            borderColor: "#9A9A9A",
            px: 1.75,
            justifyContent: "center",
        }}
    >
        {value ? (
            <>
                <Typography sx={{ fontSize: 13, color: appColors.textSecondary, lineHeight: 1.3 }}>{label}</Typography>
                <Typography sx={{ fontSize: 18, color: appColors.textPrimary, lineHeight: 1.3 }}>{value}</Typography>
            </>
        ) : (
            <Typography sx={{ fontSize: 20, color: "#5C5C5C" }}>{label}</Typography>
        )}
    </Stack>
);

export const ShiftCloseOutForm = ({
    userName,
    shiftDate,
    endingCashTotal,
    endingCheckTotal,
}: {
    userName: string;
    shiftDate: string;
    endingCashTotal?: string;
    endingCheckTotal?: string;
}) => (
    <Stack sx={{ width: 582, flexShrink: 0, bgcolor: appColors.surface, pt: 7, gap: 5 }}>
        <FormReadout label="User Name" value={userName} />
        <FormReadout label="Shift Date" value={shiftDate} />

        <Stack sx={{ px: 4.5, gap: 1.25 }}>
            <FilledField label="Ending Cash Total" value={endingCashTotal} />
            <FilledField label="Ending Check Total" value={endingCheckTotal} />
        </Stack>
    </Stack>
);

/**
 * Fixed column widths, summing wider than the space left beside the form — that
 * overflow is what clips "End Check" to "End Checl" on the device.
 */
const shiftColumns = [
    { key: "id", label: "ID:", width: 110 },
    { key: "start", label: "Start", width: 170 },
    { key: "end", label: "End", width: 145 },
    { key: "startCash", label: "Start Cash", width: 120 },
    { key: "endCash", label: "End Cash", width: 105 },
    { key: "endCheck", label: "End Check", width: 105 },
] as const;

export const ShiftHistoryTable = ({ rows }: { rows: ShiftHistoryRow[] }) => (
    <Box sx={{ flex: 1, minWidth: 0, bgcolor: appColors.surface, overflow: "hidden", pt: 3.5 }}>
        <Box sx={{ display: "flex", height: 40, alignItems: "center" }}>
            {shiftColumns.map((column) => (
                <Typography
                    key={column.key}
                    sx={{ width: column.width, flexShrink: 0, textAlign: "center", fontSize: 15, color: appColors.textPrimary }}
                    noWrap
                >
                    {column.label}
                </Typography>
            ))}
        </Box>

        {rows.map((row) => (
            <Box key={row.id} sx={{ display: "flex", height: 86, alignItems: "center" }}>
                {shiftColumns.map((column) => (
                    <Typography
                        key={column.key}
                        sx={{ width: column.width, flexShrink: 0, textAlign: "center", fontSize: 15, color: appColors.textPrimary }}
                        noWrap
                    >
                        {row[column.key]}
                    </Typography>
                ))}
            </Box>
        ))}
    </Box>
);

/** Verbatim from the reference screenshot. The top row is the open shift. */
export const shiftHistoryRows: ShiftHistoryRow[] = [
    { id: "43766", start: "7/29/2026 8:51 AM", end: "----", startCash: "$100.00", endCash: "----", endCheck: "" },
    { id: "19299", start: "6/7/2025 7:21 AM", end: "7/22/2026 2:00 AM", startCash: "$0.00", endCash: "$0.00", endCheck: "" },
    { id: "16773", start: "4/29/2025 10:01 AM", end: "7/22/2026 2:00 AM", startCash: "$400.00", endCash: "$0.00", endCheck: "" },
    { id: "15692", start: "4/10/2025 8:28 AM", end: "7/22/2026 2:00 AM", startCash: "$400.00", endCash: "$0.00", endCheck: "" },
    { id: "15657", start: "4/9/2025 11:34 AM", end: "7/22/2026 2:00 AM", startCash: "$400.00", endCash: "$0.00", endCheck: "" },
    { id: "13587", start: "2/7/2025 3:36 PM", end: "7/22/2026 2:00 AM", startCash: "$10000.00", endCash: "$0.00", endCheck: "" },
];

export default ShiftCloseOutForm;
