import Box from "@mui/material/Box";
import type { SvgIconComponent } from "@mui/icons-material";

import { radius } from "@/theme/tokens";

/**
 * The medallion that anchors a confirmation or waiting state.
 *
 * It is deliberately large (96px) — these screens have one message and no
 * competing content, so the icon is doing the fast read from across a counter
 * while the text handles the detail.
 */
export const FeatureMark = ({
    icon: Icon,
    color = "primary",
}: {
    icon: SvgIconComponent;
    color?: "primary" | "success" | "warning" | "error" | "info";
}) => (
    <Box
        sx={{
            width: 96,
            height: 96,
            borderRadius: `${radius.xl}px`,
            display: "grid",
            placeItems: "center",
            bgcolor: `${color}.light`,
            color: `${color}.dark`,
        }}
    >
        <Icon sx={{ fontSize: 48 }} />
    </Box>
);
