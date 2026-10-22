import { useState, type ReactNode } from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { OrderLineRow, OrderPanel, OrderPanelEmpty, type OrderLineItem } from "@/components/app-chrome/order-panel";
import { CheckoutBody } from "@/components/screens/checkout/checkout-panes";
import { OrderComplete } from "@/components/screens/checkout/order-complete";
import { giftCardAmount, giftCardTypes, type GiftCardType } from "@/components/screens/gift-cards/gift-card-data";
import { ProShopCatalog } from "@/components/screens/pro-shop/pro-shop-catalog";
import { ProShopActions } from "@/components/screens/pro-shop/pro-shop-order-parts";
import { buyer, recipient } from "./clean-create";
import { usd, type GiftCardRecord } from "./reload-data";
import type { DemoCustomer } from "@/components/screens/clinics/demo-customer";

/**
 * **Selling and reloading gift cards, start to finish.**
 *
 * The chrome either side of whatever the version puts in the middle. Two
 * things it settles, both Weston's:
 *
 * **The rail stays**, here as in clinics — *"let's add the rail back then, to
 * keep it consistent."*
 *
 * **A reload is a sale, not an adjustment.** *"It'll just be another incoming
 * order that adds value to that card."* So it lands in the cart and goes
 * through the same tender as everything else; the balance moves because money
 * moved, which is the whole reason it is not an editable number on a record.
 */

export type GiftCardMode = "new" | "reload";

export interface GiftCardApi {
    mode: GiftCardMode;
    setMode: (mode: GiftCardMode) => void;
    /* the new-card draft */
    amount: number;
    setAmount: (value: number) => void;
    type: GiftCardType;
    cycleType: () => void;
    from?: DemoCustomer;
    to?: DemoCustomer;
    findFrom: () => void;
    findTo: () => void;
    sameAsFrom: () => void;
    /* the reload draft */
    query: string;
    setQuery: (value: string) => void;
    card?: GiftCardRecord;
    setCard: (card: GiftCardRecord) => void;
    reload: number;
    setReload: (value: number) => void;
    /** Drops the finished thing in the cart and returns to the grid. */
    commit: () => void;
    ready: boolean;
}

export interface GiftCardFlowProps {
    render: (api: GiftCardApi) => ReactNode;
    title?: (api: GiftCardApi) => string;
    saveLabel?: (api: GiftCardApi) => string;
    /** Opens straight into the middle, for the single-screen stories. */
    startInside?: boolean;
    startMode?: GiftCardMode;
}

export const GiftCardFlow = ({ render, title, saveLabel, startInside = false, startMode = "new" }: GiftCardFlowProps) => {
    const [stage, setStage] = useState<"proshop" | "working" | "payment" | "complete">(startInside ? "working" : "proshop");
    const [mode, setMode] = useState<GiftCardMode>(startMode);
    const [amount, setAmount] = useState(0);
    const [typeIndex, setTypeIndex] = useState(0);
    const [from, setFrom] = useState<DemoCustomer | undefined>(undefined);
    const [to, setTo] = useState<DemoCustomer | undefined>(undefined);
    const [query, setQuery] = useState("");
    const [card, setCard] = useState<GiftCardRecord | undefined>(undefined);
    const [reload, setReload] = useState(100);
    const [cart, setCart] = useState<OrderLineItem[]>([]);

    /* A gift card is not taxed — the device's ticket prints one figure twice. */
    const total = cart.reduce((sum, line) => sum + Number(line.price.replace(/[^0-9.]/g, "")) * line.qty, 0);

    const api: GiftCardApi = {
        mode,
        setMode,
        amount,
        setAmount,
        type: giftCardTypes[typeIndex],
        cycleType: () => setTypeIndex((prev) => (prev + 1) % giftCardTypes.length),
        from,
        to,
        findFrom: () => setFrom(buyer()),
        findTo: () => setTo(recipient()),
        sameAsFrom: () => from && setTo(from),
        query,
        setQuery: (value) => {
            setQuery(value);
            setCard(undefined);
        },
        card,
        setCard,
        reload,
        setReload,
        ready: mode === "new" ? amount > 0 : Boolean(card) && reload > 0,
        commit: () => {
            const line =
                mode === "new"
                    ? { id: `gc-${cart.length}`, name: "Gift Card", qty: 1, price: usd(amount) }
                    : {
                          id: `rl-${cart.length}`,
                          name: `Gift Card reload — ${card?.code}`,
                          qty: 1,
                          price: usd(reload),
                          note: `${card?.holder.first} ${card?.holder.last} · ${usd(card?.balance ?? 0)} → ${usd((card?.balance ?? 0) + reload)}`,
                      };

            setCart((prev) => [...prev, line]);
            setAmount(0);
            setFrom(undefined);
            setTo(undefined);
            setQuery("");
            setCard(undefined);
            setReload(100);
            setStage("proshop");
        },
    };

    const reset = () => {
        setCart([]);
        setMode(startMode);
        setAmount(0);
        setFrom(undefined);
        setTo(undefined);
        setQuery("");
        setCard(undefined);
        setReload(100);
        setStage("proshop");
    };

    /** The rail, on every screen with a canvas. */
    const cartPanel = (
        <OrderPanel>{cart.length > 0 ? cart.map((line) => <OrderLineRow key={line.id} line={line} />) : <OrderPanelEmpty />}</OrderPanel>
    );

    if (stage === "proshop") {
        const hasOrder = cart.length > 0;

        return (
            <AppShell
                title="Pro Shop Order"
                active="proshop"
                showCart
                orderPanel={cartPanel}
                actionBar={
                    <ProShopActions
                        payLabel={`Pay ${usd(hasOrder ? total : 0)}`}
                        payEnabled={hasOrder}
                        onPay={hasOrder ? () => setStage("payment") : undefined}
                    />
                }
            >
                <ProShopCatalog
                    onSelect={(label) => {
                        if (label !== "Gift Card") return;
                        setMode(startMode);
                        setStage("working");
                    }}
                />
            </AppShell>
        );
    }

    if (stage === "working") {
        return (
            <AppShell
                title={title ? title(api) : "Create a Gift Card"}
                active="proshop"
                orderPanel={cartPanel}
                actionBar={
                    <>
                        <ActionButton icon={<ChevronLeftIcon />} onClick={() => setStage("proshop")}>
                            BACK
                        </ActionButton>
                        {/* Unlike the shipping screen, SAVE is not live until
                            there is something to save. */}
                        <ActionButton tone="primary" disabled={!api.ready} onClick={api.ready ? api.commit : undefined}>
                            {saveLabel ? saveLabel(api) : "SAVE"}
                        </ActionButton>
                    </>
                }
            >
                {render(api)}
            </AppShell>
        );
    }

    if (stage === "payment") {
        return (
            <AppShell
                title="Credit Card Payment"
                active="proshop"
                accountLabel=""
                showLogOut={false}
                actionBar={
                    <>
                        <ActionButton icon={<ChevronLeftIcon />} iconEdge="right" onClick={() => setStage("proshop")}>
                            PRO SHOP
                        </ActionButton>
                        <ActionButton>JUSTIN GIRARD</ActionButton>
                        <ActionButton>ORDER NOTES</ActionButton>
                        <ActionButton tone="primary" onClick={() => setStage("complete")}>
                            AUTHORIZE CARD
                        </ActionButton>
                    </>
                }
            >
                <CheckoutBody
                    tab="CREDIT"
                    amount={usd(total)}
                    lines={cart.map((line) => ({
                        id: line.id,
                        name: line.name,
                        qty: line.qty,
                        unitPrice: Number(line.price.replace(/[^0-9.]/g, "")),
                    }))}
                    customer="Justin Girard"
                    points={0}
                    subtotal={total}
                    tax={0}
                    total={total}
                    payments={0}
                />
            </AppShell>
        );
    }

    return (
        <OrderComplete
            sale={{
                facility: "The Dunes of Delgado PROD",
                orderNumber: "6655947",
                lines: cart.map((line) => ({
                    id: line.id,
                    name: line.name,
                    qty: line.qty,
                    total: Number(line.price.replace(/[^0-9.]/g, "")),
                })),
                tender: "Credit",
                paid: total,
                cash: total,
                change: 0,
                subtotal: total,
                tax: 0,
                total,
            }}
            email={(api.to ?? api.from)?.email ?? "hello@girardjustin.com"}
            onExit={reset}
        />
    );
};

/** What the amount box fills with when it is tapped. */
export const amountOnTap = Number(giftCardAmount);

export default GiftCardFlow;
