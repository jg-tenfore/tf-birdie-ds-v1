import type { ReactNode } from "react";

import Box from "@mui/material/Box";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import CheckIcon from "@mui/icons-material/Check";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import MailOutlinedIcon from "@mui/icons-material/MailOutlined";
import NotesIcon from "@mui/icons-material/Notes";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StorefrontIcon from "@mui/icons-material/Storefront";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import {
    CourseMenu,
    SlotSettingsMenu,
    TeeSheetActionBar,
    TeeSheetSubBar,
    sheetCanvas,
    type SheetView,
} from "@/components/screens/tee-sheet/tee-sheet-chrome";
import {
    detailEmpty,
    detailFoursome,
    detailPaidPair,
    listRows,
    listRowsWithCartKey,
    type TeeTimeDetail,
} from "@/components/screens/tee-sheet/tee-sheet-data";
import { NotesDialog, ReservationHistoryDialog, TeeTimeNotesDialog } from "@/components/screens/tee-sheet/tee-sheet-dialogs";
import {
    TeeSheetBackNineView,
    TeeSheetGridView,
    TeeSheetListView,
    TeeSheetMultiView,
} from "@/components/screens/tee-sheet/tee-sheet-views";
import { TeeTimeDetailBody, TeeTimeDetailTopRight } from "@/components/screens/tee-sheet/tee-time-detail";
import { CartSignOutScreen, EditReservationScreen } from "@/components/screens/tee-sheet/tee-time-edit";

/**
 * # Tee Sheet
 *
 * The busiest screen in the shipping app, reproduced as-is from
 * `references/072926/2-teesheet/`. It is where a pro shop attendant spends the
 * morning: it shows one day of tee times for one course, and every booking,
 * payment, cart signout and no-show flows through it.
 *
 * **What is on the screen, top to bottom**
 *
 * 1. The app bar — `Tee Sheet`, the account, LOG OUT, HIDE BACK, cart, overflow.
 * 2. A date-navigation band: prev / facility / **date in orange** / GO TO TODAY / next.
 *    Orange appears nowhere else in the app; it is the tee sheet's date and only that.
 * 3. A counts strip — Total, Booked, Paid, No Shows, Available — plus a live clock.
 * 4. The sheet itself, in one of four layouts.
 * 5. A bottom bar holding the course picker, the four layout toggles, refresh and PAY.
 *
 * **Four layouts of the same day**
 *
 * List, Grid, Multi and Back 9 are not filters. They re-render identical data,
 * and the colour language shifts between them, which is the single most
 * surprising thing about this screen: a booked reservation is purple in List
 * and Back 9 but dark navy in Grid and Multi, and a paid one is green in List
 * but slate-blue in Grid. Blocked times are grey everywhere.
 *
 * The sheet's background is a mid grey rather than the app's usual light canvas,
 * which is what makes an empty white slot read as available from arm's length.
 *
 * All captures are the same day — **The Dunes of Delgado PROD, North Course,
 * Tuesday May 12 2026** — so the counts (Total 236 / Booked 50 / Paid 5 / No
 * Shows 0 / Available 186) are constant across every story here.
 */
const meta = {
    title: "App Screens/Pro Shop/Tee Sheet",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/* ------------------------------------------------------------------ */
/* Frames                                                              */
/* ------------------------------------------------------------------ */

/**
 * The sheet body plus its own bottom bar.
 *
 * The bar is rendered here rather than through `AppShell`'s `actionBar` slot
 * because the tee sheet paints it on the same mid grey as the sheet, while
 * every other screen in the app uses the light canvas.
 */
const SheetFrame = ({ view, children, courseMenu }: { view: SheetView; children: ReactNode; courseMenu?: ReactNode }) => (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: sheetCanvas }}>
        <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}>{children}</Box>
        <TeeSheetActionBar view={view} courseMenu={courseMenu} />
    </Box>
);

const TeeSheetScreen = ({ view, children, courseMenu }: { view: SheetView; children: ReactNode; courseMenu?: ReactNode }) => (
    <AppShell title="Tee Sheet" active="teesheet" topActions={["HIDE BACK"]} showCart subBar={<TeeSheetSubBar />}>
        <SheetFrame view={view} courseMenu={courseMenu}>
            {children}
        </SheetFrame>
    </AppShell>
);

/** The detail screen's bottom bar — the same five actions on every tee time. */
const DetailActionBar = () => (
    <>
        <ActionButton icon={<CalendarMonthOutlinedIcon />}>Tee Sheet</ActionButton>
        <ActionButton icon={<StorefrontIcon />}>Pro Shop</ActionButton>
        <ActionButton icon={<AddIcon />}>Add all to cart</ActionButton>
        <ActionButton icon={<NotesIcon />}>Tee time notes</ActionButton>
        <ActionButton tone="disabled" icon={<ShoppingCartIcon />}>
            Pay
        </ActionButton>
    </>
);

const TeeTimeDetailScreen = ({ detail }: { detail: TeeTimeDetail }) => (
    <AppShell title={detail.title} active="teesheet" topBarRight={<TeeTimeDetailTopRight />} actionBar={<DetailActionBar />}>
        <TeeTimeDetailBody detail={detail} />
    </AppShell>
);

/* ------------------------------------------------------------------ */
/* Sheet layouts                                                       */
/* ------------------------------------------------------------------ */

/**
 * **List view** — the default, and the one attendants live in.
 *
 * One row per tee time: the time on the left, four playing positions across the
 * middle, and a gear at the right end that operates on the whole time. Each
 * booked position carries the party size in parentheses, the booking name, a
 * cart glyph if a cart is attached, and the amount owed. A large "$" watermark
 * marks reservations carrying a balance; the two green 6:54 PM positions are
 * paid.
 *
 * Note the 6:26 PM row: three positions all read `(4) Ivar Brennevin` at
 * `$0.00`. The sheet does nothing to disambiguate repeated names — the amount
 * and the position are the only distinguishing marks.
 */
export const ListView: Story = {
    render: () => (
        <TeeSheetScreen view="list">
            <TeeSheetListView rows={listRows} />
        </TeeSheetScreen>
    ),
};

/**
 * **The tee-time gear menu, open.**
 *
 * Six operations, all on the tee time rather than on a player. Squeeze inserts
 * an extra time immediately before or after this one — how a walk-up gets fitted
 * into a full sheet. Clone copies the time and its players. Clear Time empties
 * it. Move Player(s) hands the group to another time.
 *
 * The 5:58 PM row also shows a key glyph on the first position here: that
 * reservation's cart has been signed out since the previous capture.
 */
export const SlotMenuOpen: Story = {
    name: "List view — tee time menu",
    render: () => (
        <TeeSheetScreen view="list">
            <TeeSheetListView rows={listRowsWithCartKey} slotMenu={<SlotSettingsMenu />} />
        </TeeSheetScreen>
    ),
};

/**
 * **The course picker, open.**
 *
 * Opens *upward* out of the bottom bar as a dark sheet, because the button it
 * belongs to already sits on the bottom edge of the screen. Three courses at
 * this facility: North, East, West. Picking one reloads the whole sheet; the
 * date and the layout toggle are unaffected.
 */
export const CoursePickerOpen: Story = {
    name: "List view — course picker",
    render: () => (
        <TeeSheetScreen view="list" courseMenu={<CourseMenu />}>
            <TeeSheetListView rows={listRows} />
        </TeeSheetScreen>
    ),
};

/**
 * **Grid view** — six tee times across, one card each.
 *
 * Roughly four hours of the sheet fit on screen against List view's ninety
 * minutes. The trade is that positions stop being columns: a card just lists
 * its players top to bottom, so you can no longer see at a glance which of the
 * four slots is free.
 *
 * The colour is doing the work here — white is open, navy is booked, slate-blue
 * is paid, grey is blocked. The 3:10 and 3:24 PM cards are a recurring
 * "Pre-Sunset Block" that holds the last daylight times off the market.
 */
export const GridView: Story = {
    render: () => (
        <TeeSheetScreen view="grid">
            <TeeSheetGridView />
        </TeeSheetScreen>
    ),
};

/**
 * **Multi view** — all three courses at once.
 *
 * Each course is a column with its own card stack, and each keeps its own
 * interval: North runs every 14 minutes, East every 10, West every 9. The rows
 * therefore never line up horizontally, and no attempt is made to align them.
 *
 * The course picker disappears from the bottom bar in this mode, since every
 * course is already on screen. North's 5:36 AM card shows four BLOCKED bars;
 * its 6:04 AM has a pair booked online — the globe glyph — at $120.00 each.
 */
export const MultiCourseView: Story = {
    name: "Multi view — three courses",
    render: () => (
        <TeeSheetScreen view="multi">
            <TeeSheetMultiView />
        </TeeSheetScreen>
    ),
};

/**
 * **Back 9 view** — the front and back nines of one course, side by side.
 *
 * For courses selling 9-hole rounds off both tees. The two halves share a time
 * axis; the back-nine times are printed in a slate blue so the halves stay
 * distinguishable when the screen is dense.
 *
 * The 7:00 AM league block shows the "9H D35" tags — the app's shorthand for a
 * 9-hole round on a named rate — alongside $25.93. A weather line sits above
 * the Front/Back headers and holds its row even when there is nothing to say.
 */
export const BackNineView: Story = {
    name: "Back 9 view — front and back",
    render: () => (
        <TeeSheetScreen view="back9">
            <TeeSheetBackNineView />
        </TeeSheetScreen>
    ),
};

/* ------------------------------------------------------------------ */
/* Tee time detail                                                     */
/* ------------------------------------------------------------------ */

/**
 * **Tee time detail** — 5:58 PM, a foursome.
 *
 * Tapping a position on the sheet lands here. The app bar becomes a full
 * breadcrumb (`facility - course - date time - confirmation # - FRONT`) and the
 * account cluster is replaced by a cart and an hourglass.
 *
 * Two bands sit above the players: a customer lookup, and a slate summary of
 * whoever that lookup finds. The `--------` placeholders are the app's real
 * empty state, not a spinner, and RESERVE stays grey until a customer is
 * attached.
 *
 * Each reservation gets its own card and its own row of actions, and the rows
 * differ by state — this is the important part of the screen:
 *
 * - **Oda Brennevin** ($27.82, unpaid): Cancel, No Show, History, Edit, Cart
 *   Signout, Cart Key, **Add to Cart**.
 * - **Ivar Brennevin** ($1.00, on a raincheck — note the "$" after the name):
 *   **Raincheck** replaces Cancel/No Show, and Print Starter / Print Receipt
 *   appear because there is something to print against.
 * - **Rufus Brennevin** ($37.05): back to the unpaid row.
 *
 * The grey meta line carries holes, the named rate, the cart product, the
 * reservation ID and the loyalty delta. Ivar's ends "9 roudns" — the app's own
 * typo, kept verbatim.
 */
export const TeeTimeDetailFoursome: Story = {
    name: "Tee time detail — foursome",
    render: () => <TeeTimeDetailScreen detail={detailFoursome} />,
};

/**
 * **Tee time detail** — 6:54 PM, a paid pair.
 *
 * The same screen for a time that has already been through checkout. Both
 * players show their email beside the name, and both gain **Customer Notes** and
 * **Group Notes** buttons on the right of the meta line.
 *
 * Oda's row has no Cancel or No Show — the round is paid and carries a
 * raincheck flag (the bolt) — and offers **Clone** plus both print actions
 * instead. G-Oda's row is still cancellable and still has Add to Cart, so the
 * two halves of one booking can be in different states at the same time.
 */
export const TeeTimeDetailPaidPair: Story = {
    name: "Tee time detail — paid pair",
    render: () => <TeeTimeDetailScreen detail={detailPaidPair} />,
};

/**
 * **Tee time detail** — 5:44 PM, nobody booked.
 *
 * An open time keeps the entire chrome and simply has no cards. There is no
 * empty-state illustration and no "add player" affordance in the body: booking
 * starts from the search field at the top, which fills the summary band and
 * enables RESERVE.
 */
export const TeeTimeDetailOpen: Story = {
    name: "Tee time detail — open time",
    render: () => <TeeTimeDetailScreen detail={detailEmpty} />,
};

/* ------------------------------------------------------------------ */
/* Dialogs                                                             */
/* ------------------------------------------------------------------ */

/**
 * **Reservation History.**
 *
 * An append-only audit log for one reservation ID, reached from the History
 * button on a player card. Three columns — timestamp, staff member, what
 * changed. The body holds its full height with a single entry, and the only way
 * out is the green OK.
 *
 * The entry here reads `Reservation Edited : $26.33 -> $26.33` — the log records
 * the edit even when the amount did not move.
 */
export const HistoryDialog: Story = {
    name: "Dialog — reservation history",
    render: () => (
        <>
            <TeeTimeDetailScreen detail={detailFoursome} />
            <ReservationHistoryDialog />
        </>
    ),
};

/**
 * **Customer Notes.**
 *
 * A free-text note against the customer, carried between visits. Both buttons
 * are slate — the app does not weight Save above Cancel here.
 */
export const CustomerNotesDialog: Story = {
    name: "Dialog — customer notes",
    render: () => (
        <>
            <TeeTimeDetailScreen detail={detailPaidPair} />
            <NotesDialog title="Customer Notes" />
        </>
    ),
};

/**
 * **Group Notes.**
 *
 * The same dialog against the whole booking group rather than one customer.
 * Note the placeholder is identical — "Enter notes for this customer" — in both,
 * which is a real inconsistency in the shipping app.
 */
export const GroupNotesDialog: Story = {
    name: "Dialog — group notes",
    render: () => (
        <>
            <TeeTimeDetailScreen detail={detailPaidPair} />
            <NotesDialog title="Group Notes" />
        </>
    ),
};

/**
 * **Tee Time Notes.**
 *
 * Attached to the time itself rather than to a player, which is why it is
 * reached from the bottom bar and why it has no Cancel — a single full-width
 * SAVE. It is a one-line field, not the multi-line box the notes dialogs use.
 */
export const TeeTimeNotes: Story = {
    name: "Dialog — tee time notes",
    render: () => (
        <>
            <TeeTimeDetailScreen detail={detailEmpty} />
            <TeeTimeNotesDialog />
        </>
    ),
};

/* ------------------------------------------------------------------ */
/* Pushed screens                                                      */
/* ------------------------------------------------------------------ */

/**
 * **Edit reservation** — pricing for one player.
 *
 * Pushed from a card's Edit button; it takes the whole canvas and returns via
 * BACK. Three headers across the top: the guest, the booker (unknown here, so
 * dashes), and a Change Customer lookup with a green shortcut for spending
 * someone else's punchcards.
 *
 * Below that, two independently totalled fee groups. Green fees carry a
 * one-of-many rate selection — "Birdie (25%)" is filled navy — and an 18-holes
 * toggle; transportation fees are a separate list with their own SubTotal and
 * Grand Total. Splitting the totals lets a starter see which half of the price
 * a comp landed on.
 *
 * **SAVE FEES TO ALL** applies this selection to every player in the tee time,
 * which is why it sits beside SAVE rather than being folded into it.
 */
export const EditReservationFees: Story = {
    name: "Edit reservation — fees",
    render: () => (
        <AppShell
            title=""
            active="teesheet"
            accountLabel=""
            showLogOut={false}
            showOverflow={false}
            actionBar={
                <>
                    <ActionButton icon={<ArrowBackIosIcon />}>Back</ActionButton>
                    <ActionButton icon={<AddIcon />}>Add customer</ActionButton>
                    <ActionButton icon={<MailOutlinedIcon />}>Send email</ActionButton>
                    <ActionButton tone="primary" icon={<DoneAllIcon />}>
                        Save fees to all
                    </ActionButton>
                    <ActionButton tone="primary" icon={<CheckIcon />}>
                        Save
                    </ActionButton>
                </>
            }
        >
            <EditReservationScreen />
        </AppShell>
    ),
};

/**
 * **Cart Sign Out.**
 *
 * A liability waiver captured on the tablet before the keys change hands.
 * Reservation number at the top, name prefilled from the booking, cart number
 * typed in, an unchecked consent box against the damage clause, and a signature
 * area under the "Sign Here" rule.
 *
 * Only two actions: BACK and SAVE. There is no way to skip the signature from
 * this screen.
 */
export const CartSignOut: Story = {
    name: "Cart sign out",
    render: () => (
        <AppShell
            title="Cart Sign Out"
            active="teesheet"
            accountLabel=""
            showLogOut={false}
            showOverflow={false}
            actionBar={
                <>
                    <ActionButton icon={<ArrowBackIosIcon />}>Back</ActionButton>
                    <ActionButton tone="primary" icon={<CheckIcon />}>
                        Save
                    </ActionButton>
                </>
            }
        >
            <CartSignOutScreen />
        </AppShell>
    ),
};
