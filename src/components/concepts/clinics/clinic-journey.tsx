import { useState, type ReactNode } from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { OrderLineRow, OrderPanel, OrderPanelEmpty, type OrderLineItem } from "@/components/app-chrome/order-panel";
import { CheckoutBody } from "@/components/screens/checkout/checkout-panes";
import { OrderComplete } from "@/components/screens/checkout/order-complete";
import { clinicReceiptEmail, girlsSummerCamp } from "@/components/screens/clinics/clinic-data";
import { ProShopCatalog } from "@/components/screens/pro-shop/pro-shop-catalog";
import { ProShopActions } from "@/components/screens/pro-shop/pro-shop-order-parts";

/**
 * **Selling a clinic, start to finish.**
 *
 * The chrome either side of the two screens under review: the Pro Shop grid you
 * arrive from, and the order, payment and receipt you leave through. Only the
 * clinic list and the session picker change between versions, so those two are
 * render props and everything else is shared.
 *
 * Running it is the only way to judge the thing a single screen cannot show:
 * **how late the price and the roster arrive.** In the shipping flow the first
 * figure of any kind appears after SAVE, five screens in.
 */

/** The device's rates, derived from its own ticket: $67.41 → $5.55 tax, $2.01 fees. */
export const clinicTotalsFor = (subtotal: number) => {
    const tax = Number((subtotal * 0.0824).toFixed(2));
    const fees = Number((subtotal * 0.0298).toFixed(2));
    return { subtotal, tax, fees, total: Number((subtotal + tax + fees).toFixed(2)) };
};

const usd = (value: number) => `$${value.toFixed(2)}`;

export interface ClinicSessionsApi {
    selected: string[];
    toggle: (label: string) => void;
    selectAll: () => void;
    /** Which step of the booking screen is showing, for the stepped versions. */
    step: number;
    next: () => void;
    back: () => void;
}

export interface ClinicJourneyProps {
    /** The clinic list screen for this version. */
    renderList: (api: { open: () => void }) => ReactNode;
    /** The session picker for this version. */
    renderSessions: (api: ClinicSessionsApi) => ReactNode;
    /** The order lines a booking produces. */
    linesFor: (selected: string[]) => OrderLineItem[];
    /**
     * The shipping flow keeps the empty order panel on both clinic screens;
     * every Oct 20 version drops it, which is Weston's note.
     */
    showOrderPanel?: boolean;
    /** Every session that can still be booked — what SELECT ALL reaches. */
    selectableSessions: string[];
    /** The label on the commit button, which the versions put a price on. */
    saveLabel?: (selected: string[]) => string;
    /**
     * How many steps the booking screen has. B and C split it in two — dates
     * and guest — so the action bar shows NEXT until the last one.
     */
    sessionSteps?: number;
    /** Whether the step in hand is finished enough to move on. */
    canAdvance?: (step: number, selected: string[]) => boolean;
    /** The label for each step's forward button. Defaults to NEXT. */
    nextLabel?: (step: number) => string;
}

export const ClinicJourney = ({
    renderList,
    renderSessions,
    linesFor,
    showOrderPanel = false,
    selectableSessions,
    saveLabel,
    sessionSteps = 1,
    canAdvance,
    nextLabel,
}: ClinicJourneyProps) => {
    const [stage, setStage] = useState<"proshop" | "list" | "sessions" | "order" | "payment" | "complete">("proshop");
    const [selected, setSelected] = useState<string[]>([]);
    const [step, setStep] = useState(0);
    /** What was booked, held separately so the picker can be reopened. */
    const [booked, setBooked] = useState<string[]>([]);

    const lines = linesFor(booked);
    const subtotal = lines.reduce((sum, line) => sum + Number(line.price.replace(/[^0-9.]/g, "")) * line.qty, 0);
    const totals = clinicTotalsFor(Number(subtotal.toFixed(2)));

    const reset = () => {
        setSelected([]);
        setBooked([]);
        setStep(0);
        setStage("proshop");
    };

    const clinicPanel = showOrderPanel ? (
        <OrderPanel>
            {booked.length === 0 ? <OrderPanelEmpty /> : lines.map((line) => <OrderLineRow key={line.id} line={line} />)}
        </OrderPanel>
    ) : undefined;

    if (stage === "proshop" || stage === "order") {
        const hasOrder = booked.length > 0;

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
                        payLabel={hasOrder ? `Pay ${usd(totals.total)}` : "Pay $0.00"}
                        payEnabled={hasOrder}
                        onPay={hasOrder ? () => setStage("payment") : undefined}
                    />
                }
            >
                {/* The way in: the Clinics tile, like any other category. */}
                <ProShopCatalog onSelect={(label) => label === "Clinics" && setStage("list")} />
            </AppShell>
        );
    }

    if (stage === "list") {
        return (
            <AppShell
                title="Clinics"
                active="proshop"
                orderPanel={clinicPanel}
                actionBar={
                    <ActionButton icon={<ChevronLeftIcon />} onClick={() => setStage("proshop")}>
                        BACK
                    </ActionButton>
                }
            >
                {renderList({ open: () => setStage("sessions") })}
            </AppShell>
        );
    }

    if (stage === "sessions") {
        const lastStep = step >= sessionSteps - 1;
        const ready = canAdvance ? canAdvance(step, selected) : selected.length > 0;

        return (
            <AppShell
                title={girlsSummerCamp.name}
                active="proshop"
                orderPanel={clinicPanel}
                actionBar={
                    <>
                        <ActionButton
                            icon={<ChevronLeftIcon />}
                            onClick={() => {
                                if (step > 0) setStep(step - 1);
                                else setStage("list");
                            }}
                        >
                            BACK
                        </ActionButton>
                        <ActionButton
                            tone="primary"
                            // Genuinely unavailable, not merely painted grey:
                            // a step that cannot be left should not be
                            // clickable or reachable by a screen reader.
                            disabled={!ready}
                            onClick={
                                !ready
                                    ? undefined
                                    : lastStep
                                      ? () => {
                                            setBooked(selected);
                                            setStage("order");
                                        }
                                      : () => setStep(step + 1)
                            }
                        >
                            {lastStep ? (saveLabel ? saveLabel(selected) : "SAVE") : nextLabel ? nextLabel(step) : "NEXT"}
                        </ActionButton>
                    </>
                }
            >
                {renderSessions({
                    selected,
                    toggle: (label) => setSelected((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label])),
                    selectAll: () => setSelected(selectableSessions),
                    step,
                    next: () => setStep((prev) => Math.min(prev + 1, sessionSteps - 1)),
                    back: () => setStep((prev) => Math.max(prev - 1, 0)),
                })}
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
                    amount={usd(totals.total)}
                    lines={lines.map((line) => ({
                        id: line.id,
                        name: line.name,
                        qty: line.qty,
                        unitPrice: Number(line.price.replace(/[^0-9.]/g, "")),
                    }))}
                    customer="Justin Girard"
                    points={0}
                    subtotal={totals.subtotal}
                    tax={totals.tax}
                    total={totals.total}
                    payments={0}
                />
            </AppShell>
        );
    }

    return (
        <OrderComplete
            sale={{
                facility: "The Dunes of Delgado PROD",
                orderNumber: "6655771",
                lines: lines.map((line) => ({
                    id: line.id,
                    name: girlsSummerCamp.name,
                    qty: line.qty,
                    total: Number(line.price.replace(/[^0-9.]/g, "")),
                })),
                tender: "Cash",
                paid: totals.total,
                cash: totals.total,
                change: 0,
                subtotal: totals.subtotal,
                tax: Number((totals.tax + totals.fees).toFixed(2)),
                total: totals.total,
            }}
            email={clinicReceiptEmail}
            onExit={reset}
        />
    );
};

export default ClinicJourney;
