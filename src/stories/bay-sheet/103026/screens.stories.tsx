import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { BayWorkspace } from "@/components/concepts/bay-sheet/103026/bay-workspace";
import { seedReservations } from "@/components/concepts/bay-sheet/103026/bay-data";
import AddIcon from "@mui/icons-material/Add";
import BlockIcon from "@mui/icons-material/Block";
import ReplayIcon from "@mui/icons-material/Replay";

/**
 * **The bay sheet, screen by screen.** From the Oct 30 PRD.
 *
 * Every story is live: tap a blank slot to book, tap a chip to open it, tap a
 * block to edit it. The numbers in the notes are the PRD's requirement
 * numbers, so a developer can find the sentence that asked for each thing.
 */
const meta = {
    title: "Bay Sheet Oct 30/Screens",
    parameters: { layout: "fullscreen", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Shell = ({ children }: { children: React.ReactNode }) => (
    <AppShell
        title="Bay Sheet"
        active="baysheet"
        showOverflow={false}
        actionBar={
            <>
                <ActionButton icon={<ReplayIcon />}>REFRESH</ActionButton>
                <ActionButton icon={<BlockIcon />}>ADD BLOCK</ActionButton>
                <ActionButton tone="primary" icon={<AddIcon />}>
                    NEW RESERVATION
                </ActionButton>
            </>
        }
    >
        {children}
    </AppShell>
);

/**
 * **1 — The day.**
 *
 * > 1. *"The bay sheet shows as many bays as possible without scrolling."*
 * > 2. *"Each reservation shows: the player who booked, duration, party size,
 * >    checked-in status, and paid status."*
 * > 3. *"Each reservation shows an indicator when it has an open tab."*
 * > 4. *"Reservation notes show on the bay sheet."*
 *
 * **Eight bays**, where the shipping sheet draws six, and a full 8am–10pm day
 * on the vertical. That is the trade: bays never scroll, time does.
 *
 * Seven things have to fit in a column about 149px wide, so only the name and
 * the duration are words — everything else is a mark, and the legend above the
 * sheet teaches them. A chip reads its own height and decides what it can
 * afford to say: the two-hour bookings show their note as text, the
 * one-hour ones show a note glyph instead.
 *
 * Read down the day for the states: checked in, paid, an open tab, a weekly
 * series, a cancellation and a no-show that have **given their time back**
 * (requirement 27), and two blocks.
 *
 * **Open question — Weston's:** *"What device, and how many bays should fit
 * without scrolling?"* Eight is a working figure at 1280, not a decision.
 */
export const Sheet: Story = {
    name: "1 — The day",
    render: () => (
        <Shell>
            <BayWorkspace />
        </Shell>
    ),
};

/**
 * **2 — Booking a bay.**
 *
 * > 5. *"Clicking a blank time on the bay sheet opens the booking flow."*
 *
 * Which is how you got here: this story opens on the dialog a blank 11:00 slot
 * in Teal Bay produces.
 *
 * The order is the order a counter asks it in — who, how long, how many, does
 * it repeat, anything to note — and the **fee is never typed** (7). It follows
 * the answers: a Member before 4pm is $30/hr, a Guest at 5pm is $60.
 *
 * Search `justin` to pick a customer with a punch card (8), `maya` for a guest
 * with none, and `avery` for someone with a single punch left — which is where
 * Weston's open question lives: *"what happens if a punch card only covers
 * part of the fee?"* The panel shows the shortfall rather than hiding it.
 *
 * At the bottom, requirement 12: **Don't send confirmation**.
 */
export const Booking: Story = {
    name: "2 — Book a bay",
    render: () => (
        <Shell>
            <BayWorkspace openBooking={{ bayId: "teal", start: 11 * 60 }} />
        </Shell>
    ),
};

/**
 * **3 — The overlap that cannot happen.**
 *
 * > 10. *"The system checks for double bookings and overlaps and prevents
 * >     them."*
 *
 * This opens on 11:00 in Blue Bay, where Riley Hartman already has two hours.
 * The warning names who has it and until when, and the primary action reads
 * **TIME UNAVAILABLE** and does nothing.
 *
 * There is no override here, and that is the point: compare it with the daily
 * limit in the next story, which warns in amber and offers a switch. One rule
 * is physics, the other is policy, and the screen should not make them look
 * alike.
 *
 * Move the bay with the picker and the warning clears.
 */
export const Conflict: Story = {
    name: "3 — Overlap is refused",
    render: () => (
        <Shell>
            <BayWorkspace openBooking={{ bayId: "blue", start: 11 * 60 }} openBookingCustomerId="c-6" />
        </Shell>
    ),
};

/**
 * **4 — The daily limit, and the override.**
 *
 * > 16. *"Operators can set a limit on the number of simulator bookings a
 * >     golfer can have in a day."*
 * > 17. *"When a booking would put a golfer over the limit, the bay sheet
 * >     shows a warning."*
 * > 18. *"Staff can override the limit on the bay sheet and complete the
 * >     booking."*
 *
 * This opens with Justin Girard already chosen — he holds 8:30 in Red Bay and
 * the 1:00 standing lesson in Teal, which is the limit. The warning appears
 * **with its own switch**: amber, not red, and the booking completes once it is thrown.
 *
 * It also states the rule that causes arguments at a counter: a no-show counts
 * toward the limit (29), a cancellation does not.
 *
 * **Open questions — Weston's:** does the limit count reservations or minutes?
 * Can any staff member override it, or only certain roles? Neither is answered
 * here; this counts reservations and lets anyone override.
 */
export const Limit: Story = {
    name: "4 — Over the daily limit",
    render: () => (
        <Shell>
            <BayWorkspace openBooking={{ bayId: "magenta", start: 15 * 60 }} openBookingCustomerId="c-1" />
        </Shell>
    ),
};

/**
 * **5 — The reservation.**
 *
 * > 19–24. The details modal: when it was booked, duration, customer, status,
 * > fees and notes; all editable; movable to another bay; the fee and the
 * > punch usage recalculating; and a tab openable from it.
 *
 * Everything is editable in place, because a modal that shows you a wrong
 * duration and makes you cancel to fix it is the thing this PRD is replacing.
 *
 * Change the duration and watch the fee and the punch count follow (23). Move
 * it to another bay with the picker (22) — and if you move it onto something,
 * the same overlap warning appears here as in the booking flow.
 *
 * The three destructive actions sit together, apart from SAVE: **no-show**,
 * **cancel**, and — because this one repeats weekly — **clear series** (15).
 * Above them, the rule that surprises people: changes apply to this occurrence
 * only (14).
 */
export const Details: Story = {
    name: "5 — Reservation details",
    render: () => (
        <Shell>
            <BayWorkspace openReservationId="r-7" />
        </Shell>
    ),
};

/**
 * **6 — Open a tab.**
 *
 * > 30. *"Staff can add the bay fee to a tab, so the golfer can add food and
 * >     drinks during the session and close out at the end."*
 *
 * This opens on Maya Okafor's 9:00 booking. **OPEN TAB** moves the bay fee
 * onto a tab and the chip on the sheet gains its receipt mark (3) — the one
 * thing the shipping chip has no room to say.
 *
 * **Open question — Weston's:** *"When the fee is moved to a tab, does the
 * reservation show as paid, unpaid, or open tab until the tab closes?"* Here
 * it reads as its own state, neither paid nor unpaid, because those are the
 * only two the shipping sheet can express and the answer is plainly a third.
 */
export const Tab: Story = {
    name: "6 — Open a tab",
    render: () => (
        <Shell>
            <BayWorkspace openReservationId="r-2" />
        </Shell>
    ),
};

/**
 * **7 — Blocking time.**
 *
 * > 31–33. *"Staff can add a block… staff can repeat a block… repeating blocks
 * > follow the same rules as repeating reservations."*
 *
 * The same repeat picker as a reservation, deliberately — requirement 33 says
 * the rules match, so the control should too.
 *
 * A block is drawn hatched and belongs to nobody, which is what separates it
 * from a reservation at a glance. It needs a reason before it can be saved,
 * which answers half of Weston's open question — *"should blocks have a reason
 * or label?"* — in the affirmative.
 *
 * **The other half is unanswered:** *"can a block be placed over existing
 * reservations?"* This says no, by running the same overlap check a booking
 * runs. It is the cautious reading and the easy one to reverse.
 */
export const Block: Story = {
    name: "7 — Block a bay",
    render: () => (
        <Shell>
            <BayWorkspace openBlock={{ bayId: "green", start: 12 * 60 }} />
        </Shell>
    ),
};

/**
 * **8 — A quiet day.**
 *
 * The same sheet with nothing on it, because every screen needs its empty
 * state and this one is where the blank-slot targets are easiest to see.
 *
 * Tap anywhere.
 */
export const Empty: Story = {
    name: "8 — An empty day",
    render: () => (
        <Shell>
            <BayWorkspace initialReservations={[]} initialBlocks={[]} />
        </Shell>
    ),
};

/**
 * **9 — Zoomed out.**
 *
 * The same day at the compact zoom. Fourteen hours fit without scrolling, and
 * the chips fall below the height where they can carry a second line — so the
 * name and the marks are all that survive.
 *
 * Worth looking at beside story 1: it is the real answer to requirement 1,
 * which asks for as much of the sheet as possible at once, and it shows what
 * that costs.
 */
export const ZoomedOut: Story = {
    name: "9 — Zoomed out",
    render: () => (
        <Shell>
            <BayWorkspace zoom="compact" initialReservations={seedReservations} />
        </Shell>
    ),
};
