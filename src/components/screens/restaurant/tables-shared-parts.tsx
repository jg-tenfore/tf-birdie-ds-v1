import type { ReactNode } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { appColors } from "@/theme/app-replica-tokens";
import { assetUrl } from "@/utils/asset-url";

/**
 * Small pieces shared by the four restaurant screens replicated here — Tables,
 * Table Chart, Reservations and Orders & Tips.
 *
 * The `tables-` prefix is a filename convention for this workspace, not a
 * statement about scope: every screen in `references/072926/7-tables`,
 * `8-reservations`, `9-ordersTips` and `10-tablechart` uses these.
 */

/**
 * A bottom-bar button label.
 *
 * The shipping app pins the button's icon to the left (or right) inset and
 * centers the label over the whole button, rather than letting MUI group icon
 * and label together. BACK, TABLES, POP, DAY REPORT and SAVE all do this.
 */
export const EdgeLabel = ({
    icon,
    side = "left",
    transform = "uppercase",
    children,
}: {
    icon?: ReactNode;
    side?: "left" | "right";
    /** `[Detached Tables]` and `banquet` render in their stored casing. */
    transform?: "uppercase" | "none";
    children: ReactNode;
}) => (
    <Box sx={{ position: "relative", width: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {icon && (
            <Box aria-hidden sx={{ position: "absolute", [side]: 0, display: "flex", alignItems: "center", lineHeight: 0 }}>
                {icon}
            </Box>
        )}
        <Box component="span" sx={{ textTransform: transform }}>
            {children}
        </Box>
    </Box>
);

/**
 * The app's empty state: the TenFore antler mark at full contrast — not the
 * faded watermark the order panel uses — over a single sentence, optionally
 * followed by one slate call-to-action button.
 */
export const AntlerEmptyState = ({ message, action }: { message: string; action?: ReactNode }) => (
    <Stack sx={{ flex: 1, height: "100%", alignItems: "center", justifyContent: "center", gap: 2, pb: 8, px: 4 }}>
        <Box component="img" src={assetUrl("logos/tf-square-black.svg")} alt="" sx={{ width: 216, height: 200 }} />
        <Typography sx={{ fontSize: 17, color: appColors.textPrimary }}>{message}</Typography>
        {action}
    </Stack>
);

/** The near-opaque scrim the app puts behind its modal dialogs. */
export const ScrimOverlay = ({ children, opacity = 0.72 }: { children: ReactNode; opacity?: number }) => (
    <Box
        sx={{
            position: "fixed",
            inset: 0,
            bgcolor: `rgba(0,0,0,${opacity})`,
            display: "grid",
            placeItems: "center",
            zIndex: 1300,
        }}
    >
        {children}
    </Box>
);

/**
 * A full-width column header band.
 *
 * Reservations spreads six labels across the whole width; Orders & Tips packs
 * seven into the left ~78% and leaves the remainder empty. `trailingSpace`
 * covers the difference.
 */
export const ColumnHeaderBand = ({ columns, trailingSpace = 0 }: { columns: string[]; trailingSpace?: number }) => (
    <Box
        sx={{
            flexShrink: 0,
            bgcolor: appColors.grey,
            display: "grid",
            gridTemplateColumns: `repeat(${columns.length}, 1fr)${trailingSpace ? ` ${trailingSpace}fr` : ""}`,
            minHeight: 41,
            alignItems: "center",
        }}
    >
        {columns.map((label) => (
            <Typography key={label} sx={{ fontSize: 17, color: appColors.textPrimary, textAlign: "center" }}>
                {label}
            </Typography>
        ))}
    </Box>
);

/** The dark date band under the app bar on Reservations and Create a Reservation. */
export const DateBand = ({ label }: { label: string }) => (
    <Box
        sx={{
            flexShrink: 0,
            m: 1,
            minHeight: 58,
            bgcolor: appColors.slate,
            display: "grid",
            placeItems: "center",
        }}
    >
        <Typography sx={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.08em", color: "#fff" }}>{label}</Typography>
    </Box>
);
