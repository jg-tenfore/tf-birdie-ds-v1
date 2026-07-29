import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { appColors } from "@/theme/app-replica-tokens";

/**
 * The totals strip at the top of Orders & Tips.
 *
 * Seven day-level figures on a navy band, spread evenly across the full width.
 * The label sits at the top of the band and the figure underneath it, so the
 * strip keeps its height even before any payments have been taken — which is
 * what the reference capture shows.
 */

export interface DayTotal {
    label: string;
    /** Blank until the day has activity — the app renders no placeholder. */
    value?: string;
}

export const DayTotalsStrip = ({ totals }: { totals: DayTotal[] }) => (
    <Box
        sx={{
            flexShrink: 0,
            bgcolor: appColors.navy,
            minHeight: 89,
            display: "grid",
            gridTemplateColumns: `repeat(${totals.length}, 1fr)`,
            alignContent: "start",
            pt: 2,
        }}
    >
        {totals.map((total) => (
            <Stack key={total.label} spacing={1} sx={{ alignItems: "center" }}>
                <Typography sx={{ fontSize: 13, color: "#fff" }}>{total.label}</Typography>
                {total.value && <Typography sx={{ fontSize: 17, color: "#fff", fontWeight: 500 }}>{total.value}</Typography>}
            </Stack>
        ))}
    </Box>
);

/** The seven figures, in the order the app prints them. */
export const dayTotalLabels = [
    "Total Sales",
    "Total Payments",
    "Cash Turn In",
    "Total Credit",
    "Total Comps",
    "Total Discounts",
    "Total Tips",
];

/** Columns of the tippable-payment ledger below the strip. */
export const paymentColumns = ["Payment ID", "Order ID", "Time", "Customer", "Payment", "Amount", "Tip"];
