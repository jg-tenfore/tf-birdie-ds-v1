import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { BayWorkspace } from "@/components/concepts/bay-sheet/103026/bay-workspace";
import AddIcon from "@mui/icons-material/Add";
import BlockIcon from "@mui/icons-material/Block";
import ReplayIcon from "@mui/icons-material/Replay";

/**
 * **What changed on Nov 2, and nothing else.**
 *
 * Everything here came out of the Nov 2 review with Weston and Cody. The
 * screens it changes are still in **Bay Sheet Oct 30**; this category exists
 * so Cody has one short list to read rather than a diff to hunt for, and so
 * the three decisions that are still open are visibly open.
 *
 * Read **What changed — Nov 2** first. It says which of these are settled and
 * which are waiting on an answer.
 */
const meta = {
    title: "Cody to Review/Nov 2 — Bay Sheet",
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

const PanelShell = ({ children }: { children: React.ReactNode }) => (
    <AppShell title="Bay Sheet" active="baysheet" showOverflow={false}>
        {children}
    </AppShell>
);

/* ------------------------------------------------ 1. the colour of a chip */

/**
 * **A — The ribbon reports the membership.** Settled, build it.
 *
 * **Revised Nov 3 — read *What changed — Nov 3* for why.** This story shows
 * the current design, not the one Nov 2 described.
 *
 * Until Nov 2 the 4px edge on a chip was its bay's colour, which spent the
 * only colour a card has on the one fact the column heading above it already
 * states. Weston asked for the tee sheet's pattern instead: *"ideally it
 * would be their membership… oh, I can see that he's my simulator member. Oh,
 * this is a public."*
 *
 * Nov 2 read that as three fixed statuses and invented three colours. Nov 3
 * corrected both halves: a course creates **as many memberships as it likes**
 * and **picks each one's colour on the plan itself**, so the colour is data
 * and there is no set to enumerate. The edge draws the course's own colour,
 * exactly as chosen.
 *
 * Read down the day: the punch-card holders carry the Gold Punch amber, Maya
 * Okafor at 9am carries the Super Membership yellow, the Monthly Silver and
 * Par plans appear in the afternoon, and the walk-ups get a neutral grey that
 * says only *not a member*. The cancelled and no-show chips have **no**
 * colour at all, which is the same rule as before — they are not bookings any
 * more, they are time being offered back.
 *
 * Two things to look at rather than take on trust:
 *
 * - **The legend names the memberships on this day's sheet**, not a fixed
 *   list. It cannot be fixed any more; his test course alone has a dozen
 *   plans and the bar would wrap to rows of memberships nobody booked.
 * - **Maya's yellow is deliberately weak.** We draw what the course picked
 *   rather than darkening it, so the sheet matches the membership form and
 *   the tee sheet's bar. The cost is visible here on purpose.
 *
 * **The bay colours are gone**, which is the other Nov 3 change: a resource
 * has no colour field, so the column heading is a name and an alternating
 * neutral wash keeps fifteen columns trackable.
 */
export const Ribbon: Story = {
    name: "A — Ribbon by membership",
    render: () => (
        <Shell>
            <BayWorkspace />
        </Shell>
    ),
};

/**
 * **B — The same day with the whole card coloured.** For spec, not for now.
 *
 * Cody, in the review: *"we will probably get some courses that say, hey, I
 * can barely tell which colour is which because it's this thin little ribbon…
 * so some things we could try to do is add some customization to it where a
 * course op can say, I want the full card to be a colour instead of just the
 * edge of it."* He also said it is *"not a big, like heavy lift,"* and asked
 * for it to be in the spec so it does not get forgotten.
 *
 * This is that, built as a **course-level preference and not a per-user
 * toggle** — everyone standing at one counter should be reading the same
 * sheet. One prop, `tint="card"`, and the chip fills with the membership's
 * colour.
 *
 * **Nov 3 changed how the text survives that.** When there were three colours
 * I owned, each had a darkened twin that carried white text. A course picking
 * its own colours breaks that: white on Weston's yellow is unreadable. So the
 * card keeps the colour exactly and **moves the ink instead** — black or
 * white per chip, by luminance. Look at Maya Okafor's yellow card against the
 * amber ones beside it; they are the same treatment with different ink.
 *
 * Put it beside **A** and the trade is plain: this is easier to tell apart
 * across the room, and it is the visual noise Cody picked Option A to get
 * away from. The recommendation is to ship **A** and keep this in your back
 * pocket for the first course that complains.
 *
 * Still open: **where a course would set this.** Cody raised it himself —
 * *"obviously the question is, where are they going to modify all these
 * settings?"* — and it is not answered here.
 */
export const FullCard: Story = {
    name: "B — Full-card colour (the fallback)",
    render: () => (
        <Shell>
            <BayWorkspace tint="card" />
        </Shell>
    ),
};

/* ------------------------------------------------- 2. blocking more bays */

/**
 * **C — Block several bays at once.** Settled, build it.
 *
 * Weston: *"being able to block like multiple bays at the same time, because
 * if not, you have to do it one by one."* Cody: *"I can make that a checklist
 * and make sure that the endpoint can take multiple bays at the input."*
 *
 * The field is the dropdown that was already there, with a checkbox in front
 * of every bay — **open the Bays field** and tick a few. It stays open while
 * you tick, because a menu that shut after each one would be slower than the
 * one-by-one it replaces.
 *
 * Weston confirmed it on Nov 3 — *"I really like it, the multi-select"* — in
 * the same breath as asking for the bay colours to come out, which this field
 * is where he noticed. **The swatches went with them**, so the closed field
 * now names the bays while they fit and counts them after: `Red Bay, Teal
 * Bay`, then `4 bays`. Naming them matters more here than anywhere, because
 * this is the one field that can block four bays in one press.
 *
 * Three rules worth knowing before you build it:
 *
 * 1. **A busy bay fails the whole dialog**, it is not silently dropped.
 *    Blocking four of the five bays somebody asked for is the kind of
 *    half-success that gets found out at 7pm. Tick **Amber Bay** at 9:30 to
 *    see it — the warning names which bays are busy and why.
 * 2. **One block per bay** comes out the other side. The model still gives a
 *    block exactly one bay, because that is what the sheet draws.
 * 3. **A repeat started across several bays shares one series**, so clearing
 *    the series clears all of them.
 */
export const BlockMultiBay: Story = {
    name: "C — Block several bays",
    render: () => (
        <Shell>
            <BayWorkspace initialRoute={{ kind: "newblock", bayId: "red", start: 12 * 60 }} />
        </Shell>
    ),
};

/* --------------------------------------------- 3. the two dialogs, aligned */

/**
 * **D — Editing a booking, rebuilt to match booking one.** Settled, build it.
 *
 * Justin, in the review: *"I just realized that the edit dialog is different
 * than the creation dialog, like than the create reservation dialog."* It was
 * — the two asked the same questions with different controls. Create used
 * grouped fields in boxes; edit used a settings list of rows, and changing
 * who a booking was for meant opening a second dialog on top of the first.
 *
 * Edit now uses the booking dialog's parts, in the booking dialog's order:
 * **who it is for → bay and time → repeat → notes → order**. Four things
 * follow from that:
 *
 * - The customer picker is **inline**, the same one booking uses. One fewer
 *   layer, and one fewer way for the two screens to drift apart.
 * - **Occasion** is now on both. It was only on edit, which meant a birthday
 *   could not be recorded until after the booking existed.
 * - **Status** is the one group booking has no counterpart for, and it stays
 *   first — nothing is checked in before it exists.
 * - **Order** keeps everything it had: the punch card, the series total, the
 *   schedule band, the running total in the heading.
 *
 * Open this beside **Dialog — a new reservation** in *Bay Sheet Oct 30 ›
 * Edge cases* and the two should now read as one dialog with different
 * contents.
 */
export const DialogEditAligned: Story = {
    name: "D — Edit, aligned with create",
    render: () => (
        <PanelShell>
            <BayWorkspace initialRoute={{ kind: "reservation", id: "r-7", edit: true }} />
        </PanelShell>
    ),
};

/* ------------------------------------------------ 4. the slide-over widths */

/**
 * **E — The panel at 420.** Not chosen; kept to compare.
 *
 * The width it has been since it was built, and the one that leaves the most
 * sheet visible behind it — about a third of a 1280 tablet.
 *
 * Weston asked for it wider in the review: *"it was a little bigger on the
 * T-sheet designs that we were playing around with… I just know there's a lot
 * of information. I guess there's a lot less information for a reservation for
 * bays."* That last sentence is the argument for leaving it here.
 *
 * **Nov 2: 560 won** — see G. This is kept so the comparison survives.
 * Cody's constraint may still move the final number: *"in a lot of these cases, they're going on an onscreen
 * keyboard, so something to keep in mind, like you have to think about that
 * real estate as well."* Whichever wins, the body scrolls and the actions
 * stay at the foot — and he will flex the final number against a real
 * keyboard: *"I can kind of flex around it and then send you guys some
 * screenshots of what I'm testing real time."*
 */
export const PeekSnug: Story = {
    name: "E — Panel at 420",
    render: () => (
        <PanelShell>
            <BayWorkspace peekWidth="snug" initialRoute={{ kind: "reservation", id: "r-7" }} />
        </PanelShell>
    ),
};

/**
 * **F — The panel at 480.** Not chosen; kept to compare.
 *
 * 480 is roughly the 35% Justin floated in the review. It buys the order
 * lines enough room that the punch-card line stops wrapping, and it still
 * leaves five bay columns readable behind it — which matters, because the
 * whole reason this is a slide-over and not a full screen is Weston's point:
 * *"then you don't lose the context of where you're working, whereas you did
 * before."*
 */
export const PeekRoomy: Story = {
    name: "F — Panel at 480",
    render: () => (
        <PanelShell>
            <BayWorkspace peekWidth="roomy" initialRoute={{ kind: "reservation", id: "r-7" }} />
        </PanelShell>
    ),
};

/**
 * **G — The panel at 560. Chosen, and now the default.**
 *
 * Getting on for half the tablet. Nothing in the panel strictly needs this
 * much room today, which was the case against it — but it is the one to pick
 * if the panel is going to grow, and it is the closest of the three to the
 * tee sheet's detail panel, which carries far more than a bay booking does.
 *
 * **This is what the sheet and the prototype now open at.** The cost is
 * behind it, and worth knowing: four bay columns stay readable instead of
 * six, and the chip you tapped is often one of the ones now covered.
 *
 * Still subject to Cody's keyboard test — *"I can kind of flex around it and
 * then send you guys some screenshots of what I'm testing real time."*
 */
export const PeekWide: Story = {
    name: "G — Panel at 560 (chosen)",
    render: () => (
        <PanelShell>
            <BayWorkspace peekWidth="wide" initialRoute={{ kind: "reservation", id: "r-7" }} />
        </PanelShell>
    ),
};
