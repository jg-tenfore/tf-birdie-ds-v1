import type { Meta, StoryObj } from "@storybook/react-vite";

import { GroupIssueScreen } from "@/components/concepts/rainchecks/aug-31/group-issue-screen";
import { GroupIssueFlow } from "@/components/concepts/rainchecks/group-issue-flow";
import {
    mixedHoleFoursome,
    partlyDoneFoursome,
    rainedOutFoursome,
    rainedOutHeading,
    twosome,
} from "@/components/concepts/rainchecks/group-issue";

/**
 * **Aug 31 — the chosen solution. Issuing the whole group.**
 *
 * The other half of the flow. Screens 1–4 in this folder are about **redeeming**
 * a credit; this is where credits come from, and it is step 2 of the journey
 * rather than step 5. It is numbered 5 because it arrived last and the four
 * screens above it are already deployed and linked from Linear — renumbering
 * would break those links to buy tidiness.
 *
 * > *"It would be nice to set up all the rainchecks on one screen. So you would
 * > not need to click through that flow four separate times for a foursome."*
 * > — Weston, Aug 20
 *
 * ## Option B is chosen here too
 *
 * Aug 20 drew two options and left the choice open in WJ-84. **It is now
 * settled: Option B — one stop for the group.** The hole count is asked once,
 * at the top, for everybody; rows that differ come off it by hand.
 *
 * The bet, now the design's assumption: **the hole count is a fact about the
 * weather, not about each player.** The horn goes on the ninth and the foursome
 * walks off the ninth. One number to get right instead of four.
 *
 * Option A — a stepper on every row — is retired, the same way Aug 24's options
 * A and C were once the tender decision was made. Both survive in
 * `Flows → Rainchecks → Aug 20` as the record of how the choice was made.
 *
 * **Start with "The whole trip"**, which is the story that proves the batch's
 * actual claim: a rained-off foursome is one visit to this screen rather than
 * four.
 */
const meta = {
    title: "Flows/Rainchecks/Aug 31/5 — Issue the group",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const TEE_TIME = "7/20/2026 7:00 PM";

/**
 * **The whole trip — tee sheet → the group screen → where the credits land.**
 *
 * The only place the batch's claim can actually be checked. Walk it:
 *
 * 1. **Tap the red RAINCHECK** on any player. The button has not moved — this is
 *    the shipping detail screen with its buttons made live, because Weston asked
 *    for the entry point to stay exactly where it is. What changed is where it
 *    *goes*: one player's button now opens the whole group.
 * 2. **Drag the group slider.** Four different prices move together off one
 *    number — the thing a shared control is for. **Tap a row's hole count** to
 *    take that player off it; the row marks itself `SET BY HAND` and later moves
 *    of the group number leave it alone.
 * 3. **Reassign one.** Use the dropdown on the right to put Tom Watson's credit
 *    on Weston Farnsworth — the visiting-buddy case. The row tints and the band
 *    counts it.
 * 4. **Issue.** One press, and the button says what it is about to do first.
 * 5. **Look at the landing.** Credits group by the **account** holding them, not
 *    by round — so a reassignment shows as one account with two credits, which
 *    is the only thing that dropdown was ever for and is invisible on the issue
 *    screen. Each credit still names the round it was cut from.
 * 6. **Go back to the tee time.** Every player carries a credit and none offers
 *    RAINCHECK any more. The shipping flow reaches that state after four round
 *    trips.
 *
 * The landing step is a **demonstration, not a screen to build** — it exists to
 * prove the batch produces the same `Raincheck` object the record and the RAIN
 * tender already understand. Screens 1–4 of this folder consume exactly that
 * object.
 */
export const TheWholeTrip: Story = {
    name: "The whole trip — tee sheet to the credits",
    render: () => <GroupIssueFlow variant="one-stop" seed={rainedOutFoursome} heading={rainedOutHeading} teeTime={TEE_TIME} />,
};

/**
 * **The screen on its own.** A rained-out foursome, one number at the top.
 *
 * Drag the slider and watch four amounts resolve from one hole count — four
 * different rates, one fact about the weather. The rows are short because the
 * hole count has left them; what remains is what differs per player: the tick,
 * the money their own rate produces, and the account it lands on.
 */
export const TheScreen: Story = {
    name: "Rained-out foursome",
    render: () => <GroupIssueScreen seed={rainedOutFoursome} />,
};

/**
 * **One of them played on** — the case Option B has to earn.
 *
 * Oda Brennevin kept going after the rest came in, so her row is off the group
 * number: her hole count is a stepper and the row carries `SET BY HAND`. Move
 * the group slider and hers stays put — that is why the flag is **stored rather
 * than inferred** from whether the value differs. **Back to the group** puts her
 * back on it.
 *
 * This is the cost of the chosen option, and it is one tap per exception. The
 * decision in WJ-84 was that groups stop together often enough for that trade to
 * be worth it.
 */
export const OneException: Story = {
    name: "One of them played on",
    render: () => (
        <GroupIssueScreen
            seed={rainedOutFoursome}
            tweak={(d) => d.map((x) => (x.positionId === "10314912" ? { ...x, custom: true, holesPlayed: 12 } : x))}
        />
    ),
};

/**
 * **A nine among the eighteens — and the cap rule is now decided.**
 *
 * The case that exists only because there is a group number at all. Tom Watson
 * booked the nine; the group stop is 12, and his round cannot follow it. A
 * banner names him — *"…booked a shorter round than the group stop, so their
 * credit is worked out from the end of the round actually booked"* — and his
 * hole count tints amber and reads **capped — booked 9**.
 *
 * **The rule, settled Sept 3: cap at his own round.** He gets the last hole of
 * the nine he actually bought — **$3.38**, against the others' $33.33. He
 * finished the round he paid for, so there is nothing more to give back. The
 * alternative considered and rejected was unticking him automatically, which
 * would have hidden a decision the operator should see.
 *
 * It is an awkward number to hand across a counter, so the row states the
 * reason in words rather than leaving the operator to explain an amount they
 * cannot account for. `clampHoles()` already implements this — the rule was
 * always in the code, it just had no ruling behind it.
 *
 * This remains the strongest single argument against Option B, and it is on
 * screen rather than in a footnote.
 */
export const MixedHoles: Story = {
    name: "A nine among the eighteens — the cap rule",
    render: () => <GroupIssueScreen seed={mixedHoleFoursome} startHoles={12} />,
};

/**
 * **Two of them finished.**
 *
 * Unticking leaves the row visible and legible rather than hiding it — you have
 * to be able to see what you turned off. Excluded rows also drop out of the
 * exception controls, so the list quietens as you narrow it.
 *
 * > *"You would need to be able to deselect the ones you do not want to issue a
 * > raincheck for."*
 */
export const SomeExcluded: Story = {
    name: "Two of them finished",
    render: () => (
        <GroupIssueScreen
            seed={rainedOutFoursome}
            tweak={(d) => d.map((x) => (x.positionId === "10314912" || x.positionId === "10314913" ? { ...x, include: false } : x))}
        />
    ),
};

/**
 * **A round already credited earlier in the day.**
 *
 * Justin Girard's row cannot be ticked, carries no controls, and the group
 * number does not reach it — a round cannot be rainchecked twice. The count
 * reads three.
 *
 * > *"I already issued Justin's raincheck for 72 — that's greyed out."*
 */
export const OneAlreadyIssued: Story = {
    name: "One round already credited",
    render: () => <GroupIssueScreen seed={partlyDoneFoursome} />,
};

/**
 * **Voiding a credit.**
 *
 * Justin Girard's credit has **already been partly spent**, so his VOID is dead
 * and the row says why — once the money has left it is a refund question, not a
 * correction. Oda Brennevin's was cut twenty minutes ago and untouched, so hers
 * is live.
 *
 * Pressing it asks **why**, from a fixed list. Free text would be left blank,
 * and *"issued to the wrong player"* is precisely the count that would justify
 * redesigning this screen.
 *
 * Voiding releases the round: it becomes tickable again and rejoins the count.
 * Without that, a credit cut for the wrong player leaves the round locked as
 * well as the money misplaced.
 */
export const Voidable: Story = {
    name: "Voiding a credit",
    render: () => (
        <GroupIssueScreen
            seed={partlyDoneFoursome.map((p) =>
                p.id === "10314912" ? { ...p, issued: { raincheckId: "51379", amount: 39.78, at: "2:41 PM", to: "Oda Brennevin" } } : p,
            )}
        />
    ),
};

/**
 * **Two players, for scale.**
 *
 * The group control has a weaker case at this size — two steppers is not four.
 * Still open, and it is a build question rather than a design one: whether the
 * header earns its space below three players, or whether small bookings should
 * fall back to a single-issue screen. Flagged on WJ-71.
 */
export const Twosome: Story = {
    name: "Two players",
    render: () => <GroupIssueScreen seed={twosome} />,
};
