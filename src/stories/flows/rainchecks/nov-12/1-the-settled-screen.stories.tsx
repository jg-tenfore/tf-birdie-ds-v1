import type { Meta, StoryObj } from "@storybook/react-vite";

import { GroupIssueScreen } from "@/components/concepts/rainchecks/aug-31/group-issue-screen";
import { GroupIssueFlow } from "@/components/concepts/rainchecks/group-issue-flow";
import { mixedHoleFoursome, rainedOutFoursome, rainedOutHeading } from "@/components/concepts/rainchecks/group-issue";

/**
 * **Nov 12 — both open questions closed. This is the screen to build.**
 *
 * Nov 11 drew two opening defaults and deliberately chose neither. The Nov 12
 * call chose, and a second change arrived with it from the build side. Two
 * things move; everything else on the screen is exactly as Aug 31 settled it.
 *
 * ## 1. Option B is chosen
 *
 * The screen opens with **only the player whose RAINCHECK button was pressed**
 * ticked. Weston, looking at the Nov 11 comparison: *"Yeah. This is the one…
 * that's the one we go [with]."*
 *
 * So the Nov 11 page stops being a question. Option A — nobody ticked — is
 * retired the way Aug 20's Option A was once the hole-count decision was made,
 * and it survives in `Flows → Rainchecks → Nov 11` as the record of how the
 * choice was made.
 *
 * ## 2. The slider is replaced by buttons
 *
 * One button per hole, 0 to 17, in place of the group slider. This one is
 * **not a design preference** — it came back from the build:
 *
 * > *"We did change the slider [to] the buttons. I forgot to tell you that…
 * > Cody, he tried the slider, and in the way it's built with the stuff now,
 * > he's like, oh, that's just not gonna work."* — Weston, Nov 12
 *
 * Taken on its own merits it is not a concession. The value is **chosen**
 * rather than approximated: one tap lands exactly on 12, where a drag lands
 * near it and the operator has to read back what they actually got — on a
 * screen where that number is money. Every reachable answer is on screen at
 * once, so the range is read instead of discovered.
 *
 * What it costs is width, and that cost is why this is the **group** control
 * only. The rows keep the stepper: eighteen keys once is a legible row,
 * eighteen keys four times is a wall. That was the Aug 20 argument against
 * four sliders, and it survives the swap unchanged.
 *
 * ## What is not being changed
 *
 * The hole count shared across the group, rows coming off it by hand, the
 * `SET BY HAND` flag, the cap rule for a shorter round, the reassignment
 * dropdown, voiding, and the confirmation synopsis — all settled, all
 * untouched, and all still rendered by the same code as Aug 31. The entire
 * Nov 12 diff is which boxes open ticked and what shape the hole control is.
 *
 * **Start with "The screen, as settled."**
 */
const meta = {
    title: "Flows/Rainchecks/Nov 12/1 — The screen as settled",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const TEE_TIME = "7/20/2026 7:00 PM";
/** Oda Brennevin — third of the four, so "the one you tapped" is visibly not the first row. */
const TAPPED = "10314912";

/**
 * **The screen, as settled.** Both Nov 12 changes, on the real screen.
 *
 * Oda Brennevin's RAINCHECK was the button pressed, so hers is the only row
 * ticked and the bar opens on **Issue 1 raincheck · $39.78** — what the
 * operator asked for, stated before they commit to it. The other three are
 * waiting to be chosen rather than waiting to be noticed, which was the whole
 * complaint Nevo brought back.
 *
 * Tap along the button row and watch four prices resolve from one number. The
 * selected key is the group's answer; the rows read it back and say **with the
 * group** so a number nobody can see is never a number nobody checks.
 */
export const TheScreen: Story = {
    name: "The screen, as settled",
    render: () => <GroupIssueScreen seed={rainedOutFoursome} preselect="tapped" tappedId={TAPPED} holeControl="buttons" />,
};

/**
 * **The whole trip** — tee sheet → issue screen → where the credits land.
 *
 * The only place the Option B claim can actually be checked, because the
 * player it ticks is known one screen earlier. Press RAINCHECK on **Oda
 * Brennevin** and she is the one ticked; go back, press **Weston Farnsworth**
 * instead, and he is.
 *
 * Worth walking both ways once before this goes to build. The tap now carries
 * meaning it did not carry before — an operator who presses whichever button
 * is nearest gets a credit for whoever that was — and the confirmation
 * synopsis is the thing standing behind that.
 */
export const TheWholeTrip: Story = {
    name: "The whole trip — tee sheet to the credits",
    render: () => (
        <GroupIssueFlow
            variant="one-stop"
            seed={rainedOutFoursome}
            heading={rainedOutHeading}
            teeTime={TEE_TIME}
            preselect="tapped"
            holeControl="buttons"
        />
    ),
};

/**
 * **Nobody teed off** — the case the build screenshot was taken on.
 *
 * One player, the horn before the first tee, so the stop is **0** and the
 * credit is the whole round: **100% back**. The left-hand caption is doing
 * real work here — `0` on a row of numbers is ambiguous in a way *"0 — never
 * teed off"* is not, and this is the one value where the operator is handing
 * back every dollar.
 *
 * A single-player reservation also shows the row list at its weakest: one tick,
 * one amount, and a header that counts to one. Still open from Aug 31 (WJ-71)
 * and not reopened here — whether a booking this small should fall back to a
 * single-issue screen is a build question, not a design one.
 */
export const NeverTeedOff: Story = {
    name: "Nobody teed off — one player",
    render: () => (
        <GroupIssueScreen
            seed={rainedOutFoursome.slice(0, 1)}
            preselect="tapped"
            tappedId={rainedOutFoursome[0].id}
            startHoles={0}
            holeControl="buttons"
        />
    ),
};

/**
 * **A nine among the eighteens, under the buttons.**
 *
 * The cap rule from Sept 3, unchanged, and shown here because the button row
 * is the one place it could have quietly broken. The row of keys is drawn from
 * the **longest** round in the group, so it still reaches 17 — the control does
 * not shrink to Tom Watson's nine and silently refuse the group an answer of
 * 12.
 *
 * His row caps instead, reads **capped — booked 9**, and the banner says why in
 * words. He gets the last hole of the nine he actually bought, $3.38 against
 * the others' $33.33: he finished the round he paid for, so there is nothing
 * more to give back.
 */
export const MixedHoles: Story = {
    name: "A nine among the eighteens — the cap rule",
    render: () => <GroupIssueScreen seed={mixedHoleFoursome} startHoles={12} preselect="tapped" tappedId={TAPPED} holeControl="buttons" />,
};

/**
 * **The control that was replaced.** Same screen, same Option B, the Aug 31
 * slider.
 *
 * Kept on this page so the swap can be read as a swap rather than remembered.
 * Open it beside "The screen, as settled" and the difference is one row of the
 * card: nothing else about the screen moves, which is why this came back from
 * the build as a small change rather than a redesign.
 *
 * The honest comparison: the slider is narrower and gets to a rough answer in
 * one gesture; the buttons are wider and get to an exact one. On a control
 * whose output is money, and in a build where the slider does not fit anyway,
 * that trade is not close.
 */
export const TheOldSlider: Story = {
    name: "The control that was replaced",
    render: () => <GroupIssueScreen seed={rainedOutFoursome} preselect="tapped" tappedId={TAPPED} />,
};
