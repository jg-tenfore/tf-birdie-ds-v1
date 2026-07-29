import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { motion, radius } from "@/theme/tokens";
import { DocPage, DocSection, Grid, Token } from "../shared/doc-shell";

/**
 * Shape and depth. Radii run larger than a desktop system because at arm's
 * length a 4px corner reads as a hard edge; depth runs shallower because the
 * POS is a flat, panel-based layout where heavy shadows just add noise.
 */
const meta = {
    title: "Foundations/Radius & Elevation",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const radiusUsage: Record<keyof typeof radius, string> = {
    none: "Full-bleed panels, table cells",
    sm: "Chips, badges, inline tags",
    md: "Buttons, inputs, menu items",
    lg: "Cards, product tiles",
    xl: "Dialogs, bottom sheets",
    pill: "Filter pills, status pills, avatars",
};

export const Shape: Story = {
    render: () => (
        <DocPage
            title="Radius & Elevation"
            intro="Softer corners than a desktop system, flatter surfaces, and motion fast enough to disappear."
        >
            <DocSection
                title="Radius"
                note="Larger radii read as discrete, tappable objects at arm's length — which is exactly what a POS tile needs to be."
            >
                <Grid min={180}>
                    {(Object.keys(radius) as (keyof typeof radius)[]).map((key) => (
                        <Stack key={key} spacing={1}>
                            <Box
                                sx={{
                                    height: 88,
                                    borderRadius: `${radius[key]}px`,
                                    bgcolor: "primary.main",
                                    display: "grid",
                                    placeItems: "center",
                                    color: "primary.contrastText",
                                    fontWeight: 700,
                                }}
                            >
                                {radius[key]}
                            </Box>
                            <Token>radius.{key}</Token>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                {radiusUsage[key]}
                            </Typography>
                        </Stack>
                    ))}
                </Grid>
            </DocSection>

            <DocSection
                title="Elevation"
                note="Cards default to elevation 0 with a 1px border — on a dense POS screen, a dozen drop shadows read as visual static. Reserve real elevation for things that genuinely float above the canvas: menus, dialogs, snackbars."
            >
                <Grid min={200}>
                    {[0, 1, 2, 4, 8, 16].map((level) => (
                        <Stack key={level} spacing={1}>
                            <Paper
                                elevation={level}
                                sx={{
                                    height: 88,
                                    display: "grid",
                                    placeItems: "center",
                                    borderRadius: 2,
                                    border: level === 0 ? "1px solid" : "none",
                                    borderColor: "divider",
                                }}
                            >
                                <Typography variant="subtitle2">{level}</Typography>
                            </Paper>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                {level === 0
                                    ? "Cards, panels (default)"
                                    : level <= 2
                                      ? "Raised rows, sticky headers"
                                      : level <= 8
                                        ? "Menus, popovers"
                                        : "Dialogs, sheets"}
                            </Typography>
                        </Stack>
                    ))}
                </Grid>
            </DocSection>

            <DocSection
                title="Motion"
                note="An operator repeats the same interaction hundreds of times a shift. Above roughly 200ms, a transition stops reading as polish and starts reading as lag."
            >
                <Stack spacing={1}>
                    {Object.entries(motion).map(([key, ms]) => (
                        <Stack key={key} direction="row" spacing={2} sx={{ alignItems: "center" }}>
                            <Box sx={{ minWidth: 160 }}>
                                <Token>motion.{key}</Token>
                            </Box>
                            <Box sx={{ width: ms, height: 12, bgcolor: "primary.main", borderRadius: 999 }} />
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                {ms}ms
                            </Typography>
                        </Stack>
                    ))}
                </Stack>
            </DocSection>
        </DocPage>
    ),
};
