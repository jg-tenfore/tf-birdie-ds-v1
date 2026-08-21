import { useMemo, useState } from "react";

import BoltIcon from "@mui/icons-material/Bolt";
import CheckIcon from "@mui/icons-material/Check";
import GolfCourseIcon from "@mui/icons-material/GolfCourse";
import NotesIcon from "@mui/icons-material/Notes";
import PersonIcon from "@mui/icons-material/Person";
import StorefrontIcon from "@mui/icons-material/Storefront";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { CheckoutBody, type TenderTab } from "@/components/screens/checkout/checkout-panes";
import { checkoutCustomer } from "@/components/screens/checkout/checkout-fixtures";
import { rainchecks, searchRainchecks } from "@/data/rainchecks";

/**
 * **Checkout** — the seven ways a course takes money.
 *
 * One screen, two panes. The left is the ticket and never changes; the right is
 * a tab strip over a body that changes completely per tender. There is one story
 * per tender because they share almost nothing: a cash sale is a keyed amount
 * and five quick keys, a card sale is a handoff to a terminal, and four of them
 * are lookups against a balance somebody else's screen created.
 *
 * That last group is the one worth studying. Gift card, raincheck, member and
 * room all mean "find the money that already exists and spend it", and all four
 * ask for it differently — a UPC, a raincheck id, a customer, a room number —
 * with the same grey field and the same green result band underneath. The
 * **Raincheck** story is the one wired live here, and it shows what the pattern
 * needs that the others do not: one customer can hold several credits, so
 * finding the person is only half the job.
 *
 * A few labels are wrong on the device and are reproduced exactly — NAY WITH
 * CARD, "Csutomer Balance", and the amount heading that still says "Raincheck
 * Amount" on the MEMBER and ROOM tabs. Read the component's source note before
 * assuming they are typos here.
 */
const meta = {
    title: "App Screens/checkoutScreens",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The action bar, shared by every story.
 *
 * The commit button is the only thing that moves: it reads PAY on six tenders
 * and APPLY RAINCHECK on the seventh, and goes flat until a credit is chosen.
 */
const Bar = ({ commit, enabled = true }: { commit: string; enabled?: boolean }) => (
    <>
        <ActionButton icon={<GolfCourseIcon />}>Tee Sheet</ActionButton>
        <ActionButton icon={<StorefrontIcon />}>Pro Shop</ActionButton>
        <ActionButton icon={<PersonIcon />}>{checkoutCustomer}</ActionButton>
        <ActionButton icon={<NotesIcon />}>Order Notes</ActionButton>
        <ActionButton icon={commit === "Apply Raincheck" ? <BoltIcon /> : <CheckIcon />} tone={enabled ? "primary" : "disabled"} grow={1.6}>
            {commit}
        </ActionButton>
    </>
);

const Screen = ({ tab, amount = "$0.00", commit = "Pay" }: { tab: TenderTab; amount?: string; commit?: string }) => (
    <AppShell title="Credit Card Payment" active="proshop" accountLabel="Join Admin" actionBar={<Bar commit={commit} />}>
        <CheckoutBody tab={tab} amount={amount} />
    </AppShell>
);

/** Hands off to the card terminal. Nothing on screen completes the sale. */
export const Credit: Story = { render: () => <Screen tab="CREDIT" /> };

/**
 * The default tab, and the only one that can produce change.
 *
 * The five quick keys are fixed at $0 / $5 / $10 / $20 / $100 rather than
 * computed from what is owed, so on a $53.48 ticket not one of them is the
 * useful number.
 */
export const Cash: Story = { render: () => <Screen tab="CASH" /> };

/** Stored value by UPC or by name. The lookup is not wired in this story. */
export const GiftCard: Story = { name: "Gift card", render: () => <Screen tab="GIFT CARD" /> };

/**
 * **Live.** Type `weston` — or `51381`, or part of the email — into the lookup.
 *
 * Two credits come back, because this customer is holding two. The chips carry
 * the id and the balance and nothing else, which is the only information that
 * separates them; choosing one fills the amount field and completes the green
 * band, and only then does APPLY RAINCHECK come up.
 *
 * The device gives the chips no selected state at all — the amount field
 * changing is the entire acknowledgement. The green fill here is an addition.
 *
 * **Flows → Rainchecks** walks the whole journey this tab sits at the end of.
 */
export const RainCheck: Story = {
    name: "Rain check",
    render: function RainCheckStory() {
        const [query, setQuery] = useState("weston");
        const [selectedId, setSelectedId] = useState<string | undefined>();

        const results = useMemo(() => searchRainchecks(query, rainchecks), [query]);
        const selected = results.find((r) => r.id === selectedId);

        return (
            <AppShell
                title="Credit Card Payment"
                active="proshop"
                accountLabel="Join Admin"
                actionBar={<Bar commit="Apply Raincheck" enabled={Boolean(selected)} />}
            >
                <CheckoutBody
                    tab="RAIN"
                    amount={selected ? `$${selected.balance.toFixed(2)}` : "$0.00"}
                    raincheck={{ query, onQuery: setQuery, results, selectedId, onSelect: setSelectedId }}
                />
            </AppShell>
        );
    },
};

/**
 * Two amount fields, and the first is mislabelled.
 *
 * A check needs its number and its value; the device asks for "Cash Amount" and
 * "Check Number", so the field taking dollars says cash and the field taking a
 * serial is pre-filled with `$0.00`.
 */
export const Check: Story = { render: () => <Screen tab="CHECK" /> };

/**
 * Charge to a member's account.
 *
 * Two label defects in one pane: the amount still reads "Raincheck Amount"
 * because the heading is not swapped per tab, and the third result column reads
 * "Csutomer Balance".
 */
export const Member: Story = { render: () => <Screen tab="MEMBER" /> };
