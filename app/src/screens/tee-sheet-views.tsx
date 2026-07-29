import {
    TeeSheetBackNineView,
    TeeSheetGridView,
    TeeSheetListView,
    TeeSheetMultiView,
} from "@/components/screens/tee-sheet/tee-sheet-views";
import type { GridCard, MultiCourseColumn, SheetRow, SheetSlot } from "@/components/screens/tee-sheet/tee-sheet-data";
import { money, type Position, type SheetView, type TeeTimeBooking } from "../store";

/**
 * Adapters from the store's tee sheet to the four view renderers.
 *
 * The renderers are the Storybook components, unchanged — this file only turns
 * live bookings into the shapes they already take. Keeping the translation here
 * rather than teaching the components about the store is what lets the same
 * components document the design and drive the prototype.
 *
 * The tone rules are the interesting part, because the *same* reservation reads
 * differently per view: purple in List, dark navy in Grid, Multi and Back 9. A
 * paid time is green in List and a muted slate-blue in Grid. That is the app's
 * behaviour, not a simplification.
 */

const slotOf = (p: Position, tone: SheetSlot["tone"]): SheetSlot => ({
    label: `(${p.party}) ${p.name}`,
    price: money(p.price),
    tone: p.paid && tone === "booked" ? "paid" : tone,
    cart: p.cart,
    dollar: p.balance,
    bolt: p.raincheck,
    key: p.keyed,
    online: p.online,
    tags: p.holes === 9 ? ["9H"] : undefined,
});

const blockedSlot = (label: string): SheetSlot => ({ label, tone: "blocked" });

/** List view keeps the purple/green palette. */
export const toListRows = (times: TeeTimeBooking[]): SheetRow[] =>
    times.map((t) => ({
        time: t.time,
        slots: t.blocked
            ? Array.from({ length: 4 }, () => blockedSlot(t.blockLabel ?? "BLOCKED"))
            : t.positions.map((p) => (p ? slotOf(p, "booked") : null)),
    }));

/** Grid, Multi and Back 9 render the same reservations on navy. */
const navyRows = (times: TeeTimeBooking[]): SheetRow[] =>
    times.map((t) => ({
        time: t.time,
        slots: t.blocked
            ? Array.from({ length: 4 }, () => blockedSlot(`(4) ${t.blockLabel ?? "BLOCKED"}`))
            : t.positions.map((p) => (p ? slotOf(p, "navy") : null)),
    }));

export const toGridCards = (times: TeeTimeBooking[]): GridCard[] =>
    times.map((t) => {
        const filled = t.positions.filter((p): p is Position => Boolean(p));
        const tone: GridCard["tone"] = t.blocked
            ? "blocked"
            : filled.length === 0
              ? "open"
              : filled.every((p) => p.paid)
                ? "paid"
                : "navy";

        return {
            time: t.time,
            tone,
            lines: t.blocked
                ? Array.from({ length: 4 }, () => blockedSlot(t.blockLabel ?? "BLOCKED"))
                : filled.map((p) => slotOf(p, "navy")),
        };
    });

/**
 * Multi view — the booked course beside its two quiet siblings.
 *
 * The sibling intervals really are different (East every 10 minutes, West every
 * 9, against the main course's own spacing), so the rows do not line up. That
 * misalignment is information: it is why a starter cannot read three courses as
 * one grid.
 */
const siblingTimes = (start: [number, number], stepMinutes: number, count: number) =>
    Array.from({ length: count }, (_, i) => {
        const total = start[0] * 60 + start[1] + i * stepMinutes;
        const h24 = Math.floor(total / 60) % 24;
        const m = total % 60;
        const h = h24 % 12 || 12;
        return `${h}:${String(m).padStart(2, "0")} ${h24 < 12 ? "AM" : "PM"}`;
    });

export const toMultiColumns = (times: TeeTimeBooking[], mainCourse: string): MultiCourseColumn[] => [
    {
        course: mainCourse,
        cards: navyRows(times.slice(0, 8)).map((r) => ({
            time: r.time,
            slots: r.slots.filter((s): s is SheetSlot => Boolean(s)),
        })),
    },
    { course: "East Course", cards: siblingTimes([5, 40], 10, 8).map((time) => ({ time, slots: [] })) },
    { course: "West Course", cards: siblingTimes([6, 0], 9, 8).map((time) => ({ time, slots: [] })) },
];

/**
 * Back 9 view — the same times twice, front and back.
 *
 * The back nine is empty in the reference across the whole morning, which is
 * itself worth showing: a course that sells the front and never the back is a
 * pricing problem, not a rendering one.
 */
export const toBackNine = (times: TeeTimeBooking[]) => ({
    front: navyRows(times.slice(0, 7)),
    back: navyRows(times.slice(0, 7)).map((r) => ({ time: r.time, slots: [null, null, null, null] })),
});

export const SheetBody = ({
    view,
    times,
    course,
    slotMenu,
    onOpenTime,
}: {
    view: SheetView;
    times: TeeTimeBooking[];
    course: string;
    slotMenu?: React.ReactNode;
    onOpenTime: (time: string) => void;
}) => {
    if (view === "grid") return <TeeSheetGridView cards={toGridCards(times)} onOpenTime={onOpenTime} />;
    if (view === "multi") return <TeeSheetMultiView columns={toMultiColumns(times, course)} />;
    if (view === "back9") {
        const { front, back } = toBackNine(times);
        return <TeeSheetBackNineView front={front} back={back} />;
    }
    return <TeeSheetListView rows={toListRows(times)} slotMenu={slotMenu} onOpenTime={onOpenTime} />;
};
