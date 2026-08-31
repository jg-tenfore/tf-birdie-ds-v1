import type { ReactNode } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { appColors, appLayout } from "@/theme/app-replica-tokens";
import { devices } from "@/theme/tokens";

/**
 * **Aug 31 → Components.** The frame every specimen in this folder sits in.
 *
 * **890px wide, and that number is not arbitrary.** The primary device is a 10"
 * landscape tablet at 1280, and the checkout ticket pane takes
 * `appLayout.orderPanelWidth` (390) off the left. What is left — 890 — is the
 * RAIN panel these components live in.
 *
 * Specimens shown at a comfortable 560 would let a row's columns breathe in a
 * way they never do on the device, and every spacing judgement made against
 * them would be wrong by 330px. So the frame is the real width, and the
 * screens in `1 — The RAIN tender` should look identical to the parts here.
 */
export const PANE_WIDTH = devices.tablet10.width - appLayout.orderPanelWidth;

export const PaneFrame = ({ children, note, height = 420 }: { children: ReactNode; note?: string; height?: number | string }) => (
    <Stack sx={{ width: PANE_WIDTH, gap: 1 }}>
        {note && (
            <Typography sx={{ fontSize: 13, color: appColors.textSecondary, fontFamily: "Roboto Mono, monospace" }}>{note}</Typography>
        )}
        <Box
            sx={{
                height,
                bgcolor: appColors.surface,
                border: `1px solid ${appColors.divider}`,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
            }}
        >
            {children}
        </Box>
    </Stack>
);
