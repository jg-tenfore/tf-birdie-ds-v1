import { useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { appColors } from "@/theme/app-replica-tokens";
import { bayCustomers, feeFor, punchesNeeded, seedBlocks, seedReservations, type BayBlock, type Reservation } from "./bay-data";
import { BaySheet, SheetLegend, type Zoom } from "./bay-sheet-parts";
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

export interface BayWorkspaceProps {
    /** Opening day. Both default to the seeded day with every state on it. */
    initialReservations?: Reservation[];
    initialBlocks?: BayBlock[];
    zoom?: Zoom;
    /** Starts with the booking dialog open on this slot, for the stories. */
    openBooking?: { bayId: string; start: number };
    /**
     * Opens that booking with a customer already chosen.
     *
     * A story whose point is a warning has to show the warning: both guards
     * only fire once the flow knows who it is for.
     */
    openBookingCustomerId?: string;
    /** Starts with this reservation's details open, for the stories. */
    openReservationId?: string;
    /** Starts with the block dialog open, for the stories. */
    openBlock?: { bayId: string; start: number };
    /** The sheet alone, with no legend — for an embedded view. */
    hideLegend?: boolean;
    /** A banner above the sheet, used by the prototype for its own chrome. */
    banner?: React.ReactNode;
    /** Told when something lands in the order, so a POS can take the money. */
    onCharge?: (reservation: Reservation, kind: "tab" | "fee") => void;
}

export const BayWorkspace = ({
    initialReservations = seedReservations,
    initialBlocks = seedBlocks,
    zoom = "normal",
    openBooking,
    openBookingCustomerId,
    openReservationId,
    openBlock,
    hideLegend = false,
    banner,
    onCharge,
}: BayWorkspaceProps) => {
    const [reservations, setReservations] = useState<Reservation[]>(initialReservations);
    const [blocks, setBlocks] = useState<BayBlock[]>(initialBlocks);

    const [draft, setDraft] = useState<BookingDraft | undefined>(() => {
        if (!openBooking) return undefined;

        const seeded = emptyDraft(openBooking.bayId, openBooking.start);
        const who = openBookingCustomerId ? bayCustomers.find((c) => c.id === openBookingCustomerId) : undefined;

        return who ? { ...seeded, customer: who, usePunch: (who.punchesLeft ?? 0) > 0 } : seeded;
    });
    const [editing, setEditing] = useState<Reservation | undefined>(
        openReservationId ? initialReservations.find((r) => r.id === openReservationId) : undefined,
    );
    const [blockDraft, setBlockDraft] = useState<BlockDraft | undefined>(
        openBlock ? emptyBlock(openBlock.bayId, openBlock.start) : undefined,
    );
    const [editingBlock, setEditingBlock] = useState<BayBlock | undefined>(undefined);

    /** What the staff did last, so a prototype can show it happened. */
    const [toast, setToast] = useState<string | undefined>(undefined);
    const say = (message: string) => setToast(message);

    /* ------------------------------------------------------------ booking */

    const book = (d: BookingDraft) => {
        if (!d.customer) return;

        const fee = feeFor(d.customer.tier, d.start, d.duration);
        const id = `r-new-${reservations.length + 1}`;

        const next: Reservation = {
            id,
            bayId: d.bayId,
            start: d.start,
            duration: d.duration,
            customer: d.customer,
            party: d.party,
            status: "booked",
            paid: false,
            tabOpen: false,
            note: d.note.trim() || undefined,
            fee,
            punchesUsed: d.usePunch ? Math.min(punchesNeeded(d.duration), d.customer.punchesLeft ?? 0) : undefined,
            repeat: d.repeat,
            seriesId: d.repeat === "none" ? undefined : `s-new-${id}`,
        };

        setReservations((prev) => [...prev, next]);
        setDraft(undefined);
        say(
            d.skipConfirmation
                ? `Booked ${d.customer.name} — no confirmation sent.`
                : `Booked ${d.customer.name} — confirmation sent to ${d.customer.email}.`,
        );
    };

    /* ------------------------------------------------------- the one open */

    const save = () => {
        if (!editing) return;
        setReservations((prev) => prev.map((r) => (r.id === editing.id ? editing : r)));
        setEditing(undefined);
        say("Reservation updated.");
    };

    const setStatus = (status: Reservation["status"], message: string) => {
        if (!editing) return;
        setReservations((prev) => prev.map((r) => (r.id === editing.id ? { ...editing, status } : r)));
        setEditing(undefined);
        say(message);
    };

    /** Requirement 15 — the whole series goes, not just this occurrence. */
    const clearSeries = () => {
        if (!editing?.seriesId) return;
        const id = editing.seriesId;
        setReservations((prev) => prev.map((r) => (r.seriesId === id ? { ...r, status: "cancelled" } : r)));
        setEditing(undefined);
        say("Every occurrence in the series was cancelled.");
    };

    const openTab = () => {
        if (!editing) return;
        const next = { ...editing, tabOpen: true };
        setReservations((prev) => prev.map((r) => (r.id === editing.id ? next : r)));
        setEditing(undefined);
        onCharge?.(next, "tab");
        say(`Tab opened for ${editing.customer.name} — the bay fee is on it.`);
    };

    /* ------------------------------------------------------------- blocks */

    const saveBlock = () => {
        if (!blockDraft) return;

        if (editingBlock) {
            setBlocks((prev) => prev.map((b) => (b.id === editingBlock.id ? { ...editingBlock, ...blockDraft } : b)));
            say("Block updated.");
        } else {
            const id = `bl-new-${blocks.length + 1}`;
            setBlocks((prev) => [...prev, { id, ...blockDraft, seriesId: blockDraft.repeat === "none" ? undefined : `s-new-${id}` }]);
            say("Block added.");
        }

        setBlockDraft(undefined);
        setEditingBlock(undefined);
    };

    const removeBlock = (series: boolean) => {
        if (!editingBlock) return;
        const { id, seriesId } = editingBlock;
        setBlocks((prev) => prev.filter((b) => (series && seriesId ? b.seriesId !== seriesId : b.id !== id)));
        setBlockDraft(undefined);
        setEditingBlock(undefined);
        say(series ? "Every block in the series was removed." : "Block removed.");
    };

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: appColors.canvas }}>
            {banner}

            <BaySheet
                reservations={reservations}
                blocks={blocks}
                zoom={zoom}
                header={hideLegend ? undefined : <SheetLegend />}
                onBookSlot={(bayId, start) => setDraft(emptyDraft(bayId, start))}
                onOpenReservation={(reservation) => setEditing(reservation)}
                onOpenBlock={(block) => {
                    setEditingBlock(block);
                    setBlockDraft({
                        bayId: block.bayId,
                        start: block.start,
                        duration: block.duration,
                        label: block.label,
                        repeat: block.repeat,
                    });
                }}
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

            {draft && (
                <BookingDialog
                    draft={draft}
                    reservations={reservations}
                    blocks={blocks}
                    onChange={setDraft}
                    onBook={book}
                    onClose={() => setDraft(undefined)}
                />
            )}

            {editing && (
                <ReservationDialog
                    reservation={editing}
                    reservations={reservations}
                    blocks={blocks}
                    onChange={setEditing}
                    onSave={save}
                    onCancelReservation={() => setStatus("cancelled", "Reservation cancelled — the bay time is free again.")}
                    onNoShow={() => setStatus("noShow", "Marked as a no-show. It still counts toward the daily limit.")}
                    onClearSeries={clearSeries}
                    onOpenTab={openTab}
                    onClose={() => setEditing(undefined)}
                />
            )}

            {blockDraft && (
                <BlockDialog
                    draft={blockDraft}
                    reservations={reservations}
                    blocks={blocks}
                    editing={editingBlock}
                    onChange={setBlockDraft}
                    onSave={saveBlock}
                    onDelete={() => removeBlock(false)}
                    onClearSeries={() => removeBlock(true)}
                    onClose={() => {
                        setBlockDraft(undefined);
                        setEditingBlock(undefined);
                    }}
                />
            )}
        </Box>
    );
};

export default BayWorkspace;
