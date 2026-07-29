import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { brand, neutral, status } from "@/theme/tokens";
import { Card, DocPage, DocSection, Grid, Token } from "../shared/doc-shell";

/**
 * The Birdie palette. Brand green is Tenfore's, shared with the Fox and Buck
 * systems; neutrals are cool-shifted so the green stays the only warm accent.
 *
 * Switch the Theme toolbar to dark to check every pair against its dark
 * counterpart — the POS runs dark in low-light pro shops and bar stations.
 */
const meta = {
    title: "Foundations/Colors",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Swatch = ({ name, value, note }: { name: string; value: string; note?: string }) => (
    <Stack spacing={0.75}>
        <Box sx={{ height: 64, borderRadius: 1.5, bgcolor: value, border: "1px solid", borderColor: "divider" }} />
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {name}
        </Typography>
        <Token>{value}</Token>
        {note && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {note}
            </Typography>
        )}
    </Stack>
);

const Ramp = ({ ramp, highlight }: { ramp: Record<string, string>; highlight?: string }) => (
    <Grid min={140}>
        {Object.entries(ramp).map(([step, value]) => (
            <Swatch key={step} name={step} value={value} note={step === highlight ? "primary interactive" : undefined} />
        ))}
    </Grid>
);

export const Palette: Story = {
    render: () => (
        <DocPage
            title="Colors"
            intro="Brand green marks the action to take. Status colors mark what happened. Nothing else on a POS screen earns saturation."
        >
            <DocSection
                title="Brand"
                note="Tenfore green. brand-600 is the primary interactive color — the Charge button, the active nav item, the selected tile. Because it is reserved for action, avoid it for decoration."
            >
                <Ramp ramp={brand} highlight="600" />
            </DocSection>

            <DocSection
                title="Neutral"
                note="Surfaces, text, dividers, and the ~90% of POS chrome that should recede. Cool-shifted so brand green never has to compete with a warm grey."
            >
                <Ramp ramp={neutral} />
            </DocSection>

            <DocSection
                title="Status"
                note="Note that success is a teal-shifted green, deliberately distinct from brand-600. A green 'Paid' chip sitting beside a green 'Charge' button would be ambiguous at a glance — and glances are all a POS gets."
            >
                <Grid min={200}>
                    {Object.entries(status).map(([name, ramp]) => (
                        <Card key={name}>
                            <Stack spacing={1}>
                                <Typography variant="subtitle2" sx={{ textTransform: "capitalize" }}>
                                    {name}
                                </Typography>
                                <Stack direction="row" spacing={0.5}>
                                    {(["light", "main", "dark"] as const).map((step) => (
                                        <Box key={step} sx={{ flex: 1 }}>
                                            <Box
                                                sx={{
                                                    height: 48,
                                                    borderRadius: 1,
                                                    bgcolor: ramp[step],
                                                    border: "1px solid",
                                                    borderColor: "divider",
                                                }}
                                            />
                                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                                {step}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Stack>
                                <Token>{ramp.main}</Token>
                            </Stack>
                        </Card>
                    ))}
                </Grid>
            </DocSection>

            <DocSection
                title="Semantic theme tokens"
                note="Build with these, not with raw ramp values — they are the ones that flip correctly between light and dark."
            >
                <Grid min={220}>
                    {[
                        { token: "palette.primary.main", sx: { bgcolor: "primary.main" } },
                        { token: "palette.background.default", sx: { bgcolor: "background.default" } },
                        { token: "palette.background.paper", sx: { bgcolor: "background.paper" } },
                        { token: "palette.text.primary", sx: { bgcolor: "text.primary" } },
                        { token: "palette.text.secondary", sx: { bgcolor: "text.secondary" } },
                        { token: "palette.divider", sx: { bgcolor: "divider" } },
                    ].map(({ token, sx }) => (
                        <Stack key={token} spacing={0.75}>
                            <Box sx={{ height: 56, borderRadius: 1.5, border: "1px solid", borderColor: "divider", ...sx }} />
                            <Token>{token}</Token>
                        </Stack>
                    ))}
                </Grid>
            </DocSection>
        </DocPage>
    ),
};
