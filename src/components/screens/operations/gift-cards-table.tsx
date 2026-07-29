import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { appColors } from "@/theme/app-replica-tokens";

/**
 * The Gift Cards results table.
 *
 * Eight equal columns under a solid mid-grey header band, from
 * `references/072926/14-giftcards/`. Cards with no remaining balance render in
 * a much lighter grey — the app dims the whole row rather than badging it, so
 * "spent out" is carried by contrast alone.
 */

export interface GiftCardRow {
    id: string;
    customerName: string;
    type: string;
    expirationDate: string;
    awarded: string;
    spent: string;
    balance: string;
    upc: string;
    /** Rendered in light grey — the app's treatment for a zero-balance card. */
    dimmed?: boolean;
}

const columns = ["ID:", "Customer Name", "Gift Card Type", "Expiration Date", "Awarded", "Spent", "Balance", "UPC"] as const;

const cellSx = { flex: 1, minWidth: 0, textAlign: "center" as const, px: 1 };

export const GiftCardTableHeader = () => (
    <Box sx={{ display: "flex", alignItems: "center", height: 45, bgcolor: "#A3A3A3", flexShrink: 0 }}>
        {columns.map((label) => (
            <Typography key={label} sx={{ ...cellSx, fontSize: 15, color: appColors.textPrimary }}>
                {label}
            </Typography>
        ))}
    </Box>
);

export const GiftCardTableRow = ({ row }: { row: GiftCardRow }) => {
    const color = row.dimmed ? "#C9CDD1" : appColors.textPrimary;

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                height: 54,
                bgcolor: appColors.surface,
                borderBottom: "1px solid",
                borderColor: appColors.divider,
            }}
        >
            {[row.id, row.customerName, row.type, row.expirationDate, row.awarded, row.spent, row.balance, row.upc].map((value, index) => (
                <Typography key={columns[index]} sx={{ ...cellSx, fontSize: 15, color }} noWrap>
                    {value}
                </Typography>
            ))}
        </Box>
    );
};

/**
 * Table body only — the header band lives in the app shell's sub-bar, because
 * it stays pinned while the results scroll. An empty `rows` array is the
 * pre-search state: a bare canvas with no "no results" message of any kind.
 */
export const GiftCardTableBody = ({ rows }: { rows: GiftCardRow[] }) => (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100%", bgcolor: appColors.canvas }}>
        {rows.map((row, index) => (
            <GiftCardTableRow key={`${row.id}-${index}`} row={row} />
        ))}
    </Box>
);

export default GiftCardTableBody;

/**
 * The result set a search for "weston" returns on the reference device.
 *
 * Verbatim, mismatched test data included — "weston" matches cards belonging to
 * Randy Orton and Tony Finau, which is what the device does. The two dimmed rows
 * are the zero-balance ones: one fully spent, one issued at $0.00. Winnings cards
 * carry no UPC.
 */
export const westonGiftCards: GiftCardRow[] = [
    {
        id: "261926",
        customerName: "Randy Orton",
        type: "Purchased",
        expirationDate: "5/26/2122",
        awarded: "$200.00",
        spent: "$184.00",
        balance: "$16.00",
        upc: "533752807261",
    },
    {
        id: "261924",
        customerName: "Tony Finau",
        type: "Purchased",
        expirationDate: "5/26/2122",
        awarded: "$800.00",
        spent: "$800.00",
        balance: "$0.00",
        upc: "430752807261",
        dimmed: true,
    },
    {
        id: "261923",
        customerName: "Tony Finau",
        type: "Purchased",
        expirationDate: "5/26/2122",
        awarded: "$0.00",
        spent: "$0.00",
        balance: "$0.00",
        upc: "420252807261",
        dimmed: true,
    },
    ...["250784", "250783", "250782", "250781", "250780"].map((id) => ({
        id,
        customerName: "Randy Orton",
        type: "Winnings",
        expirationDate: "2/23/2122",
        awarded: "$100.00",
        spent: "$0.00",
        balance: "$100.00",
        upc: "",
    })),
    {
        id: "63417",
        customerName: "Randy Orton",
        type: "Winnings",
        expirationDate: "1/28/2122",
        awarded: "$175.00",
        spent: "$0.00",
        balance: "$175.00",
        upc: "cb63417",
    },
];
