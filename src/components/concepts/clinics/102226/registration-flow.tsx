import { useState, type ReactNode } from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { OrderLineRow, OrderPanel, OrderPanelEmpty, type OrderLineItem } from "@/components/app-chrome/order-panel";
import { CheckoutBody } from "@/components/screens/checkout/checkout-panes";
import { OrderComplete } from "@/components/screens/checkout/order-complete";
import { clinicReceiptEmail } from "@/components/screens/clinics/clinic-data";
import { ProShopCatalog } from "@/components/screens/pro-shop/pro-shop-catalog";
import { ProShopActions } from "@/components/screens/pro-shop/pro-shop-order-parts";
import { usd } from "../102126/clinic-catalog";
import {
    copyBookings,
    emptyRegistration,
    findCustomer,
    playerName,
    registrationLines,
    registrationTotals,
    toggleClinic,
    toggleDate,
    type Registration,
} from "./registration";

/**
 * **One registration, start to finish.**
 *
 * The chrome either side of the steps under review: the Pro Shop grid you
 * arrive from, and the order, payment and receipt you leave through. Only the
 * middle changes between the three versions, so that is a render prop.
 *
 * Two things this shell settles, both of them Weston's:
 *
 * **The rail stays.** *"Let's add the rail back then. To keep it consistent."*
 * It is on every screen of the registration, so a family being signed up for
 * nine dates never hides what was already in the order.
 *
 * **It ends at the cart, not the card.** *"Adding it to the cart and not
 * skipping gives us the most flexibility… is there that 10% where the course
 * comes and complains because they needed to add a dozen golf balls and now
 * it's two transactions?"*
 */

/** The device's own rates, read off its ticket. */
export const totalsFor = (subtotal: number) => {
    const tax = Number((subtotal * 0.0824).toFixed(2));
    const fees = Number((subtotal * 0.0298).toFixed(2));

    return { subtotal, tax, fees, total: Number((subtotal + tax + fees).toFixed(2)) };
};

export interface RegistrationApi {
    registration: Registration;
    /** Which step of the registration is showing. */
    step: number;
    /** Which player the per-player steps are about. */
    playerIndex: number;
    setStep: (step: number) => void;
    setPlayerIndex: (index: number) => void;
    setCount: (count: number) => void;
    findPlayer: (index: number) => void;
    toggleClinicFor: (playerId: string, clinicId: string) => void;
    toggleDateFor: (playerId: string, clinicId: string, label: string) => void;
    copyFrom: (fromIndex: number, toIndex: number) => void;
    commit: () => void;
}

export interface RegistrationFlowProps {
    /** The steps under review for this version. */
    render: (api: RegistrationApi) => ReactNode;
    /** How many steps this version has, given where it is. */
    stepCount: (api: RegistrationApi) => number;
    /** Whether the step in hand is finished enough to move on. */
    canAdvance: (api: RegistrationApi) => boolean;
    /** The label on the forward button. */
    nextLabel?: (api: RegistrationApi) => string;
    /** What the title bar says. */
    title?: (api: RegistrationApi) => string;
    /** Called instead of the default forward move, when a version needs it. */
    onNext?: (api: RegistrationApi) => boolean;
    /** Called instead of the default back move. */
    onBack?: (api: RegistrationApi) => boolean;
    /**
     * A registration to open on, for the single-screen stories. Without it the
     * run starts empty on the Pro Shop grid, which is how the flow really
     * begins.
     */
    seed?: Registration;
    /** Which step that seeded registration opens on. */
    startStep?: number;
}

export const RegistrationFlow = ({
    render,
    stepCount,
    canAdvance,
    nextLabel,
    title,
    onNext,
    onBack,
    seed,
    startStep = 0,
}: RegistrationFlowProps) => {
    const [stage, setStage] = useState<"proshop" | "register" | "payment" | "complete">(seed ? "register" : "proshop");
    const [registration, setRegistration] = useState<Registration>(() => seed ?? emptyRegistration(1));
    const [step, setStep] = useState(startStep);
    const [playerIndex, setPlayerIndex] = useState(0);
    const [cart, setCart] = useState<OrderLineItem[]>([]);

    const subtotal = cart.reduce((sum, line) => sum + Number(line.price.replace(/[^0-9.]/g, "")) * line.qty, 0);
    const totals = totalsFor(Number(subtotal.toFixed(2)));

    const api: RegistrationApi = {
        registration,
        step,
        playerIndex,
        setStep,
        setPlayerIndex,
        setCount: (count) =>
            setRegistration((prev) => {
                const players = emptyRegistration(count).players.map((player, index) => prev.players[index] ?? player);

                // Dropping a player drops their bookings with them, so the
                // capacity count never holds a seat for somebody who left.
                const kept = Object.fromEntries(players.map((player) => [player.id, prev.bookings[player.id] ?? []]));

                return { players, bookings: kept };
            }),
        findPlayer: (index) =>
            setRegistration((prev) => ({
                ...prev,
                players: prev.players.map((player, i) => (i === index ? { ...player, customer: findCustomer(index) } : player)),
            })),
        toggleClinicFor: (playerId, clinicId) => setRegistration((prev) => toggleClinic(prev, playerId, clinicId)),
        toggleDateFor: (playerId, clinicId, label) => setRegistration((prev) => toggleDate(prev, playerId, clinicId, label)),
        copyFrom: (fromIndex, toIndex) =>
            setRegistration((prev) => copyBookings(prev, prev.players[fromIndex].id, prev.players[toIndex].id)),
        commit: () => {
            setCart((prev) => [...prev, ...registrationLines(registration)]);
            setRegistration(emptyRegistration(1));
            setStep(0);
            setPlayerIndex(0);
            setStage("proshop");
        },
    };

    const reset = () => {
        setCart([]);
        setRegistration(emptyRegistration(1));
        setStep(0);
        setPlayerIndex(0);
        setStage("proshop");
    };

    /** The rail Weston asked to put back, on every screen that has a canvas. */
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
                        payLabel={hasOrder ? `Pay ${usd(totals.total)}` : "Pay $0.00"}
                        payEnabled={hasOrder}
                        onPay={hasOrder ? () => setStage("payment") : undefined}
                    />
                }
            >
                <ProShopCatalog
                    onSelect={(label) => {
                        if (label !== "Clinics") return;
                        setRegistration(emptyRegistration(1));
                        setStep(0);
                        setPlayerIndex(0);
                        setStage("register");
                    }}
                />
            </AppShell>
        );
    }

    if (stage === "register") {
        const total = stepCount(api);
        const last = step >= total - 1;
        const ready = canAdvance(api);
        const draft = registrationTotals(registration);

        return (
            <AppShell
                title={title ? title(api) : "Clinics"}
                active="proshop"
                orderPanel={cartPanel}
                actionBar={
                    <>
                        <ActionButton
                            icon={<ChevronLeftIcon />}
                            onClick={() => {
                                if (onBack?.(api)) return;
                                if (step > 0) setStep(step - 1);
                                else setStage("proshop");
                            }}
                        >
                            BACK
                        </ActionButton>
                        <ActionButton
                            tone="primary"
                            disabled={!ready}
                            onClick={
                                !ready
                                    ? undefined
                                    : () => {
                                          if (onNext?.(api)) return;
                                          if (last) api.commit();
                                          else setStep(step + 1);
                                      }
                            }
                        >
                            {/* The total lives on the button. The Oct 21 round
                                took the strip that repeated it underneath. */}
                            {last ? `ADD TO CART · ${usd(draft.net)}` : (nextLabel?.(api) ?? "NEXT")}
                        </ActionButton>
                    </>
                }
            >
                {render(api)}
            </AppShell>
        );
    }

    if (stage === "payment") {
        const who = registration.players[0]?.customer;
        const name = who ? `${who.first} ${who.last}` : "Justin Girard";

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
                        <ActionButton>{name.toUpperCase()}</ActionButton>
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
                    lines={cart.map((line) => ({
                        id: line.id,
                        name: line.name,
                        qty: line.qty,
                        unitPrice: Number(line.price.replace(/[^0-9.]/g, "")),
                    }))}
                    customer={name}
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
                orderNumber: "6655902",
                lines: cart.map((line) => ({
                    id: line.id,
                    name: line.name,
                    qty: line.qty,
                    total: Number(line.price.replace(/[^0-9.]/g, "")),
                })),
                tender: "Credit",
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

/** `Justin` — what the "same as" button offers to copy from. */
export const copyLabel = (registration: Registration, index: number): string | undefined =>
    index === 0 ? undefined : playerName(registration.players[index - 1], index - 1).split(" ")[0];

export default RegistrationFlow;
