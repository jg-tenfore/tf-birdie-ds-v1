import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { breakpoints, devices, layout, spacingUnit } from "@/theme/tokens";
import { Card, DocPage, DocSection, Token } from "../shared/doc-shell";

/**
 * Spacing and the landscape frame.
 *
 * The governing fact: at 1280×800, height is the scarce resource. Everything
 * here exists to keep chrome cheap and give the working canvas the rest.
 */
const meta = {
    title: "Foundations/Spacing & Layout",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const steps = [0.5, 1, 1.5, 2, 3, 4, 5, 6, 8];

export const Spacing: Story = {
    render: () => (
        <DocPage title="Spacing & Layout" intro="An 8px grid, a fixed landscape frame, and a hard rule that the page itself never scrolls.">
            <DocSection
                title="The 8px grid"
                note={`theme.spacing(n) multiplies ${spacingUnit}px. Staying on the grid is what makes tiles line up across the product grid, the cart panel, and the action bar — three panels authored by three different people.`}
            >
                <Stack spacing={1.5}>
                    {steps.map((step) => (
                        <Stack key={step} direction="row" spacing={2} sx={{ alignItems: "center" }}>
                            <Box sx={{ width: 96 }}>
                                <Token>spacing({step})</Token>
                            </Box>
                            <Box sx={{ height: 24, width: step * spacingUnit, bgcolor: "primary.main", borderRadius: 0.5 }} />
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                {step * spacingUnit}px
                            </Typography>
                        </Stack>
                    ))}
                </Stack>
            </DocSection>

            <DocSection
                title="The landscape frame"
                note={`App bar (${layout.appBarHeight}) + action bar (${layout.actionBarHeight}) = ${layout.appBarHeight + layout.actionBarHeight}px of chrome, leaving ${800 - layout.appBarHeight - layout.actionBarHeight}px of canvas on a 1280×800 device. Every pixel of chrome is taken from the work.`}
            >
                <Box
                    sx={{
                        width: "100%",
                        maxWidth: 640,
                        aspectRatio: "1280 / 800",
                        border: "2px solid",
                        borderColor: "divider",
                        borderRadius: 2,
                        overflow: "hidden",
                        display: "grid",
                        gridTemplateRows: `${(layout.appBarHeight / 800) * 100}% 1fr ${(layout.actionBarHeight / 800) * 100}%`,
                        bgcolor: "background.paper",
                    }}
                >
                    <Box
                        sx={{
                            bgcolor: "primary.main",
                            color: "primary.contrastText",
                            display: "grid",
                            placeItems: "center",
                            fontSize: 12,
                            fontWeight: 600,
                        }}
                    >
                        App bar — {layout.appBarHeight}px
                    </Box>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: `${(layout.navRailWidth / 1280) * 100}% 1fr ${(layout.orderPanelWidth / 1280) * 100}%`,
                            minHeight: 0,
                        }}
                    >
                        <Box
                            sx={{
                                bgcolor: "action.selected",
                                display: "grid",
                                placeItems: "center",
                                fontSize: 10,
                                textAlign: "center",
                                p: 0.5,
                            }}
                        >
                            Nav rail {layout.navRailWidth}
                        </Box>
                        <Box sx={{ display: "grid", placeItems: "center", fontSize: 12, color: "text.secondary" }}>Working canvas</Box>
                        <Box
                            sx={{
                                bgcolor: "action.hover",
                                borderLeft: "1px solid",
                                borderColor: "divider",
                                display: "grid",
                                placeItems: "center",
                                fontSize: 10,
                                textAlign: "center",
                                p: 0.5,
                            }}
                        >
                            Order panel {layout.orderPanelWidth}
                        </Box>
                    </Box>
                    <Box
                        sx={{
                            bgcolor: "secondary.main",
                            color: "secondary.contrastText",
                            display: "grid",
                            placeItems: "center",
                            fontSize: 12,
                            fontWeight: 600,
                        }}
                    >
                        Action bar — {layout.actionBarHeight}px
                    </Box>
                </Box>

                <Stack spacing={1} sx={{ mt: 2 }}>
                    {Object.entries(layout).map(([key, value]) => (
                        <Stack key={key} direction="row" spacing={2}>
                            <Box sx={{ minWidth: 220 }}>
                                <Token>layout.{key}</Token>
                            </Box>
                            <Typography variant="body2">{value}px</Typography>
                        </Stack>
                    ))}
                </Stack>
            </DocSection>

            <DocSection
                title="Breakpoints — Material 3 window size classes"
                note="md and lg are the only real design targets. xs and sm exist so components degrade sanely if a story is viewed narrow; they are not layouts anyone should design for, because the device cannot produce them."
            >
                <Stack spacing={1}>
                    {(
                        [
                            ["xs", "compact", "Phone portrait", false],
                            ["sm", "medium", "Phone landscape / small tablet portrait", false],
                            ["md", "expanded", '10" tablet landscape', true],
                            ["lg", "large", '12"+ tablet landscape', true],
                            ["xl", "extra-large", "Desk-docked / external display", false],
                        ] as const
                    ).map(([key, m3, desc, isTarget]) => (
                        <Card key={key} sx={{ borderColor: isTarget ? "primary.main" : "divider" }}>
                            <Stack direction="row" spacing={2} sx={{ alignItems: "center", flexWrap: "wrap" }}>
                                <Box sx={{ minWidth: 130 }}>
                                    <Token>
                                        {key} — {breakpoints[key]}px
                                    </Token>
                                </Box>
                                <Typography variant="body2" sx={{ minWidth: 120, fontWeight: 600 }}>
                                    {m3}
                                </Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary", flex: 1 }}>
                                    {desc}
                                </Typography>
                                {isTarget && (
                                    <Typography variant="caption" sx={{ color: "primary.main", fontWeight: 700 }}>
                                        TARGET
                                    </Typography>
                                )}
                            </Stack>
                        </Card>
                    ))}
                </Stack>
            </DocSection>

            <DocSection title="Reference devices" note="All landscape. These are the exact viewports in the Storybook toolbar.">
                <Stack spacing={1}>
                    {Object.entries(devices).map(([key, device]) => (
                        <Stack key={key} direction="row" spacing={2}>
                            <Box sx={{ minWidth: 180 }}>
                                <Token>devices.{key}</Token>
                            </Box>
                            <Typography variant="body2">{device.name}</Typography>
                        </Stack>
                    ))}
                </Stack>
            </DocSection>
        </DocPage>
    ),
};
