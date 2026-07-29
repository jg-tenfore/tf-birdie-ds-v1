import { useState } from "react";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import SearchIcon from "@mui/icons-material/Search";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { PosShell } from "@/components/app-chrome/pos-shell";
import { OrderPanel, SellActionBar } from "@/components/screens/order-panel";
import { ProductTile } from "@/components/screens/product-grid";
import type { CatalogItem, OrderLine } from "@/data/pos-data";
import { TAX_RATE, catalog, orderSubtotal } from "@/data/pos-data";
import { touchTarget } from "@/theme/tokens";

/**
 * Pro shop — retail, where the barcode scanner is the primary input and the
 * grid is the fallback.
 *
 * That inversion drives the layout: the scan field is focused by default and
 * sits at the top-left where the scanner wedge types into it, and the filter
 * pills below are for the times the barcode is missing or the tag is gone.
 */
const meta = {
    title: "App Screens/Pro Shop",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const shopItems = catalog.filter((item) => item.category === "Pro shop" || item.category === "Rental");

const ProShopScreen = ({ initial = [] as OrderLine[] }) => {
    const [lines, setLines] = useState<OrderLine[]>(initial);

    const addItem = (item: CatalogItem) =>
        setLines((current) => {
            const existing = current.find((line) => line.id === item.id);
            if (existing) return current.map((line) => (line.id === item.id ? { ...line, qty: line.qty + 1 } : line));
            return [...current, { id: item.id, name: item.name, qty: 1, unitPrice: item.price }];
        });

    const changeQty = (id: string, delta: number) =>
        setLines((current) =>
            current.flatMap((line) => {
                if (line.id !== id) return [line];
                const qty = line.qty + delta;
                return qty <= 0 ? [] : [{ ...line, qty }];
            }),
        );

    return (
        <PosShell
            active="proshop"
            orderPanel={<OrderPanel lines={lines} ticketNumber="#4128" guest="Walk-up" guests={1} onQtyChange={changeQty} emptyHint="Scan a barcode or tap an item." />}
            actionBar={<SellActionBar total={orderSubtotal(lines) * (1 + TAX_RATE)} isDisabled={lines.length === 0} />}
        >
            <Box sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between", mb: 2.5, flexWrap: "wrap", rowGap: 2 }}>
                    <Typography variant="h3">Pro shop</Typography>
                    <TextField
                        autoFocus
                        placeholder="Scan barcode or search"
                        sx={{ width: 420 }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <QrCodeScannerIcon />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <SearchIcon sx={{ color: "text.disabled" }} />
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </Stack>

                <Stack direction="row" spacing={1.5} sx={{ mb: 2.5, flexWrap: "wrap", rowGap: 1.5 }}>
                    {["All", "Balls", "Apparel", "Accessories", "Rentals", "Clubs"].map((filter, i) => (
                        <Chip
                            key={filter}
                            label={filter}
                            color={i === 0 ? "primary" : "default"}
                            onClick={() => {}}
                            sx={{ minHeight: touchTarget.min, px: 1 }}
                        />
                    ))}
                </Stack>

                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 2 }}>
                    {shopItems.map((item) => (
                        <ProductTile key={item.id} item={item} onSelect={addItem} />
                    ))}
                </Box>
            </Box>
        </PosShell>
    );
};

export const Default: Story = {
    render: () => <ProShopScreen />,
};

export const WithOrder: Story = {
    name: "With order",
    render: () => (
        <ProShopScreen
            initial={[
                { id: "ps-prov1", name: "Pro V1 — dozen", qty: 2, unitPrice: 54.99 },
                { id: "ps-glove", name: "Glove", qty: 1, unitPrice: 24 },
                { id: "ps-cap", name: "Sagamore cap", qty: 1, unitPrice: 32 },
            ]}
        />
    ),
};
