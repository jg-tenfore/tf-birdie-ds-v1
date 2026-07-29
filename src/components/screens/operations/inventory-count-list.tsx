import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { appColors } from "@/theme/app-replica-tokens";

/**
 * The Inventory Counts list.
 *
 * Three cells per row — count title, product count, last-saved timestamp — on
 * the light canvas, from `references/072926/16-inventory/`. Counts are freeform
 * strings the operator typed, so the reference data is exactly as messy as it
 * looks; that is the point of documenting it.
 *
 * The columns are not thirds: the middle "N products" cell reads left of centre
 * and the timestamp is flush right, which the 1 / 1.15 / 1.4 ratio reproduces.
 */

export interface InventoryCountRow {
    title: string;
    productCount: number;
    savedAt: string;
}

export const InventoryCountListRow = ({ row }: { row: InventoryCountRow }) => (
    <Box
        sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1.15fr 1.4fr",
            alignItems: "center",
            height: 76,
            bgcolor: appColors.canvas,
            borderBottom: "1px solid",
            borderColor: appColors.divider,
        }}
    >
        <Typography sx={{ pl: 4.5, fontSize: 15, color: appColors.textPrimary }} noWrap>
            {row.title}
        </Typography>
        <Typography sx={{ fontSize: 15, textAlign: "center", color: appColors.textPrimary }} noWrap>
            {row.productCount} products
        </Typography>
        <Typography sx={{ pr: 4.5, fontSize: 15, textAlign: "right", color: appColors.textPrimary }} noWrap>
            {row.savedAt}
        </Typography>
    </Box>
);

export const InventoryCountList = ({ rows }: { rows: InventoryCountRow[] }) => (
    <Box>
        {rows.map((row, index) => (
            <InventoryCountListRow key={`${row.title}-${index}`} row={row} />
        ))}
    </Box>
);

/** Verbatim from the reference screenshot, newest first. */
export const inventoryCountRows: InventoryCountRow[] = [
    { title: "78987", productCount: 92, savedAt: "7/20/2026 11:35 AM" },
    { title: "test", productCount: 46, savedAt: "7/16/2026 7:32 PM" },
    { title: "Austin Test", productCount: 1, savedAt: "7/9/2026 1:56 PM" },
    { title: "Mid week", productCount: 81, savedAt: "6/16/2026 1:10 PM" },
    { title: "yeetus", productCount: 93, savedAt: "6/12/2026 4:51 PM" },
    { title: "dong", productCount: 81, savedAt: "6/11/2026 10:17 PM" },
    { title: "ding", productCount: 93, savedAt: "6/11/2026 10:16 PM" },
    { title: "ding", productCount: 93, savedAt: "6/11/2026 10:15 PM" },
];

/** The three product categories a count can be scoped to. */
export const inventoryCategories = ["Merchandise", "Food and Beverage", "Alcohol"] as const;

/**
 * The category picker, open.
 *
 * The app renders it as a full-bleed dark sheet floating over the list rather
 * than a popover anchored to the bar — it covers most of the screen width and
 * leaves the bar itself visible underneath.
 */
export const InventoryCategoryMenu = ({ selected = "Merchandise" }: { selected?: string }) => (
    <Box
        role="menu"
        sx={{
            position: "absolute",
            left: 8,
            right: 8,
            bottom: 80,
            bgcolor: appColors.slate,
            boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
            py: 2,
        }}
    >
        {inventoryCategories.map((label) => (
            <Typography
                key={label}
                role="menuitem"
                aria-current={label === selected || undefined}
                sx={{ height: 64, display: "grid", placeItems: "center", fontSize: 15, color: "#fff" }}
            >
                {label}
            </Typography>
        ))}
    </Box>
);

export default InventoryCountList;
