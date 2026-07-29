import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { neutral } from "@/theme/tokens";
import { assetUrl } from "@/utils/asset-url";
import { DocPage, DocSection, Grid, Token } from "../shared/doc-shell";

/**
 * The Tenfore marks, served from /logos at a stable URL in both dev and the
 * static build. The square mark does most of the work in this product — it is
 * what fits in an 88px nav rail and on a launcher icon.
 */
const meta = {
    title: "Foundations/Logos",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const LogoTile = ({ src, name, bg, note }: { src: string; name: string; bg: string; note: string }) => (
    <Stack spacing={1}>
        <Box
            sx={{
                height: 120,
                display: "grid",
                placeItems: "center",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: bg,
                p: 2,
            }}
        >
            <Box component="img" src={src} alt={name} sx={{ maxWidth: "100%", maxHeight: 60 }} />
        </Box>
        <Token>{src}</Token>
        <Typography variant="caption" sx={{ color: "text.secondary" }}>
            {note}
        </Typography>
    </Stack>
);

export const Marks: Story = {
    render: () => (
        <DocPage title="Logos" intro="The Tenfore wordmark and square mark, in the three finishes the POS actually needs.">
            <DocSection
                title="Wordmark — 200×54"
                note="Used where there is horizontal room and the brand needs to be named: the login screen, printed receipts, the register close-out summary. Not used in the app bar, where the square mark and the course name do the job in less space."
            >
                <Grid min={260}>
                    <LogoTile
                        src={assetUrl("logos/tf-logo.svg")}
                        name="Tenfore wordmark, color"
                        bg={neutral[50]}
                        note="Default. Light backgrounds only."
                    />
                    <LogoTile
                        src={assetUrl("logos/tf-logo-black.svg")}
                        name="Tenfore wordmark, black"
                        bg="#ffffff"
                        note="Mono contexts: receipts, faxed reports, single-color print."
                    />
                    <LogoTile
                        src={assetUrl("logos/tf-logo-white.svg")}
                        name="Tenfore wordmark, white"
                        bg={neutral[900]}
                        note="Dark mode, brand-colored headers, photo overlays."
                    />
                </Grid>
            </DocSection>

            <DocSection
                title="Square mark — 64×60"
                note="The workhorse. It is what fits the 88px nav rail, the Android launcher icon, the tab favicon, and any place the wordmark would be illegible below ~120px wide."
            >
                <Grid min={260}>
                    <LogoTile
                        src={assetUrl("logos/tf-square-color.svg")}
                        name="Tenfore mark, color"
                        bg={neutral[50]}
                        note="Default. Nav rail, launcher, favicon."
                    />
                    <LogoTile
                        src={assetUrl("logos/tf-square-black.svg")}
                        name="Tenfore mark, black"
                        bg="#ffffff"
                        note="Mono contexts and watermarks."
                    />
                    <LogoTile
                        src={assetUrl("logos/tf-square-white.svg")}
                        name="Tenfore mark, white"
                        bg={neutral[900]}
                        note="Dark mode and brand-green surfaces."
                    />
                </Grid>
            </DocSection>

            <DocSection
                title="Clear space & minimum size"
                note="Clear space on all sides equals the height of the mark's cap. Below the minimums the mark loses its counters and reads as a smudge at arm's length — use the square mark instead of shrinking the wordmark."
            >
                <Stack direction="row" spacing={4} sx={{ flexWrap: "wrap", rowGap: 3 }}>
                    <Stack spacing={1}>
                        <Box
                            sx={{
                                position: "relative",
                                p: "27px",
                                border: "1px dashed",
                                borderColor: "primary.main",
                                borderRadius: 1,
                                bgcolor: "background.paper",
                            }}
                        >
                            <Box
                                component="img"
                                src={assetUrl("logos/tf-logo.svg")}
                                alt="Clear space"
                                sx={{ display: "block", width: 200 }}
                            />
                        </Box>
                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                            Wordmark — 27px clear space (½ mark height)
                        </Typography>
                    </Stack>
                    <Stack spacing={1} sx={{ justifyContent: "flex-end" }}>
                        <Stack direction="row" spacing={3} sx={{ alignItems: "flex-end" }}>
                            <Stack spacing={0.5} sx={{ alignItems: "center" }}>
                                <Box component="img" src={assetUrl("logos/tf-logo.svg")} alt="Minimum wordmark" sx={{ width: 120 }} />
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                    min 120px wide
                                </Typography>
                            </Stack>
                            <Stack spacing={0.5} sx={{ alignItems: "center" }}>
                                <Box component="img" src={assetUrl("logos/tf-square-color.svg")} alt="Minimum mark" sx={{ width: 32 }} />
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                    min 32px
                                </Typography>
                            </Stack>
                        </Stack>
                    </Stack>
                </Stack>
            </DocSection>

            <DocSection title="Don't" note="Each of these breaks recognition at the distance a POS is actually read from.">
                <Grid min={200}>
                    {[
                        { label: "Don't recolor", sx: { filter: "hue-rotate(180deg)" } },
                        { label: "Don't stretch", sx: { transform: "scaleX(1.4)" } },
                        { label: "Don't rotate", sx: { transform: "rotate(-8deg)" } },
                        { label: "Don't add effects", sx: { filter: "drop-shadow(0 4px 6px rgba(0,0,0,.5))" } },
                    ].map(({ label, sx }) => (
                        <Stack key={label} spacing={1}>
                            <Box
                                sx={{
                                    height: 100,
                                    display: "grid",
                                    placeItems: "center",
                                    borderRadius: 2,
                                    border: "1px solid",
                                    borderColor: "error.main",
                                    bgcolor: "background.paper",
                                    overflow: "hidden",
                                }}
                            >
                                <Box component="img" src={assetUrl("logos/tf-logo.svg")} alt={label} sx={{ width: 140, ...sx }} />
                            </Box>
                            <Typography variant="caption" sx={{ color: "error.main", fontWeight: 600 }}>
                                {label}
                            </Typography>
                        </Stack>
                    ))}
                </Grid>
            </DocSection>
        </DocPage>
    ),
};
