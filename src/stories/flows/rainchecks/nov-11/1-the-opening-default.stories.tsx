import type { Meta, StoryObj } from "@storybook/react-vite";

import { GroupIssueScreen } from "@/components/concepts/rainchecks/aug-31/group-issue-screen";
import { GroupIssueFlow } from "@/components/concepts/rainchecks/group-issue-flow";
import { OpeningComparison } from "@/components/concepts/rainchecks/nov-11/opening-comparison";
import { partlyDoneFoursome, rainedOutFoursome, rainedOutHeading } from "@/components/concepts/rainchecks/group-issue";

/**
 * **Nov 11 — the opening default, as an alternative.**
 *
 * Nevo has been running the Aug 31 issue screen in anger, and they like it.
 * One thing came back:
 *
 * > *"Right now, we default to issuing a rain check to all four players. Like,
 * > they're all checked… They request — normally they're kind of doing it
 * > player by player."* — Weston, Nov 11
 *
 * > *"Their main concern is that they don't notice the other ones are checked
 * > and they accidentally just issued four rain checks. They'd rather have to
 * > know they're doing it."* — Ryan, Nov 11
 *
 * Two defaults were proposed on the call and neither was chosen, so both are
 * drawn here rather than one being picked on their behalf:
 *
 * - **Option A — nobody ticked.** Weston's version. Every credit is a
 *   deliberate tick, including the player you just pressed RAINCHECK on.
 * - **Option B — only the player you tapped.** Ryan's refinement: *"either none
 *   or only default the player that you clicked. So if it's one through four
 *   and you click three, three could be checked."*
 *
 * **Start with "The three, side by side"**, which is the whole decision on one
 * screen. Then open the two trips, because the difference only becomes real
 * once you have pressed the button that causes it.
 *
 * ## What is not being changed
 *
 * **The screen itself.** Every other thing Aug 31 settled — one hole count for
 * the group, rows coming off it by hand, the reassignment dropdown, the cap
 * rule, voiding — is untouched and not reopened. The entire change is which
 * boxes are already ticked when the screen opens, which is why the comparison
 * can be three columns of ticks and still be complete.
 *
 * **The confirmation.** Weston noted the safety net already in place:
 *
 * > *"Before you finish and issue the rain check, it'll give you a synopsis of
 * > everything that you're doing… So it's not the easiest thing in the world to
 * > issue an unintended rain check."*
 *
 * That stays either way. It is a second line of defence, and the argument of
 * this page is that a default which needs one is the wrong default — the
 * operator pressed OK on four credits because four credits is what the screen
 * proposed, not because they failed to read.
 *
 * ## The case against, kept on the page
 *
 * Aug 31 chose "everyone ticked" on purpose, and the reason is still in the
 * source at `group-issue-flow.tsx`: singling out one player *"would only invite
 * the operator to think the others are somebody else's problem."* A rained-off
 * foursome is four credits, and a default of none makes the common case four
 * taps instead of nought.
 *
 * Nov 11 is evidence against that bet rather than an argument against it. Ryan,
 * who runs the courses:
 *
 * > *"It's just more situations where one person's coming in at a time than all
 * > four."*
 *
 * Worth knowing when you read these screens: a raincheck is not only a weather
 * instrument. *"Someone could hurt their back out there. It's not even
 * raining."* The solitary case is not an edge case.
 */
const meta = {
    title: "Flows/Rainchecks/Nov 11/1 — The opening default",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const TEE_TIME = "7/20/2026 7:00 PM";
/** Oda Brennevin — third of the four, so "the one you tapped" is visibly not the first row. */
const TAPPED = "10314912";

/**
 * **The three, side by side — today, Option A, Option B.**
 *
 * One operator has pressed RAINCHECK on Oda Brennevin. This is the next thing
 * they see, under each default.
 *
 * Read the bottom bar rather than the ticks: it is the shortest statement of
 * what each default is about to do. Today's says **Issue 4 rainchecks ·
 * $206.18** when the operator meant one — and that is the whole complaint, in
 * the place where it actually bites.
 *
 * Not a screen to build. The tick column is the only part of it that would ever
 * ship; the rest is scaffolding so the three can be looked at together. The
 * amounts come from the same helpers the real screens use, so they cannot drift
 * from what the next two stories do.
 */
export const SideBySide: Story = {
    name: "The three, side by side",
    render: () => <OpeningComparison seed={rainedOutFoursome} tappedId={TAPPED} />,
};

/**
 * **Option A — nobody ticked.** Weston's version, as the real screen.
 *
 * The action bar opens on **Nothing selected** and is dead until you tick
 * somebody. Nothing can leave this screen that an operator did not choose, and
 * the screen refuses to propose anything at all.
 *
 * The cost is honest and it is on the screen: a genuinely rained-off foursome
 * is now four taps, or one on **Select all**, which is still sitting in the
 * header where it always was. That control was built for the other direction —
 * clearing a list that arrived full — and under Option A it quietly becomes the
 * fast path for the common case. Worth watching in use: if Nevo ends up
 * pressing *Select all* every time, Option A has just moved the problem one tap
 * away rather than solving it.
 */
export const OptionA: Story = {
    name: "Option A — nobody ticked",
    render: () => <GroupIssueScreen seed={rainedOutFoursome} preselect="none" />,
};

/**
 * **Option B — only the player you tapped.** Ryan's refinement, as the real
 * screen.
 *
 * Oda Brennevin's row is ticked because hers is the button that was pressed;
 * the other three are not. The action bar opens on **Issue 1 raincheck ·
 * $39.78** — which is what the operator asked for, stated before they commit to
 * it.
 *
 * This is the one that needs the whole flow rather than the screen alone, and
 * the reason the prop is threaded back through `GroupIssueFlow`: the player it
 * ticks is only known at the tee sheet, one screen earlier. Opening this story
 * alone sets the tap by hand so the screen can be read on its own; **the trip
 * below is where it is actually true.**
 *
 * The bet it makes against Option A: the operator pressing RAINCHECK on a named
 * player has already made one choice, and re-asking for it is ceremony. The bet
 * it makes against today: they have made exactly *one* choice, not four.
 */
export const OptionB: Story = {
    name: "Option B — only the player you tapped",
    render: () => <GroupIssueScreen seed={rainedOutFoursome} preselect="tapped" tappedId={TAPPED} />,
};

/**
 * **Option A, the whole trip** — tee sheet → issue screen → where credits land.
 *
 * Press RAINCHECK on any player. The screen opens with nothing ticked,
 * whichever player you pressed, and the bar reads **Nothing selected**.
 *
 * Walk it twice — once pressing one player and issuing one credit, once using
 * **Select all** for the whole group — because Option A's cost and Option A's
 * safety are the same two taps seen from different ends.
 */
export const OptionATrip: Story = {
    name: "Option A — the whole trip",
    render: () => (
        <GroupIssueFlow variant="one-stop" seed={rainedOutFoursome} heading={rainedOutHeading} teeTime={TEE_TIME} preselect="none" />
    ),
};

/**
 * **Option B, the whole trip.** The story that proves the claim.
 *
 * Press RAINCHECK on **Oda Brennevin** and she is the one ticked. Go back and
 * press it on **Weston Farnsworth** instead and he is. That is the behaviour
 * the comparison can only assert, and it is worth doing both ways before
 * choosing — the tap now carries meaning it did not carry before, and an
 * operator who presses whichever button is nearest will get a credit for
 * whoever that was.
 *
 * Today's build ignores which button was pressed. The information was always
 * there — `onAction` has handed over the player all along — it was being
 * dropped on purpose.
 */
export const OptionBTrip: Story = {
    name: "Option B — the whole trip",
    render: () => (
        <GroupIssueFlow variant="one-stop" seed={rainedOutFoursome} heading={rainedOutHeading} teeTime={TEE_TIME} preselect="tapped" />
    ),
};

/**
 * **One round already credited, under Option B.**
 *
 * The rule that sits ahead of the preference: a round already credited is never
 * ticked, in any of the three modes, because it cannot be credited twice.
 *
 * Here Justin Girard's round was credited earlier in the day and Oda
 * Brennevin's button was the one pressed. She is ticked, he is not and cannot
 * be, and the other two are waiting to be chosen. Shown because it is the one
 * place the new preference could have been written to contradict an existing
 * rule, and it is not: `includeFor()` checks `issued` first.
 */
export const AlreadyCredited: Story = {
    name: "One already credited — Option B",
    render: () => <GroupIssueScreen seed={partlyDoneFoursome} preselect="tapped" tappedId={TAPPED} />,
};

/**
 * **Today, for reference.** The Aug 31 screen exactly as Nevo has it.
 *
 * Four ticks, **Issue 4 rainchecks · $206.18**, before the operator has touched
 * anything. Kept on this page so the thing being changed can be opened beside
 * the two proposals rather than remembered.
 *
 * Every other Aug 31 story still renders this way: `preselect` defaults to
 * `all`, so the record of what was decided in August is unaltered.
 */
export const Today: Story = {
    name: "Today — everyone ticked",
    render: () => <GroupIssueScreen seed={rainedOutFoursome} />,
};
