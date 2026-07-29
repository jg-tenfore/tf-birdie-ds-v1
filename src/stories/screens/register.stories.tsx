import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { PosShell } from "@/components/app-chrome/pos-shell";
import { OrderPanel, SellActionBar } from "@/components/screens/order-panel";
import { ProductGrid } from "@/components/screens/product-grid";
import type { CatalogItem, OrderLine } from "@/data/pos-data";
import { TAX_RATE, catalogCategories, currentOrder, orderSubtotal } from "@/data/pos-data";

/**
 * Register — the core loop, and the screen the whole system is shaped around.
 *
 * Three regions, always in the same place: catalog on the left, ticket on the
 * right, commit at the bottom. An operator learns those positions in a shift and
 * then stops looking at them, which is the entire goal.
 */
const meta = {
    title: "App Screens/Register",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Live ring-up so tapping tiles actually builds a ticket. */
const LiveRegister = ({ initial = currentOrder }: { initial?: OrderLine[] }) => {
    const [lines, setLines] = useState<OrderLine[]>(initial);

    const addItem = (item: CatalogItem) =>
        setLines((current) => {
            const existing = current.find((line) => line.id === item.id);
            if (existing) {
                return current.map((line) => (line.id === item.id ? { ...line, qty: line.qty + 1 } : line));
            }
            return [...current, { id: item.id, name: item.name, qty: 1, unitPrice: item.price, note: item.note }];
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
            active="register"
            orderPanel={<OrderPanel lines={lines} onQtyChange={changeQty} />}
            actionBar={<SellActionBar total={total} isDisabled={lines.length === 0} />}
        >
            <ProductGrid categories={catalogCategories} onSelect={addItem} />
        </PosShell>
    );
};

/** A ticket mid-build — four green fees, two carts, a range bucket. */
export const Default: Story = {
    render: () => <LiveRegister />,
};

/**
 * The state the register spends most of its day in. Worth checking that the
 * empty panel reads as "ready" rather than "broken" — and that Charge is
 * disabled rather than absent, so the layout doesn't shift when it activates.
 */
export const EmptyTicket: Story = {
    name: "Empty ticket",
    render: () => <LiveRegister initial={[]} />,
};

/** Offline: card tender is unavailable but the register keeps selling. */
export const Offline: Story = {
    render: () => (
        <PosShell
            active="register"
            connection="offline"
            orderPanel={<OrderPanel lines={currentOrder} />}
            actionBar={<SellActionBar total={orderSubtotal(currentOrder) * (1 + TAX_RATE)} />}
        >
            <ProductGrid categories={catalogCategories} />
        </PosShell>
    ),
};

/** A member is attached, so the ticket can go to a house account. */
export const MemberAttached: Story = {
    name: "Member attached",
    render: () => (
        <PosShell
            active="register"
            orderPanel={<OrderPanel lines={currentOrder} guest="Morgan Vale" memberTier="Founders" />}
            actionBar={<SellActionBar total={orderSubtotal(currentOrder) * (1 + TAX_RATE)} />}
        >
            <ProductGrid categories={catalogCategories} />
        </PosShell>
    ),
};
