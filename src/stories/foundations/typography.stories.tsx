import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { fontFamily } from "@/theme/tokens";
import { Card, DocPage, DocSection, Token } from "../shared/doc-shell";

/**
 * The type scale, sized for a tablet read at arm's length while standing.
 * The floor is 15px and body is 16px — the 14px default of most web systems is
 * genuinely hard to read at counter distance under pro-shop lighting.
 */
const meta = {
    title: "Foundations/Typography",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const scale = [
    { variant: "h1", usage: "Amount due. The one number the guest also reads.", sample: "$248.00" },
    { variant: "h2", usage: "Screen title on a full-page takeover.", sample: "Close out register" },
    { variant: "h3", usage: "Section heading.", sample: "Open tickets" },
    { variant: "h4", usage: "Panel heading, dialog title.", sample: "Order #4127" },
    { variant: "h5", usage: "Card heading, grouped list header.", sample: "Payment method" },
    { variant: "h6", usage: "Sub-heading, emphasized row label.", sample: "Tee time — 9:40 AM" },
    { variant: "subtitle1", usage: "Lead-in copy, item name in the cart.", sample: "Titleist Pro V1 — dozen" },
    { variant: "subtitle2", usage: "Emphasized label inside dense rows.", sample: "Subtotal" },
    { variant: "body1", usage: "Default body. The floor for anything a operator must read.", sample: "Split the check evenly across four guests." },
    { variant: "body2", usage: "Secondary body, table cells.", sample: "Added by Dana at 9:42 AM" },
    { variant: "button", usage: "Button label. Sentence case, never ALL CAPS.", sample: "Charge $248.00" },
    { variant: "caption", usage: "Timestamps, helper text. Never for instructions.", sample: "Synced 2 minutes ago" },
    { variant: "overline", usage: "Category eyebrow above a group.", sample: "Pro shop" },
] as const;

export const Scale: Story = {
    render: () => (
        <DocPage title="Typography" intro="Roboto — the Android system face — at sizes tuned for reading a tablet while standing, at speed.">
            <DocSection
                title="Scale"
                note="Every step is at least 15px. Button text is 16px and sentence case: ALL CAPS costs word-shape recognition, and POS buttons are scanned, not read."
            >
                <Stack spacing={2}>
                    {scale.map(({ variant, usage, sample }) => (
                        <Card key={variant}>
                            <Stack direction="row" spacing={3} sx={{ alignItems: "baseline", flexWrap: "wrap" }}>
                                <Box sx={{ minWidth: 140 }}>
                                    <Token>{variant}</Token>
                                </Box>
                                <Typography variant={variant} sx={{ flex: "1 1 320px", display: "block" }}>
                                    {sample}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary", flex: "1 1 240px" }}>
                                    {usage}
                                </Typography>
                            </Stack>
                        </Card>
                    ))}
                </Stack>
            </DocSection>

            <DocSection
                title="Families"
                note="Monospace is not decorative here — it carries tabular figures, so prices and quantities align down a column and a mis-keyed digit is visible."
            >
                <Stack spacing={2}>
                    <Card>
                        <Stack spacing={1}>
                            <Token>fontFamily.sans</Token>
                            <Typography sx={{ fontFamily: fontFamily.sans, fontSize: 24 }}>Roboto — interface, labels, body</Typography>
                        </Stack>
                    </Card>
                    <Card>
                        <Stack spacing={1}>
                            <Token>fontFamily.mono</Token>
                            <Typography sx={{ fontFamily: fontFamily.mono, fontSize: 24, fontVariantNumeric: "tabular-nums" }}>
                                Roboto Mono — 1,248.00 / 0.00 / 96.75
                            </Typography>
                        </Stack>
                    </Card>
                </Stack>
            </DocSection>

            <DocSection title="Numerals in context" note="Totals use tabular figures so the decimal point never drifts between rows.">
                <Card sx={{ maxWidth: 420 }}>
                    <Stack spacing={1.5}>
                        {[
                            ["Subtotal", "228.00"],
                            ["Tax", "13.68"],
                            ["Tip", "6.32"],
                            ["Total", "248.00"],
                        ].map(([label, amount], i, arr) => (
                            <Stack key={label} direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                                <Typography variant={i === arr.length - 1 ? "subtitle2" : "body2"} sx={{ color: i === arr.length - 1 ? "text.primary" : "text.secondary" }}>
                                    {label}
                                </Typography>
                                <Typography
                                    variant={i === arr.length - 1 ? "h5" : "body1"}
                                    sx={{ fontFamily: fontFamily.mono, fontVariantNumeric: "tabular-nums" }}
                                >
                                    ${amount}
                                </Typography>
                            </Stack>
                        ))}
                    </Stack>
                </Card>
            </DocSection>
        </DocPage>
    ),
};
