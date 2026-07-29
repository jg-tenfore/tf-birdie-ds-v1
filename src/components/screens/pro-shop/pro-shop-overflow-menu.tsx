import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

import { appColors } from "@/theme/app-replica-tokens";

/**
 * The Pro Shop Order app-bar overflow menu.
 *
 * Three items, from `references/072926/1-proshop/`. The menu anchors under the
 * ⋮ and overlaps the app bar rather than dropping below it, which is why it is
 * positioned against the screen rather than rendered inside the bar.
 */

export const proShopOverflowItems = ["Refresh", "Add Cash Payout", "Quick Tab"];

export const ProShopOverflowMenu = ({ items = proShopOverflowItems }: { items?: string[] }) => (
    <Box
        role="menu"
        aria-label="More"
        sx={{
            position: "absolute",
            top: 8,
            right: 12,
            width: 194,
            bgcolor: appColors.surface,
            boxShadow: "0 4px 16px rgba(0,0,0,0.30)",
            zIndex: 20,
        }}
    >
        {items.map((item, index) => (
            <Box key={item} role="menuitem">
                {index > 0 && <Divider />}
                <Typography sx={{ fontSize: 15, color: appColors.textPrimary, px: 2.5, py: "16px" }}>{item}</Typography>
            </Box>
        ))}
    </Box>
);

export default ProShopOverflowMenu;
