import type { ReactNode } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { appColors } from "@/theme/app-replica-tokens";

/**
 * A flow, laid out as comps.
 *
 * Every frame is a **real screen at 1280×800**, scaled down — not a picture of
 * one. Whatever is true in the clickable walkthrough is true here, because it is
 * the same component tree rendered smaller, so a storyboard cannot drift away
 * from the thing it documents.
 *
 * This exists for the conversations the clickable version cannot have: comparing
 * two options side by side, counting the surfaces a refund costs, and pasting
 * the sequence into a ticket or a deck.
 */

/** The reference device. Frames are this, scaled. */
const DEVICE = { width: 1280, height: 800 } as const;

export const StoryboardFrame = ({
    step,
    title,
    caption,
    scale = 0.44,
    children,
}: {
    /** 1-based position in the flow; printed on the frame. */
    step: number;
    title: string;
    caption: string;
    scale?: number;
    children: ReactNode;
}) => (
    <Box sx={{ width: DEVICE.width * scale }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 1 }}>
            <Box
                sx={{
                    width: 24,
                    height: 24,
                    flexShrink: 0,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "50%",
                    bgcolor: appColors.slate,
                    color: "#fff",
                    fontSize: 13,
                }}
            >
                {step}
            </Box>
            <Typography sx={{ fontSize: 16, fontWeight: 500, color: appColors.textPrimary }}>{title}</Typography>
        </Box>

        <Box
            sx={{
                position: "relative",
                width: DEVICE.width * scale,
                height: DEVICE.height * scale,
                overflow: "hidden",
                border: "1px solid",
                borderColor: appColors.divider,
                borderRadius: 1,
                bgcolor: appColors.surface,
            }}
        >
            {/*
             * The shell sizes itself to the viewport, which inside a frame would
             * be the whole storyboard page — so the device height is forced on
             * the child, and `position: relative` above keeps the modal's
             * absolute overlay inside this frame rather than over the page.
             */}
            <Box
                sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: DEVICE.width,
                    height: DEVICE.height,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    "& > *": { height: `${DEVICE.height}px !important` },
                }}
            >
                {children}
            </Box>
        </Box>

        <Typography sx={{ mt: 1, fontSize: 14, lineHeight: 1.5, color: appColors.textSecondary }}>{caption}</Typography>
    </Box>
);

/** The sheet: a title, a one-line argument, and the frames in order. */
export const FlowStoryboard = ({ title, summary, children }: { title: string; summary: string; children: ReactNode }) => (
    <Box sx={{ minHeight: "100vh", bgcolor: appColors.canvas, px: 4, py: 4 }}>
        <Typography sx={{ fontSize: 24, color: appColors.textPrimary }}>{title}</Typography>
        <Typography sx={{ mt: 0.5, mb: 3, fontSize: 16, color: appColors.textSecondary, maxWidth: 900 }}>{summary}</Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 4 }}>{children}</Box>
    </Box>
);

export default FlowStoryboard;
