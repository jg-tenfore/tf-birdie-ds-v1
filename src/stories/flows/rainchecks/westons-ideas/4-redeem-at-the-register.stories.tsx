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
import { CheckoutTicketPane, TenderTabs, type AppliedPayment } from "@/components/screens/checkout/checkout-panes";
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
 * **Used credits stay on screen.** A raincheck with nothing left on it is not an
 * offer, so it greys out and cannot be tapped — but it is still listed, under
 * "Already used", with where the money went. The shipping lookup filters
 * spent-out credits away entirely, which looks tidy and costs real time: a
 * customer who is certain they have one gets "no results", and the operator has
 * no way to say *you spent it on the 25th of April on a glove and two sleeves*.
 * That sentence is the one that ends the conversation.
 *
 * **What happens when you tap the search field.** The field sits above the list,
 * and tapping it opens a full-screen search rather than swapping the list
 * underneath. Searching every account on the system is a different job from
 * picking one of this customer's two credits, and it does not fit in a
 * 45%-wide column beneath a tender strip.
 *
 * The modal uses the app's own lookup shape — one centred, underlined field, the
 * same as Customer Search — so it reads as a screen this system already has. The
 * trade is real and worth naming: the ticket goes off screen while you look, so
 * the modal's bar restates what is owed.
 *
 * The left pane, the tab strip, the palette and the action bar are all the
 * shipping components, untouched. Only the RAIN pane is new.
 */
const meta = {
    title: "Flows/Rainchecks/Weston's ideas/4 — Redeem at the register",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const weston = rainchecks.filter((r) => r.customerName === "Weston Senior");

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

const Frame = ({
    children,
    enabled,
    total = checkoutTotals.total,
    onApply,
    applied,
    onRemove,
    commit = "Apply Raincheck",
}: {
    children: React.ReactNode;
    enabled?: boolean;
    total?: number;
    onApply?: () => void;
    applied?: AppliedPayment[];
    onRemove?: (id: string) => void;
    commit?: string;
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
                <ActionButton
                    icon={<BoltIcon />}
                    tone={enabled ? "primary" : "disabled"}
                    grow={1.6}
                    onClick={enabled ? onApply : undefined}
                >
                    {commit}
                </ActionButton>
            </>
        }
    >
        <Stack direction="row" sx={{ height: "100%", minHeight: 0 }}>
            <CheckoutTicketPane total={total} applied={applied} onRemovePayment={onRemove} />
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
 * Four credits, in the three states a raincheck can be in: two untouched, one
 * partly spent, one used up. Only the spendable ones are tappable; the used one
 * sits under "Already used" with its redemption history.
 *
 * The two full credits clear the $53.48 ticket and each says so. Pick one and APPLY RAINCHECK
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
        const [applied, setApplied] = useState<Raincheck[]>([]);
        const [paid, setPaid] = useState(false);
        const results = useMemo(() => searchRainchecks(query, rainchecks, 6, true), [query]);

        const pool = [...weston, ...results];
        const selected = pool.find((r) => r.id === selectedId);
        const total = checkoutTotals.total;

        // What each credit contributes. A credit never gives more than is left
        // on it, and never more than the ticket still owes.
        const rows: AppliedPayment[] = [];
        let running = 0;
        for (const c of applied) {
            const amount = Math.min(c.balance, +(total - running).toFixed(2));
            if (amount <= 0) continue;
            running = +(running + amount).toFixed(2);
            rows.push({
                id: c.id,
                label: `Rain Check ${c.id}`,
                amount,
                note: `${c.teeTime ?? c.reservation}${c.balance > amount ? ` · ${usd(c.balance - amount)} left on it` : " · spent out"}`,
            });
        }
        const owed = +(total - running).toFixed(2);

        if (paid) {
            return (
                <OrderComplete
                    sale={{
                        ...raincheckSale,
                        orderNumber: "5823991",
                        tender: rows.map((r) => r.label).join(" + "),
                        paid: running,
                        cash: 0,
                        change: 0,
                    }}
                    email="weston.farnsworth+senior@tenfore.golf"
                    toast={rows.length > 1 ? `Two credits settled this ticket.` : `${rows[0]?.label} applied.`}
                    onExit={() => {
                        setPaid(false);
                        setApplied([]);
                        setSelectedId(undefined);
                    }}
                />
            );
        }

        const canApply = Boolean(selected) && !applied.some((a) => a.id === selected!.id) && owed > 0;

        return (
            <Frame
                enabled={owed <= 0 ? true : canApply}
                total={total}
                applied={rows}
                onRemove={(id) => setApplied((prev) => prev.filter((c) => c.id !== id))}
                commit={owed <= 0 ? "Complete Sale" : "Apply Raincheck"}
                onApply={() => {
                    if (owed <= 0) return setPaid(true);
                    if (selected) {
                        setApplied((prev) => [...prev, selected]);
                        setSelectedId(undefined);
                    }
                }}
            >
                <CartCredits
                    customerName="Weston Senior"
                    credits={weston.filter((c) => !applied.some((a) => a.id === c.id))}
                    owed={owed}
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
 * A customer whose credits are all spent.
 *
 * Not the same as having none, and the pane says so: "Nothing left to spend",
 * then the history. The shipping tender cannot draw this state at all — a
 * spent-out credit is filtered before it reaches the screen, so this customer
 * and a customer who has never had a raincheck look identical.
 */
export const AllSpent: Story = {
    name: "Every credit already used",
    render: () => (
        <Frame>
            <CartCredits customerName="Weston Senior" credits={weston.filter((r) => r.balance <= 0)} owed={checkoutTotals.total} />
        </Frame>
    ),
};

/**
 * A credit with some of it gone.
 *
 * $68.76 was issued, $54.00 went on a round in June, $14.76 is left. The card
 * leads with what is spendable and shows the draw underneath, because "$14.76"
 * on its own invites the question this answers.
 *
 * It also cannot cover the $53.48 ticket, so it says what would still be owed —
 * before the operator commits rather than after.
 */
export const PartlySpent: Story = {
    name: "Partly spent",
    render: () => (
        <Frame>
            <CartCredits customerName="Weston Senior" credits={weston.filter((r) => r.id === "38204")} owed={checkoutTotals.total} />
        </Frame>
    ),
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
 * Full screen, one centred field, and the bar carries the amount owed so the
 * number does not disappear with the ticket. Compare with the shipping tender,
 * where the same empty field and the same empty green band mean both "no such
 * credit" and "I have not looked yet".
 */
export const SearchFocused: Story = {
    name: "Search field tapped",
    render: () => (
        <Frame>
            <CartCredits customerName="Weston Senior" credits={weston} owed={checkoutTotals.total} searching />
        </Frame>
    ),
};

/**
 * Falling through to search.
 *
 * The guest case in reverse: the round was played by a visitor, the credit was
 * issued to their host, and now the host is at the till on a different ticket.
 *
 * Results get the width the pane could not give them. Picking one closes the
 * modal and drops back to the tender with that credit selected.
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
