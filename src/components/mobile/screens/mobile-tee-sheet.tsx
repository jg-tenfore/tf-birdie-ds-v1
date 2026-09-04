import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import BoltIcon from "@mui/icons-material/Bolt";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import LayersClearIcon from "@mui/icons-material/LayersClear";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import PublicIcon from "@mui/icons-material/Public";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import VpnKeyIcon from "@mui/icons-material/VpnKey";

import {
    backNineBack,
    backNineFront,
    listRows,
    multiCourseColumns,
    sheetHeader,
    sheetStats,
    slotSettingsMenu,
    type SheetRow,
    type SheetSlot,
} from "@/components/screens/tee-sheet/tee-sheet-data";
import { appColors } from "@/theme/app-replica-tokens";
import { MobileNavDrawer } from "../mobile-drawer";
import { MobileFilterTabs } from "../mobile-parts";
import { MobileAppBar, MobileBottomSheet, MobileScreen } from "../mobile-shell";

/**
 * **Mobile Screens — 2-teesheet.** Laid out against `App Screens → 2-teesheet`.
 *
 * The tee sheet is the hardest screen in the app to narrow, and the reason is
 * structural rather than cosmetic.
 *
 * ## What the sheet actually is
 *
 * A row is one **tee time** with **four playing positions across**. On a 1280px
 * tablet each position gets ~290px, which is enough for a party size, a name, a
 * price, and up to five status glyphs. At 402px the same four columns get
 * **~95px each** — narrower than the price alone.
 *
 * So the grid **transposes**: the tee time becomes a full-width band, and its
 * four positions stack underneath it as rows. Reading order turns from
 * left-to-right into top-to-bottom, which is the only reliable move when a
 * fixed-column grid has to narrow — and it is the same move the tab listing
 * already makes.
 *
 * ## Open positions collapse
 *
 * A sheet is mostly empty air: the evening block below is seven tee times and
 * four of them have nobody on them. Stacking four `null` positions per time
 * would make an empty sheet **four times taller** than a full one, which is
 * exactly backwards — the emptier the day, the more scrolling it would cost to
 * find the bookings.
 *
 * So consecutive open positions collapse to a single **"4 open"** row, tappable
 * to book. An open time is one row instead of four.
 *
 * ## The four views do not all survive, and that is stated rather than faked
 *
 * | Tablet view | Phone | Why |
 * | -- | -- | -- |
 * | **List** | The transposed agenda | The primary view, and the one that narrows cleanly |
 * | **Grid** | A **compact** agenda — one row per time, counts and money only | Grid exists on tablet to trade detail for density. A phone cannot show more detail than List already does, so the honest phone version of "denser" is *less per row*, not smaller type |
 * | **Multi — three courses** | **A course switcher.** | Three columns of tee times cannot exist in 402px. Not "hard" — 3 × 95px positions is 32px per position. The phone shows one course at a time and names which |
 * | **Back 9 — front and back** | **A Front / Back toggle** | Same reason. Two sheets side by side is the same impossibility as three |
 *
 * **What the phone gives up:** comparing courses, or the front and back nine,
 * *at a glance*. On tablet that comparison is the entire point of those two
 * views — a starter looks across and sees where the gaps are. A switcher
 * preserves the data and loses the comparison, and there is no layout that
 * recovers it at this width. Worth a decision rather than a discovery.
 */

/* ------------------------------------------------------------------ chrome */

/** The date bar. Same slate and same orange-away-from-today rule as the tablet. */
const DateBar = ({ course = sheetHeader.course, onCourse }: { course?: string; onCourse?: () => void }) => (
    <Stack sx={{ bgcolor: appColors.orange, px: 1.5, py: 1, flexShrink: 0 }}>
        <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
            <ChevronLeftIcon sx={{ fontSize: 22, color: "#fff" }} />
            <Stack sx={{ flex: 1, alignItems: "center" }}>
                <Typography sx={{ fontSize: 14, color: "#fff" }}>{sheetHeader.date}</Typography>
            </Stack>
            <ChevronRightIcon sx={{ fontSize: 22, color: "#fff" }} />
            <CalendarMonthIcon sx={{ fontSize: 20, color: "#fff" }} />
        </Stack>
        <ButtonBase onClick={onCourse} sx={{ alignSelf: "center", gap: 0.5, color: "#fff", fontSize: 13, mt: 0.25 }}>
            {course}
            <UnfoldMoreIcon sx={{ fontSize: 14 }} />
        </ButtonBase>
    </Stack>
);

/**
 * The stat strip.
 *
 * Six figures on tablet — total, booked, paid, no-shows, available, clock. All
 * six fit here because they are numbers, not labels: the label shrinks to a
 * word and the number carries the weight.
 */
const StatStrip = () => (
    <Stack direction="row" sx={{ bgcolor: appColors.slateDark, px: 1, py: 0.5, justifyContent: "space-between", flexShrink: 0 }}>
        {[
            ["Total", sheetStats.total],
            ["Booked", sheetStats.booked],
            ["Paid", sheetStats.paid],
            ["No show", sheetStats.noShows],
            ["Open", sheetStats.available],
        ].map(([label, value]) => (
            <Stack key={label} sx={{ alignItems: "center", minWidth: 0 }}>
                <Typography sx={{ fontSize: 14, color: "#fff" }}>{value}</Typography>
                <Typography sx={{ fontSize: 10, color: "rgba(255,255,255,0.7)" }}>{label}</Typography>
            </Stack>
        ))}
    </Stack>
);

/* -------------------------------------------------------------------- rows */

/** The colour a slot's left edge takes, from the tablet's own tone vocabulary. */
const toneColor = (tone: SheetSlot["tone"]) =>
    ({
        booked: appColors.purple,
        bookedAlt: appColors.purpleAlt,
        paid: appColors.greenTee,
        paidAlt: appColors.green,
        blocked: appColors.blocked,
        navy: appColors.navy,
    })[tone];

/** A booked position. The glyph set is the tablet's, at 14px instead of 16. */
const SlotRow = ({ slot, onOpen }: { slot: SheetSlot; onOpen?: () => void }) => (
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
            <Box sx={{ width: 5, alignSelf: "stretch", bgcolor: toneColor(slot.tone), flexShrink: 0 }} />
            <Stack sx={{ flex: 1, minWidth: 0, py: 0.75 }}>
                <Typography sx={{ fontSize: 15, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {slot.label}
                </Typography>
                {slot.tags && slot.tags.length > 0 && (
                    <Typography sx={{ fontSize: 12, color: appColors.textSecondary }}>{slot.tags.join("  ")}</Typography>
                )}
            </Stack>
            <Stack direction="row" sx={{ gap: 0.25, color: appColors.textSecondary, flexShrink: 0 }}>
                {slot.cart && <DirectionsCarIcon sx={{ fontSize: 14 }} />}
                {slot.bolt && <BoltIcon sx={{ fontSize: 14, color: appColors.orange }} />}
                {slot.key && <VpnKeyIcon sx={{ fontSize: 14 }} />}
                {slot.online && <PublicIcon sx={{ fontSize: 14 }} />}
                {slot.dollar && <Typography sx={{ fontSize: 14 }}>$</Typography>}
            </Stack>
            <Typography sx={{ fontSize: 14, minWidth: 62, textAlign: "right", pr: 1.5, flexShrink: 0 }}>{slot.price}</Typography>
        </Stack>
    </ButtonBase>
);

/**
 * Consecutive open positions, as one row.
 *
 * The number is what a starter is looking for — "how many can I sell into this
 * time" — so it leads, and the four empty rows it replaces never appear.
 */
const OpenRow = ({ count }: { count: number }) => (
    <ButtonBase
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

/** One tee time: a band, then its positions stacked. */
const TimeBlock = ({ row, onMenu, onOpenTime }: { row: SheetRow; onMenu?: () => void; onOpenTime?: () => void }) => {
    const booked = row.slots.filter((s): s is SheetSlot => s !== null);
    const open = row.slots.length - booked.length;
    return (
        <Box>
            <Stack
                direction="row"
                sx={{ alignItems: "center", bgcolor: appColors.slate, px: 1.5, py: 0.5, gap: 1, position: "sticky", top: 0, zIndex: 1 }}
            >
                <Typography sx={{ fontSize: 14, color: "#fff", flex: 1 }}>{row.time}</Typography>
                {booked.length > 0 && (
                    <Typography sx={{ fontSize: 12, color: "rgba(255,255,255,0.75)" }}>
                        {booked.length}/{row.slots.length}
                    </Typography>
                )}
                {/* The tablet's per-row gear column. The kebab rather than a
                    gear because every other overflow in this category is a
                    kebab, and one glyph meaning "more" beats two. */}
                <ButtonBase onClick={onMenu} aria-label={`Options for ${row.time}`} sx={{ color: "#fff", p: 0.5 }}>
                    <MoreVertIcon sx={{ fontSize: 18 }} />
                </ButtonBase>
            </Stack>
            {booked.map((slot, i) => (
                <SlotRow key={`${slot.label}-${i}`} slot={slot} onOpen={onOpenTime} />
            ))}
            {open > 0 && <OpenRow count={open} />}
        </Box>
    );
};

/* ------------------------------------------------------------------ views */

export type SheetView = "list" | "grid" | "multi" | "back9";

const VIEW_TABS = ["List", "Grid", "Multi", "Back 9"];
const VIEW_OF: Record<string, SheetView> = { List: "list", Grid: "grid", Multi: "multi", "Back 9": "back9" };

export interface MobileTeeSheetProps {
    view?: SheetView;
    /** Seeds an overlay open so a story can show it without a click. */
    overlay?: null | "menu" | "course";
    drawerOpen?: boolean;
}

export const MobileTeeSheet = ({ view: view0 = "list", overlay: overlay0 = null, drawerOpen = false }: MobileTeeSheetProps) => {
    const [view, setView] = useState<SheetView>(view0);
    const [overlay, setOverlay] = useState(overlay0);
    const [drawer, setDrawer] = useState(drawerOpen);
    const [course, setCourse] = useState<string>(sheetHeader.courses[0]);
    const [nine, setNine] = useState<"Front" | "Back">("Front");

    const activeTab = VIEW_TABS.find((t) => VIEW_OF[t] === view) ?? "List";

    const sheetOverlay = drawer ? (
        <MobileNavDrawer active="teesheet" onDismiss={() => setDrawer(false)} onPick={() => setDrawer(false)} />
    ) : overlay === "menu" ? (
        <MobileBottomSheet
            onDismiss={() => setOverlay(null)}
            items={slotSettingsMenu.map((label) => ({
                label,
                icon:
                    label === "Clear Time" ? (
                        <LayersClearIcon sx={{ fontSize: 20 }} />
                    ) : label.startsWith("Clone") ? (
                        <ContentCopyIcon sx={{ fontSize: 20 }} />
                    ) : (
                        <PeopleAltIcon sx={{ fontSize: 20 }} />
                    ),
                destructive: label === "Clear Time",
                onClick: () => setOverlay(null),
            }))}
        />
    ) : overlay === "course" ? (
        <MobileBottomSheet
            onDismiss={() => setOverlay(null)}
            items={sheetHeader.courses.map((c) => ({
                label: c,
                onClick: () => {
                    setCourse(c);
                    setOverlay(null);
                },
            }))}
        />
    ) : undefined;

    // Multi and Back 9 keep their data and lose their side-by-side comparison —
    // there is one column here, so the second axis becomes a switcher.
    const rows: SheetRow[] =
        view === "back9" ? (nine === "Front" ? backNineFront : backNineBack) : view === "multi" ? multiCourseRowsFor(course) : listRows;

    return (
        <MobileScreen
            appBar={<MobileAppBar title="Tee Sheet" leading="menu" onLeading={() => setDrawer(true)} showSearch />}
            overlay={sheetOverlay}
        >
            <MobileFilterTabs tabs={VIEW_TABS} active={activeTab} onChange={(t) => setView(VIEW_OF[t])} />
            <DateBar course={view === "multi" ? course : sheetHeader.course} onCourse={() => setOverlay("course")} />
            <StatStrip />

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
                    One course at a time — three columns cannot fit 402px. Tap the course name above to switch.
                </Typography>
            )}

            {view === "grid"
                ? // The phone's version of "denser": less per row, not smaller type.
                  rows.map((row) => {
                      const booked = row.slots.filter((s): s is SheetSlot => s !== null);
                      const money = booked.reduce((sum, s) => sum + Number((s.price ?? "$0").replace(/[^0-9.]/g, "")), 0);
                      return (
                          <Stack
                              key={row.time}
                              direction="row"
                              sx={{
                                  alignItems: "center",
                                  gap: 1,
                                  px: 1.5,
                                  minHeight: 48,
                                  bgcolor: appColors.surface,
                                  borderBottom: `1px solid ${appColors.divider}`,
                              }}
                          >
                              <Typography sx={{ fontSize: 15, minWidth: 74 }}>{row.time}</Typography>
                              <Box
                                  sx={{
                                      flex: 1,
                                      height: 8,
                                      display: "flex",
                                      gap: 0.5,
                                  }}
                              >
                                  {row.slots.map((s, i) => (
                                      <Box key={i} sx={{ flex: 1, bgcolor: s ? toneColor(s.tone) : appColors.divider }} />
                                  ))}
                              </Box>
                              <Typography sx={{ fontSize: 13, color: appColors.textSecondary, minWidth: 34, textAlign: "right" }}>
                                  {booked.length}/4
                              </Typography>
                              <Typography sx={{ fontSize: 14, minWidth: 64, textAlign: "right" }}>
                                  {money > 0 ? `$${money.toFixed(2)}` : "—"}
                              </Typography>
                          </Stack>
                      );
                  })
                : rows.map((row) => <TimeBlock key={row.time} row={row} onMenu={() => setOverlay("menu")} />)}
        </MobileScreen>
    );
};

/**
 * Multi view's data is per column; the phone shows one column at a time.
 *
 * A column's cards carry only the slots that are filled — a 2-ball is a
 * two-element array, not four with two nulls — because the tablet draws bars
 * rather than positions. The phone's rows are position-shaped, so each card is
 * padded back out to four and the padding becomes the "open positions" row.
 */
function multiCourseRowsFor(course: string): SheetRow[] {
    const column = multiCourseColumns.find((c) => c.course === course) ?? multiCourseColumns[0];
    return column.cards.map((card) => ({
        time: card.time,
        slots: Array.from({ length: 4 }, (_, i) => card.slots[i] ?? null),
    }));
}
