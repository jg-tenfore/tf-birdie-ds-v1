import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";

import { appColors } from "@/theme/app-replica-tokens";

/**
 * The new-count form, reached from the "+" action on Inventory Counts.
 *
 * Two fields on a bare canvas. Note the asymmetry the app actually ships: the
 * "Product Category" label is left-aligned but its value is centred with the
 * caret pinned far right, while "Count Title" is a conventional left-aligned
 * underlined input. From `references/072926/16-inventory/`.
 */
export const InventoryNewCountForm = ({
    category = "Merchandise",
    title,
}: {
    category?: string;
    title?: string;
}) => (
    <Stack sx={{ minHeight: "100%", bgcolor: appColors.canvas, pt: 4.5 }}>
        <Typography sx={{ px: 4.5, fontSize: 16, color: appColors.textPrimary }}>Product Category</Typography>

        <Stack direction="row" sx={{ alignItems: "center", px: 4.5, py: 1 }}>
            <Typography sx={{ flex: 1, textAlign: "center", fontSize: 22, color: appColors.textPrimary }}>{category}</Typography>
            <ArrowDropDownIcon sx={{ color: appColors.textSecondary }} />
        </Stack>

        <Typography sx={{ px: 4.5, pt: 1.5, fontSize: 16, color: appColors.textPrimary }}>Count Title</Typography>

        <Box sx={{ mx: 4.5, mt: 1.5, pb: 1, borderBottom: "1px solid", borderColor: appColors.textSecondary }}>
            <Typography sx={{ pl: 1, fontSize: 19, color: title ? appColors.textPrimary : "#6B6B6B" }}>
                {title || "Enter Title for Count…"}
            </Typography>
        </Box>
    </Stack>
);

export default InventoryNewCountForm;
