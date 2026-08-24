import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import {
    OptionAInline,
    OptionBTabs,
    OptionCOverlay,
    type TenderOptionProps,
} from "@/components/concepts/rainchecks/tender-history-options";
import { RedeemScreen, TICKET_OWED } from "@/components/concepts/rainchecks/redeem-screen";
import { checkoutCustomer } from "@/components/screens/checkout/checkout-fixtures";
import { creditsForCustomer, rainchecks } from "@/data/rainchecks";

/**
 * **Concept — Aug 24. The counter moment.**
 *
 * > *"Employee clicks raincheck payment type and searches customer name. Nothing
 * > comes up. Employee says 'I don't see it here.' Customer gets mad. Employee
 * > has to talk to the manager to look it up in buck and then they find out
 * > customer used it at a different course a few weeks ago."*
 *
 * The register's lookup filters to spendable credits, so a used one does not
 * rank low — **it does not exist**. Empty reads as *you never had one*, which is
 * a different fact from *you used it at Falls Road on the 25th*. Collapsing the
 * two is what sends people to a manager.
 *
 * **Start with "Nothing spendable".** That story is the fix for the incident as
 * described, and it involves no search at all.
 *
 * Every story here is the **shipping redeem screen** — `Flows → Rainchecks →
 * 4 — Redeem at the register` — with the RAIN panel's contents replaced and
 * nothing else touched. Same app bar, same ticket, same tender tabs, same action
 * bar. Open the two side by side.
 */
const meta = {
    title: "Flows/Rainchecks/Aug 24/1 — The counter moment",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const WESTON = rainchecks.find((r) => r.customerName.includes("Senior"))?.customerId ?? rainchecks[0].customerId;

/**
 * Every story here is the **shipping redeem screen** with one region replaced.
 *
 * Same app bar, same ticket pane, same tender tabs, same action bar as
 * `4 — Redeem at the register`. Only the contents of the RAIN panel change,
 * because that is the only thing this feedback is about — and a proposal that
 * redraws the whole screen cannot be compared against the one it replaces.
 */
const Live = ({ Component, ...rest }: { Component: (p: TenderOptionProps) => React.ReactElement } & Partial<TenderOptionProps>) => {
    const [query, setQuery] = useState(rest.query ?? "");
    const [selectedId, setSelectedId] = useState<string | undefined>();
    return (
        <RedeemScreen canApply={Boolean(selectedId)} applyLabel={selectedId ? "Apply Raincheck" : "Pick a raincheck"}>
            <Component
                customerName={rest.customerName ?? checkoutCustomer}
                customerId={rest.customerId ?? WESTON}
                owed={rest.owed ?? TICKET_OWED}
                credits={rest.credits}
                query={query}
                onQuery={setQuery}
                selectedId={selectedId}
                onSelect={setSelectedId}
            />
        </RedeemScreen>
    );
};

/**
 * **The incident, and the fix — no search involved.**
 *
 * This customer has rainchecks. None of them can pay for this ticket: one was
 * used up at **Falls Road**, one expired, one was voided. The shipping screen
 * shows an empty pane here and the operator says *"I don't see it here."*
 *
 * This says what they actually had, in a sentence meant to be **read out loud**.
 * That sentence ends the conversation; "nothing found" starts a longer one and a
 * trip to a manager.
 *
 * Note the credit that caused all this: `#29115`, issued at the Dunes, spent at
 * Falls Road on 4/25 and 5/02. Until the model gained a `course` field there was
 * nowhere to record that, so the terminal could say a credit was empty but never
 * *where* it went.
 */
export const NothingSpendable: Story = {
    name: "Nothing spendable — what the screen should say",
    render: () => (
        <Live
            Component={OptionAInline}
            credits={creditsForCustomer(WESTON).filter((c) => c.balance <= 0 || c.voided || c.id === "22470")}
        />
    ),
};

/**
 * **Option A — one list, never empty.**
 *
 * Search returns everything that matches, ranked: spendable at the top and
 * tappable, everything else below a divider with the sentence that explains it.
 *
 * Type `weston` and watch what comes back — the two spendable credits first,
 * then the used, expired and voided ones underneath rather than nowhere.
 *
 * **Weston's worry lives here:** *"if we include all exhausted rainchecks it
 * will slow down the search for the more common use case."* The answer is
 * ranking rather than omission. The spendable ones are still the first thing on
 * screen; nothing had to be hidden to achieve that. And search is already the
 * exception path — the pane opens on the cart customer, so by the time anyone
 * types, the default has already failed them.
 */
export const OptionA: Story = {
    name: "Option A — never say nothing",
    render: () => <Live Component={OptionAInline} />,
};

/** Option A with a search already run, so the ranking is visible at a glance. */
export const OptionASearched: Story = {
    name: "Option A — searched",
    render: () => <Live Component={OptionAInline} query="weston" />,
};

/**
 * **Option B — Available and History as siblings.**
 *
 * Two tabs. **Available** is exactly what ships today and never gets slower.
 * **History** is everything else, one tap away, with a badge saying how much is
 * there.
 *
 * This is closest to Weston's own instinct — keep the common path pristine and
 * make the awkward one deliberate.
 *
 * **The risk is the badge.** It is the only thing standing between this and the
 * screen that caused the incident. An operator who does not notice it says "I
 * don't see it here" exactly as before.
 */
export const OptionB: Story = {
    name: "Option B — Available / History tabs",
    render: () => <Live Component={OptionBTabs} />,
};

/**
 * **Option C — the record, over the sale.**
 *
 * The tender stays as it ships. One control opens the customer's raincheck
 * record **as an overlay** — the ticket is not abandoned and the operator is
 * looking at the screen a manager would open.
 *
 * This answers Weston's objection directly: *"it would send them to another
 * screen"* — it doesn't. And it reuses the record built in WJ-74/75 rather than
 * rebuilding that history inside a tender pane.
 *
 * The control names the count, so the pane still says there is something to look
 * at before anyone concludes there isn't.
 */
export const OptionC: Story = {
    name: "Option C — the record, over the sale",
    render: () => <Live Component={OptionCOverlay} />,
};

/**
 * The ordinary case, for scale.
 *
 * A customer with two spendable credits. All three options are identical here —
 * which is the point. Nothing about this work should make the common path
 * heavier, and the comparison is only fair if it starts from the same screen.
 */
export const TheCommonCase: Story = {
    name: "The common case — two credits, nothing unusual",
    render: () => (
        <Live
            Component={OptionAInline}
            credits={creditsForCustomer(WESTON).filter((c) => c.balance > 0 && !c.voided && c.id !== "22470")}
        />
    ),
};
