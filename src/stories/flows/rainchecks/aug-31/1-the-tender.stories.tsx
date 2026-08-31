import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { RaincheckTender, type RaincheckTenderProps } from "@/components/concepts/rainchecks/aug-31/raincheck-tender";
import { RedeemScreen, TICKET_OWED } from "@/components/concepts/rainchecks/redeem-screen";
import { checkoutCustomer } from "@/components/screens/checkout/checkout-fixtures";
import { creditsForCustomer, isRedeemable, rainchecks } from "@/data/rainchecks";

/**
 * **Aug 31 — the chosen solution. The RAIN tender.**
 *
 * Option B, hardened. Two tabs on the tender panel:
 *
 * > **AVAILABLE** — what ships today, and never slower.
 * > **HISTORY** — everything else, one tap away, with a count badge.
 *
 * Every story here is the **shipping redeem screen** — same app bar, same
 * ticket, same seven-tender strip, same action bar — with the RAIN panel's
 * contents replaced and nothing else touched. Open
 * [4 — Redeem at the register](?path=/story/flows-rainchecks-4-redeem-at-the-register--default)
 * beside it.
 *
 * **Start with "Available is empty"**, which is the incident and the reason
 * this folder exists. It involves no search at all.
 */
const meta = {
    title: "Flows/Rainchecks/Aug 31/1 — The RAIN tender",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const WESTON = rainchecks.find((r) => r.customerName.includes("Senior"))?.customerId ?? rainchecks[0].customerId;
const ALL = creditsForCustomer(WESTON);
const SPENDABLE = ALL.filter((c) => isRedeemable(c));
const DEAD = ALL.filter((c) => !isRedeemable(c));

/** The panel, inside the real screen, with the action bar wired to selection. */
const Live = (props: Partial<RaincheckTenderProps>) => {
    const [selectedId, setSelectedId] = useState<string | undefined>();
    return (
        <RedeemScreen canApply={Boolean(selectedId)} applyLabel={selectedId ? "Apply Raincheck" : "Pick a raincheck"}>
            <RaincheckTender
                customerName={props.customerName ?? checkoutCustomer}
                customerId={props.customerId ?? WESTON}
                owed={props.owed ?? TICKET_OWED}
                credits={props.credits}
                tab={props.tab}
                availableQuery={props.availableQuery}
                historyQuery={props.historyQuery}
                onSelect={setSelectedId}
            />
        </RedeemScreen>
    );
};

/**
 * **The incident, and the fix — no search involved.**
 *
 * This customer has rainchecks. None of them can pay for this ticket: one was
 * used up at **Falls Road**, one expired, one was voided. Today the pane goes
 * blank here and the operator says *"I don't see it here."*
 *
 * **Option B on its own would still go blank on this tab** — its own risk note
 * said the badge was the only thing preventing a repeat. So the Available tab
 * is not allowed to render empty. Two things fill it:
 *
 * 1. **The sentence, meant to be read out loud.** *"3 rainchecks on file. The
 *    most recent was spent 5/02/2026 at Falls Road — Twilight green fee."* That
 *    ends the conversation. "Nothing found" starts a longer one.
 * 2. **A 52dp hand-off that names the count** and moves to History. The badge
 *    stays as the ambient signal; a blank pane is exactly the moment ambient
 *    stops being enough.
 *
 * Tap the hand-off and read the next story.
 */
export const AvailableEmpty: Story = {
    name: "Available is empty — the incident, fixed",
    render: () => <Live credits={DEAD} />,
};

/**
 * **The common case, for scale.**
 *
 * Two spendable credits, no badge, nothing unusual. This is the path a course
 * runs all day, and the whole point of choosing Option B is that this tab is
 * **not** made heavier to fix the awkward case.
 *
 * Each row says what it is — the round it came from, the course, and whether it
 * clears this ticket — which is WJ-76's card, not new work. The shipping row is
 * an id and a balance in 12px.
 */
export const AvailableCommon: Story = {
    name: "Available — two credits, the ordinary day",
    render: () => <Live credits={SPENDABLE} />,
};

/**
 * **HISTORY — where the answer lives.**
 *
 * Used, expired and cancelled credits on this customer, ranked, each carrying
 * the sentence that explains it **and the course**. `#29115` is the credit from
 * the incident: issued at The Dunes, spent twice at Falls Road.
 *
 * Until the model gained `course` on Aug 24 there was nowhere to record that,
 * so the terminal could say a credit was empty but never *where* it went.
 */
export const History: Story = {
    name: "History — used, expired, cancelled",
    render: () => <Live credits={DEAD} tab="history" />,
};

/**
 * **A live credit under another name — and it is tappable.**
 *
 * History search spans **every customer**, because the reason to be on this tab
 * is often that the name on the ticket is not the name on the credit: a
 * misspelling, a spouse's booking, a company account, a slip with only an id.
 *
 * Aug 24's Option B made every History row read-only, which was safe while the
 * tab only held dead credits. A cross-customer search breaks that assumption —
 * finding a valid credit you cannot then apply is the same dead end wearing
 * different clothes. **Spendable rows found here select like any other.**
 *
 * Type an id or a name into the field and watch the ranking: spendable first.
 */
export const HistorySearched: Story = {
    name: "History — searched across every customer",
    render: () => <Live tab="history" historyQuery="weston" />,
};

/**
 * **The customer hands over a slip with an id on it.**
 *
 * `29115` is typed in. Available's field is scoped to spendable credits — byte
 * for byte the query that ships today, which is the direct answer to the worry
 * that including exhausted credits would slow the common case down. Nothing was
 * hidden to keep it fast; the two questions were separated.
 *
 * So it finds nothing, and that is a **true** answer to a narrow question. The
 * screen then says what the broader one would return, rather than stopping at
 * the same empty pane the operator started from.
 *
 * **The hand-off carries the typed string with it.** Tap it: History opens
 * already searched on `29115`, and there is the credit — spent at Falls Road on
 * 5/02. The operator typed the id once.
 */
export const AvailableSearchEmpty: Story = {
    name: "Available search finds nothing — hand off to History",
    render: () => <Live credits={DEAD} availableQuery="29115" />,
};
