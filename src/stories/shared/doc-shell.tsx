import type { ReactNode } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

/**
 * Shared chrome for the Foundations documentation stories.
 *
 * These pages are read on the same landscape canvas as the product, so they use
 * the real theme rather than Storybook's docs styling — what you see is what the
 * device renders.
 */

export const DocPage = ({ title, intro, children }: { title: string; intro?: ReactNode; children: ReactNode }) => (
    <Box sx={{ p: 4, bgcolor: "background.default", minHeight: "100%" }}>
        <Stack spacing={1} sx={{ mb: 4, maxWidth: 760 }}>
            <Typography variant="h3">{title}</Typography>
            {intro && (
                <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
                    {intro}
                </Typography>
            )}
        </Stack>
        <Stack spacing={5}>{children}</Stack>
    </Box>
);

export const DocSection = ({ title, note, children }: { title: string; note?: ReactNode; children: ReactNode }) => (
    <Stack spacing={2}>
        <Stack spacing={0.5}>
            <Typography variant="h5">{title}</Typography>
            {note && (
                <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 760 }}>
                    {note}
                </Typography>
            )}
        </Stack>
        {children}
    </Stack>
);

/** Monospaced token name, so the reader can copy the exact identifier. */
export const Token = ({ children }: { children: ReactNode }) => (
    <Box component="code" sx={{ fontFamily: "var(--birdie-font-mono, monospace)", fontSize: 13, color: "text.secondary", wordBreak: "break-all" }}>
        {children}
    </Box>
);

export const Grid = ({ min = 180, children }: { min?: number; children: ReactNode }) => (
    <Box sx={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${min}px, 1fr))`, gap: 2 }}>{children}</Box>
);

export const Card = ({ children, sx }: { children: ReactNode; sx?: object }) => (
    <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, bgcolor: "background.paper", p: 2, ...sx }}>{children}</Box>
);
