import { useMemo, useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import BoltIcon from "@mui/icons-material/Bolt";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import LayersClearIcon from "@mui/icons-material/LayersClear";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PublicIcon from "@mui/icons-material/Public";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StorefrontIcon from "@mui/icons-material/Storefront";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import { useNavigate } from "react-router-dom";

import { MobileEmpty, MobileFilterTabs, MobileSectionHeading } from "@/components/mobile/mobile-parts";
import { MobileActionArea, MobileBottomSheet, MobilePrimary, MobileSecondary, MobileSecondaryRow } from "@/components/mobile/mobile-shell";
import { appColors } from "@/theme/app-replica-tokens";
import { money, slashDate, TODAY, useActions, useStore, type Position, type SheetView, type TeeTimeBooking } from "../../store";
import { MobileShell } from "../mobile-shell";

/**
 * The tee sheet, on a phone. **Live** — every row is a booking in the store and
 * every command dispatches through `useActions()`.
 *
 * The static Storybook version (`src/components/mobile/screens/mobile-tee-sheet.tsx`)
 * settled the layout; this file settles the behaviour. The layout decisions are
 * copied rather than re-argued, and each one is restated below with what it
 * costs against the landscape screen it replaces.
 *
 * ## What changed from `app/src/screens/tee-sheet.tsx`
 *
 * **The grid transposes.** The landscape row is one tee time with four playing
 * positions across a ~1280px pane — roughly 290px each, enough for a party
 * size, a name, a price and five status glyphs. At 402px those same four
 * columns get **95px each**, narrower than `$28.47` plus its glyphs. So the tee
 * time becomes a full-width slate band and its positions stack under it. The
 * sheet is read top-to-bottom instead of left-to-right.
 *
 * **Open positions collapse to one row.** A day is mostly empty air. Stacking
 * four `null` positions per time would make a quiet morning **four times
 * taller** than a busy one, which is exactly backwards. Consecutive opens
 * become a single `3 open positions` row, so an untouched time costs 1 row
 * instead of 4 — a 30-time sheet is ~50 rows rather than 120.
 *
 * **Four views become four tabs, and two of them become switchers.** The
 * landscape action bar carries Grid / List / Multi / Back 9 as toggles beside
 * five other buttons. Here the four are a `MobileFilterTabs` row (the action bar
 * is gone — its 8 buttons would be 50px each), and:
 *
 * | Landscape | Phone | Why |
 * | -- | -- | -- |
 * | **List** | The transposed agenda | The primary view; the one that narrows cleanly |
 * | **Grid** | One row per time — a 4-segment state bar, a count, the money | A phone cannot show *more* detail than List already does, so the honest "denser" is less per row |
 * | **Multi**, 3 courses side by side | A **course switcher** | 3 × 4 positions in 402px is 33px per position |
 * | **Back 9**, front and back side by side | A **Front / Back toggle** | Same impossibility, two columns instead of three |
 *
 * What the phone gives up is the *comparison* those two views exist for — a
 * starter looking across three courses for the gap. The data survives; the
 * glance does not, and no layout recovers it at this width.
 *
 * **The date band loses four buttons.** Landscape runs `‹ | facility | date |
 * GO TO TODAY | ›` across ~1280px. Here the chevrons flank the date, `GO TO
 * TODAY` moves into the calendar sheet beside the other date jumps, and the
 * facility — one entry in this prototype — moves into the app bar subtitle. The
 * band keeps the rule that actually matters: **orange when the sheet is not
 * showing today**, slate when it is. That is a warning, not decoration.
 *
 * **The per-time gear becomes a kebab and a bottom sheet.** Squeeze / Clone /
 * Clear / Move are six commands in an anchored menu on tablet. Anchored to a
 * 402px row the menu would cover the row it acts on, so it comes up from the
 * bottom. Move Player(s) needs a target, and its list can be thirty times long
 * — too long for a sheet — so it takes the screen instead.
 */

/* ------------------------------------------------------------------ shared */

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** `2026-05-12` → `Tue, May 12 2026`. Abbreviated — the band is 402px, not 1280. */
export const shortDate = (iso: string) => {
    const d = new Date(`${iso}T12:00:00`);
    return `${DOW[d.getDay()].slice(0, 3)}, ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()} ${d.getFullYear()}`;
};

/** The courses the landscape action bar offers behind the course button. */
export const COURSES = ["North Course", "East Course", "West Course"];

/**
 * The colour a position's left edge takes.
 *
 * Straight off `tee-sheet-views.tsx`: paid is the sheet's own green, booked
 * alternates two purples by position index for no reason other than that the
 * shipping app does, and a blocked time is grey.
 */
export const positionTone = (p: Position, index: number) =>
    p.paid ? appColors.greenTee : index % 2 === 0 ? appColors.purple : appColors.purpleAlt;

/* ------------------------------------------------------------------- rows */

/** One booked position. The landscape cell's glyph set, at 14px instead of 16. */
const PositionRow = ({ position, index, onOpen }: { position: Position; index: number; onOpen: () => void }) => (
    <ButtonBase
        onClick={onOpen}
        sx={{
            display: "block",
            width: "100%",
            textAlign: "left",
            bgcolor: appColors.surface,
            borderBottom: `1px solid ${appColors.divider}`,
        }}
    >
        <Stack direction="row" sx={{ alignItems: "center", gap: 1, minHeight: 52 }}>
            <Box sx={{ width: 5, alignSelf: "stretch", bgcolor: positionTone(position, index), flexShrink: 0 }} />
            <Stack sx={{ flex: 1, minWidth: 0, py: 0.75 }}>
                <Typography sx={{ fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    ({position.party}) {position.name}
                </Typography>
                {/* The tags line carries only what changes the sale: a nine-hole
                    round, an arrival, a no-show. Everything else is a glyph. */}
                <Typography sx={{ fontSize: 12, color: position.noShow ? appColors.red : appColors.textSecondary }}>
                    {[position.holes === 9 ? "9H" : null, position.checkedIn ? "Checked in" : null, position.noShow ? "NO SHOW" : null]
                        .filter(Boolean)
                        .join("  ·  ") || position.rateName.split(" : ")[0]}
                </Typography>
            </Stack>
            <Stack direction="row" sx={{ gap: 0.25, alignItems: "center", color: appColors.textSecondary, flexShrink: 0 }}>
                {position.cart && <DirectionsCarIcon sx={{ fontSize: 14 }} />}
                {position.raincheck && <BoltIcon sx={{ fontSize: 14, color: appColors.orange }} />}
                {position.keyed && <VpnKeyIcon sx={{ fontSize: 14 }} />}
                {position.online && <PublicIcon sx={{ fontSize: 14 }} />}
                {position.checkedIn && <CheckCircleOutlineIcon sx={{ fontSize: 14, color: appColors.greenTee }} />}
                {position.balance && <Typography sx={{ fontSize: 14 }}>$</Typography>}
            </Stack>
            <Typography sx={{ fontSize: 14, minWidth: 62, textAlign: "right", pr: 1.5, flexShrink: 0 }}>{money(position.price)}</Typography>
        </Stack>
    </ButtonBase>
);

/** Consecutive open positions, as one row. The count leads because it is the question. */
const OpenRow = ({ count, onOpen }: { count: number; onOpen: () => void }) => (
    <ButtonBase
        onClick={onOpen}
        sx={{
            display: "block",
            width: "100%",
            textAlign: "left",
            bgcolor: appColors.canvas,
            borderBottom: `1px solid ${appColors.divider}`,
        }}
    >
        <Stack direction="row" sx={{ alignItems: "center", gap: 1, minHeight: 44, px: 1.5 }}>
            <Typography sx={{ fontSize: 14, color: appColors.textSecondary, flex: 1 }}>
                {count} open {count === 1 ? "position" : "positions"}
            </Typography>
            <ChevronRightIcon sx={{ fontSize: 18, color: appColors.textSecondary }} />
        </Stack>
    </ButtonBase>
);

/** One tee time: the slate band, then its positions stacked underneath. */
const TimeBlock = ({ booking, onOpen, onMenu }: { booking: TeeTimeBooking; onOpen: () => void; onMenu: () => void }) => {
    const filled = booking.positions.map((p, i) => ({ p, i })).filter((x): x is { p: Position; i: number } => Boolean(x.p));
    const open = booking.positions.length - filled.length;

    return (
        <Box>
            <Stack
                direction="row"
                sx={{ alignItems: "center", bgcolor: appColors.slate, px: 1.5, py: 0.5, gap: 1, position: "sticky", top: 0, zIndex: 1 }}
            >
                <Typography sx={{ fontSize: 14, color: "#fff", flex: 1 }}>{booking.time}</Typography>
                {filled.length > 0 && (
                    <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
                        {filled.length}/{booking.positions.length}
                    </Typography>
                )}
                {/* The landscape gear column. A kebab because every other
                    overflow on the phone is a kebab, and one glyph meaning
                    "more" beats two. */}
                <ButtonBase onClick={onMenu} aria-label={`Options for ${booking.time}`} sx={{ color: "#fff", p: 0.5 }}>
                    <MoreVertIcon sx={{ fontSize: 18 }} />
                </ButtonBase>
            </Stack>

            {booking.blocked ? (
                <Stack direction="row" sx={{ alignItems: "center", minHeight: 44, px: 1.5, bgcolor: appColors.blocked }}>
                    <Typography sx={{ fontSize: 14, color: "#fff" }}>{booking.blockLabel ?? "BLOCKED"}</Typography>
                </Stack>
            ) : (
                <>
                    {filled.map(({ p, i }) => (
                        <PositionRow key={`${p.id}-${i}`} position={p} index={i} onOpen={onOpen} />
                    ))}
                    {open > 0 && <OpenRow count={open} onOpen={onOpen} />}
                </>
            )}
        </Box>
    );
};

/** Grid view: the state of a time as a 4-segment bar, its count, and its money. */
const GridRow = ({ booking, onOpen }: { booking: TeeTimeBooking; onOpen: () => void }) => {
    const filled = booking.positions.filter((p): p is Position => Boolean(p));
    const taken = filled.reduce((sum, p) => sum + p.price, 0);

    return (
        <ButtonBase
            onClick={onOpen}
            sx={{
                display: "block",
                width: "100%",
                textAlign: "left",
                bgcolor: appColors.surface,
                borderBottom: `1px solid ${appColors.divider}`,
            }}
        >
            <Stack direction="row" sx={{ alignItems: "center", gap: 1, px: 1.5, minHeight: 48 }}>
                <Typography sx={{ fontSize: 15, minWidth: 74 }}>{booking.time}</Typography>
                <Box sx={{ flex: 1, height: 8, display: "flex", gap: 0.5 }}>
                    {booking.positions.map((p, i) => (
                        <Box
                            key={i}
                            sx={{ flex: 1, bgcolor: booking.blocked ? appColors.blocked : p ? positionTone(p, i) : appColors.divider }}
                        />
                    ))}
                </Box>
                <Typography sx={{ fontSize: 13, color: appColors.textSecondary, minWidth: 34, textAlign: "right" }}>
                    {filled.length}/{booking.positions.length}
                </Typography>
                <Typography sx={{ fontSize: 14, minWidth: 64, textAlign: "right" }}>{taken > 0 ? money(taken) : "—"}</Typography>
            </Stack>
        </ButtonBase>
    );
};

/* ----------------------------------------------------------------- chrome */

/**
 * The date band.
 *
 * Orange the moment the sheet is not on today, exactly as the landscape screen
 * does it — this is the only signal that a booking you are about to take is
 * going onto the wrong day.
 */
const DateBand = ({ onCalendar, onCourse }: { onCalendar: () => void; onCourse: () => void }) => {
    const { state, isToday } = useStore();
    const { shiftSheetDate } = useActions();

    return (
        <Stack sx={{ bgcolor: isToday ? appColors.slate : appColors.orange, px: 0.5, py: 0.5, flexShrink: 0 }}>
            <Stack direction="row" sx={{ alignItems: "center" }}>
                <ButtonBase onClick={() => shiftSheetDate(-1)} aria-label="Previous day" sx={{ width: 44, height: 40, color: "#fff" }}>
                    <ChevronLeftIcon sx={{ fontSize: 24 }} />
                </ButtonBase>
                <ButtonBase onClick={onCalendar} sx={{ flex: 1, height: 40, gap: 0.75, color: "#fff", fontSize: 14 }}>
                    <CalendarMonthIcon sx={{ fontSize: 18 }} />
                    {shortDate(state.sheetDate)}
                </ButtonBase>
                <ButtonBase onClick={() => shiftSheetDate(1)} aria-label="Next day" sx={{ width: 44, height: 40, color: "#fff" }}>
                    <ChevronRightIcon sx={{ fontSize: 24 }} />
                </ButtonBase>
            </Stack>
            <ButtonBase onClick={onCourse} sx={{ alignSelf: "center", gap: 0.5, color: "#fff", fontSize: 13, minHeight: 28 }}>
                {state.course}
                <UnfoldMoreIcon sx={{ fontSize: 14 }} />
            </ButtonBase>
        </Stack>
    );
};

/**
 * The count strip.
 *
 * The landscape band is five labelled figures plus a clock across 1280px. All
 * five fit here because they are numbers: the label shrinks to 10px and the
 * number carries the weight. The clock goes — the phone has one in the status
 * bar, 24px above.
 */
const CountStrip = ({ times }: { times: TeeTimeBooking[] }) => {
    const all = times.flatMap((t) => t.positions);
    const booked = all.filter(Boolean).length;

    return (
        <Stack direction="row" sx={{ bgcolor: appColors.slateDark, px: 1, py: 0.5, justifyContent: "space-between", flexShrink: 0 }}>
            {(
                [
                    ["Total", all.length],
                    ["Booked", booked],
                    ["Paid", all.filter((p) => p?.paid).length],
                    ["In", all.filter((p) => p?.checkedIn).length],
                    ["No show", all.filter((p) => p?.noShow).length],
                    ["Open", all.length - booked],
                ] as const
            ).map(([label, value]) => (
                <Stack key={label} sx={{ alignItems: "center", minWidth: 0 }}>
                    <Typography sx={{ fontSize: 14, color: "#fff" }}>{value}</Typography>
                    <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>{label}</Typography>
                </Stack>
            ))}
        </Stack>
    );
};

/* ------------------------------------------------------------------ screen */

const VIEW_TABS = ["List", "Grid", "Multi", "Back 9"];
const VIEW_OF: Record<string, SheetView> = { List: "list", Grid: "grid", Multi: "multi", "Back 9": "back9" };

type Overlay = null | { kind: "time"; time: string } | { kind: "course" } | { kind: "calendar" } | { kind: "screen" };

export const MobileTeeSheetScreen = () => {
    const navigate = useNavigate();
    const { state, teeTimes, lines, total, isToday } = useStore();
    const { setSheetDate, shiftSheetDate, goToToday, setCourse, squeezeTime, cloneTime, clearTime, movePlayers } = useActions();

    const [view, setView] = useState<SheetView>("list");
    const [overlay, setOverlay] = useState<Overlay>(null);
    /** Which course the Multi switcher is showing. Independent of `state.course`. */
    const [multiCourse, setMultiCourse] = useState(state.course);
    const [nine, setNine] = useState<"Front" | "Back">("Front");
    /** Set while picking a destination for Move Player(s) — takes the screen. */
    const [moveFrom, setMoveFrom] = useState<string | null>(null);

    const openTime = (time: string) => navigate(`/teesheet/${encodeURIComponent(time)}`);

    /**
     * What each view actually renders.
     *
     * Multi and Back 9 lose their second axis rather than faking it. Multi on a
     * sibling course shows that course's own spacing with nothing sold — which
     * is the truth in the landscape screen too, where East and West are drawn
     * empty. Back 9's back is empty for the same reason the tablet's is.
     */
    const rows = useMemo<TeeTimeBooking[]>(() => {
        if (view === "back9" && nine === "Back") return teeTimes.slice(0, 7).map((t) => ({ ...t, positions: [null, null, null, null] }));
        if (view === "back9") return teeTimes.slice(0, 7);
        if (view === "multi" && multiCourse !== state.course)
            return teeTimes.slice(0, 8).map((t) => ({ ...t, positions: [null, null, null, null], blocked: false }));
        if (view === "multi") return teeTimes.slice(0, 8);
        return teeTimes;
    }, [view, nine, multiCourse, state.course, teeTimes]);

    /* ------------------------------------------------------- move screen */

    if (moveFrom) {
        const targets = teeTimes.filter((t) => t.time !== moveFrom && !t.blocked && t.positions.some((p) => !p));
        return (
            <MobileShell
                title={`Move ${moveFrom} to…`}
                subtitle={shortDate(state.sheetDate)}
                active="teesheet"
                leading="close"
                onLeading={() => setMoveFrom(null)}
                showOverflow={false}
            >
                {targets.length === 0 ? (
                    <MobileEmpty message="No other time on this sheet has room for them." />
                ) : (
                    targets.map((t) => {
                        const room = t.positions.filter((p) => !p).length;
                        return (
                            <ButtonBase
                                key={t.time}
                                onClick={() => {
                                    movePlayers(moveFrom, t.time);
                                    setMoveFrom(null);
                                }}
                                sx={{
                                    display: "flex",
                                    width: "100%",
                                    justifyContent: "space-between",
                                    px: 1.5,
                                    minHeight: 52,
                                    bgcolor: appColors.surface,
                                    borderBottom: `1px solid ${appColors.divider}`,
                                }}
                            >
                                <Typography sx={{ fontSize: 16 }}>{t.time}</Typography>
                                <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{room} open</Typography>
                            </ButtonBase>
                        );
                    })
                )}
            </MobileShell>
        );
    }

    /* ----------------------------------------------------------- overlays */

    const sheet =
        overlay?.kind === "time" ? (
            <MobileBottomSheet
                onDismiss={() => setOverlay(null)}
                items={[
                    {
                        label: "Squeeze Before",
                        icon: <UnfoldMoreIcon sx={{ fontSize: 20 }} />,
                        run: () => squeezeTime(overlay.time, "before"),
                    },
                    {
                        label: "Squeeze After",
                        icon: <UnfoldMoreIcon sx={{ fontSize: 20 }} />,
                        run: () => squeezeTime(overlay.time, "after"),
                    },
                    {
                        label: "Clone Before",
                        icon: <ContentCopyIcon sx={{ fontSize: 20 }} />,
                        run: () => cloneTime(overlay.time, "before"),
                    },
                    { label: "Clone After", icon: <ContentCopyIcon sx={{ fontSize: 20 }} />, run: () => cloneTime(overlay.time, "after") },
                    { label: "Move Player(s)", icon: <PeopleAltIcon sx={{ fontSize: 20 }} />, run: () => setMoveFrom(overlay.time) },
                    {
                        label: "Clear Time",
                        icon: <LayersClearIcon sx={{ fontSize: 20 }} />,
                        destructive: true,
                        run: () => clearTime(overlay.time),
                    },
                ].map(({ label, icon, destructive, run }) => ({
                    label,
                    icon,
                    destructive,
                    onClick: () => {
                        setOverlay(null);
                        run();
                    },
                }))}
            />
        ) : overlay?.kind === "course" ? (
            <MobileBottomSheet
                onDismiss={() => setOverlay(null)}
                items={COURSES.map((c) => ({
                    label: c,
                    onClick: () => {
                        // In Multi the course name is the switcher, so it must not
                        // also reload the sheet — that would move the live course
                        // while you were comparing against it.
                        if (view === "multi") setMultiCourse(c);
                        else setCourse(c);
                        setOverlay(null);
                    },
                }))}
            />
        ) : overlay?.kind === "calendar" ? (
            <MobileBottomSheet
                onDismiss={() => setOverlay(null)}
                items={[
                    { label: `Go to today — ${shortDate(TODAY)}`, icon: <EventAvailableIcon sx={{ fontSize: 20 }} />, run: goToToday },
                    { label: "Back a week", icon: <ChevronLeftIcon sx={{ fontSize: 20 }} />, run: () => shiftSheetDate(-7) },
                    { label: "Forward a week", icon: <ChevronRightIcon sx={{ fontSize: 20 }} />, run: () => shiftSheetDate(7) },
                    {
                        label: `Seeded day — ${slashDate("2026-05-12")}`,
                        icon: <CalendarMonthIcon sx={{ fontSize: 20 }} />,
                        run: () => setSheetDate("2026-05-12"),
                    },
                ].map(({ label, icon, run }) => ({
                    label,
                    icon,
                    onClick: () => {
                        setOverlay(null);
                        run();
                    },
                }))}
            />
        ) : overlay?.kind === "screen" ? (
            <MobileBottomSheet
                onDismiss={() => setOverlay(null)}
                items={[
                    {
                        label: "Go to today",
                        icon: <EventAvailableIcon sx={{ fontSize: 20 }} />,
                        onClick: () => {
                            setOverlay(null);
                            goToToday();
                        },
                    },
                    {
                        label: "Change course",
                        icon: <UnfoldMoreIcon sx={{ fontSize: 20 }} />,
                        onClick: () => setOverlay({ kind: "course" }),
                    },
                    {
                        label: "Pro Shop",
                        icon: <StorefrontIcon sx={{ fontSize: 20 }} />,
                        onClick: () => {
                            setOverlay(null);
                            navigate("/proshop");
                        },
                    },
                ]}
            />
        ) : undefined;

    /* ------------------------------------------------------------- render */

    return (
        <MobileShell
            title="Tee Sheet"
            subtitle={state.facility}
            active="teesheet"
            onOverflow={() => setOverlay({ kind: "screen" })}
            overlay={sheet}
            actions={
                <MobileActionArea>
                    <MobileSecondaryRow>
                        <MobileSecondary onClick={() => navigate("/proshop")}>Pro Shop</MobileSecondary>
                        <MobileSecondary tone={isToday ? "muted" : "default"} disabled={isToday} onClick={goToToday}>
                            Go to today
                        </MobileSecondary>
                    </MobileSecondaryRow>
                    <MobilePrimary
                        disabled={lines.length === 0}
                        icon={<ShoppingCartIcon sx={{ fontSize: 20 }} />}
                        onClick={() => lines.length > 0 && navigate("/pay")}
                    >
                        {lines.length > 0 ? `Pay ${money(total)}` : "Nothing on the ticket"}
                    </MobilePrimary>
                </MobileActionArea>
            }
        >
            <MobileFilterTabs
                tabs={VIEW_TABS}
                active={VIEW_TABS.find((t) => VIEW_OF[t] === view) ?? "List"}
                onChange={(t) => setView(VIEW_OF[t])}
            />
            <DateBand onCalendar={() => setOverlay({ kind: "calendar" })} onCourse={() => setOverlay({ kind: "course" })} />
            <CountStrip times={teeTimes} />

            {view === "back9" && (
                <Stack direction="row" sx={{ bgcolor: appColors.surface, borderBottom: `1px solid ${appColors.divider}`, flexShrink: 0 }}>
                    {(["Front", "Back"] as const).map((n) => (
                        <ButtonBase
                            key={n}
                            onClick={() => setNine(n)}
                            sx={{
                                flex: 1,
                                minHeight: 44,
                                fontSize: 14,
                                color: nine === n ? appColors.textPrimary : appColors.textSecondary,
                                borderBottom: "2px solid",
                                borderBottomColor: nine === n ? appColors.textPrimary : "transparent",
                            }}
                        >
                            {n} nine
                        </ButtonBase>
                    ))}
                </Stack>
            )}

            {view === "multi" && (
                <Typography sx={{ px: 1.5, py: 0.75, fontSize: 12, color: appColors.textSecondary, bgcolor: appColors.canvasAlt }}>
                    {multiCourse} — one course at a time. Three columns cannot fit 402px; tap the course name above to switch.
                </Typography>
            )}

            {rows.length === 0 ? (
                <MobileEmpty message="No tee times configured for this day." />
            ) : view === "grid" ? (
                rows.map((booking) => <GridRow key={booking.time} booking={booking} onOpen={() => openTime(booking.time)} />)
            ) : (
                rows.map((booking) => (
                    <TimeBlock
                        key={booking.time}
                        booking={booking}
                        onOpen={() => openTime(booking.time)}
                        // Multi and Back 9 have no per-time affordance on the
                        // tablet either — the gear exists only in List.
                        onMenu={() => (view === "list" ? setOverlay({ kind: "time", time: booking.time }) : openTime(booking.time))}
                    />
                ))
            )}

            {view === "multi" && multiCourse !== state.course && (
                <>
                    <MobileSectionHeading>Nothing sold on {multiCourse}</MobileSectionHeading>
                    <Typography sx={{ px: 1.5, pb: 2, fontSize: 13, color: appColors.textSecondary }}>
                        The sibling courses run their own intervals and carry no bookings in this prototype — the same thing the
                        tablet&apos;s Multi view shows in its second and third columns.
                    </Typography>
                </>
            )}

            {/* Clearance so the last row never sits under the action tray. */}
            <Box sx={{ height: 8 }} />
        </MobileShell>
    );
};
