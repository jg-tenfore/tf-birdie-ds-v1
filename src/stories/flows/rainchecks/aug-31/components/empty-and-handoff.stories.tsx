import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { HandoffBanner } from "@/components/concepts/rainchecks/aug-31/raincheck-tender";
import { NothingSpendable } from "@/components/concepts/rainchecks/credit-history";
import { creditsForCustomer, noCreditsSummary, rainchecks } from "@/data/rainchecks";
import { appColors } from "@/theme/app-replica-tokens";
import { PaneFrame } from "./pane-frame";

/**
 * **Aug 31 → Components. The empty state, and the hand-off.**
 *
 * **The two parts that decide whether this redesign worked.** Everything else in
 * the folder is an improvement; this pair is the fix.
 *
 * ## Why they exist
 *
 * Option B's own risk note, written the day it was drawn:
 *
 * > *"The risk is the badge. It is the only thing standing between this and the
 * > screen that caused the incident. An operator who does not notice it says 'I
 * > don't see it here' exactly as before."*
 *
 * A 22px pill in a tab bar is not a load-bearing structure. So the Available tab
 * is **not permitted to render as an empty pane**. When nothing is spendable,
 * these two fill it.
 *
 * ## 1 — The sentence
 *
 * `NothingSpendable` is written to be **read out loud**. Not a status, not an
 * error: a sentence an operator can say across a counter that ends the
 * conversation rather than starting a longer one.
 *
 * > **No credits available for Weston Senior.**
 * > 3 rainchecks on file. The most recent was spent 5/02/2026 at Falls Road —
 * > Twilight green fee.
 *
 * `noCreditsSummary()` composes it, and the ordering inside it is deliberate:
 * **redemptions lead, voids come last.** A void reason like *"issued to the
 * wrong player"* is an internal correction, and reading it across a counter
 * helps nobody.
 *
 * ## 2 — The hand-off
 *
 * A full-width **52dp** control that names the count and moves to History.
 * Amber-edged to match the badge it reinforces.
 *
 * **It carries the typed query with it.** When the hand-off follows a failed
 * search on Available, History opens with that string already in its field — the
 * operator does not type the name twice.
 *
 * ## Why it does not auto-switch
 *
 * Jumping straight to History would hide the fact that Available was empty,
 * which is half of what the operator has to tell the customer, and it would
 * fight with whichever tab they pick next. One labelled tap keeps both facts.
 *
 * **Open question, not a settled decision** — it is on the Linear issue, and it
 * is a question for a pro shop rather than for a desk.
 */
const meta = {
    title: "Flows/Rainchecks/Aug 31/Components/Empty state & hand-off",
    parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const WESTON = rainchecks.find((r) => r.customerName.includes("Senior"))?.customerId ?? rainchecks[0].customerId;
const ALL = creditsForCustomer(WESTON);

/**
 * **The pair, as the Available tab renders them.**
 *
 * Compare against the shipping screen, which renders nothing at all here — see
 * [Aug 24 → 4 — Start to finish → Today](?path=/story/flows-rainchecks-aug-24-4-start-to-finish--today).
 */
export const Together: Story = {
    name: "Together — what fills an empty Available tab",
    render: function Together() {
        const [handed, setHanded] = useState(false);
        return (
            <PaneFrame height="auto" note="The branch that decides whether the redesign worked">
                <Box>
                    <NothingSpendable customerName="Weston Senior" summary={noCreditsSummary(ALL)} />
                    <Box sx={{ height: 12 }} />
                    <HandoffBanner count={3} onOpen={() => setHanded(true)} />
                    {handed && (
                        <Typography sx={{ px: 2, pb: 2, fontSize: 14, color: appColors.greenTee }}>
                            → History opens, with the three credits and the course each was spent at.
                        </Typography>
                    )}
                </Box>
            </PaneFrame>
        );
    },
};

/**
 * **The summary, under every condition it has to cover.**
 *
 * `noCreditsSummary()` has to produce a readable sentence whatever the ledger
 * looks like, including the case nobody plans for — a customer who genuinely
 * never had one, which is the only time "nothing" is the true answer.
 */
export const SummaryVariants: Story = {
    name: "Every summary the sentence has to produce",
    render: () => {
        const cases: [string, ReturnType<typeof creditsForCustomer>][] = [
            ["Spent — leads with where the money went", ALL.filter((c) => c.redemptions?.length)],
            ["Expired only — names what lapsed and how much was on it", ALL.filter((c) => c.id === "22470")],
            ["Voided only — says a manager can explain, and does not accuse anybody", ALL.filter((c) => c.voided)],
            ["Never had one — the only true 'nothing'", []],
        ];
        return (
            <Stack sx={{ gap: 2, width: 890 }}>
                {cases.map(([label, credits]) => (
                    <Stack key={label} sx={{ gap: 0.5 }}>
                        <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{label}</Typography>
                        <Box sx={{ border: `1px solid ${appColors.divider}` }}>
                            <NothingSpendable customerName="Weston Senior" summary={noCreditsSummary(credits)} />
                        </Box>
                    </Stack>
                ))}
            </Stack>
        );
    },
};

/** The hand-off alone, at each count it has to render. Singular is not "1 rainchecks". */
export const HandoffCounts: Story = {
    name: "Hand-off — counts and grammar",
    render: () => (
        <PaneFrame height="auto">
            <Stack sx={{ py: 1 }}>
                {[1, 3, 12].map((n) => (
                    <HandoffBanner key={n} count={n} onOpen={() => {}} />
                ))}
            </Stack>
        </PaneFrame>
    ),
};
