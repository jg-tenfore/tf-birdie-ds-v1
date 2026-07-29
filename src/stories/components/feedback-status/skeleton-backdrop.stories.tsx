import { useState } from "react";

import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

/**
 * Skeleton and Backdrop — the two loading treatments, and when each is right.
 *
 * Skeleton: content is coming and the layout is known. Preferred, because it
 * reserves the space and the screen doesn't jump when data lands — a shifting
 * layout under a moving finger causes mis-taps.
 *
 * Backdrop: block everything because an operation is in flight that must not be
 * interrupted. Rare, and always paired with an explanation.
 */
const meta = {
    title: "Components/Feedback & Status/Skeleton & Backdrop",
    component: Skeleton,
    parameters: { layout: "padded" },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Variants: Story = {
    render: () => (
        <Stack spacing={3} sx={{ p: 3, maxWidth: 560 }}>
            <Stack spacing={1}>
                <Typography variant="subtitle2">text</Typography>
                <Skeleton variant="text" sx={{ fontSize: 24 }} />
                <Skeleton variant="text" width="60%" sx={{ fontSize: 16 }} />
            </Stack>
            <Stack spacing={1}>
                <Typography variant="subtitle2">circular</Typography>
                <Skeleton variant="circular" width={56} height={56} />
            </Stack>
            <Stack spacing={1}>
                <Typography variant="subtitle2">rectangular / rounded</Typography>
                <Skeleton variant="rectangular" height={80} />
                <Skeleton variant="rounded" height={80} />
            </Stack>
            <Stack spacing={1}>
                <Typography variant="subtitle2">wave animation</Typography>
                <Skeleton variant="rounded" height={64} animation="wave" />
            </Stack>
        </Stack>
    ),
};

/** Matching the real ticket grid, so nothing moves when the data arrives. */
export const TicketGridLoading: Story = {
    name: "Ticket grid loading",
    render: () => (
        <Box sx={{ p: 3 }}>
            <Skeleton variant="text" width={200} sx={{ fontSize: 34, mb: 2 }} />
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 2 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                    <Card key={i} sx={{ p: 2, minHeight: 148 }}>
                        <Stack spacing={1.5} sx={{ height: "100%", justifyContent: "space-between" }}>
                            <Stack direction="row" sx={{ justifyContent: "space-between" }}>
                                <Skeleton variant="text" width={70} sx={{ fontSize: 20 }} />
                                <Skeleton variant="rounded" width={56} height={24} />
                            </Stack>
                            <Stack spacing={0.5}>
                                <Skeleton variant="text" width="70%" />
                                <Skeleton variant="text" width="50%" />
                            </Stack>
                            <Skeleton variant="text" width={90} sx={{ fontSize: 24 }} />
                        </Stack>
                    </Card>
                ))}
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 2, maxWidth: 680 }}>
                The skeleton mirrors the real card's dimensions exactly — 148px tall, same grid. That's the
                whole point: when the tickets load, nothing under the operator's finger moves.
            </Typography>
        </Box>
    ),
};

export const BackdropBlocking: Story = {
    name: "Backdrop — blocking",
    render: function Render() {
        const [open, setOpen] = useState(false);

        return (
            <Box sx={{ p: 3 }}>
                <Button size="large" onClick={() => setOpen(true)}>
                    Close out register
                </Button>
                <Backdrop open={open} onClick={() => setOpen(false)} sx={{ zIndex: 1300, color: "#fff" }}>
                    <Stack spacing={3} sx={{ alignItems: "center" }}>
                        <CircularProgress color="inherit" size={64} />
                        <Stack spacing={0.5} sx={{ alignItems: "center" }}>
                            <Typography variant="h5">Closing register 2</Typography>
                            <Typography variant="body1" sx={{ color: "rgba(255,255,255,0.75)" }}>
                                Reconciling 47 tickets — don't turn off the terminal
                            </Typography>
                        </Stack>
                    </Stack>
                </Backdrop>
                <Typography variant="body2" sx={{ color: "text.secondary", mt: 2, maxWidth: 680 }}>
                    A backdrop always says what it's doing and why waiting matters. A bare spinner over a dimmed
                    screen just looks like the app froze — and an operator's next move is to force-quit it.
                    (Tap to dismiss in this demo.)
                </Typography>
            </Box>
        );
    },
};
