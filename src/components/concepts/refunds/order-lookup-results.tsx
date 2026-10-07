import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { assetUrl } from "@/utils/asset-url";
import type { LookupRow } from "./refund-data";

/**
 * Order Lookup Results — the list every refund starts from.
 *
 * Transcribed from `references/100626/`. Five text columns under a pinned
 * header, then two buttons per row: REPRINT fires immediately, DETAILS opens
 * the transaction. Rows are 56px and the buttons are 44 × 180, which is under
 * the 48dp floor the rest of this system holds to.
 *
 * The column that matters most is the one doing the least work. **Amount** is
 * where a refund declares itself, and it declares itself with a minus sign in
 * the same grey as everything else — no color, no label, no grouping with the
 * order it reverses.
 */

const columns = ["Order ID", "Date", "Customer Name", "Payment Type", "Amount"] as const;

/** Text columns share the row equally; the button pair is fixed-width on the right. */
const cellSx = { flex: 1, minWidth: 0, textAlign: "center" as const, px: 1, fontSize: 15 };

export const LookupResultsHeader = () => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            height: 45,
            flexShrink: 0,
            bgcolor: appColors.surface,
            borderBottom: "1px solid",
            borderColor: appColors.divider,
        }}
    >
        {columns.map((label) => (
            <Typography key={label} sx={{ ...cellSx, color: appColors.textSecondary }}>
                {label}
            </Typography>
        ))}
        {/* Reserves the width of the REPRINT + DETAILS pair, which has no heading. */}
        <Box sx={{ width: 384, flexShrink: 0 }} />
    </Box>
);

/** A small slate action button — the row pair, not the bottom bar. */
const RowButton = ({ children, icon, onClick }: { children: string; icon?: React.ReactNode; onClick?: () => void }) => (
    <Button
        onClick={onClick}
        disableElevation
        sx={{
            width: 180,
            minHeight: 44,
            position: "relative",
            borderRadius: `${appRadius.button}px`,
            bgcolor: appColors.slate,
            color: "#fff",
            fontSize: 14,
            letterSpacing: "0.06em",
            "&:hover": { bgcolor: appColors.slateDark },
        }}
    >
        {icon && (
            <Box aria-hidden sx={{ position: "absolute", left: 18, top: "50%", transform: "translateY(-50%)", display: "flex" }}>
                {icon}
            </Box>
        )}
        {children}
    </Button>
);

export const LookupResultsRow = ({ row, onDetails }: { row: LookupRow; onDetails?: () => void }) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            height: 56,
            flexShrink: 0,
            bgcolor: appColors.surface,
            borderBottom: "1px solid",
            borderColor: appColors.divider,
        }}
    >
        {[row.orderId, row.date, row.customerName, row.paymentType, row.amount].map((value, index) => (
            <Typography key={columns[index]} sx={{ ...cellSx, color: appColors.textPrimary }} noWrap>
                {value}
            </Typography>
        ))}
        <Box sx={{ display: "flex", gap: 1, width: 384, flexShrink: 0, pr: 1 }}>
            <RowButton>REPRINT</RowButton>
            <RowButton icon={<SearchIcon sx={{ fontSize: 22 }} />} onClick={onDetails}>
                DETAILS
            </RowButton>
        </Box>
    </Box>
);

/**
 * The results list.
 *
 * `banner` is the full-width band the app drops under the app bar after a
 * refund saves. It is the only confirmation the operator gets, it is not
 * dismissible, and it names no order — so the row it is telling you about has
 * to be found by eye in the list underneath.
 */
export const OrderLookupResults = ({
    rows,
    banner,
    onDetails,
}: {
    rows: LookupRow[];
    banner?: string;
    onDetails?: (row: LookupRow) => void;
}) => (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100%", bgcolor: appColors.surface }}>
        {banner && (
            <Box sx={{ flexShrink: 0, minHeight: 55, bgcolor: appColors.green, display: "grid", placeItems: "center" }}>
                <Typography sx={{ fontSize: 17, color: "#fff" }}>{banner}</Typography>
            </Box>
        )}
        <LookupResultsHeader />
        {rows.map((row) => (
            <LookupResultsRow key={row.orderId} row={row} onDetails={() => onDetails?.(row)} />
        ))}
    </Box>
);

/**
 * The loading state between SEARCH and results, and again after a refund saves.
 *
 * It is a full-screen takeover with the brand mark and a lowercase "loading…".
 * Worth keeping in the record: a refund costs the operator two of these, and the
 * second one lands after the money has already moved.
 */
export const LookupLoading = () => (
    <Box
        sx={{
            minHeight: "100%",
            bgcolor: appColors.surface,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            pb: 10,
        }}
    >
        <Box component="img" src={assetUrl("logos/tf-square-color.svg")} alt="" sx={{ width: 200, height: 200 }} />
        <Typography sx={{ fontSize: 17, color: appColors.textPrimary }}>loading…</Typography>
    </Box>
);

export default OrderLookupResults;
