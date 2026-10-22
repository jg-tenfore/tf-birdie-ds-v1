import { useState } from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { OrderLineRow, OrderPanel, OrderPanelEmpty } from "@/components/app-chrome/order-panel";
import { CheckoutBody } from "@/components/screens/checkout/checkout-panes";
import { OrderComplete } from "@/components/screens/checkout/order-complete";
import {
    fromSearchResults,
    giftCardAmount,
    giftCardFrom,
    giftCardTo,
    giftCardTypes,
    toSearchResults,
    type GiftCardParty,
    type GiftCardType,
} from "@/components/screens/gift-cards/gift-card-data";
import { CreateGiftCard, UpcDialog } from "@/components/screens/gift-cards/gift-card-screens";
import { ProShopCatalog } from "@/components/screens/pro-shop/pro-shop-catalog";
import { ProShopActions } from "@/components/screens/pro-shop/pro-shop-order-parts";

/**
 * **Selling a gift card, start to finish — as it ships.**
 *
 * Transcribed from `references/102226/giftCards/`. The Pro Shop grid, the one
 * screen that does the whole job, the UPC dialog SAVE opens, the order, the
 * tender screen and the receipt.
 *
 * Running it is the only way to see the two things a screenshot cannot:
 *
 * **The searches are the work.** Eight fields, two of them hiding a sheet of
 * near-identical records, and nothing on screen says which combination attaches
 * a customer. Tapping a field here stands in for typing and raises the sheet
 * the device raised.
 *
 * **The dialog arrives after the work, not before it.** SAVE is the first
 * moment anyone learns the optional barcode had a consequence.
 */

export const GiftCardJourney = ({ startType = giftCardTypes[0] }: { startType?: GiftCardType }) => {
    const [stage, setStage] = useState<"proshop" | "create" | "order" | "payment" | "complete">("proshop");
    const [type, setType] = useState<GiftCardType>(startType);
    const [amount, setAmount] = useState<string>("");
    const [amountFocused, setAmountFocused] = useState(false);
    const [from, setFrom] = useState<GiftCardParty | undefined>(undefined);
    const [to, setTo] = useState<GiftCardParty | undefined>(undefined);
    const [activeField, setActiveField] = useState<string | undefined>(undefined);
    const [results, setResults] = useState<{ field: string; items: typeof fromSearchResults } | undefined>(undefined);
    const [dialog, setDialog] = useState(false);
    const [sold, setSold] = useState(false);

    /* The type is a reporting tag, not a behaviour switch: all three sell. */
    const faceValue = Number(amount || 0);
    const lines = sold ? [{ id: "gift-card", name: "Gift Card", qty: 1, price: `$${faceValue.toFixed(2)}` }] : [];
    /* A gift card is not taxed — the device's ticket prints one figure twice. */
    const total = faceValue;

    const reset = () => {
        setStage("proshop");
        setType(startType);
        setAmount("");
        setAmountFocused(false);
        setFrom(undefined);
        setTo(undefined);
        setActiveField(undefined);
        setResults(undefined);
        setDialog(false);
        setSold(false);
    };

    /** Tapping a field stands in for typing into it. */
    const openField = (field: string) => {
        setActiveField(field);
        setAmountFocused(false);

        if (field.startsWith("from") && !from) setResults({ field, items: fromSearchResults });
        else if (field.startsWith("to") && !to) setResults({ field, items: toSearchResults });
        else setResults(undefined);
    };

    const pick = () => {
        if (activeField?.startsWith("from")) setFrom(giftCardFrom);
        else setTo(giftCardTo);

        setResults(undefined);
        setActiveField(undefined);
    };

    if (stage === "proshop" || stage === "order") {
        const hasOrder = lines.length > 0;

        return (
            <AppShell
                title="Pro Shop Order"
                active="proshop"
                showCart
                orderPanel={
                    <OrderPanel>
                        {hasOrder ? lines.map((line) => <OrderLineRow key={line.id} line={line} />) : <OrderPanelEmpty />}
                    </OrderPanel>
                }
                actionBar={
                    <ProShopActions
                        payLabel={`Pay $${total.toFixed(2)}`}
                        payEnabled={hasOrder}
                        onPay={hasOrder ? () => setStage("payment") : undefined}
                    />
                }
            >
                <ProShopCatalog onSelect={(label) => label === "Gift Card" && setStage("create")} />
            </AppShell>
        );
    }

    if (stage === "create") {
        return (
            <AppShell
                title="Create a Gift Card"
                active="proshop"
                orderPanel={
                    <OrderPanel>
                        <OrderPanelEmpty />
                    </OrderPanel>
                }
                overlay={
                    dialog ? (
                        <UpcDialog
                            onCancel={() => setDialog(false)}
                            onConfirm={() => {
                                setDialog(false);
                                setSold(true);
                                setStage("order");
                            }}
                        />
                    ) : undefined
                }
                actionBar={
                    <>
                        <ActionButton icon={<ChevronLeftIcon />} onClick={() => setStage("proshop")}>
                            BACK
                        </ActionButton>
                        {/* SAVE is live from the first frame: no amount, no
                            customer, nothing stops it. The only gate the screen
                            has is a dialog about a field it called optional. */}
                        <ActionButton tone="primary" onClick={() => setDialog(true)}>
                            SAVE
                        </ActionButton>
                    </>
                }
            >
                <CreateGiftCard
                    amount={amount}
                    amountFocused={amountFocused}
                    type={type}
                    from={from}
                    to={to}
                    results={results}
                    activeField={activeField}
                    showToErrors={Boolean(from) && !to}
                    onAmount={() => {
                        setAmountFocused(true);
                        setActiveField(undefined);
                        setResults(undefined);
                        setAmount(giftCardAmount);
                    }}
                    onType={setType}
                    onField={openField}
                    onPick={pick}
                    onSameAsFrom={() => from && setTo({ ...from, accountName: from.accountName })}
                />
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
                        <ActionButton icon={<ChevronLeftIcon />} iconEdge="right" onClick={() => setStage("order")}>
                            PRO SHOP
                        </ActionButton>
                        <ActionButton>{(from ?? giftCardFrom).accountName.toUpperCase()}</ActionButton>
                        <ActionButton>ORDER NOTES</ActionButton>
                        <ActionButton tone="primary" onClick={() => setStage("complete")}>
                            AUTHORIZE CARD
                        </ActionButton>
                    </>
                }
            >
                <CheckoutBody
                    tab="CREDIT"
                    amount={`$${total.toFixed(2)}`}
                    lines={lines.map((line) => ({ id: line.id, name: line.name, qty: line.qty, unitPrice: faceValue }))}
                    customer={(from ?? giftCardFrom).accountName}
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
                orderNumber: "6655814",
                lines: lines.map((line) => ({ id: line.id, name: line.name, qty: line.qty, total: faceValue })),
                tender: "Credit",
                paid: total,
                cash: total,
                change: 0,
                subtotal: total,
                tax: 0,
                total,
            }}
            email={(to ?? giftCardTo).email}
            onExit={reset}
        />
    );
};

export default GiftCardJourney;
