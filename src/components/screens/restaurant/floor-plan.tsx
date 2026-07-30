import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

/**
 * The restaurant floor plan — geometry and rendering, shared by the Table Chart
 * editor and the live Tables view.
 *
 * Ported from `references/072926/10-tablechart/restaurant-table-editor-prototype/`.
 * The seat geometry is the part worth keeping faithfully: chairs are drawn as
 * rounded squares distributed around the table body, proportionally across the
 * four sides for rectangles and evenly around the perimeter for circles. It is
 * what makes a six-top read as a six-top at a glance, without a number on it.
 *
 * One element type, four kinds. Tables carry a number, a shape and a seat count;
 * barriers are bare bars (walls, the bar itself); boxes are outlined regions;
 * labels are dashed text chips. They all share x/y/w/h so selection, dragging
 * and resizing work the same way on each.
 */

export type TableShape = "square" | "circle" | "rectangle" | "oval" | "diamond";

/**
 * Which pair of edges the seats sit on.
 *
 * `horizontal` puts them along the top and bottom, so diners face each other
 * across the table's width; `vertical` puts them on the left and right. It only
 * means anything on the straight-edged shapes — a round table seats evenly around
 * its perimeter — so the control is hidden for those rather than doing nothing.
 *
 * Left unset, seats follow the longer pair of edges. That is right most of the
 * time and wrong exactly when a long table is pushed against a wall.
 */
export type SeatOrientation = "horizontal" | "vertical";
export type ElementKind = "table" | "barrier" | "box" | "label";

/** The states the live view colours by. Only `occupied` is coloured warm. */
export type TableStatus = "empty" | "occupied" | "reserved" | "cleaning" | "blocked" | "check-requested";

export interface FloorElement {
    id: string;
    kind: ElementKind;
    x: number;
    y: number;
    w: number;
    h: number;
    /** Tables only. */
    shape?: TableShape;
    num?: string;
    seats?: number;
    status?: TableStatus;
    /** Labels only. */
    text?: string;
    /** Resizing keeps the aspect ratio — round tables must stay round. */
    lockAR?: boolean;
    /** Overrides the default "seats follow the longer edges" rule. */
    seatOrientation?: SeatOrientation;
    /** Live view only: who is sitting here. */
    party?: { name: string; guests: number; server: string; tab: number };
}

/* ------------------------------------------------------------- geometry */

const CHAIR_SIZE = 12;
const CHAIR_GAP = 4;
const CHAIR_RADIUS = 2.5;

/** Every shape allows a single seat — bar stools are one-seat circles. */
export const SEAT_RANGE = { min: 1, max: 16 };

export const clampSeats = (seats: number | undefined) =>
    seats == null || Number.isNaN(seats) ? SEAT_RANGE.min : Math.max(SEAT_RANGE.min, Math.min(SEAT_RANGE.max, Math.round(seats)));

interface ChairPos {
    x: number;
    y: number;
    rotate: number;
}

/**
 * Chair anchors for a shape and seat count.
 *
 * Rectangles distribute proportionally by edge length, so a long table gets more
 * chairs down its sides than across its ends. Squares with four or fewer seats
 * are special-cased to top → bottom → right → left, because proportional
 * distribution puts two chairs on one edge and looks wrong at low counts.
 */
export function chairPositions(
    shape: TableShape,
    seats: number,
    w: number,
    h: number,
    orientation?: SeatOrientation,
): ChairPos[] {
    const inset = CHAIR_SIZE + CHAIR_GAP;
    const tableLeft = inset;
    const tableTop = inset;
    const tableW = w - inset * 2;
    const tableH = h - inset * 2;
    const cx = w / 2;
    const cy = h / 2;
    const out: ChairPos[] = [];

    if (shape === "circle" || shape === "oval") {
        const rx = (w - 2 * CHAIR_GAP) / 2;
        const ry = (h - 2 * CHAIR_GAP) / 2;
        for (let i = 0; i < seats; i += 1) {
            const angle = (i / seats) * Math.PI * 2 - Math.PI / 2;
            out.push({
                x: cx + Math.cos(angle) * rx,
                y: cy + Math.sin(angle) * ry,
                rotate: (angle * 180) / Math.PI + 90,
            });
        }
        return out;
    }

    // Square / rectangle / diamond (a diamond is a rotated square).
    const top: ChairPos = { x: cx, y: CHAIR_GAP, rotate: 0 };
    const bottom: ChairPos = { x: cx, y: h - CHAIR_GAP, rotate: 180 };
    const right: ChairPos = { x: w - CHAIR_GAP, y: cy, rotate: 90 };
    const left: ChairPos = { x: CHAIR_GAP, y: cy, rotate: 270 };

    if (seats <= 4 && shape !== "rectangle") {
        // Fill the chosen pair of edges first, then the other pair. With no
        // orientation this is top → bottom → right → left, which is what a
        // four-top looks like when nobody has said otherwise.
        const sides = orientation === "vertical" ? [left, right, top, bottom] : [top, bottom, right, left];
        return sides.slice(0, seats);
    }

    // An explicit orientation overrides the edge-length rule: `horizontal` treats
    // top and bottom as the primary pair whatever the proportions say.
    const isWide = orientation ? orientation === "horizontal" : tableW >= tableH;
    const longEdge = isWide ? tableW : tableH;
    const shortEdge = isWide ? tableH : tableW;
    const total = longEdge * 2 + shortEdge * 2;

    let longEach = Math.ceil(Math.round(seats * (longEdge / total)) / 2);
    let shortEach = Math.floor(Math.round(seats * (shortEdge / total)) / 2);

    let guard = 0;
    while (longEach * 2 + shortEach * 2 < seats && guard < 40) {
        if (longEach <= shortEach + 1) longEach += 1;
        else shortEach += 1;
        guard += 1;
    }

    for (let i = 0; i < longEach; i += 1) {
        const t = (i + 1) / (longEach + 1);
        if (isWide) {
            out.push({ x: tableLeft + t * tableW, y: CHAIR_GAP, rotate: 0 });
            out.push({ x: tableLeft + t * tableW, y: h - CHAIR_GAP, rotate: 180 });
        } else {
            out.push({ x: CHAIR_GAP, y: tableTop + t * tableH, rotate: 270 });
            out.push({ x: w - CHAIR_GAP, y: tableTop + t * tableH, rotate: 90 });
        }
    }
    for (let i = 0; i < shortEach; i += 1) {
        const t = (i + 1) / (shortEach + 1);
        if (isWide) {
            out.push({ x: CHAIR_GAP, y: tableTop + t * tableH, rotate: 270 });
            out.push({ x: w - CHAIR_GAP, y: tableTop + t * tableH, rotate: 90 });
        } else {
            out.push({ x: tableLeft + t * tableW, y: CHAIR_GAP, rotate: 0 });
            out.push({ x: tableLeft + t * tableW, y: h - CHAIR_GAP, rotate: 180 });
        }
    }

    return out.slice(0, seats);
}

/* -------------------------------------------------------------- colours */

/** Table body colours. Only a seated table is warm — everything else is cool. */
export const floorColors = {
    /** Free, and the editor's only fill. */
    idle: "#2C3339",
    /** Seated. Sampled from the artifact's live view. */
    occupied: "#8A6A41",
    /** Held for a booking that has not walked in. */
    reserved: "#4B5560",
    /** Being reset between covers. */
    cleaning: "#6E7883",
    /** Out of service. */
    blocked: "#9AA1A9",
    canvas: "#F4F4F3",
    grid: "rgba(0,0,0,0.06)",
} as const;

export const statusFill = (status: TableStatus | undefined) => {
    switch (status) {
        case "occupied":
        case "check-requested":
            return floorColors.occupied;
        case "reserved":
            return floorColors.reserved;
        case "cleaning":
            return floorColors.cleaning;
        case "blocked":
            return floorColors.blocked;
        default:
            return floorColors.idle;
    }
};

/* ------------------------------------------------------------ rendering */

/** The table body plus its chairs, as one SVG sized to the element's box. */
export const TableGraphic = ({ element, fill }: { element: FloorElement; fill: string }) => {
    const { w, h } = element;
    const shape = element.shape ?? "square";
    const seats = clampSeats(element.seats);
    const inset = CHAIR_SIZE + CHAIR_GAP;

    // A single-seat table fills its whole box and draws no chairs — that is how
    // bar stools render, and why a stool is a circle with no ring around it.
    const bare = seats === 1;
    const bodyX = bare ? 0 : inset;
    const bodyW = bare ? w : Math.max(20, w - inset * 2);
    const bodyH = bare ? h : Math.max(20, h - inset * 2);

    return (
        <Box component="svg" width={w} height={h} viewBox={`0 0 ${w} ${h}`} sx={{ display: "block", overflow: "visible" }}>
            {!bare &&
                chairPositions(shape, seats, w, h, element.seatOrientation).map((c, i) => (
                    <rect
                        key={i}
                        x={c.x - CHAIR_SIZE / 2}
                        y={c.y - CHAIR_SIZE / 2}
                        width={CHAIR_SIZE}
                        height={CHAIR_SIZE}
                        rx={CHAIR_RADIUS}
                        ry={CHAIR_RADIUS}
                        fill={fill}
                        transform={`rotate(${c.rotate} ${c.x} ${c.y})`}
                    />
                ))}

            {shape === "circle" || shape === "oval" ? (
                <ellipse cx={w / 2} cy={h / 2} rx={bodyW / 2} ry={bodyH / 2} fill={fill} />
            ) : (
                <rect x={bodyX} y={bare ? 0 : inset} width={bodyW} height={bodyH} rx={4} ry={4} fill={fill} />
            )}
        </Box>
    );
};

/**
 * One element on the plan, absolutely positioned.
 *
 * `onPointerDown` is what the editor hooks for dragging; the live view passes
 * `onSelect` instead and gets a plain tap.
 */
export const FloorElementView = ({
    element,
    selected,
    fill,
    onPointerDown,
    onSelect,
}: {
    element: FloorElement;
    selected?: boolean;
    fill?: string;
    onPointerDown?: (e: React.PointerEvent) => void;
    onSelect?: () => void;
}) => {
    const body = statusFill(element.status);
    const color = fill ?? body;

    const common = {
        position: "absolute" as const,
        left: element.x,
        top: element.y,
        width: element.w,
        height: element.h,
        cursor: onPointerDown ? "move" : onSelect ? "pointer" : "default",
        touchAction: "none" as const,
    };

    if (element.kind === "barrier") {
        return <Box sx={{ ...common, bgcolor: floorColors.idle, borderRadius: "2px" }} onPointerDown={onPointerDown} onClick={onSelect} />;
    }

    if (element.kind === "box") {
        return (
            <Box
                sx={{ ...common, border: `2px solid ${floorColors.idle}`, borderRadius: "4px" }}
                onPointerDown={onPointerDown}
                onClick={onSelect}
            />
        );
    }

    if (element.kind === "label") {
        return (
            <Box
                sx={{
                    ...common,
                    display: "grid",
                    placeItems: "center",
                    border: `1px dashed rgba(0,0,0,0.35)`,
                    borderRadius: "3px",
                }}
                onPointerDown={onPointerDown}
                onClick={onSelect}
            >
                <Typography sx={{ fontSize: 13 }}>{element.text}</Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                ...common,
                // The diamond is a square the caller rotates, so its chairs
                // rotate with it rather than being recomputed.
                transform: element.shape === "diamond" ? "rotate(45deg)" : undefined,
            }}
            onPointerDown={onPointerDown}
            onClick={onSelect}
            data-table={element.num}
            aria-label={element.num ? `Table ${element.num}` : undefined}
            role={onSelect ? "button" : undefined}
        >
            <TableGraphic element={element} fill={color} />
            {element.num && (
                <Typography
                    sx={{
                        position: "absolute",
                        inset: 0,
                        display: "grid",
                        placeItems: "center",
                        color: "#fff",
                        fontSize: element.w <= 84 ? 14 : 17,
                        fontWeight: 600,
                        pointerEvents: "none",
                        transform: element.shape === "diamond" ? "rotate(-45deg)" : undefined,
                    }}
                >
                    {element.num}
                </Typography>
            )}
            {selected && (
                <Box
                    sx={{
                        position: "absolute",
                        inset: -4,
                        border: `1.5px solid ${floorColors.idle}`,
                        pointerEvents: "none",
                    }}
                />
            )}
        </Box>
    );
};

/* ------------------------------------------------------------- fixtures */

const stool = (i: number, num: string, status: TableStatus, party?: FloorElement["party"]): FloorElement => ({
    id: `stool-${num}`,
    kind: "table",
    shape: "circle",
    x: 60 + i * 95,
    y: 90,
    w: 80,
    h: 80,
    num,
    seats: 1,
    lockAR: true,
    status,
    party,
});

/**
 * Every room the device has configured, in its own order.
 *
 * Only three carry a layout. The other eight are real rooms with nothing laid
 * out in them, which is worth keeping rather than trimming the list: an operator
 * scrolling eleven rooms to find the two that are set up is the actual
 * experience, and the empty-room state is one the editor has to handle.
 */
export const floorRoomOrder = [
    "[Detached Tables]",
    "smallroom",
    "bigroom",
    "Private Hall",
    "banquet",
    "Lounge",
    "Trivia Pub/Bar",
    "Astor Creek Test Room",
    "Big Bar",
    "Open Tabs",
    "New Table Designer Room",
] as const;


/* --------------------------------------------------- the other nine rooms */

/** Helpers so a room reads as a room rather than a wall of coordinates. */
const table = (
    id: string,
    num: string,
    x: number,
    y: number,
    opts: Partial<FloorElement> = {},
): FloorElement => ({ id, kind: "table", shape: "square", x, y, w: 100, h: 100, num, seats: 4, status: "empty", ...opts });

const round = (id: string, num: string, x: number, y: number, opts: Partial<FloorElement> = {}) =>
    table(id, num, x, y, { shape: "circle", w: 110, h: 110, lockAR: true, ...opts });

const long = (id: string, num: string, x: number, y: number, opts: Partial<FloorElement> = {}) =>
    table(id, num, x, y, { shape: "rectangle", w: 220, h: 100, seats: 8, ...opts });

const seat = (id: string, num: string, x: number, y: number, opts: Partial<FloorElement> = {}) =>
    table(id, num, x, y, { shape: "circle", w: 80, h: 80, seats: 1, lockAR: true, ...opts });

const wall = (id: string, x: number, y: number, w: number, h = 14): FloorElement => ({ id, kind: "barrier", x, y, w, h });

const label = (id: string, x: number, y: number, text: string, w = 120): FloorElement => ({ id, kind: "label", x, y, w, h: 24, text });

const seated = (name: string, guests: number, server: string, tab: number) =>
    ({ status: "occupied" as const, party: { name, guests, server, tab } });

/**
 * The rooms the device has configured but never laid out.
 *
 * Invented rather than transcribed, and each one deliberately a different *kind*
 * of room rather than the same grid renamed — a banquet hall, a bar, a lounge and
 * a test room have genuinely different geometry, and a floor-plan editor that has
 * only ever been used on one shape is untested.
 */
const detachedTables: FloorElement[] = [
    label("d-note", 24, 20, "Unassigned", 130),
    // No walls: these are tables that belong to no room, which is the whole point
    // of the bucket. They sit loose in the top-left as the app drops them.
    table("d1", "27699", 40, 70, seated("Brooksby", 2, "BT", 11.94)),
    table("d2", "27700", 190, 70),
    table("d3", "27701", 340, 70, seated("Nakamura", 4, "SC", 86.4)),
    round("d4", "27702", 40, 210),
    round("d5", "27703", 190, 210),
];

const smallroom: FloorElement[] = [
    wall("s-w1", 40, 40, 620),
    label("s-l", 300, 12, "smallroom", 120),
    table("s1", "1", 60, 110, { w: 90, h: 90, seats: 2 }),
    table("s2", "2", 200, 110, { w: 90, h: 90, seats: 2, ...seated("Halloran", 2, "MR", 42.5) }),
    table("s3", "3", 340, 110, { w: 90, h: 90, seats: 2 }),
    table("s4", "4", 480, 110, { w: 90, h: 90, seats: 2 }),
    round("s5", "5", 100, 270),
    round("s6", "6", 260, 270, seated("Petrov", 3, "MR", 68.2)),
    round("s7", "7", 420, 270),
];

const banquet: FloorElement[] = [
    label("b-l", 40, 20, "Head table", 130),
    // A banquet room is rows, not a scatter: one head table across the top and
    // four long tables down the room, all seating eight.
    long("b-head", "HEAD", 380, 60, { w: 420, h: 100, seats: 10 }),
    long("b1", "1", 120, 220),
    long("b2", "2", 420, 220, seated("Delgado Outing", 8, "JL", 612.0)),
    long("b3", "3", 720, 220),
    long("b4", "4", 120, 380),
    long("b5", "5", 420, 380, seated("Sandhill Group", 6, "JL", 388.5)),
    long("b6", "6", 720, 380),
    long("b7", "7", 120, 540),
    long("b8", "8", 420, 540),
    long("b9", "9", 720, 540),
];

const lounge: FloorElement[] = [
    label("l-l", 40, 20, "Lounge", 100),
    // Low seating, no rows. Small rounds scattered off a counter along the wall.
    wall("l-counter", 700, 80, 20, 520),
    ...Array.from({ length: 6 }, (_, i) => seat(`l-s${i}`, `C${i + 1}`, 610, 100 + i * 90, i % 3 === 0 ? seated("Kaur", 1, "BT", 18) : {})),
    round("l1", "1", 90, 120, { w: 96, h: 96, seats: 2 }),
    round("l2", "2", 260, 120, { w: 96, h: 96, seats: 2, ...seated("Ito", 2, "BT", 34) }),
    round("l3", "3", 90, 300, { w: 96, h: 96, seats: 2 }),
    round("l4", "4", 260, 300, { w: 96, h: 96, seats: 2 }),
    table("l5", "5", 420, 200, { w: 140, h: 140, seats: 6 }),
];

const triviaPub: FloorElement[] = [
    label("t-l", 60, 20, "Trivia Pub/Bar", 150),
    wall("t-bar", 60, 70, 900, 18),
    ...Array.from({ length: 9 }, (_, i) =>
        seat(`t-s${i}`, `B${i + 1}`, 60 + i * 100, 100, i % 2 === 0 ? seated("Osei", 1, "BT", 22) : {}),
    ),
    // High-tops on the floor, small and square so a quiz team crowds one.
    ...Array.from({ length: 8 }, (_, i) =>
        table(`t-h${i}`, `T${i + 1}`, 80 + (i % 4) * 220, 260 + Math.floor(i / 4) * 180, {
            w: 90,
            h: 90,
            seats: 4,
            ...(i === 2 || i === 5 ? seated("Quiz Night", 4, "MR", 96.5) : {}),
        }),
    ),
];

const astorCreekTest: FloorElement[] = [
    label("a-l", 40, 20, "Astor Creek Test Room", 220),
    // Deliberately mechanical: a 5×3 grid of identical four-tops. It is a test
    // room, and test rooms look like test data.
    ...Array.from({ length: 15 }, (_, i) => table(`a${i}`, String(i + 1), 60 + (i % 5) * 180, 90 + Math.floor(i / 5) * 170)),
];

const bigBar: FloorElement[] = [
    label("bb-l", 500, 20, "Big Bar", 110),
    // A U: three walls of counter with stools on the outside of each run.
    wall("bb-top", 260, 90, 620, 20),
    wall("bb-left", 260, 90, 20, 300),
    wall("bb-right", 860, 90, 20, 300),
    ...Array.from({ length: 7 }, (_, i) => seat(`bb-t${i}`, `B${i + 1}`, 290 + i * 90, 130)),
    ...Array.from({ length: 3 }, (_, i) => seat(`bb-l${i}`, `B${8 + i}`, 160, 150 + i * 90, i === 1 ? seated("Marchetti", 1, "BT", 31) : {})),
    ...Array.from({ length: 3 }, (_, i) => seat(`bb-r${i}`, `B${11 + i}`, 900, 150 + i * 90, i === 0 ? seated("Bergstrom", 1, "BT", 44) : {})),
    round("bb-1", "1", 380, 460, seated("Ferreira", 4, "AK", 118)),
    round("bb-2", "2", 560, 460),
    round("bb-3", "3", 740, 460),
];

const openTabs: FloorElement[] = [
    label("o-l", 40, 20, "Counter tabs", 150),
    // Not a room with furniture — six counter positions for tabs that never sat
    // down. Modelling them as tables is what lets them appear on the floor at all.
    ...Array.from({ length: 6 }, (_, i) =>
        seat(`o${i}`, `T${i + 1}`, 60 + i * 120, 110, i < 3 ? seated(["Mbeki", "Salvatore", "Wren"][i], 1, "BT", [14, 26, 9][i]) : {}),
    ),
];

const newDesignerRoom: FloorElement[] = [
    label("n-l", 40, 20, "Work in progress", 190),
    // Half laid out, because that is what a room called "New … Room" usually is:
    // somebody started and stopped.
    wall("n-w", 40, 70, 400),
    table("n1", "1", 60, 130),
    table("n2", "2", 210, 130),
    round("n3", "3", 60, 280),
];

export const seededFloorPlans: Record<string, FloorElement[]> = {
    bigroom: [
        // The bar: one long barrier with a dashed label over the stool row.
        { id: "bar", kind: "barrier", x: 60, y: 60, w: 1140, h: 16 },
        { id: "bar-label", kind: "label", x: 580, y: 28, w: 100, h: 22, text: "Bar" },
        stool(0, "B1", "occupied", { name: "Reid", guests: 1, server: "BT", tab: 24 }),
        stool(1, "B2", "occupied", { name: "Park", guests: 1, server: "BT", tab: 18.5 }),
        stool(2, "B3", "empty"),
        stool(3, "B4", "occupied", { name: "Singh", guests: 1, server: "BT", tab: 42 }),
        stool(4, "B5", "occupied", { name: "Brooks", guests: 1, server: "BT", tab: 31 }),
        stool(5, "B6", "empty"),
        stool(6, "B7", "occupied", { name: "Khan", guests: 1, server: "BT", tab: 12 }),
        stool(7, "B8", "occupied", { name: "Lee", guests: 1, server: "BT", tab: 56.5 }),
        stool(8, "B9", "empty"),
        stool(9, "B10", "empty"),
        stool(10, "B11", "occupied", { name: "Moss", guests: 1, server: "BT", tab: 28 }),
        stool(11, "B12", "empty"),

        // Front row — four-tops by the window.
        {
            id: "t1",
            kind: "table",
            shape: "square",
            x: 100,
            y: 230,
            w: 100,
            h: 100,
            num: "1",
            seats: 4,
            status: "occupied",
            party: { name: "Williams", guests: 3, server: "SC", tab: 143.5 },
        },
        { id: "t2", kind: "table", shape: "square", x: 250, y: 230, w: 100, h: 100, num: "2", seats: 4, status: "empty" },
        {
            id: "t3",
            kind: "table",
            shape: "square",
            x: 400,
            y: 230,
            w: 100,
            h: 100,
            num: "3",
            seats: 4,
            status: "occupied",
            party: { name: "Chen", guests: 4, server: "MR", tab: 67.25 },
        },
        { id: "t4", kind: "table", shape: "square", x: 550, y: 230, w: 100, h: 100, num: "4", seats: 4, status: "reserved" },

        // Middle row — circles, a mix of states.
        {
            id: "t5",
            kind: "table",
            shape: "circle",
            x: 110,
            y: 390,
            w: 110,
            h: 110,
            num: "5",
            seats: 4,
            lockAR: true,
            status: "occupied",
            party: { name: "Garcia", guests: 2, server: "SC", tab: 38 },
        },
        {
            id: "t6",
            kind: "table",
            shape: "circle",
            x: 260,
            y: 390,
            w: 110,
            h: 110,
            num: "6",
            seats: 4,
            lockAR: true,
            status: "occupied",
            party: { name: "Anderson", guests: 4, server: "MR", tab: 287 },
        },
        { id: "t7", kind: "table", shape: "circle", x: 410, y: 390, w: 110, h: 110, num: "7", seats: 4, lockAR: true, status: "cleaning" },
        {
            id: "t8",
            kind: "table",
            shape: "circle",
            x: 560,
            y: 390,
            w: 110,
            h: 110,
            num: "8",
            seats: 4,
            lockAR: true,
            status: "occupied",
            party: { name: "Thompson", guests: 3, server: "JL", tab: 112.5 },
        },
        {
            id: "t12",
            kind: "table",
            shape: "oval",
            x: 730,
            y: 390,
            w: 130,
            h: 100,
            num: "12",
            seats: 4,
            lockAR: true,
            status: "check-requested",
            party: { name: "Nguyen", guests: 4, server: "MR", tab: 245 },
        },

        // Back row — the group tables.
        {
            id: "t9",
            kind: "table",
            shape: "rectangle",
            x: 120,
            y: 550,
            w: 160,
            h: 100,
            num: "9",
            seats: 6,
            status: "occupied",
            party: { name: "Davis", guests: 6, server: "JL", tab: 412.75 },
        },
        {
            id: "t10",
            kind: "table",
            shape: "rectangle",
            x: 320,
            y: 550,
            w: 160,
            h: 100,
            num: "10",
            seats: 6,
            status: "occupied",
            party: { name: "Rodriguez", guests: 5, server: "AK", tab: 198 },
        },
        { id: "t11", kind: "table", shape: "rectangle", x: 520, y: 550, w: 180, h: 100, num: "11", seats: 8, status: "blocked" },
    ],
    "Private Hall": [
        { id: "p-label", kind: "label", x: 380, y: 90, w: 110, h: 24, text: "Private Hall" },
        { id: "p1", kind: "table", shape: "circle", x: 180, y: 180, w: 96, h: 96, num: "1", seats: 2, lockAR: true, status: "empty" },
        { id: "p2", kind: "table", shape: "circle", x: 320, y: 180, w: 96, h: 96, num: "2", seats: 2, lockAR: true, status: "empty" },
        { id: "p3", kind: "table", shape: "circle", x: 460, y: 180, w: 110, h: 110, num: "3", seats: 4, lockAR: true, status: "empty" },
        { id: "p4", kind: "table", shape: "circle", x: 600, y: 180, w: 96, h: 96, num: "4", seats: 2, lockAR: true, status: "empty" },
        { id: "p-barrier", kind: "barrier", x: 140, y: 280, w: 540, h: 4 },
        { id: "p5", kind: "table", shape: "diamond", x: 250, y: 350, w: 100, h: 100, num: "5", seats: 4, lockAR: true, status: "empty" },
        { id: "p6", kind: "table", shape: "diamond", x: 400, y: 350, w: 100, h: 100, num: "6", seats: 4, lockAR: true, status: "empty" },
        { id: "p7", kind: "table", shape: "diamond", x: 550, y: 350, w: 100, h: 100, num: "7", seats: 4, lockAR: true, status: "empty" },
    ],
    "[Detached Tables]": detachedTables,
    smallroom,
    banquet,
    Lounge: lounge,
    "Trivia Pub/Bar": triviaPub,
    "Astor Creek Test Room": astorCreekTest,
    "Big Bar": bigBar,
    "Open Tabs": openTabs,
    "New Table Designer Room": newDesignerRoom,
};
