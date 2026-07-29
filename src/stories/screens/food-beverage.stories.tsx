import { useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { PosShell } from "@/components/app-chrome/pos-shell";
import { OrderPanel, SellActionBar } from "@/components/screens/order-panel";
import { ProductTile } from "@/components/screens/product-grid";
import type { CatalogItem, OrderLine } from "@/data/pos-data";
import { TAX_RATE, catalog, orderSubtotal } from "@/data/pos-data";
import { radius } from "@/theme/tokens";

/**
 * F & B — the snack bar and beverage cart till.
 *
 * Different rhythm from the pro shop: many small items, high tap volume, and a
 * guest waiting at the window. So tiles are denser (160px vs 180px) to fit the
 * full menu without paging, and the destination toggle sits at the top because
 * "where is this going" changes the tax and the runner, and getting it wrong is
 * a remake.
 */
const meta = {
    title: "App Screens/F & B",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const fnbItems = catalog.filter((item) => item.category === "F & B");

const FnbScreen = ({ initial = [] as OrderLine[] }) => {
    const [lines, setLines] = useState<OrderLine[]>(initial);
    const [destination, setDestination] = useState("counter");

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

    const total = orderSubtotal(lines) * (1 + TAX_RATE);

    return (
        <PosShell
            active="fnb"
            orderPanel={<OrderPanel lines={lines} ticketNumber="#4131" guest="Snack bar" guests={1} onQtyChange={changeQty} emptyHint="Tap an item to start an order." />}
            actionBar={<SellActionBar total={total} isDisabled={lines.length === 0} />}
        >
            <Box sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between", mb: 2.5, flexWrap: "wrap", rowGap: 2 }}>
                    <Typography variant="h3">Food &amp; beverage</Typography>
                    <ToggleButtonGroup
                        exclusive
                        value={destination}
                        onChange={(_, next) => next && setDestination(next)}
                        sx={{ gap: 1 }}
                    >
                        {[
                            { value: "counter", label: "Counter" },
                            { value: "cart", label: "Beverage cart" },
                            { value: "turn", label: "Turn shack" },
                        ].map((option) => (
                            <ToggleButton
                                key={option.value}
                                value={option.value}
                                sx={{ minWidth: 150, borderRadius: `${radius.md}px !important`, border: "1px solid !important", borderColor: "divider !important" }}
                            >
                                {option.label}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </Stack>

                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 2 }}>
                    {fnbItems.map((item) => (
                        <ProductTile key={item.id} item={item} onSelect={addItem} />
                    ))}
                </Box>

                <Typography variant="body2" sx={{ color: "text.secondary", mt: 3, maxWidth: 640 }}>
                    Alcohol items would carry an age-check prompt on first add per ticket — a blocking dialog,
                    not a toast, because it is a legal gate rather than a notification.
                </Typography>
            </Box>
        </PosShell>
    );
};

export const Default: Story = {
    render: () => <FnbScreen />,
};

export const WithOrder: Story = {
    name: "With order",
    render: () => (
        <FnbScreen
            initial={[
                { id: "fb-draft", name: "Draft beer", qty: 4, unitPrice: 8 },
                { id: "fb-dog", name: "Hot dog", qty: 2, unitPrice: 6.5 },
                { id: "fb-water", name: "Bottled water", qty: 2, unitPrice: 3 },
            ]}
        />
    ),
};
