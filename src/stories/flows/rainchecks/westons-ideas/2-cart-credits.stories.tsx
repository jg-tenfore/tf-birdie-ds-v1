import { useMemo, useState } from "react";

import Stack from "@mui/material/Stack";
import BoltIcon from "@mui/icons-material/Bolt";
import GolfCourseIcon from "@mui/icons-material/GolfCourse";
import NotesIcon from "@mui/icons-material/Notes";
import PersonIcon from "@mui/icons-material/Person";
import StorefrontIcon from "@mui/icons-material/Storefront";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { CartCredits } from "@/components/concepts/rainchecks/cart-credits";
import { CheckoutTicketPane, TenderTabs } from "@/components/screens/checkout/checkout-panes";
import { checkoutCustomer, checkoutTotals } from "@/components/screens/checkout/checkout-fixtures";
import { OrderComplete, raincheckSale } from "@/components/screens/checkout/order-complete";
import { rainchecks, searchRainchecks, type Raincheck } from "@/data/rainchecks";

/**
 * **Concept — the tender already knows whose ticket this is.**
 *
 * In the walkthrough Weston never searched:
 *
 * > *"because I'm in the cart, on the bottom it says Weston Senior — so that's
 * > the person who's in the cart. It shows the rainchecks that I have to my
 * > name."*
 *
 * The shipping tender opens on an empty grey field and waits. The ticket has a
 * customer attached; the tender should start from it and keep search for the one
 * case it cannot cover — a credit sitting on someone else's account, which is
 * exactly what the issuance concept lets you create.
 *
 * The second change is what a result tells you. The shipping chips carry an id
 * and a balance in 12px type: two credits for one customer are separated only by
 * numbers neither the operator nor the customer recognises. These name the round
 * — *the seven o'clock on the twentieth* — and say whether the credit clears the
 * ticket **before** you commit rather than after.
 *
 * **What happens when you tap the search field.** It does not open a centred
 * search screen — the app uses that pattern for Customer Search, whose only job
 * is finding somebody, and here the ticket on the left has to stay visible the
 * whole time. Instead the pane switches into a search mode: the field moves from
 * the foot of the pane to the **top**, which is where the shipping RAIN tender
 * puts its lookup, so the moment search is actually in use the layout matches
 * the screen everyone already knows. A back control returns to the ticket
 * customer's credits, because otherwise opening search is a one-way door out of
 * the list you wanted.
 *
 * The left pane, the tab strip, the palette and the action bar are all the
 * shipping components, untouched. Only the RAIN pane is new.
 */
const meta = {
    title: "Flows/Rainchecks/Weston's ideas/2 — Checkout knows the cart",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const weston = rainchecks.filter((r) => r.customerName === "Weston Senior");

const Frame = ({
    children,
    enabled,
    total = checkoutTotals.total,
    onApply,
}: {
    children: React.ReactNode;
    enabled?: boolean;
    total?: number;
    onApply?: () => void;
}) => (
    <AppShell
        title="Credit Card Payment"
        active="proshop"
        accountLabel="Join Admin"
        actionBar={
            <>
                <ActionButton icon={<GolfCourseIcon />}>Tee Sheet</ActionButton>
                <ActionButton icon={<StorefrontIcon />}>Pro Shop</ActionButton>
                <ActionButton icon={<PersonIcon />}>{checkoutCustomer}</ActionButton>
                <ActionButton icon={<NotesIcon />}>Order Notes</ActionButton>
                <ActionButton icon={<BoltIcon />} tone={enabled ? "primary" : "disabled"} grow={1.6} onClick={enabled ? onApply : undefined}>
                    Apply Raincheck
                </ActionButton>
            </>
        }
    >
        <Stack direction="row" sx={{ height: "100%", minHeight: 0 }}>
            <CheckoutTicketPane total={total} />
            <Stack sx={{ flex: 1, minWidth: 0 }}>
                <TenderTabs active="RAIN" />
                {children}
            </Stack>
        </Stack>
    </AppShell>
);

/**
 * **Live, end to end.** Opens on Weston Senior's two credits, because that is
 * whose ticket this is. Neither of them needed finding.
 *
 * Both clear the $53.48 ticket, and each says so. Pick one and APPLY RAINCHECK
 * settles it and prints the receipt — with what is left on the credit, which the
 * shipping Order Complete never says. Any exit on that screen brings you back
 * here.
 *
 * Tap the field at the foot of the pane to fall through to the search the
 * shipping tender starts with.
 */
export const Default: Story = {
    name: "Opens on the cart's customer",
    render: function CartCreditsStory() {
        const [selectedId, setSelectedId] = useState<string | undefined>();
        const [query, setQuery] = useState("");
        const [applied, setApplied] = useState<Raincheck | null>(null);
        const results = useMemo(() => searchRainchecks(query, rainchecks), [query]);

        const selected = [...weston, ...results].find((r) => r.id === selectedId);

        // APPLY RAINCHECK settles the ticket and prints the receipt, so the
        // concept can be walked end to end rather than only looked at. The
        // credit's remaining balance is on the receipt, which the shipping
        // Order Complete does not say anywhere.
        if (applied) {
            const left = +(applied.balance - checkoutTotals.total).toFixed(2);
            return (
                <OrderComplete
                    sale={{
                        ...raincheckSale,
                        orderNumber: "5823991",
                        tender: `Rain Check ${applied.id}`,
                        paid: checkoutTotals.total,
                        cash: 0,
                        change: 0,
                    }}
                    email="weston.farnsworth+senior@tenfore.golf"
                    toast={`Raincheck ${applied.id} — $${left.toFixed(2)} left on it.`}
                    onExit={() => {
                        setApplied(null);
                        setSelectedId(undefined);
                    }}
                />
            );
        }

        return (
            <Frame enabled={Boolean(selected)} onApply={() => selected && setApplied(selected)}>
                <CartCredits
                    customerName="Weston Senior"
                    credits={weston}
                    owed={checkoutTotals.total}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    query={query}
                    onQuery={setQuery}
                    searchResults={results}
                />
            </Frame>
        );
    },
};

/**
 * The same tender on a ticket neither credit can cover.
 *
 * $265.48 owed against $103.90 and $72.22. Each card says what would still be
 * owed, in the orange the sheet uses for attention — so the operator can see
 * before committing that this is a part payment, and decide whether to take it.
 *
 * The shipping flow finds this out only on apply, and the prototype refuses
 * outright. Which of those is right is still open.
 */
export const ShortOfTheTotal: Story = {
    name: "Neither credit covers it",
    render: () => (
        <Frame total={265.48}>
            <CartCredits customerName="Weston Senior" credits={weston} owed={265.48} />
        </Frame>
    ),
};

/**
 * A customer with nothing.
 *
 * The empty state is a counter telling someone *no, you don't have one* — so it
 * has to name them and be unmistakable, not look like a search that has not run
 * yet. The search field stays, because the credit may be on a friend's account.
 */
export const NoCredits: Story = {
    name: "This customer has none",
    render: () => (
        <Frame>
            <CartCredits customerName="Randy Orton" credits={[]} owed={checkoutTotals.total} />
        </Frame>
    ),
};

/**
 * The moment the field is tapped, before anything is typed.
 *
 * The field has moved to the top, the header says the scope has widened past
 * this ticket's customer, and there is a way back. Compare with the shipping
 * tender, where the same empty field and the same empty green band mean both
 * "no such credit" and "I have not looked yet".
 */
export const SearchFocused: Story = {
    name: "Search field tapped",
    render: () => <Frame><CartCredits customerName="Weston Senior" credits={weston} owed={checkoutTotals.total} searching /></Frame>,
};

/**
 * Falling through to search.
 *
 * The guest case in reverse: the round was played by a visitor, the credit was
 * issued to their host, and now the host is at the till on a different ticket.
 * Search is the escape hatch, and the header changes to say the scope has
 * widened past this ticket's customer.
 */
export const Searching: Story = {
    name: "Searching another account",
    render: () => (
        <Frame>
            <CartCredits
                customerName="Weston Senior"
                credits={weston}
                owed={checkoutTotals.total}
                searching
                query="51381"
                searchResults={searchRainchecks("51381", rainchecks)}
            />
        </Frame>
    ),
};
