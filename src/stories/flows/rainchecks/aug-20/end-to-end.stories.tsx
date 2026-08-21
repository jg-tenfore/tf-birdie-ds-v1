import type { Meta, StoryObj } from "@storybook/react-vite";

import { GroupIssueFlow } from "@/components/concepts/rainchecks/group-issue-flow";
import { rainedOutFoursome, rainedOutHeading } from "@/components/concepts/rainchecks/group-issue";

/**
 * **Concept — Aug 20, end to end.** Tee sheet → the group screen → where the
 * credits land.
 *
 * The option stories show the screen. These two show the **trip**, which is the
 * only place the batch's actual claim can be checked: that a rained-off foursome
 * is one visit to this screen rather than four.
 *
 * Both stories run the same harness and differ only in the middle step. The
 * entry, the commit and the landing are identical on purpose — so anything that
 * feels different between them is the hole-count question and nothing else.
 *
 * Compare **Weston's ideas → Create one, end to end**, which is this trip taken
 * one player at a time.
 */
const meta = {
    title: "Flows/Rainchecks/Aug 20/End to end",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const TEE_TIME = "7/20/2026 7:00 PM";

/**
 * **Live — Option A.** Every row carries its own hole count.
 *
 * Walk it:
 *
 * 1. **Tap the red RAINCHECK** on any player. The button has not moved — this is
 *    the shipping detail screen with its buttons made live, because Weston asked
 *    for the entry point to stay exactly where it is. What changed is where it
 *    goes: one player's button now opens the whole group.
 * 2. **Set the group up.** Untick anyone who finished, set each player's holes,
 *    and use the dropdown on the right to put a credit on somebody else's
 *    account — try putting Tom Watson's on Weston Farnsworth, the visiting-buddy
 *    case. The row tints and the band counts it.
 * 3. **Issue.** One press. The button says what it is about to do before you
 *    press it.
 * 4. **Look at the landing.** Credits are grouped by the **account** holding
 *    them, not by round — so a reassignment shows up as one account with two
 *    credits, which is the only thing that dropdown was ever for and is
 *    invisible on the issue screen. Each credit still names the round it was cut
 *    from.
 * 5. **Go back to the tee time.** Every player carries a credit and none of them
 *    offers RAINCHECK any more. The single-issue flow reaches this state after
 *    four round trips.
 *
 * **Start over** resets the booking if you want to run it again differently.
 */
export const OptionA: Story = {
    name: "Option A — row per player",
    render: () => <GroupIssueFlow variant="per-player" seed={rainedOutFoursome} heading={rainedOutHeading} teeTime={TEE_TIME} />,
};

/**
 * **Live — Option B.** One hole count for the group, exceptions after.
 *
 * The same five steps. The difference is step two, and it is worth running both
 * back to back rather than reading about it:
 *
 * - **Drag the group slider** and four different prices move together off one
 *   number. Option A's version of that move is four steppers.
 * - **Tap a row's hole count** to take that player off the group number. The
 *   button becomes a stepper, the row marks itself `SET BY HAND`, and moving the
 *   group slider afterwards leaves it alone.
 *
 * Everything either side of that step is byte-for-byte the same component as
 * Option A's story, so the comparison has one variable.
 *
 * The case worth setting up deliberately: push the group stop past 8 in the
 * **Option B — One stop for the group → A nine among the eighteens** story,
 * where a shorter booking has to be reconciled against a group number. That
 * fixture is not in this flow because the trip is about the batch, not the
 * clamp — but it is the strongest argument against B and should be looked at
 * before either option is chosen.
 */
export const OptionB: Story = {
    name: "Option B — one stop for the group",
    render: () => <GroupIssueFlow variant="one-stop" seed={rainedOutFoursome} heading={rainedOutHeading} teeTime={TEE_TIME} />,
};
