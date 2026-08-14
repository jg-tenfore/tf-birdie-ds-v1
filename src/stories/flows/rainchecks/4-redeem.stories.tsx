import { useMemo, useState } from "react";

import BoltIcon from "@mui/icons-material/Bolt";
import GolfCourseIcon from "@mui/icons-material/GolfCourse";
import NotesIcon from "@mui/icons-material/Notes";
import PersonIcon from "@mui/icons-material/Person";
import StorefrontIcon from "@mui/icons-material/Storefront";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { CheckoutBody } from "@/components/screens/checkout/checkout-panes";
import { checkoutCustomer } from "@/components/screens/checkout/checkout-fixtures";
import { rainchecks, searchRainchecks } from "@/data/rainchecks";

/**
 * **Step 4 — spending it.**
 *
 * The RAIN tender, on a $53.48 ticket. This is the half of the flow that has to
 * find work somebody else did days ago, and it is where the design earns its
 * keep or does not.
 *
 * The lookup returns **credits, not customers.** That is the whole reason this
 * tab does not use the customer sheet every other lookup in the app uses: one
 * person can be holding two rainchecks, and which one is being spent is a
 * decision a name cannot settle. So the results are amount chips — id and
 * balance, nothing else, because that is the only information that separates
 * them.
 *
 * Two things the device gets wrong and this reproduces. The chips have **no
 * selected state** — the amount field changing is the entire acknowledgement of
 * a tap (the green fill here is an addition). And the amount field is
 * **editable**, so an operator can key a figure that does not match the credit
 * they chose, with nothing to say which one wins.
 */
const meta = {
    title: "Flows/Rainchecks/4 — Redeem at the register",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Frame = ({ children, enabled }: { children: React.ReactNode; enabled?: boolean }) => (
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
                <ActionButton icon={<BoltIcon />} tone={enabled ? "primary" : "disabled"} grow={1.6}>
                    Apply Raincheck
                </ActionButton>
            </>
        }
    >
        {children}
    </AppShell>
);

/**
 * **Live.** Type `weston`, `51381`, or part of the email.
 *
 * Two chips come back for one name. Pick one and the green band fills; APPLY
 * RAINCHECK only comes up then.
 */
export const Default: Story = {
    name: "Look up and pick",
    render: function RedeemStory() {
        const [query, setQuery] = useState("weston");
        const [selectedId, setSelectedId] = useState<string | undefined>();

        const results = useMemo(() => searchRainchecks(query, rainchecks), [query]);
        const selected = results.find((r) => r.id === selectedId);

        return (
            <Frame enabled={Boolean(selected)}>
                <CheckoutBody
                    tab="RAIN"
                    amount={selected ? `$${selected.balance.toFixed(2)}` : "$0.00"}
                    raincheck={{ query, onQuery: setQuery, results, selectedId, onSelect: setSelectedId }}
                />
            </Frame>
        );
    },
};

/**
 * Before anyone types.
 *
 * A grey field, an empty green band of `---`, and a commit button that does
 * nothing. Nothing on screen suggests what a raincheck id looks like or that a
 * customer name will work, beyond the field's own label.
 */
export const Empty: Story = {
    name: "Nothing searched yet",
    render: () => (
        <Frame>
            <CheckoutBody tab="RAIN" amount="$0.00" raincheck={{ query: "", results: [] }} />
        </Frame>
    ),
};

/**
 * A query that matches nothing.
 *
 * The device shows an empty result area and leaves the green band on `---`,
 * which is indistinguishable from not having searched. This says so instead —
 * a small addition, and the difference between "no such credit" and "I have not
 * looked yet" is the difference between telling a customer no and telling them
 * to wait.
 */
export const NoMatch: Story = {
    name: "No match",
    render: () => (
        <Frame>
            <CheckoutBody tab="RAIN" amount="$0.00" raincheck={{ query: "zephyr quill", results: [] }} />
        </Frame>
    ),
};

/**
 * A credit that does not cover the ticket.
 *
 * `51381` holds $72.22 against a ticket of $260-odd. The device would take it as
 * a part payment and leave a balance; the prototype refuses and names the
 * shortfall, because there is no split-tender model behind it. Which of those is
 * right is an open question — see **Overview**.
 */
export const TooSmall: Story = {
    name: "Credit too small",
    render: function TooSmallStory() {
        const results = searchRainchecks("51381", rainchecks);
        return (
            <Frame enabled>
                <CheckoutBody
                    lines={[
                        { id: "greenfee", name: "Senior Weekday", qty: 5, unitPrice: 26.99, stock: [27, 350] },
                        { id: "cart", name: "Dunes Cart", qty: 5, unitPrice: 23.1, stock: [20, 100] },
                    ]}
                    subtotal={250.45}
                    tax={15.03}
                    total={265.48}
                    payments={0}
                    tab="RAIN"
                    amount="$72.22"
                    raincheck={{ query: "51381", results, selectedId: "51381" }}
                />
            </Frame>
        );
    },
};
