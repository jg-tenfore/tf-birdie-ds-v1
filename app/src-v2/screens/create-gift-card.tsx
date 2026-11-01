import { useState } from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { CleanCreate, buyer, recipient } from "@/components/concepts/gift-cards/102226/clean-create";
import { ModeChooser, OptionB } from "@/components/concepts/gift-cards/102226/options";
import { amountOnTap, type GiftCardApi, type GiftCardMode } from "@/components/concepts/gift-cards/102226/gift-card-flow";
import { usd, type GiftCardRecord } from "@/components/concepts/gift-cards/102226/reload-data";
import { giftCardTypes, type GiftCardType } from "@/components/screens/gift-cards/gift-card-data";
import type { DemoCustomer } from "@/components/screens/clinics/demo-customer";
import { LiveOrderPanel, Shell } from "../pos-shell";
import { useActions } from "../store";

/**
 * **Gift cards — V2**, built on Option B from the Oct 22 round.
 *
 * V1's version of this screen is still in `app/src/screens/create-gift-card.tsx`,
 * untouched: one canvas with an unlabelled amount box, `Gift Card FROM ———
 * Golf Course Customer ID 0` crammed above its fields, and a SAVE that is live
 * on an empty form.
 *
 * What changed, and why:
 *
 * - **The entry splits first.** Weston: *"there's gift card, and there's an
 *   option to reload or purchase new, or something like that."* So tapping the
 *   tile asks one question before opening anything, and neither screen can be
 *   mistaken for the other.
 * - **Reload is new functionality.** Find a card by customer or code, pick one
 *   of the several they may hold, add funds. It is a sale, not an adjustment —
 *   *"it'll just be another incoming order that adds value to that card"* — so
 *   it lands in the order and goes through the ordinary tender.
 * - **The create screen is cleaned up**: the amount gets a caption, FROM and TO
 *   become cards with plain headings, `Same as From` stops being a dark button,
 *   the categories get a sentence, and SAVE is dead until there is an amount.
 *
 * Every part of it is the component the **Flows / Gift Cards / 102226**
 * category documents, so the specification and this screen cannot drift.
 */
export const CreateGiftCardScreen = () => {
    const navigate = useNavigate();
    const { addItem } = useActions();

    const [mode, setMode] = useState<GiftCardMode | undefined>(undefined);
    const [amount, setAmount] = useState(0);
    const [typeIndex, setTypeIndex] = useState(0);
    const [from, setFrom] = useState<DemoCustomer | undefined>(undefined);
    const [to, setTo] = useState<DemoCustomer | undefined>(undefined);
    const [query, setQuery] = useState("");
    const [card, setCard] = useState<GiftCardRecord | undefined>(undefined);
    const [reload, setReload] = useState(100);

    const type: GiftCardType = giftCardTypes[typeIndex];
    const ready = mode === "new" ? amount > 0 : Boolean(card) && reload > 0;

    /** The shape the shared components expect, over this screen's own state. */
    const api: GiftCardApi = {
        mode: mode ?? "new",
        setMode: (next) => setMode(next),
        amount,
        setAmount,
        type,
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
        ready,
        commit: () => undefined,
    };

    /**
     * Both paths end the same way: a line in the order, paid for as usual.
     *
     * `taxable: false` on both. A gift card is stored value rather than a sale
     * — the tax lands when the card is spent — and a reload is the same money
     * arriving by a different door. The reference device agrees: its gift card
     * ticket prints SubTotal $200.00 and Grand Total $200.00.
     *
     * The ids are derived from the thing itself rather than the clock, because
     * the store bumps the quantity when an id repeats — so selling two $100
     * cards reads as one line of two, which is what a counter would expect.
     */
    const save = () => {
        if (mode === "new") {
            addItem({ id: `gc-${type}-${amount}`, name: `Gift Card — ${type}`, price: amount, taxable: false }, "Pro Shop");
        } else if (card) {
            addItem(
                { id: `rl-${card.code}-${reload}`, name: `Gift Card reload — ${card.code}`, price: reload, taxable: false },
                "Pro Shop",
            );
        }

        navigate("/proshop");
    };

    const title = mode === undefined ? "Gift Cards" : mode === "new" ? "Create a Gift Card" : "Reload a Gift Card";

    return (
        <Shell
            title={title}
            active="proshop"
            orderPanel={<LiveOrderPanel />}
            actionBar={
                <>
                    <ActionButton
                        icon={<ChevronLeftIcon />}
                        onClick={() => (mode === undefined ? navigate("/proshop") : setMode(undefined))}
                    >
                        Back
                    </ActionButton>
                    {mode !== undefined && (
                        <ActionButton tone="primary" disabled={!ready} onClick={ready ? save : undefined}>
                            {mode === "new" ? (amount > 0 ? `Save · ${usd(amount)}` : "Save") : card ? `Add ${usd(reload)}` : "Add Funds"}
                        </ActionButton>
                    )}
                </>
            }
        >
            {/* The question first, then the screen it chose. */}
            {mode === undefined ? (
                <ModeChooser onPick={setMode} />
            ) : mode === "new" ? (
                <CleanCreate
                    amount={amount}
                    onAmount={() => setAmount(amountOnTap)}
                    type={type}
                    onType={api.cycleType}
                    from={from}
                    to={to}
                    onFindFrom={api.findFrom}
                    onFindTo={api.findTo}
                    onSameAsFrom={api.sameAsFrom}
                />
            ) : (
                <OptionB api={api} />
            )}
        </Shell>
    );
};
