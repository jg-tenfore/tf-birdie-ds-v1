import { useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { appColors } from "@/theme/app-replica-tokens";
import {
    bayCustomers,
    bays,
    columnsFor,
    feeFor,
    matchesFilter,
    noFilter,
    punchesNeeded,
    seedBlocks,
    seedReservations,
    type BayBlock,
    type Reservation,
    type SheetFilter,
} from "./bay-data";
import { BayRows } from "./bay-rows";
import { BaySheet, SheetFilterBar, SheetLegend, type SheetTint, type Zoom } from "./bay-sheet-parts";
import { ReservationPeek, type PeekWidth } from "./reservation-peek";
import { BlockDialog, BookingDialog, ReservationDialog, emptyBlock, emptyDraft, type BlockDraft, type BookingDraft } from "./bay-dialogs";

/**
 * **The bay sheet, wired.**
 *
 * One component holding the day and every dialog that can change it, so the
 * Storybook stories and the V2 prototype run the same code rather than two
 * copies that drift.
 *
 * What it is for: the PRD's requirements are mostly about *what happens next*
 * — a booking that collides, a limit that warns, a cancellation that frees its
 * time, a punch that recalculates — and none of that can be judged from a
 * static screen.
 */

/* --------------------------------------------------------------- routing */

/**
 * **Which dialog is open, as a value.**
 *
 * Nov 1: the dialogs used to be four pieces of private state, which meant the
 * only way to show somebody the booking flow was to tell them where to tap.
 * They are one value now, so the V2 prototype can keep it in the URL and
 * `#/baysheet/reservation/r-7` opens Justin's standing lesson directly.
 *
 * `app/src-v2/screens/bay-sheet.tsx` holds the translation between this and a
 * path; nothing in here knows about URLs.
 */
export type BayDialogRoute =
    | { kind: "none" }
    | { kind: "book"; bayId: string; start: number; customerId?: string }
    /* `edit` is the full dialog; without it, the peek panel. */
    | { kind: "reservation"; id: string; edit?: boolean }
    | { kind: "newblock"; bayId: string; start: number }
    | { kind: "block"; id: string };

export const noDialog: BayDialogRoute = { kind: "none" };

/** A stable identity for the open dialog, used to reset its draft on change. */
const routeKey = (route: BayDialogRoute): string =>
    route.kind === "book"
        ? `book:${route.bayId}:${route.start}:${route.customerId ?? ""}`
        : route.kind === "newblock"
          ? `newblock:${route.bayId}:${route.start}`
          : route.kind === "reservation"
            ? `reservation:${route.id}:${route.edit ? "edit" : "peek"}`
            : route.kind === "block"
              ? `block:${route.id}`
              : "none";

/* ---------------------------------------------------- the dialog wrappers */

/**
 * Each dialog's draft lives in a small wrapper that the workspace mounts with
 * a `key`. Changing the route remounts the wrapper, which is how the draft
 * resets without an effect that writes state during render.
 */

const BookingFlow = ({
    bayId,
    start,
    customerId,
    reservations,
    blocks,
    onBook,
    onClose,
}: {
    bayId: string;
    start: number;
    customerId?: string;
    reservations: Reservation[];
    blocks: BayBlock[];
    onBook: (draft: BookingDraft) => void;
    onClose: () => void;
}) => {
    const [draft, setDraft] = useState<BookingDraft>(() => {
        const seeded = emptyDraft(bayId, start);
        const who = customerId ? bayCustomers.find((candidate) => candidate.id === customerId) : undefined;

        /* A story or a link whose point is a warning has to show the warning:
           both guards only fire once the flow knows who it is for. */
        return who ? { ...seeded, customer: who, usePunch: (who.punchesLeft ?? 0) > 0 } : seeded;
    });

    return (
        <BookingDialog draft={draft} reservations={reservations} blocks={blocks} onChange={setDraft} onBook={onBook} onClose={onClose} />
    );
};

const ReservationFlow = ({
    reservation,
    reservations,
    blocks,
    onSave,
    onCancelReservation,
    onStatus,
    onClearSeries,
    onOpenTab,
    onClose,
}: {
    reservation: Reservation;
    reservations: Reservation[];
    blocks: BayBlock[];
    onSave: (reservation: Reservation) => void;
    onCancelReservation: (reservation: Reservation) => void;
    onStatus: (reservation: Reservation, status: Reservation["status"]) => void;
    onClearSeries: (reservation: Reservation) => void;
    onOpenTab: (reservation: Reservation) => void;
    onClose: () => void;
}) => {
    const [edited, setEdited] = useState<Reservation>(reservation);

    return (
        <ReservationDialog
            reservation={edited}
            reservations={reservations}
            blocks={blocks}
            onChange={setEdited}
            onSave={() => onSave(edited)}
            onCancelReservation={() => onCancelReservation(edited)}
            onStatus={(status) => onStatus(edited, status)}
            onClearSeries={() => onClearSeries(edited)}
            onOpenTab={() => onOpenTab(edited)}
            onClose={onClose}
        />
    );
};

const BlockFlow = ({
    seed,
    editing,
    reservations,
    blocks,
    onSave,
    onDelete,
    onClearSeries,
    onClose,
}: {
    seed: BlockDraft;
    editing?: BayBlock;
    reservations: Reservation[];
    blocks: BayBlock[];
    onSave: (draft: BlockDraft, editing?: BayBlock) => void;
    onDelete: (block: BayBlock) => void;
    onClearSeries: (block: BayBlock) => void;
    onClose: () => void;
}) => {
    const [draft, setDraft] = useState<BlockDraft>(seed);

    return (
        <BlockDialog
            draft={draft}
            editing={editing}
            reservations={reservations}
            blocks={blocks}
            onChange={setDraft}
            onSave={() => onSave(draft, editing)}
            onDelete={() => editing && onDelete(editing)}
            onClearSeries={() => editing && onClearSeries(editing)}
            onClose={onClose}
        />
    );
};

/* ------------------------------------------------------------- the whole */

/**
 * **Which of the two sheets to draw.**
 *
 * Nov 2: `calendar` is Option A, the time grid this build started as.
 * `rows` is Option B, the same day drawn the way the shipping tee sheet draws
 * its own — one card per half hour. Everything below the sheet is shared, so
 * the variant decides the layout and nothing else.
 */
export type SheetVariant = "calendar" | "rows";

export interface BayWorkspaceProps {
    /** Opening day. Both default to the seeded day with every state on it. */
    initialReservations?: Reservation[];
    initialBlocks?: BayBlock[];
    zoom?: Zoom;
    /** The layout. Defaults to the calendar grid, which is Option A. */
    variant?: SheetVariant;
    /**
     * Nov 2 — the course-level colour preference and the panel width, both
     * passed through so a story can show them on the real screen rather than
     * on a component in isolation. Neither is a staff-facing switch.
     */
    tint?: SheetTint;
    peekWidth?: PeekWidth;
    /**
     * Which dialog to open on mount, for a story that is about one dialog.
     * Ignored when `route` is supplied, which makes the workspace controlled.
     */
    initialRoute?: BayDialogRoute;
    /** Controlled mode: the open dialog, and where to send a change to it. */
    route?: BayDialogRoute;
    onRoute?: (route: BayDialogRoute) => void;
    /** The sheet alone, with no legend — for an embedded view. */
    hideLegend?: boolean;
    /** The sheet alone, with no filter row — for an embedded view. */
    hideFilter?: boolean;
    /** Opening filter, for a story or a link that is about a narrowed sheet. */
    initialFilter?: SheetFilter;
    /** A banner above the sheet, used by the prototype for its own chrome. */
    banner?: React.ReactNode;
    /** Told when something lands in the order, so a POS can take the money. */
    onCharge?: (reservation: Reservation, kind: "tab" | "fee") => void;
}

export const BayWorkspace = ({
    initialReservations = seedReservations,
    initialBlocks = seedBlocks,
    zoom = "normal",
    variant = "calendar",
    tint = "ribbon",
    peekWidth = "wide",
    initialRoute,
    route: controlledRoute,
    onRoute,
    hideLegend = false,
    hideFilter = false,
    initialFilter,
    banner,
    onCharge,
}: BayWorkspaceProps) => {
    const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
    const [blocks, setBlocks] = useState<BayBlock[]>(initialBlocks);

    /* Controlled when the host passes a route — the V2 prototype does, so the
       URL is the source of truth there — and self-driven otherwise. */
    const [selfRoute, setSelfRoute] = useState<BayDialogRoute>(initialRoute ?? noDialog);
    const route = controlledRoute ?? selfRoute;
    const go = (next: BayDialogRoute) => (onRoute ? onRoute(next) : setSelfRoute(next));
    const close = () => go(noDialog);

    /*
     * The filter is a view, not a fact: it changes what the sheet draws and
     * nothing else. Every dialog below still gets the whole day, because an
     * overlap check that only saw the filtered bookings would happily let you
     * double-book a golfer you had filtered out.
     */
    const [filter, setFilter] = useState<SheetFilter>(initialFilter ?? noFilter);
    const onSheet = reservations.filter((reservation) => matchesFilter(reservation, filter));
    const columns = columnsFor(reservations, filter);

    /** What the staff did last, so a prototype can show it happened. */
    const [toast, setToast] = useState<string | undefined>(undefined);
    const say = (message: string) => setToast(message);

    /* ------------------------------------------------------------ booking */

    const book = (draft: BookingDraft) => {
        if (!draft.customer) return;

        const fee = feeFor(draft.customer.status, draft.start, draft.duration);
        const id = `r-new-${reservations.length + 1}`;

        const next: Reservation = {
            id,
            bayId: draft.bayId,
            start: draft.start,
            duration: draft.duration,
            customer: draft.customer,
            party: draft.party,
            status: "booked",
            paid: false,
            tabOpen: false,
            note: draft.note.trim() || undefined,
            occasion: draft.occasion,
            fee,
            punchesUsed: draft.usePunch ? Math.min(punchesNeeded(draft.duration), draft.customer.punchesLeft ?? 0) : undefined,
            repeat: draft.repeat,
            seriesId: draft.repeat === "none" ? undefined : `s-new-${id}`,
        };

        setReservations((prev) => [...prev, next]);
        close();
        say(
            draft.skipConfirmation
                ? `Booked ${draft.customer.name} — no confirmation sent.`
                : `Booked ${draft.customer.name} — confirmation sent to ${draft.customer.email}.`,
        );
    };

    /* ------------------------------------------------------- the one open */

    const save = (edited: Reservation) => {
        setReservations((prev) => prev.map((r) => (r.id === edited.id ? edited : r)));
        close();
        say("Reservation updated.");
    };

    const setStatus = (edited: Reservation, status: Reservation["status"], message: string) => {
        setReservations((prev) => prev.map((r) => (r.id === edited.id ? { ...edited, status } : r)));
        close();
        say(message);
    };

    /** Requirement 15 — the whole series goes, not just this occurrence. */
    const clearSeries = (edited: Reservation) => {
        if (!edited.seriesId) return;
        const id = edited.seriesId;
        setReservations((prev) => prev.map((r) => (r.seriesId === id ? { ...r, status: "cancelled" } : r)));
        close();
        say("Every occurrence in the series was cancelled.");
    };

    const openTab = (edited: Reservation) => {
        const next = { ...edited, tabOpen: true };
        setReservations((prev) => prev.map((r) => (r.id === edited.id ? next : r)));
        close();
        onCharge?.(next, "tab");
        say(`Tab opened for ${edited.customer.name} — the bay fee is on it.`);
    };

    /* ------------------------------------------------------------- blocks */

    /**
     * Nov 2: one draft can now become several blocks, one per ticked bay.
     *
     * A block still belongs to exactly one bay in the model, because that is
     * what the sheet draws and what the shipping data says. The plural lives
     * in the dialog and ends here — which also means a series started across
     * four bays shares one `seriesId`, so clearing it clears all four.
     */
    const saveBlock = (draft: BlockDraft, editing?: BayBlock) => {
        const { bayIds, ...shared } = draft;
        const stamp = Date.now();
        const seriesId = draft.repeat === "none" ? undefined : `s-new-${stamp}`;

        if (editing) {
            /* The edited block keeps its id and takes the first bay. Any bay
               ticked on top of it becomes a new block beside it, because
               "also block these" is what the extra ticks mean. */
            const [first, ...also] = bayIds;

            setBlocks((prev) => [
                ...prev.map((b) => (b.id === editing.id ? { ...editing, ...shared, bayId: first ?? editing.bayId } : b)),
                ...also.map((bayId, index) => ({ id: `bl-new-${stamp}-${index}`, bayId, ...shared, seriesId })),
            ]);
            say(also.length ? `Block updated, and added to ${also.length} more ${also.length === 1 ? "bay" : "bays"}.` : "Block updated.");
        } else {
            setBlocks((prev) => [...prev, ...bayIds.map((bayId, index) => ({ id: `bl-new-${stamp}-${index}`, bayId, ...shared, seriesId }))]);
            say(bayIds.length === 1 ? "Block added." : `${bayIds.length} bays blocked.`);
        }

        close();
    };

    const removeBlock = (block: BayBlock, series: boolean) => {
        setBlocks((prev) => prev.filter((b) => (series && block.seriesId ? b.seriesId !== block.seriesId : b.id !== block.id)));
        close();
        say(series ? "Every block in the series was removed." : "Block removed.");
    };

    /* --------------------------------------------------- what is open now */

    const openReservation = route.kind === "reservation" ? reservations.find((r) => r.id === route.id) : undefined;
    const openBlock = route.kind === "block" ? blocks.find((b) => b.id === route.id) : undefined;

    /* The one line the variant decides. Both take `BaySheetProps`. */
    const Sheet = variant === "rows" ? BayRows : BaySheet;

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: appColors.canvas }}>
            {banner}

            <Sheet
                reservations={onSheet}
                blocks={blocks}
                zoom={zoom}
                tint={tint}
                bayIds={columns}
                header={
                    <>
                        {!hideFilter && (
                            <SheetFilterBar
                                filter={filter}
                                onFilter={setFilter}
                                shown={onSheet.length}
                                total={reservations.length}
                                bayCount={columns.length || bays.length}
                            />
                        )}
                        {!hideLegend && <SheetLegend />}
                    </>
                }
                onBookSlot={(bayId, start) => go({ kind: "book", bayId, start })}
                onOpenReservation={(reservation) => go({ kind: "reservation", id: reservation.id })}
                onOpenBlock={(block) => go({ kind: "block", id: block.id })}
            />

            {/* What just happened, since a prototype has no server to tell you. */}
            {toast && (
                <Box
                    onClick={() => setToast(undefined)}
                    role="status"
                    sx={{
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        minHeight: 48,
                        px: 3,
                        bgcolor: appColors.slate,
                        cursor: "pointer",
                    }}
                >
                    <Typography sx={{ flex: 1, minWidth: 0, fontSize: 16, color: "#fff" }}>{toast}</Typography>
                    <Typography sx={{ fontSize: 14, letterSpacing: "0.06em", color: "rgba(255,255,255,0.8)" }}>DISMISS</Typography>
                </Box>
            )}

            {route.kind === "book" && (
                <BookingFlow
                    key={routeKey(route)}
                    bayId={route.bayId}
                    start={route.start}
                    customerId={route.customerId}
                    reservations={reservations}
                    blocks={blocks}
                    onBook={book}
                    onClose={close}
                />
            )}

            {/* A tap on a chip peeks first. Most taps are not edits — they are
                "who is this, have they shown up, what do they owe". */}
            {openReservation && route.kind === "reservation" && !route.edit && (
                <ReservationPeek
                    key={routeKey(route)}
                    width={peekWidth}
                    reservation={openReservation}
                    reservations={reservations}
                    onStatus={(status) =>
                        setStatus(
                            openReservation,
                            status,
                            {
                                booked: "Put back to booked.",
                                checkedIn: "Checked in.",
                                noShow: "Marked as a no-show. It still counts toward the daily limit.",
                                cancelled: "Reservation cancelled — the bay time is free again.",
                            }[status],
                        )
                    }
                    onEdit={() => go({ kind: "reservation", id: openReservation.id, edit: true })}
                    onOpenTab={() => openTab(openReservation)}
                    onCancelReservation={() =>
                        setStatus(openReservation, "cancelled", "Reservation cancelled — the bay time is free again.")
                    }
                    onClose={close}
                />
            )}

            {openReservation && route.kind === "reservation" && route.edit && (
                <ReservationFlow
                    key={routeKey(route)}
                    reservation={openReservation}
                    reservations={reservations}
                    blocks={blocks}
                    onSave={save}
                    onCancelReservation={(edited) => setStatus(edited, "cancelled", "Reservation cancelled — the bay time is free again.")}
                    /* The status toggle at the top of the dialog, not a one-shot
                       button: checking someone in is as routine as marking them
                       absent, and both must be reversible. */
                    onStatus={(edited, status) =>
                        setStatus(
                            edited,
                            status,
                            {
                                booked: "Put back to booked.",
                                checkedIn: "Checked in.",
                                noShow: "Marked as a no-show. It still counts toward the daily limit.",
                                cancelled: "Reservation cancelled — the bay time is free again.",
                            }[status],
                        )
                    }
                    onClearSeries={clearSeries}
                    onOpenTab={openTab}
                    onClose={close}
                />
            )}

            {route.kind === "newblock" && (
                <BlockFlow
                    key={routeKey(route)}
                    seed={emptyBlock(route.bayId, route.start)}
                    reservations={reservations}
                    blocks={blocks}
                    onSave={saveBlock}
                    onDelete={(block) => removeBlock(block, false)}
                    onClearSeries={(block) => removeBlock(block, true)}
                    onClose={close}
                />
            )}

            {openBlock && (
                <BlockFlow
                    key={routeKey(route)}
                    seed={{
                        bayIds: [openBlock.bayId],
                        start: openBlock.start,
                        duration: openBlock.duration,
                        label: openBlock.label,
                        repeat: openBlock.repeat,
                    }}
                    editing={openBlock}
                    reservations={reservations}
                    blocks={blocks}
                    onSave={saveBlock}
                    onDelete={(block) => removeBlock(block, false)}
                    onClearSeries={(block) => removeBlock(block, true)}
                    onClose={close}
                />
            )}
        </Box>
    );
};

export default BayWorkspace;
