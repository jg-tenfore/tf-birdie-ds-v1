import { useState, type ReactNode } from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { OrderLineRow, OrderPanel, OrderPanelEmpty, type OrderLineItem } from "@/components/app-chrome/order-panel";
import { CheckoutBody } from "@/components/screens/checkout/checkout-panes";
import { OrderComplete } from "@/components/screens/checkout/order-complete";
import { clinicReceiptEmail } from "@/components/screens/clinics/clinic-data";
import { demoCustomer } from "@/components/screens/clinics/demo-customer";
import { ProShopCatalog } from "@/components/screens/pro-shop/pro-shop-catalog";
import { ProShopActions } from "@/components/screens/pro-shop/pro-shop-order-parts";
import { clinicById, usd, type CatalogClinic } from "./clinic-catalog";
import { ClinicSearchList, type Guest } from "./clinic-parts";

/**
 * **Selling clinics, start to finish — the Oct 21 flow.**
 *
 * The Oct 20 journey ran one clinic and one booking. This one runs the two
 * things Weston asked to see next:
 *
 * 1. **A list worth searching.** Twenty clinics, so finding one is a task.
 * 2. **A cart that fills up.** *"I added that to the cart, I can click clinics
 *    again."* Every trip through the booking steps adds its own lines, and the
 *    guest from the last trip is still there when the next one starts — which
 *    is the behaviour Option A is built around and Option B inherits.
 *
 * Only the booking screen differs between the two versions, so it is a render
 * prop and everything either side of it is shared.
 */

/** The customer a tap on any field finds. Shared with the Oct 20 screens. */
export const DEMO_GUEST: Guest = demoCustomer(0);

/** The device's own rates, read off its ticket: $67.41 → $5.55 tax, $2.01 fees. */
export const totalsFor = (subtotal: number) => {
    const tax = Number((subtotal * 0.0824).toFixed(2));
    const fees = Number((subtotal * 0.0298).toFixed(2));

    return { subtotal, tax, fees, total: Number((subtotal + tax + fees).toFixed(2)) };
};

interface Booking {
    clinicId: string;
    dates: string[];
    party: number;
    guest: Guest;
}

export interface ClinicFlowApi {
    clinic: CatalogClinic;
    selected: string[];
    party: number;
    step: number;
    /** Who the previous booking was for, if the cart already holds one. */
    guest?: Guest;
    toggle: (label: string) => void;
    selectAll: () => void;
    setParty: (count: number) => void;
    setStep: (index: number) => void;
    clearGuest: () => void;
}

export interface ClinicFlowProps {
    /** The booking screen for this version. */
    renderBooking: (api: ClinicFlowApi) => ReactNode;
    /** How many steps that screen has — 2 for A, 3 for B. */
    steps: number;
    /** Whether the step in hand is finished enough to move on. */
    canAdvance: (api: ClinicFlowApi) => boolean;
    /** What SELECT ALL OPEN reaches, which depends on the party size. */
    selectAllFor: (clinic: CatalogClinic, party: number) => string[];
    /** The label on each forward button. Defaults to NEXT. */
    nextLabel?: (step: number) => string;
    /**
     * Whether re-opening the same clinic brings its dates back ticked —
     * *"you selected these, you're just changing the customer."*
     */
    recallDates?: boolean;
}

export const ClinicFlow = ({ renderBooking, steps, canAdvance, selectAllFor, nextLabel, recallDates = false }: ClinicFlowProps) => {
    const [stage, setStage] = useState<"proshop" | "list" | "booking" | "payment" | "complete">("proshop");
    const [clinicId, setClinicId] = useState(() => clinicById("girls-summer-camp").id);
    const [selected, setSelected] = useState<string[]>([]);
    const [party, setParty] = useState(1);
    const [step, setStep] = useState(0);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [guest, setGuest] = useState<Guest | undefined>(undefined);

    const clinic = clinicById(clinicId);

    /** One order line per date per booking, named and dated — unlike today's. */
    const lines: OrderLineItem[] = bookings.flatMap((booking, index) => {
        const booked = clinicById(booking.clinicId);

        return booking.dates.map((label) => ({
            id: `${index}-${label}`,
            name: `${booked.name} — ${label}`,
            qty: booking.party,
            price: usd(booked.price),
            note: booking.party > 1 ? `${booking.party} players` : undefined,
        }));
    });

    /**
     * **The rail, restored.**
     *
     * The Oct 20 round took the order panel off the clinic screens on Weston's
     * note that it was unused. He reversed that on Oct 22 after testing it:
     *
     * > *"I was wrong. If you do have something in the cart, it will show there
     * > in the rail while you're adding the clinic information… let's add the
     * > rail back then. To keep it consistent."*
     *
     * It earns its place for the reason it was built: a registration that runs
     * four screens deep should not hide what is already in the order, so the
     * total at the end is never a surprise. The Oct 20 folder keeps the version
     * without it, as the record of that pass.
     */
    const cartPanel = (
        <OrderPanel>{lines.length > 0 ? lines.map((line) => <OrderLineRow key={line.id} line={line} />) : <OrderPanelEmpty />}</OrderPanel>
    );

    const subtotal = lines.reduce((sum, line) => sum + Number(line.price.replace(/[^0-9.]/g, "")) * line.qty, 0);
    const totals = totalsFor(Number(subtotal.toFixed(2)));
    const draftTotal = selected.length * clinic.price * party;

    const api: ClinicFlowApi = {
        clinic,
        selected,
        party,
        step,
        guest,
        toggle: (label) => setSelected((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label])),
        selectAll: () => setSelected(selectAllFor(clinic, party)),
        setParty: (count) => {
            setParty(count);
            // A date that seated two may not seat four, so a change of party
            // size cannot keep a selection made under the old one.
            setSelected([]);
        },
        setStep,
        clearGuest: () => setGuest(undefined),
    };

    const openClinic = (id: string) => {
        const previous = [...bookings].reverse().find((booking) => booking.clinicId === id);

        setClinicId(id);
        setSelected(recallDates && previous ? previous.dates : []);
        setParty(recallDates && previous ? previous.party : 1);
        setStep(0);
        setStage("booking");
    };

    const save = () => {
        const who = guest ?? DEMO_GUEST;

        setBookings((prev) => [...prev, { clinicId, dates: selected, party, guest: who }]);
        setGuest(who);
        setSelected([]);
        setParty(1);
        setStep(0);
        setStage("proshop");
    };

    const reset = () => {
        setBookings([]);
        setGuest(undefined);
        setSelected([]);
        setParty(1);
        setStep(0);
        setStage("proshop");
    };

    if (stage === "proshop") {
        const hasOrder = lines.length > 0;

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
                {/* Tap Clinics again after a booking: the cart keeps what is in
                    it and the guest comes with you. */}
                <ProShopCatalog onSelect={(label) => label === "Clinics" && setStage("list")} />
            </AppShell>
        );
    }

    if (stage === "list") {
        return (
            <AppShell
                title="Clinics"
                active="proshop"
                orderPanel={cartPanel}
                actionBar={
                    <ActionButton icon={<ChevronLeftIcon />} onClick={() => setStage("proshop")}>
                        BACK
                    </ActionButton>
                }
            >
                <ClinicSearchList onOpen={openClinic} />
            </AppShell>
        );
    }

    if (stage === "booking") {
        const lastStep = step >= steps - 1;
        const ready = canAdvance(api);

        return (
            <AppShell
                title={clinic.name}
                active="proshop"
                orderPanel={cartPanel}
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
                            disabled={!ready}
                            onClick={!ready ? undefined : lastStep ? save : () => setStep(step + 1)}
                        >
                            {/* The total lives here and nowhere else — the strip
                                that used to repeat it under the form is gone. */}
                            {lastStep ? `SAVE · ${usd(draftTotal)}` : (nextLabel?.(step) ?? "NEXT")}
                        </ActionButton>
                    </>
                }
            >
                {renderBooking(api)}
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
                        <ActionButton>
                            {(guest ?? DEMO_GUEST).first.toUpperCase()} {(guest ?? DEMO_GUEST).last.toUpperCase()}
                        </ActionButton>
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
                    customer={`${(guest ?? DEMO_GUEST).first} ${(guest ?? DEMO_GUEST).last}`}
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
                    name: line.name,
                    qty: line.qty,
                    total: Number(line.price.replace(/[^0-9.]/g, "")) * line.qty,
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

export default ClinicFlow;
