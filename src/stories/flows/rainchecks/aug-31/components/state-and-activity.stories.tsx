import type { Meta, StoryObj } from "@storybook/react-vite";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { CreditActivity, CreditOrigin, NotUsableDivider, StateChip } from "@/components/concepts/rainchecks/credit-history";
import { CREDIT_STATES, creditState, raincheckById, whyNotUsable } from "@/data/rainchecks";
import { appColors } from "@/theme/app-replica-tokens";
import { PaneFrame } from "./pane-frame";

/**
 * **Aug 31 → Components. State, origin and activity.**
 *
 * The three small parts every surface in this project shares — the tender's two
 * tabs, the listing, the customer record and the payment result. Get these right
 * once and every screen agrees with every other one.
 *
 * ## StateChip — five states, and they are derived, never stored
 *
 * `creditState()` computes the word from the record, in this precedence:
 *
 * ```
 * voided   → r.voided is set          (an operator cancelled it)
 * used     → r.balance <= 0.001       (spent out)
 * expired  → r.expires < today        (lapsed with money on it)
 * part spent → r.spent > 0
 * available → everything else
 * ```
 *
 * **Precedence matters and is not alphabetical.** A voided credit with a zero
 * balance is *voided*, not *used* — the two carry different obligations, and a
 * screen that shows the wrong one sends the operator down the wrong path.
 *
 * Today the register infers this from three columns of arithmetic, which is why
 * an operator reads `balance 0` as *"no raincheck"* rather than *"spent"*.
 *
 * ## CreditOrigin — where it came from, in words a customer recognises
 *
 * *"51381, $72.22"* settles nothing at a counter. *"The 7:00 PM on July 20th at
 * the Dunes"* settles it. **When the course is not this one the whole line turns
 * amber**, because in a multi-course operation that is the most useful fact on
 * the row.
 *
 * ## CreditActivity — the full ledger
 *
 * Issued, every redemption **with its own course**, and the void if there is
 * one. This is the *"any activities on that raincheck"* half of the written ask,
 * and it is the same component in the listing's expanded row and the tender's
 * History rows.
 *
 * ## whyNotUsable — the sentence that ends the conversation
 *
 * One line, naming the course, or `null` when the credit is fine. It is the
 * single function that separates *"I don't see it here"* from *"you used it at
 * Falls Road on the 2nd"*.
 */
const meta = {
    title: "Flows/Rainchecks/Aug 31/Components/State, origin & activity",
    parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every chip, in ranking order — which is also the order History sorts them. */
export const Chips: Story = {
    name: "State chips",
    render: () => (
        <PaneFrame height="auto" note="Ranking order — spendable first, then the rest">
            <Stack direction="row" sx={{ gap: 1.5, p: 2, alignItems: "center", flexWrap: "wrap" }}>
                {CREDIT_STATES.map((s) => (
                    <StateChip key={s} state={s} />
                ))}
            </Stack>
        </PaneFrame>
    ),
};

/**
 * **Origin — this course versus another.**
 *
 * `#51381` was cut here. `#38204` was cut at Falls Road, and the amber says so
 * before anybody has to ask.
 */
export const Origins: Story = {
    name: "Origin — here, and elsewhere",
    render: () => (
        <PaneFrame height="auto">
            <Stack sx={{ gap: 1.5, p: 2 }}>
                {["51381", "38204", "22470"].map((id) => (
                    <Box key={id}>
                        <Typography sx={{ fontSize: 12, color: appColors.textDisabled, fontFamily: "Roboto Mono, monospace" }}>
                            #{id}
                        </Typography>
                        <CreditOrigin credit={raincheckById(id)!} />
                    </Box>
                ))}
            </Stack>
        </PaneFrame>
    ),
};

/**
 * **The whole life of the credit from the incident.**
 *
 * `#29115`: issued at The Dunes of Delgado, spent at Falls Road twice. Three
 * lines, and every one of them is a fact the register already held and could
 * not say.
 */
export const Activity: Story = {
    name: "Activity — the incident's credit",
    render: () => (
        <PaneFrame height="auto" note="#29115 — issued at one course, spent at another, twice">
            <Box sx={{ p: 2 }}>
                <CreditActivity credit={raincheckById("29115")!} />
            </Box>
        </PaneFrame>
    ),
};

/**
 * **Every sentence `whyNotUsable()` produces**, beside the state that produced
 * it — and the `null` that means there is nothing to explain.
 *
 * Read them as an operator would say them out loud. That is the test each one
 * has to pass.
 */
export const Sentences: Story = {
    name: "whyNotUsable — every sentence",
    render: () => (
        <Stack sx={{ width: 890, gap: 1, bgcolor: appColors.surface, border: `1px solid ${appColors.divider}`, p: 2 }}>
            {["41331", "38204", "29115", "22470", "51379"].map((id) => {
                const c = raincheckById(id)!;
                const why = whyNotUsable(c);
                return (
                    <Stack key={id} direction="row" sx={{ gap: 1.5, alignItems: "baseline" }}>
                        <Box sx={{ minWidth: 110 }}>
                            <StateChip state={creditState(c)} />
                        </Box>
                        <Typography sx={{ fontSize: 15, flex: 1, color: why ? appColors.textPrimary : appColors.textDisabled }}>
                            {why ?? "null — nothing to explain, the credit is spendable"}
                        </Typography>
                    </Stack>
                );
            })}
        </Stack>
    ),
};

/**
 * The divider between what you can spend and what you cannot.
 *
 * **Ranking rather than filtering is the entire argument.** The common case
 * stays first on screen; the awkward case stops being invisible. Omission is
 * what produced the empty list that started all of this.
 */
export const Divider: Story = {
    name: "The not-usable divider",
    render: () => (
        <PaneFrame height="auto">
            <Stack>
                {[1, 3].map((n) => (
                    <NotUsableDivider key={n} count={n} />
                ))}
            </Stack>
        </PaneFrame>
    ),
};
