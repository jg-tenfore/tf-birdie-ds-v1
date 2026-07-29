import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import BackspaceOutlinedIcon from "@mui/icons-material/BackspaceOutlined";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { touchTarget } from "@/theme/tokens";
import { Card, DocPage, DocSection, Token } from "../shared/doc-shell";

/**
 * The rule that separates this system from a desktop one.
 *
 * Android's accessibility minimum is 48dp, WCAG 2.2 AAA (2.5.5) asks 44px, and
 * AA (2.5.8) asks 24px. 48 clears all three, so it is the floor — and the floor
 * is enforced in the theme, not in review comments.
 */
const meta = {
    title: "Foundations/Touch Targets",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const tiers = [
    { key: "min", size: touchTarget.min, name: "Minimum", use: "Icon buttons, list rows, tabs, table row actions. The absolute floor — nothing tappable goes below it." },
    { key: "comfortable", size: touchTarget.comfortable, name: "Comfortable", use: "The default. Buttons, text fields, select menus, menu items." },
    { key: "large", size: touchTarget.large, name: "Large", use: "Tender keys, numeric keypad, order-grid product tiles — repeated eyes-off taps." },
    { key: "critical", size: touchTarget.critical, name: "Critical", use: "Irreversible or money-moving: Charge, Void, Refund, Close register." },
] as const;

export const Sizes: Story = {
    render: () => (
        <DocPage
            title="Touch Targets"
            intro="Sized for a finger, not a cursor — and specifically for a finger belonging to someone standing, hurrying, and possibly wearing a glove."
        >
            <DocSection
                title="The four tiers"
                note="Size tracks the cost of a mis-tap. A wrong tab costs a second; a wrong Refund costs a phone call to a member. That is why Charge is 80dp and a tab is 48dp."
            >
                <Stack spacing={2}>
                    {tiers.map(({ key, size, name, use }) => (
                        <Card key={key}>
                            <Stack direction="row" spacing={3} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                                <Box
                                    sx={{
                                        width: size,
                                        height: size,
                                        flexShrink: 0,
                                        borderRadius: 2,
                                        bgcolor: "primary.main",
                                        color: "primary.contrastText",
                                        display: "grid",
                                        placeItems: "center",
                                        fontWeight: 700,
                                        fontSize: 14,
                                    }}
                                >
                                    {size}
                                </Box>
                                <Stack spacing={0.25} sx={{ minWidth: 160 }}>
                                    <Typography variant="subtitle2">{name}</Typography>
                                    <Token>touchTarget.{key} — {size}dp</Token>
                                </Stack>
                                <Typography variant="body2" sx={{ color: "text.secondary", flex: "1 1 300px" }}>
                                    {use}
                                </Typography>
                            </Stack>
                        </Card>
                    ))}
                </Stack>
            </DocSection>

            <DocSection
                title="Enforced by the theme"
                note="These are stock MUI components with no size props — the heights come from birdie-theme.ts. That is the point: a screen built from plain components is already compliant."
            >
                <Card>
                    <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap", rowGap: 2 }}>
                        <Button size="small">Small — 48</Button>
                        <Button>Default — 56</Button>
                        <Button size="large">Large — 64</Button>
                        <IconButton aria-label="Backspace">
                            <BackspaceOutlinedIcon />
                        </IconButton>
                        <Button
                            size="large"
                            sx={{ minHeight: touchTarget.critical, minWidth: 240, fontSize: 20 }}
                        >
                            Charge $248.00
                        </Button>
                    </Stack>
                </Card>
            </DocSection>

            <DocSection
                title="Spacing between targets"
                note={`Adjacent targets need at least ${touchTarget.minGap}px of gap. Two 48dp buttons flush against each other are effectively one 96dp button with an ambiguous middle.`}
            >
                <Stack direction="row" spacing={4} sx={{ flexWrap: "wrap", rowGap: 2 }}>
                    <Stack spacing={1}>
                        <Typography variant="caption" sx={{ color: "error.main", fontWeight: 700 }}>
                            ✗ No gap
                        </Typography>
                        <Stack direction="row" spacing={0}>
                            <Button variant="outlined" sx={{ borderRadius: 0 }}>
                                Void
                            </Button>
                            <Button variant="outlined" sx={{ borderRadius: 0 }}>
                                Refund
                            </Button>
                        </Stack>
                    </Stack>
                    <Stack spacing={1}>
                        <Typography variant="caption" sx={{ color: "success.main", fontWeight: 700 }}>
                            ✓ {touchTarget.minGap}px minimum
                        </Typography>
                        <Stack direction="row" spacing={`${touchTarget.minGap}px`}>
                            <Button variant="outlined">Void</Button>
                            <Button variant="outlined">Refund</Button>
                        </Stack>
                    </Stack>
                </Stack>
            </DocSection>

            <DocSection
                title="Hover is not available"
                note="A finger has no hover state. Tooltips, hover-reveal actions, and hover-only affordances may exist as progressive enhancement for a docked tablet with a mouse — but no POS flow may require one to be discoverable."
            >
                <Card sx={{ borderColor: "warning.main" }}>
                    <Typography variant="body2">
                        Rule: if an action can only be found by hovering, it cannot be found. Put it in the row, the overflow menu, or a long-press.
                    </Typography>
                </Card>
            </DocSection>
        </DocPage>
    ),
};
