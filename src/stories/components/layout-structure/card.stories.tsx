import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { fontFamily, touchTarget } from "@/theme/tokens";

/**
 * Cards and tiles — the unit the POS canvas is actually built from.
 *
 * Cards default to elevation 0 with a 1px border. On a screen showing twenty
 * of them, drop shadows stop separating anything and just add grain.
 */
const meta = {
    title: "Components/Layout & Structure/Card",
    component: Card,
    parameters: { layout: "padded" },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

const products = [
    { name: "Green fee — 18", price: "62.00", tag: "Golf" },
    { name: "Cart — 18", price: "22.00", tag: "Golf" },
    { name: "Range bucket — L", price: "14.00", tag: "Range" },
    { name: "Pro V1 — dozen", price: "54.99", tag: "Pro shop" },
    { name: "Draft beer", price: "8.00", tag: "F & B" },
    { name: "Club rental", price: "45.00", tag: "Rental" },
];

export const ProductTiles: Story = {
    name: "Product tiles",
    render: () => (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 2, maxWidth: 900 }}>
                {products.map((product) => (
                    <Card key={product.name}>
                        <CardActionArea sx={{ minHeight: 120, p: 2, alignItems: "flex-start", justifyContent: "flex-start" }}>
                            <Stack spacing={1} sx={{ justifyContent: "space-between", height: "100%", width: "100%" }}>
                                <Stack spacing={0.5}>
                                    <Typography variant="overline" sx={{ color: "text.secondary" }}>
                                        {product.tag}
                                    </Typography>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                                        {product.name}
                                    </Typography>
                                </Stack>
                                <Typography variant="h5" sx={{ fontFamily: fontFamily.mono, fontVariantNumeric: "tabular-nums" }}>
                                    ${product.price}
                                </Typography>
                            </Stack>
                        </CardActionArea>
                    </Card>
                ))}
            </Box>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 2, maxWidth: 720 }}>
                Tiles are 120px minimum — well past the {touchTarget.large}dp tier, because the whole card is
                the target and the operator hits it without looking. Price is bottom-right on every tile so the
                eye lands in a consistent place across the grid.
            </Typography>
        </Box>
    ),
};

export const TicketCard: Story = {
    name: "Ticket card",
    render: () => (
        <Box sx={{ p: 3, maxWidth: 420 }}>
            <Card>
                <CardContent>
                    <Stack spacing={2}>
                        <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
                            <Stack spacing={0.25}>
                                <Typography variant="h6">Ticket #4127</Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                    Jordan Ellis · 4 guests · 9:40 AM
                                </Typography>
                            </Stack>
                            <Chip label="Open" color="info" size="small" />
                        </Stack>

                        <Divider />

                        <Stack spacing={1}>
                            {[
                                ["4 × Green fee", "248.00"],
                                ["2 × Cart", "44.00"],
                                ["1 × Range bucket", "14.00"],
                            ].map(([label, amount]) => (
                                <Stack key={label} direction="row" sx={{ justifyContent: "space-between" }}>
                                    <Typography variant="body2">{label}</Typography>
                                    <Typography variant="body2" sx={{ fontFamily: fontFamily.mono, fontVariantNumeric: "tabular-nums" }}>
                                        {amount}
                                    </Typography>
                                </Stack>
                            ))}
                        </Stack>

                        <Divider />

                        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                            <Typography variant="subtitle2">Total</Typography>
                            <Typography variant="h5" sx={{ fontFamily: fontFamily.mono, fontVariantNumeric: "tabular-nums" }}>
                                $306.00
                            </Typography>
                        </Stack>

                        <Button fullWidth size="large">
                            Charge $306.00
                        </Button>
                    </Stack>
                </CardContent>
            </Card>
        </Box>
    ),
};
