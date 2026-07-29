import type { ReactNode } from "react";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import { appColors } from "@/theme/app-replica-tokens";
import { assetUrl } from "@/utils/asset-url";

/**
 * The left-hand order panel used by the selling screens (Pro Shop, Quick Order,
 * Tabs, Tables).
 *
 * Empty state is a large, low-contrast antler watermark over "No items in
 * order." — reproduced from `references/072926/1-proshop/`.
 */

export interface OrderLineItem {
    id: string;
    name: string;
    qty: number;
    price: string;
    /** Small grey/orange numbers under the name — SKU and inventory count. */
    meta?: [string, string];
    /** Product thumbnail path under /store-images. */
    image?: string;
    note?: string;
    /** Renders the small timer glyph, as on split items. */
    hasTimer?: boolean;
}

export const OrderPanelEmpty = ({ message = "No items in order." }: { message?: string }) => (
    <Stack sx={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 3, px: 4 }}>
        {/*
         * Sized from the screenshots via REFERENCE_PX_TO_CSS (0.645). The mark
         * measures ~275px in a 2000px-wide capture → ~177 CSS px; 150 sits at
         * the smaller end of the range, since Pro Shop renders it tighter than
         * Quick Order does.
         */}
        <Box component="img" src={assetUrl("logos/tf-square-black.svg")} alt="" sx={{ width: 150, height: 140, opacity: 0.18 }} />
        <Typography sx={{ fontSize: 17, color: appColors.textSecondary }}>{message}</Typography>
    </Stack>
);

/** A seat divider inside the Tables order panel — a solid color band. */
export const SeatBand = ({ label, color, collapsible }: { label: string; color: string; collapsible?: boolean }) => (
    <Box sx={{ bgcolor: color, px: 2, py: 1.25, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography sx={{ fontSize: 15, color: "#fff" }}>{label}</Typography>
        {collapsible && <Typography sx={{ color: "#fff", fontSize: 18, lineHeight: 1 }}>‹</Typography>}
    </Box>
);

export const OrderLineRow = ({ line }: { line: OrderLineItem }) => (
    <Stack direction="row" spacing={1.5} sx={{ px: 2, py: 1.5, alignItems: "flex-start" }}>
        <Box sx={{ position: "relative", width: 56, height: 44, flexShrink: 0 }}>
            {line.image ? (
                <Box component="img" src={line.image} alt="" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
                <Box sx={{ width: "100%", height: "100%", bgcolor: appColors.canvasAlt }} />
            )}
            <Box
                sx={{
                    position: "absolute",
                    inset: "0 auto 0 0",
                    width: 26,
                    bgcolor: appColors.greenTee,
                    color: "#fff",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 14,
                    fontWeight: 500,
                }}
            >
                {line.qty}
            </Box>
        </Box>

        <Stack sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: "center" }}>
                <Typography sx={{ fontSize: 15, fontWeight: 500 }}>{line.name}</Typography>
                {line.hasTimer && <Box component="span" sx={{ fontSize: 13 }}>⏱</Box>}
            </Stack>
            {line.meta && (
                <Stack direction="row" spacing={1}>
                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{line.meta[0]}</Typography>
                    <Typography sx={{ fontSize: 13, color: appColors.orange }}>{line.meta[1]}</Typography>
                </Stack>
            )}
            {line.note && (
                <Typography sx={{ fontSize: 13, color: appColors.textSecondary }} noWrap>
                    {line.note}
                </Typography>
            )}
        </Stack>

        <Typography sx={{ fontSize: 15 }}>{line.price}</Typography>
        <IconButton size="small" aria-label={`Options for ${line.name}`}>
            <MoreVertIcon fontSize="small" />
        </IconButton>
    </Stack>
);

export const OrderPanel = ({ children }: { children: ReactNode }) => (
    <Stack sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>{children}</Stack>
);

export default OrderPanel;
