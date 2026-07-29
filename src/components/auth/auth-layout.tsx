import type { ReactNode } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { brand } from "@/theme/tokens";
import { assetUrl } from "@/utils/asset-url";

/**
 * The landscape auth frame.
 *
 * A centered 480px card — the web convention — wastes two thirds of a 1280×800
 * tablet and puts the form under the operator's line of sight rather than under
 * their hands. So auth here is a split: brand panel left, form right, with the
 * form column sized to stay within comfortable thumb reach of the bezel.
 *
 * The keyboard matters too. When the on-screen keyboard opens on Android it
 * takes roughly 40% of the height in landscape, so the form column scrolls
 * independently and the submit button is never the thing that gets covered.
 */

export interface AuthLayoutProps {
    title: string;
    subtitle?: ReactNode;
    children: ReactNode;
    /** Secondary line under the form — "Don't have an account?" and similar. */
    footer?: ReactNode;
    /** Narrower column for code entry and PIN screens. */
    width?: number;
}

export const AuthLayout = ({ title, subtitle, children, footer, width = 440 }: AuthLayoutProps) => (
    <Box sx={{ height: "100vh", display: "flex", overflow: "hidden", bgcolor: "background.default" }}>
        {/* Brand panel — hidden below `md`, because on anything smaller the form
            needs the whole width and the branding is the first thing to cut. */}
        <Box
            sx={{
                display: { xs: "none", md: "flex" },
                flexDirection: "column",
                justifyContent: "space-between",
                width: { md: "42%", lg: "46%" },
                p: 6,
                background: `linear-gradient(150deg, ${brand[700]} 0%, ${brand[900]} 55%, ${brand[950]} 100%)`,
                color: "#fff",
            }}
        >
            <Box component="img" src={assetUrl("logos/tf-logo-white.svg")} alt="Tenfore" sx={{ width: 168 }} />

            <Stack spacing={2} sx={{ maxWidth: 460 }}>
                <Typography variant="h2" sx={{ color: "#fff", lineHeight: 1.15 }}>
                    Sagamore Golf Club
                </Typography>
                <Typography variant="subtitle1" sx={{ color: "rgba(255,255,255,0.78)" }}>
                    Point of sale · Pro shop, snack bar, and beverage cart on one till.
                </Typography>
            </Stack>

            <Stack direction="row" spacing={3} sx={{ color: "rgba(255,255,255,0.6)" }}>
                <Typography variant="caption">Birdie POS v1.0</Typography>
                <Typography variant="caption">Terminal SGM-02</Typography>
            </Stack>
        </Box>

        {/* Form column — scrolls on its own so the Android keyboard never
            pushes the submit button off screen. */}
        <Box
            sx={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflowY: "auto",
                px: 4,
                py: 5,
            }}
        >
            <Stack spacing={4} sx={{ width: "100%", maxWidth: width }}>
                <Stack spacing={1.5}>
                    {/* The mark repeats here for the sub-md case where the brand
                        panel is gone entirely. */}
                    <Box
                        component="img"
                        src={assetUrl("logos/tf-square-color.svg")}
                        alt="Tenfore"
                        sx={{ display: { xs: "block", md: "none" }, width: 48, mb: 1 }}
                    />
                    <Typography variant="h3">{title}</Typography>
                    {subtitle && (
                        <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
                            {subtitle}
                        </Typography>
                    )}
                </Stack>

                {children}

                {footer && <Box sx={{ pt: 1 }}>{footer}</Box>}
            </Stack>
        </Box>
    </Box>
);

/** Compact variant used by the PIN unlock — no brand panel, everything centered. */
export const AuthLockLayout = ({ children }: { children: ReactNode }) => (
    <Box
        sx={{
            height: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            overflow: "hidden",
            background: `linear-gradient(150deg, ${brand[800]} 0%, ${brand[950]} 100%)`,
            px: 4,
            py: 3,
        }}
    >
        <Box component="img" src={assetUrl("logos/tf-logo-white.svg")} alt="Tenfore" sx={{ width: 150 }} />
        {children}
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.55)" }}>
            Sagamore Golf Club · Terminal SGM-02 · Register 2
        </Typography>
    </Box>
);
