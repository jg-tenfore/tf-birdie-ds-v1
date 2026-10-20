import { useState } from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { OrderLineRow, OrderPanel, OrderPanelEmpty } from "@/components/app-chrome/order-panel";
import { CheckoutBody } from "@/components/screens/checkout/checkout-panes";
import { OrderComplete } from "@/components/screens/checkout/order-complete";
import {
    clinicCheckoutLines,
    clinicOrderLines,
    clinicReceiptEmail,
    clinicSale,
    clinicTotals,
    girlsSummerCamp,
    selectableSessions,
} from "@/components/screens/clinics/clinic-data";
import { ClinicList, ClinicSessionPicker } from "@/components/screens/clinics/clinic-screens";
import { ProShopCatalog } from "@/components/screens/pro-shop/pro-shop-catalog";
import { ProShopActions } from "@/components/screens/pro-shop/pro-shop-order-parts";

/**
 * **Clinics, as it ships today.** Transcribed from `references/102026/`.
 *
 * Selling a clinic is a Pro Shop category like any other: tap **Clinics**, pick
 * a clinic, pick its dates, search for the guest, SAVE — and the booking lands
 * in the order as ordinary lines to be paid for.
 *
 * Flaws are reproduced rather than corrected, and named in the notes on each
 * screen. The ones that cost the counter most:
 *
 * 1. **Nothing says how many places are left** until the very end. The number
 *    on the clinic card is the maximum roster, not availability, and a guest
 *    can be taken all the way through registration before the limit is hit.
 * 2. **A full session is told apart by a word inside a chip** — `(FULL)` and a
 *    shade of grey — while every other session says nothing at all about how
 *    many spots remain.
 * 3. **The order panel is empty on both clinic screens** and takes a third of
 *    the canvas with it.
 * 4. **The clinic is named two different ways in one sale**: its blurb in the
 *    order panel, its name on the receipt.
 */
const meta = {
    title: "Flows/Clinics/Current state",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * **1 — Where it starts.** Clinics is a tile in the Pro Shop grid, between the
 * gift cards and the test categories, with no badge or count on it.
 */
export const ProShopEntry: Story = {
    name: "1 — Pro Shop entry",
    render: () => (
        <AppShell
            title="Pro Shop Order"
            active="proshop"
            showCart
            orderPanel={
                <OrderPanel>
                    <OrderPanelEmpty />
                </OrderPanel>
            }
            actionBar={<ProShopActions />}
        >
            <ProShopCatalog />
        </AppShell>
    ),
};

/**
 * **2 — The clinic list.**
 *
 * One card on an otherwise empty canvas. It prints the clinic's name, its type
 * and the number **10** — which is the maximum roster, not the places left.
 * Nothing on this screen says which, and nothing says how full the clinic is.
 *
 * The order panel sits empty beside it for the whole screen.
 */
export const ClinicListing: Story = {
    name: "2 — The clinic list",
    render: () => (
        <AppShell
            title="Clinics"
            active="proshop"
            orderPanel={
                <OrderPanel>
                    <OrderPanelEmpty />
                </OrderPanel>
            }
            actionBar={<ActionButton icon={<ChevronLeftIcon />}>BACK</ActionButton>}
        >
            <ClinicList clinics={[girlsSummerCamp]} />
        </AppShell>
    ),
};

/**
 * **3 — Choosing sessions.** The screen that does the work, as it opens.
 *
 * Ten dates, five to a row, each a chip with a radio pinned to its left edge —
 * on the two-line labels the radio overlaps the first character. Two sessions
 * are full: grey text and the word `(FULL)` inside the same label, with the
 * radio still drawn as though it were selectable.
 *
 * The eight that are bookable say nothing about how many places they have left,
 * so the only availability signal on the screen is binary and only appears once
 * a session is already gone.
 *
 * Underneath, a six-field customer search with no required field and no result
 * list. It starts below the fold on an 800px device.
 *
 * The chips are live — tap them, or use SELECT ALL.
 */
export const ChooseSessions: Story = {
    name: "3 — Choose sessions",
    render: function ChooseSessionsStory() {
        const [selected, setSelected] = useState<string[]>([]);

        return (
            <AppShell
                title={girlsSummerCamp.name}
                active="proshop"
                orderPanel={
                    <OrderPanel>
                        <OrderPanelEmpty />
                    </OrderPanel>
                }
                actionBar={
                    <>
                        <ActionButton icon={<ChevronLeftIcon />}>BACK</ActionButton>
                        <ActionButton tone="primary">SAVE</ActionButton>
                    </>
                }
            >
                <ClinicSessionPicker
                    clinic={girlsSummerCamp}
                    selected={selected}
                    onToggle={(label) => setSelected((prev) => (prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]))}
                    onSelectAll={() => setSelected(selectableSessions)}
                />
            </AppShell>
        );
    },
};

/**
 * **4 — Every session taken.** SELECT ALL, which reaches the eight bookable
 * dates and leaves the two full ones alone.
 *
 * Eight sessions are now chosen and the screen still shows no price. The first
 * figure the operator sees is in the order panel on the next screen.
 */
export const AllSessionsChosen: Story = {
    name: "4 — Every session chosen",
    render: () => (
        <AppShell
            title={girlsSummerCamp.name}
            active="proshop"
            orderPanel={
                <OrderPanel>
                    <OrderPanelEmpty />
                </OrderPanel>
            }
            actionBar={
                <>
                    <ActionButton icon={<ChevronLeftIcon />}>BACK</ActionButton>
                    <ActionButton tone="primary">SAVE</ActionButton>
                </>
            }
        >
            <ClinicSessionPicker clinic={girlsSummerCamp} selected={selectableSessions} />
        </AppShell>
    ),
};

/**
 * **5 — In the order.** SAVE drops the booking into the Pro Shop order.
 *
 * Three lines, all reading **Come learn the game!** — the clinic's blurb, not
 * its name — at $0.00, $22.47 and $44.94. No session dates, no guest name, and
 * three lines where eight sessions were chosen.
 *
 * A counter looking at this order cannot tell which dates the guest is booked
 * into, or why one of the lines is free.
 */
export const InTheOrder: Story = {
    name: "5 — In the order",
    render: () => (
        <AppShell
            title={girlsSummerCamp.name}
            active="proshop"
            showCart
            orderPanel={
                <OrderPanel>
                    {clinicOrderLines.map((line) => (
                        <OrderLineRow key={line.id} line={line} />
                    ))}
                </OrderPanel>
            }
            actionBar={<ProShopActions payLabel={`Pay ${clinicTotals.grandTotal}`} payEnabled />}
        >
            <ProShopCatalog />
        </AppShell>
    ),
};

/**
 * **6 — Payment.** The ordinary tender screen, with the clinic lines on the
 * ticket: $67.41 of goods, $5.55 tax, $2.01 fees, **$74.97** owed.
 */
export const Payment: Story = {
    name: "6 — Payment",
    render: () => (
        <AppShell
            title="Credit Card Payment"
            active="proshop"
            accountLabel=""
            showLogOut={false}
            actionBar={
                <>
                    <ActionButton icon={<ChevronLeftIcon />} iconEdge="right">
                        TEE SHEET
                    </ActionButton>
                    <ActionButton icon={<ChevronLeftIcon />} iconEdge="right">
                        PRO SHOP
                    </ActionButton>
                    <ActionButton>JUSTIN GIRARD</ActionButton>
                    <ActionButton>ORDER NOTES</ActionButton>
                    <ActionButton tone="disabled">AUTHORIZE CARD</ActionButton>
                </>
            }
        >
            <CheckoutBody
                tab="CREDIT"
                amount="$74.97"
                lines={clinicCheckoutLines}
                customer="Justin Girard"
                points={0}
                subtotal={67.41}
                tax={5.55}
                total={74.97}
                payments={0}
            />
        </AppShell>
    ),
};

/**
 * **7 — Order complete.** The receipt, and the four ways out.
 *
 * The lines print as **Girls Summer Camp x1** here — the clinic's name, where
 * the order panel printed its blurb. Nothing on the receipt names the sessions
 * the guest just bought, and nothing has been emailed to them: the address on
 * this screen sends *this receipt*, not a registration confirmation.
 */
export const OrderCompleteScreen: Story = {
    name: "7 — Order complete",
    render: () => <OrderComplete sale={clinicSale} email={clinicReceiptEmail} />,
};

/** The same screen with the device's print toast raised. */
export const OrderCompletePrinting: Story = {
    name: "7 — Order complete (printing)",
    render: () => <OrderComplete sale={clinicSale} email={clinicReceiptEmail} toast="Print job queued up!" />,
};
