import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { appColors } from "@/theme/app-replica-tokens";

/**
 * An open inventory count.
 *
 * Products are grouped under a dark navy section band and each one occupies two
 * lines: the product name, then a run of label/value pairs — SKU, Expected,
 * Actual. The pairs are *not* column-aligned; a longer SKU pushes everything
 * after it to the right, which is visible on the Chapstick row in
 * `references/072926/16-inventory/`.
 */

export interface InventoryCountLine {
    name: string;
    sku: string;
    expected: string;
    actual: string;
}

export const InventorySectionBand = ({ label }: { label: string }) => (
    <Box
        sx={{
            mx: 2.25,
            height: 25,
            display: "grid",
            placeItems: "center",
            bgcolor: appColors.navyDeep,
        }}
    >
        <Typography sx={{ fontSize: 15, color: "#fff" }}>{label}</Typography>
    </Box>
);

const Pair = ({ label, value }: { label: string; value: string }) => (
    <>
        <Typography component="span" sx={{ fontSize: 15, color: appColors.textPrimary }}>
            {label}
        </Typography>
        <Typography component="span" sx={{ fontSize: 15, color: appColors.textPrimary }}>
            {value}
        </Typography>
    </>
);

export const InventoryCountLineRow = ({ line }: { line: InventoryCountLine }) => (
    <Stack sx={{ px: 4, py: 1.25 }}>
        <Typography sx={{ fontSize: 22, color: appColors.textPrimary, lineHeight: 1.35 }}>{line.name}</Typography>
        <Stack direction="row" spacing={2.75} sx={{ alignItems: "baseline", flexWrap: "wrap" }} useFlexGap>
            <Pair label="SKU:" value={line.sku} />
            <Pair label="Expected:" value={line.expected} />
            <Pair label="Actual:" value={line.actual} />
        </Stack>
    </Stack>
);

export const InventoryCountDetail = ({ section, lines }: { section: string; lines: InventoryCountLine[] }) => (
    <Box sx={{ bgcolor: appColors.surface, minHeight: "100%", pt: 2 }}>
        <InventorySectionBand label={section} />
        <Box sx={{ pt: 1 }}>
            {lines.map((line) => (
                <InventoryCountLineRow key={line.sku} line={line} />
            ))}
        </Box>
    </Box>
);

/** The "Accessories" section of count 3484 - 78987, verbatim. */
export const accessoriesCountLines: InventoryCountLine[] = [
    { name: "Ball Marker", sku: "4439016566", expected: "0.0", actual: "15.0" },
    { name: "Chapstick", sku: "14431035462", expected: "0.0", actual: "65.0" },
    { name: "Club Brush", sku: "11439030582", expected: "0.0", actual: "30.0" },
    { name: "credit book test", sku: "4439014867", expected: "0.0", actual: "0.0" },
    { name: "Dress - JS", sku: "4439017354", expected: "0.0", actual: "20.0" },
    { name: "Nike Belly Ball Ball Marker", sku: "4439232168", expected: "0.0", actual: "20.0" },
    { name: "Tees - assorted size/color (50ct)", sku: "4439030579", expected: "0.0", actual: "20.0" },
    { name: "test", sku: "4439015843", expected: "0.0", actual: "0.0" },
    { name: "Women Sock2", sku: "4439021075", expected: "0.0", actual: "30.0" },
];

export default InventoryCountDetail;
