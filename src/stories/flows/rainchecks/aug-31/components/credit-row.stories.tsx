import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";
import Box from "@mui/material/Box";

import { CreditRow, NotUsableDivider } from "@/components/concepts/rainchecks/credit-history";
import { raincheckById } from "@/data/rainchecks";
import { PaneFrame } from "./pane-frame";

/**
 * **Aug 31 → Components. The credit row, in five states.**
 *
 * **There is one row in this design, not one per surface.** The same component
 * renders on the Available tab, the History tab and the listing; what changes is
 * whether it is selectable and whether its activity is expanded. A second row
 * built for History would drift from this one inside a release.
 *
 * ## Anatomy
 *
 * ```
 * ┌──────────────────────────────────────────────────────────────┐
 * │ $72.22   [AVAILABLE]                                  #51381 │  ← 22px balance, state chip, id
 * │ ⛳ Issued 07/20/2026 at The Dunes · 7/20/2026 7:00 PM round   │  ← CreditOrigin — amber if not this course
 * │ ⟲ Used up 5/02/2026 at Falls Road — Twilight green fee        │  ← whyNotUsable(), only when unusable
 * │ Covers this ticket in full                                     │  ← only when usable and `owed` is passed
 * └──────────────────────────────────────────────────────────────┘
 * ```
 *
 * ## Rules
 *
 * | Rule | Why |
 * | :-- | :-- |
 * | A row you cannot spend renders as a `Box`, not a `ButtonBase` | It must not look pressable. Discovering the fact by tapping is worse than reading it |
 * | The `whyNotUsable` sentence **names the course** | *"Used up"* sends people to a manager; *"used up at Falls Road on 5/02"* ends the conversation |
 * | Coverage is stated **before** you commit | *"Covers this ticket in full"* or *"$38.72 would still be owed"*. Finding out on apply is worse |
 * | Selection is a green fill plus a 4px left edge | The device acknowledges a tap only by changing a number elsewhere on screen |
 * | An origin at another course is **amber** | In a multi-course operation this is the single most useful thing on the row |
 *
 * ## The `showActivity` prop
 *
 * Expands the full ledger under the row — issued, every redemption with its own
 * course, and the void if there is one. **History passes it; Available does
 * not.** A spendable credit's history is not what the operator is deciding on.
 */
const meta = {
    title: "Flows/Rainchecks/Aug 31/Components/Credit row",
    parameters: { layout: "centered" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const OWED = 53.48;

/**
 * All five states, in the order the tabs rank them.
 *
 * The first two are what Available shows. The last three are History's, below
 * the divider, greyed, each carrying its reason.
 */
export const FiveStates: Story = {
    name: "Five states",
    render: () => (
        <PaneFrame height="auto" note="Available, part spent · then the divider · then used, expired, voided">
            <Box sx={{ overflow: "hidden" }}>
                <CreditRow credit={raincheckById("41331")!} owed={OWED} />
                <CreditRow credit={raincheckById("38204")!} owed={OWED} />
                <NotUsableDivider count={3} />
                <CreditRow credit={raincheckById("29115")!} showActivity />
                <CreditRow credit={raincheckById("22470")!} showActivity />
                <CreditRow credit={raincheckById("51379")!} showActivity />
            </Box>
        </PaneFrame>
    ),
};

/**
 * **Coverage, stated before the tap.**
 *
 * `#41331` clears the ticket. `#38204` does not, and says by how much. The
 * shipping screen tells you neither until you apply.
 */
export const Coverage: Story = {
    name: "Covers it, and doesn't",
    render: () => (
        <PaneFrame height="auto">
            <Box>
                <CreditRow credit={raincheckById("41331")!} owed={OWED} />
                <CreditRow credit={raincheckById("38204")!} owed={OWED} />
            </Box>
        </PaneFrame>
    ),
};

/**
 * **Selection.** Tap either row.
 *
 * Green fill, 4px left edge. The device today acknowledges a tap only by
 * changing the amount field at the top of the pane, which is not where the
 * operator is looking.
 */
export const Selectable: Story = {
    name: "Selection",
    render: function Selectable() {
        const [id, setId] = useState<string | undefined>("41331");
        return (
            <PaneFrame height="auto">
                <Box>
                    {["41331", "38204"].map((cid) => (
                        <CreditRow key={cid} credit={raincheckById(cid)!} owed={OWED} selected={id === cid} onSelect={() => setId(cid)} />
                    ))}
                </Box>
            </PaneFrame>
        );
    },
};

/**
 * **The row from the incident.**
 *
 * `#29115` — issued at The Dunes of Delgado, spent at Falls Road on 4/25 and
 * again on 5/02. Every fact a manager opened Buck for is on this one row.
 *
 * Note that it is **not** a `ButtonBase`: nothing about it invites a tap,
 * because there is nothing to spend.
 */
export const TheIncidentRow: Story = {
    name: "The credit from the incident",
    render: () => (
        <PaneFrame height="auto" note="#29115 — issued at one course, spent twice at another">
            <CreditRow credit={raincheckById("29115")!} showActivity />
        </PaneFrame>
    ),
};
