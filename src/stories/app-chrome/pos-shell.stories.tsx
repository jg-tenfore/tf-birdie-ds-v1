import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { PosShell } from "@/components/app-chrome/pos-shell";
import { fontFamily } from "@/theme/tokens";

/**
 * The POS frame, at real device size.
 *
 * Open this at each viewport in the toolbar — 8", 10", 11", 12.4" — to see what
 * the fixed chrome costs on the smallest target. Everything else in the system
 * is built inside the canvas this leaves.
 */
const meta = {
    title: "App Chrome/POS Shell",
    component: PosShell,
    parameters: { layout: "fullscreen" },
    // Each story supplies its own canvas via `render`; this satisfies the
    // required prop so the Docs tab still gets a props table from `component`.
    args: { children: null },
} satisfies Meta<typeof PosShell>;

export default meta;
type Story = StoryObj<typeof meta>;

const catalog = [
    { name: "Green fee — 18", price: "62.00", group: "Golf" },
    { name: "Green fee — 9", price: "38.00", group: "Golf" },
    { name: "Cart — 18", price: "22.00", group: "Golf" },
    { name: "Cart — 9", price: "14.00", group: "Golf" },
    { name: "Range bucket — S", price: "8.00", group: "Range" },
    { name: "Range bucket — L", price: "14.00", group: "Range" },
    { name: "Club rental", price: "45.00", group: "Rental" },
    { name: "Pull cart", price: "10.00", group: "Rental" },
    { name: "Pro V1 — dozen", price: "54.99", group: "Pro shop" },
    { name: "Glove", price: "24.00", group: "Pro shop" },
    { name: "Draft beer", price: "8.00", group: "F & B" },
    { name: "Bottled water", price: "3.00", group: "F & B" },
];

const orderLines = [
    { name: "Green fee — 18", qty: 4, amount: "248.00" },
    { name: "Cart — 18", qty: 2, amount: "44.00" },
    { name: "Range bucket — L", qty: 1, amount: "14.00" },
];

const Canvas = () => (
    <Box sx={{ p: 3 }}>
        <Tabs value={0} sx={{ mb: 2 }}>
            {["Golf", "Range", "Rental", "Pro shop", "F & B"].map((label) => (
                <Tab key={label} label={label} />
            ))}
        </Tabs>
        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 2 }}>
            {catalog.map((item) => (
                <Card key={item.name}>
                    <CardActionArea sx={{ minHeight: 108, p: 2, alignItems: "flex-start" }}>
                        <Stack spacing={1} sx={{ justifyContent: "space-between", height: "100%", width: "100%" }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                                {item.name}
                            </Typography>
                            <Typography variant="h6" sx={{ fontFamily: fontFamily.mono, fontVariantNumeric: "tabular-nums" }}>
                                ${item.price}
                            </Typography>
                        </Stack>
                    </CardActionArea>
                </Card>
            ))}
        </Box>
    </Box>
);

const OrderPanel = () => (
    <>
        <Box sx={{ p: 2.5, pb: 1.5 }}>
            <Typography variant="h6">Ticket #4127</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Jordan Ellis · 4 guests
            </Typography>
        </Box>
        <Divider />

        {/* The line list is the only part of the panel that scrolls. */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 1.5 }}>
            <Stack spacing={1.5}>
                {orderLines.map((line) => (
                    <Stack key={line.name} direction="row" spacing={1} sx={{ alignItems: "center" }}>
                        <Stack sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body1" noWrap sx={{ fontWeight: 500 }}>
                                {line.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                Qty {line.qty}
                            </Typography>
                        </Stack>
                        <Typography variant="body1" sx={{ fontFamily: fontFamily.mono, fontVariantNumeric: "tabular-nums" }}>
                            {line.amount}
                        </Typography>
                        <IconButton aria-label={`Remove ${line.name}`} size="small">
                            <DeleteOutlineOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                ))}
            </Stack>
        </Box>

        <Divider />
        <Stack spacing={1} sx={{ p: 2.5 }}>
            {[
                ["Subtotal", "306.00"],
                ["Tax", "18.36"],
            ].map(([label, amount]) => (
                <Stack key={label} direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        {label}
                    </Typography>
                    <Typography variant="body2" sx={{ fontFamily: fontFamily.mono, fontVariantNumeric: "tabular-nums" }}>
                        {amount}
                    </Typography>
                </Stack>
            ))}
            <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between", pt: 0.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Total
                </Typography>
                <Typography variant="h4" sx={{ fontFamily: fontFamily.mono, fontVariantNumeric: "tabular-nums" }}>
                    $324.36
                </Typography>
            </Stack>
        </Stack>
    </>
);

const ActionBar = () => (
    <>
        <Button variant="outlined" size="large">
            Hold ticket
        </Button>
        <Button variant="outlined" size="large" color="error">
            Void
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button size="large" sx={{ minHeight: 64, minWidth: 260, fontSize: 20 }}>
            Charge $324.36
        </Button>
    </>
);

export const Register: Story = {
    render: () => (
        <PosShell active="register" orderPanel={<OrderPanel />} actionBar={<ActionBar />}>
            <Canvas />
        </PosShell>
    ),
};

/** No active order — the panel is simply absent, and the canvas takes the width. */
export const WithoutOrderPanel: Story = {
    name: "Without order panel",
    render: () => (
        <PosShell active="teesheet">
            <Box sx={{ p: 3 }}>
                <Typography variant="h4" sx={{ mb: 1 }}>
                    Tee sheet — today
                </Typography>
                <Typography variant="body1" sx={{ color: "text.secondary" }}>
                    Screens with no cart drop the order panel entirely rather than showing an empty one. An
                    empty panel is 380px of the canvas spent on nothing.
                </Typography>
            </Box>
        </PosShell>
    ),
};

/** Offline is a normal operating mode for a course with patchy Wi-Fi, not an error. */
export const Offline: Story = {
    render: () => (
        <PosShell active="register" connection="offline" orderPanel={<OrderPanel />} actionBar={<ActionBar />}>
            <Canvas />
        </PosShell>
    ),
};
