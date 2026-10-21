import { useState } from "react";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { OrderLineRow, OrderPanel, OrderPanelEmpty } from "@/components/app-chrome/order-panel";
import { CheckoutBody } from "@/components/screens/checkout/checkout-panes";
import { OrderComplete } from "@/components/screens/checkout/order-complete";
import {
    membershipCustomer,
    membershipDefaults,
    membershipTotals,
    type Membership,
} from "@/components/screens/memberships/membership-data";
import { MembershipForm, MembershipList } from "@/components/screens/memberships/membership-screens";
import { ProShopCatalog } from "@/components/screens/pro-shop/pro-shop-catalog";
import { ProShopActions } from "@/components/screens/pro-shop/pro-shop-order-parts";

/**
 * **Selling a membership, start to finish — as it ships.**
 *
 * Transcribed from `references/102226/memberships/`. The Pro Shop grid, the
 * catalogue, the form, the order, the tender screen and the receipt.
 *
 * What the run shows that the screenshots cannot:
 *
 * **The price changes between two screens and nobody says why.** The tile
 * reads **$1.00**. The form opens on **$0.32**. The ticket settles at
 * **$0.36**. Somewhere in there is a proration the screen states as a
 * sentence — *First month type: Prorated* — and nothing shows the arithmetic.
 *
 * **The group tiles are filters, not products.** Tap `testing` and eighteen
 * memberships become two. They are drawn exactly like the things they filter.
 *
 * **The catalogue has never been weeded.** `Beta Compare`, `July QA`,
 * `Cheapos`, and a `Monthly Credit` priced at **-$490.20** — a negative number
 * in a screen whose only job is to take money.
 */
export const MembershipJourney = () => {
    const [stage, setStage] = useState<"proshop" | "list" | "form" | "payment" | "complete">("proshop");
    const [group, setGroup] = useState<string | undefined>(undefined);
    const [membership, setMembership] = useState<Membership | undefined>(undefined);
    const [customer, setCustomer] = useState<typeof membershipCustomer | undefined>(undefined);
    const [sold, setSold] = useState(false);

    /* The form's figure, not the tile's — which is the point of running it. */
    const price = membershipTotals.subtotal;
    const lines = sold && membership ? [{ id: "membership", name: membership.name, qty: 1, price: membershipDefaults.price }] : [];

    const reset = () => {
        setStage("proshop");
        setGroup(undefined);
        setMembership(undefined);
        setCustomer(undefined);
        setSold(false);
    };

    if (stage === "proshop") {
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
                        payLabel={`Pay $${(hasOrder ? membershipTotals.total : 0).toFixed(2)}`}
                        payEnabled={hasOrder}
                        onPay={hasOrder ? () => setStage("payment") : undefined}
                    />
                }
            >
                <ProShopCatalog onSelect={(label) => label === "Memberships" && setStage("list")} />
            </AppShell>
        );
    }

    if (stage === "list") {
        return (
            <AppShell
                title="Pro Shop Order"
                active="proshop"
                orderPanel={
                    <OrderPanel>
                        <OrderPanelEmpty />
                    </OrderPanel>
                }
                actionBar={
                    <ProShopActions showBack payLabel="Pay $0.00" onBack={() => (group ? setGroup(undefined) : setStage("proshop"))} />
                }
            >
                <MembershipList
                    group={group}
                    onGroup={setGroup}
                    onSelect={(picked) => {
                        setMembership(picked);
                        setStage("form");
                    }}
                />
            </AppShell>
        );
    }

    if (stage === "form") {
        return (
            <AppShell
                title={membership?.name ?? "Membership"}
                active="proshop"
                orderPanel={
                    <OrderPanel>
                        <OrderPanelEmpty />
                    </OrderPanel>
                }
                actionBar={
                    <>
                        <ActionButton icon={<ChevronLeftIcon />} onClick={() => setStage("list")}>
                            BACK
                        </ActionButton>
                        {/* Live from the first frame: no customer, no change to
                            the price, nothing stops SAVE. */}
                        <ActionButton
                            tone="primary"
                            onClick={() => {
                                setSold(true);
                                setStage("proshop");
                            }}
                        >
                            SAVE
                        </ActionButton>
                    </>
                }
            >
                <MembershipForm customer={customer} onField={() => setCustomer(membershipCustomer)} />
            </AppShell>
        );
    }

    if (stage === "payment") {
        const who = customer ?? membershipCustomer;

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
                        <ActionButton>{`${who.first} ${who.last}`.toUpperCase()}</ActionButton>
                        <ActionButton>ORDER NOTES</ActionButton>
                        <ActionButton tone="primary" onClick={() => setStage("complete")}>
                            AUTHORIZE CARD
                        </ActionButton>
                    </>
                }
            >
                <CheckoutBody
                    tab="CREDIT"
                    amount={`$${membershipTotals.total.toFixed(2)}`}
                    lines={lines.map((line) => ({ id: line.id, name: line.name, qty: line.qty, unitPrice: price }))}
                    customer={`${who.first} ${who.last}`}
                    points={0}
                    subtotal={membershipTotals.subtotal}
                    tax={membershipTotals.tax}
                    total={membershipTotals.total}
                    payments={0}
                />
            </AppShell>
        );
    }

    const who = customer ?? membershipCustomer;

    return (
        <OrderComplete
            sale={{
                facility: "The Dunes of Delgado PROD",
                orderNumber: "6655823",
                lines: lines.map((line) => ({ id: line.id, name: line.name, qty: line.qty, total: price })),
                tender: "Credit",
                paid: membershipTotals.total,
                cash: membershipTotals.total,
                change: 0,
                subtotal: membershipTotals.subtotal,
                tax: Number((membershipTotals.tax + membershipTotals.fees).toFixed(2)),
                total: membershipTotals.total,
            }}
            email={who.email}
            onExit={reset}
        />
    );
};

export default MembershipJourney;
