import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "@/components/app-chrome/app-shell";
import { BayWorkspace } from "@/components/concepts/bay-sheet/103026/bay-workspace";

/**
 * **Every state the peek panel and the dialog can be in.**
 *
 * The happy path is in **Screens**. This is the rest of it: the states that
 * only show up on a real sheet at 4pm, and the ones that are easy to build a
 * dialog without ever seeing.
 *
 * Each story opens the sheet at an address, so they are also the list of what
 * can be linked to. Everything is live — close a panel and the sheet behind
 * it is the real sheet.
 *
 * ## The two layers
 *
 * A tap on a chip opens the **peek panel**: who, have they shown up, what do
 * they owe, is there a note, and the four things anyone does next. It edits
 * nothing except status, so it needs no save and no guard.
 *
 * **EDIT DETAILS** opens the **dialog**, which edits everything and guards
 * every way out. In the prototype they are separate addresses —
 * `#/baysheet/reservation/r-7` and `#/baysheet/reservation/r-7/edit`.
 */
const meta = {
    title: "Bay Sheet Oct 30/Edge cases",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Shell = ({ children }: { children: React.ReactNode }) => (
    <AppShell title="Bay Sheet" active="baysheet" showOverflow={false}>
        {children}
    </AppShell>
);

/**
 * **Peek — a standing booking.** `r-7`, Justin's weekly lesson.
 *
 * The fullest case: a series, a punch card, a note. *Repeats* spells the
 * cadence out rather than saying "Weekly" and leaving staff to work out what
 * that commits the bay to.
 */
export const PeekStanding: Story = {
    name: "Peek — a standing booking",
    render: () => (
        <Shell>
            <BayWorkspace initialRoute={{ kind: "reservation", id: "r-7" }} />
        </Shell>
    ),
};

/**
 * **Peek — checked in, tab open.** `r-3`.
 *
 * Two things are true that change what the actions should offer: they are
 * here, so *check in* would be wrong, and the tab is already open, so
 * *start a tab* is gone rather than disabled. A key that does nothing is
 * worse than no key.
 */
export const PeekCheckedIn: Story = {
    name: "Peek — checked in, tab open",
    render: () => (
        <Shell>
            <BayWorkspace initialRoute={{ kind: "reservation", id: "r-3" }} />
        </Shell>
    ),
};

/**
 * **Peek — a no-show.** `r-5`.
 *
 * The bay time is back on the sheet, so there is nothing left to cancel and
 * nothing to put on a tab: both keys are gone and only *edit details*
 * remains. The status control still works, which is the point of it being a
 * control — a no-show marked by mistake is put back in one tap.
 */
export const PeekNoShow: Story = {
    name: "Peek — a no-show",
    render: () => (
        <Shell>
            <BayWorkspace initialRoute={{ kind: "reservation", id: "r-5" }} />
        </Shell>
    ),
};

/**
 * **Peek — a cancelled booking.** `r-6`.
 *
 * Same shape as a no-show and a different meaning: requirement 29 says a
 * no-show still counts toward the golfer's daily limit and a cancellation
 * does not. The panel does not try to explain that — it is the sort of rule
 * that belongs in the place it bites, which is the booking dialog's limit
 * warning.
 */
export const PeekCancelled: Story = {
    name: "Peek — a cancelled booking",
    render: () => (
        <Shell>
            <BayWorkspace initialRoute={{ kind: "reservation", id: "r-6" }} />
        </Shell>
    ),
};

/**
 * **Dialog — a new reservation.** The booking flow, at Teal Bay, 11:00 AM.
 *
 * Worth seeing beside the others because it is the one dialog built from the
 * *older* field-shell parts, and deliberately: booking asks **who**, which is
 * a search, and a search needs the room a bordered field gives it. The peek
 * panel and the details dialog never ask that question from nothing — by the
 * time either opens, there is a guest.
 */
export const DialogNew: Story = {
    name: "Dialog — a new reservation",
    render: () => (
        <Shell>
            <BayWorkspace initialRoute={{ kind: "book", bayId: "teal", start: 11 * 60 }} />
        </Shell>
    ),
};

/**
 * **Dialog — editing the standing booking.** `r-7/edit`.
 *
 * What **EDIT DETAILS** opens. The *Guest* row is the answer to "where do we
 * change who this is for" — it was settable only at booking time until now,
 * which was a real hole given the tier sets the price. Tap it and the same
 * customer search the booking dialog uses opens over the top; pick someone
 * else and the order re-prices on the way out.
 */
export const DialogEdit: Story = {
    name: "Dialog — editing a booking",
    render: () => (
        <Shell>
            <BayWorkspace initialRoute={{ kind: "reservation", id: "r-7", edit: true }} />
        </Shell>
    ),
};

/**
 * **Dialog — the plainest booking.** `r-9/edit`.
 *
 * No series, no note, no occasion, no tab. Worth checking because a dialog
 * that is tight on its busiest booking can look sparse on its simplest one:
 * the schedule band and the series total are gone, *cancel booking* stands
 * alone where the repeating one gives it a partner, and the note is six empty
 * rows waiting for a sentence.
 */
export const DialogPlain: Story = {
    name: "Dialog — the plainest booking",
    render: () => (
        <Shell>
            <BayWorkspace initialRoute={{ kind: "reservation", id: "r-9", edit: true }} />
        </Shell>
    ),
};

/**
 * **Dialog — a cancelled booking.** `r-6/edit`.
 *
 * The removal group and the tab key are both gone, because a booking that has
 * already given its time back has nothing left to remove and nothing to
 * charge. Everything else still edits, which is right: the usual reason to
 * open a cancelled booking is to correct it and put it back.
 */
export const DialogCancelled: Story = {
    name: "Dialog — a cancelled booking",
    render: () => (
        <Shell>
            <BayWorkspace initialRoute={{ kind: "reservation", id: "r-6", edit: true }} />
        </Shell>
    ),
};

/**
 * **Dialog — an overlap.** `r-4/edit` runs 10:30 to 12:30 on Blue Bay.
 *
 * Stretch it or move it onto a busy bay and the band appears at the top and
 * SAVE becomes TIME UNAVAILABLE. Requirement 17 wants the warning *on the bay
 * sheet*, and a disabled save with no explanation is the one thing worse than
 * a clash — so the band says which bay is busy and from when.
 */
export const DialogConflict: Story = {
    name: "Dialog — an overlap",
    render: () => (
        <Shell>
            <BayWorkspace initialRoute={{ kind: "reservation", id: "r-4", edit: true }} />
        </Shell>
    ),
};
