import type { ReactNode } from "react";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import AirportShuttleIcon from "@mui/icons-material/AirportShuttle";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BoltIcon from "@mui/icons-material/Bolt";
import PublicIcon from "@mui/icons-material/Public";
import SettingsIcon from "@mui/icons-material/Settings";
import VpnKeyIcon from "@mui/icons-material/VpnKey";

import { appColors, appRadius, teeSlotColors } from "@/theme/app-replica-tokens";
import { sheetCanvas } from "./tee-sheet-chrome";
import {
    backNineBack,
    backNineFront,
    forecastNotice,
    gridCards,
    listRows,
    multiCourseColumns,
    type GridCard,
    type SheetRow,
    type SheetSlot,
    type SlotTone,
} from "./tee-sheet-data";

/**
 * The four Tee Sheet renderings of the same day's bookings.
 *
 * List, Grid, Multi and Back 9 are not filters — they are four different
 * layouts of one data set, and the app keeps the same date, course and counts
 * across all of them. The colour language changes between them, which is worth
 * noticing: a booked reservation is **purple** in List and Back 9 but **navy**
 * in Grid and Multi, and a paid one is **green** in List but a lighter
 * **slate-blue** in Grid.
 */

/** Slot fills, sampled from the captures. */
const slotFill: Record<SlotTone, string> = {
    booked: appColors.purple,
    bookedAlt: appColors.purpleAlt,
    paid: "#4C7E5D",
    paidAlt: appColors.greenTee,
    blocked: appColors.blocked,
    navy: teeSlotColors.multi,
};

const SlotGlyphs = ({ slot, size = 18 }: { slot: SheetSlot; size?: number }) => (
    <>
        {slot.cart && <AirportShuttleIcon sx={{ fontSize: size }} />}
        {slot.bolt && <BoltIcon sx={{ fontSize: size }} />}
        {slot.key && <VpnKeyIcon sx={{ fontSize: size }} />}
        {slot.online && <PublicIcon sx={{ fontSize: size }} />}
    </>
);

/** A booked/paid/blocked position inside a List or Back-9 row. */
const RowSlot = ({ slot, compact = false }: { slot: SheetSlot; compact?: boolean }) => {
    const isBlocked = slot.tone === "blocked";

    return (
        <Box
            sx={{
                flex: 1,
                m: compact ? "2px" : "5px 0",
                px: compact ? 0.75 : 1,
                py: compact ? 0.25 : 0.5,
                bgcolor: slotFill[slot.tone],
                color: isBlocked ? "rgba(255,255,255,0.92)" : "#fff",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minWidth: 0,
            }}
        >
            <Typography noWrap sx={{ fontSize: compact ? 12 : 14 }}>
                {slot.label}
            </Typography>

            {!isBlocked && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
                    <SlotGlyphs slot={slot} size={compact ? 14 : 18} />

                    {slot.tags?.map((tag) => (
                        <Typography key={tag} sx={{ fontSize: compact ? 10 : 12 }}>
                            {tag}
                        </Typography>
                    ))}

                    {/* The oversized "$" is a watermark, not a label — it sits
                        between the glyph run and the amount. */}
                    <Box sx={{ flex: 1, display: "flex", justifyContent: "center" }}>
                        {slot.dollar && <AttachMoneyIcon sx={{ fontSize: compact ? 20 : 28 }} />}
                    </Box>

                    {slot.price && (
                        <Typography sx={{ fontSize: compact ? 11 : 13, fontWeight: 700, whiteSpace: "nowrap" }}>{slot.price}</Typography>
                    )}
                </Box>
            )}
        </Box>
    );
};

const GearCell = ({ menu, onOpenMenu, time }: { menu?: ReactNode; onOpenMenu?: () => void; time?: string }) => (
    <Box sx={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "flex-end", pr: 2 }}>
        {/*
         * A real button, not a role on the icon: MUI's SvgIcon sets
         * aria-hidden, so `role="button"` on it is invisible to assistive tech
         * and to anything driving the UI. The 48px box also brings the target up
         * to the touch floor — the glyph alone is 30px.
         */}
        <IconButton
            aria-label={time ? `Options for ${time}` : "Options"}
            onClick={onOpenMenu}
            disabled={!onOpenMenu}
            sx={{ width: 48, height: 48, color: appColors.textPrimary }}
        >
            <SettingsIcon sx={{ fontSize: 30 }} />
        </IconButton>
        {menu}
    </Box>
);

/* ------------------------------------------------------------------ */
/* List view                                                           */
/* ------------------------------------------------------------------ */

const ListRow = ({ row, menu, onOpen, onOpenMenu }: { row: SheetRow; menu?: ReactNode; onOpen?: () => void; onOpenMenu?: () => void }) => (
    <Paper
        elevation={1}
        sx={{
            display: "grid",
            gridTemplateColumns: "200px repeat(4, 1fr) 240px",
            minHeight: 64,
            borderRadius: `${appRadius.card}px`,
            overflow: "visible",
        }}
    >
        <Box sx={{ display: "flex", alignItems: "center", pl: 3, borderRight: `1px solid ${appColors.divider}` }}>
            <Typography sx={{ fontSize: 22, color: appColors.textPrimary }}>{row.time}</Typography>
        </Box>

        {row.slots.map((slot, index) => (
            <Box
                key={index}
                sx={{
                    display: "flex",
                    alignItems: "stretch",
                    borderRight: `1px solid ${appColors.divider}`,
                    minWidth: 0,
                }}
                onClick={slot && onOpen ? onOpen : undefined}
            >
                {slot && <RowSlot slot={slot} />}
            </Box>
        ))}

        <GearCell menu={menu} onOpenMenu={onOpenMenu} time={row.time} />
    </Paper>
);

/**
 * List view — one row per tee time, four positions across.
 *
 * The row is the unit of interaction: tapping a coloured position opens the tee
 * time detail, and the gear at the right end opens per-time operations
 * (squeeze, clone, clear, move players).
 */
export const TeeSheetListView = ({
    rows = listRows,
    slotMenu,
    onOpenTime,
    onOpenMenu,
    menuFor,
}: {
    rows?: SheetRow[];
    slotMenu?: ReactNode;
    /** Supplied by the prototype; the stories leave the rows inert. */
    onOpenTime?: (time: string) => void;
    onOpenMenu?: (time: string) => void;
    /**
     * Which row's gear menu is open. The stories pin `slotMenu` to the first row
     * instead, so the documented state does not need a controlled parent.
     */
    menuFor?: string;
}) => (
    <Box sx={{ bgcolor: sheetCanvas, px: 1, pb: 1, display: "flex", flexDirection: "column", gap: 1 }}>
        {rows.map((row, index) => (
            <ListRow
                key={row.time}
                row={row}
                menu={menuFor === undefined ? (index === 0 ? slotMenu : undefined) : menuFor === row.time ? slotMenu : undefined}
                onOpen={onOpenTime ? () => onOpenTime(row.time) : undefined}
                onOpenMenu={onOpenMenu ? () => onOpenMenu(row.time) : undefined}
            />
        ))}
    </Box>
);

/* ------------------------------------------------------------------ */
/* Grid view                                                           */
/* ------------------------------------------------------------------ */

const gridCardFill: Record<GridCard["tone"], { bg: string; fg: string }> = {
    open: { bg: appColors.surface, fg: appColors.textPrimary },
    navy: { bg: teeSlotColors.multi, fg: "#fff" },
    // Paid times read as a muted slate-blue card here rather than the green
    // they take in List view.
    paid: { bg: "#7189A3", fg: "#fff" },
    blocked: { bg: appColors.blocked, fg: "rgba(255,255,255,0.92)" },
};

const GridTile = ({ card, onOpen }: { card: GridCard; onOpen?: () => void }) => {
    const fill = gridCardFill[card.tone];

    return (
        <Paper
            elevation={1}
            onClick={onOpen}
            sx={{
                bgcolor: fill.bg,
                color: fill.fg,
                p: 1.5,
                minHeight: 132,
                borderRadius: `${appRadius.card}px`,
                cursor: onOpen ? "pointer" : "default",
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                <Typography sx={{ fontSize: 19, color: fill.fg }}>{card.time}</Typography>
                <SettingsIcon sx={{ fontSize: 24, color: card.tone === "open" ? appColors.textPrimary : fill.fg }} />
            </Box>

            {card.lines.map((line, index) => (
                <Box key={index} sx={{ display: "flex", alignItems: "center", gap: 0.5, minWidth: 0 }}>
                    <Typography noWrap sx={{ fontSize: 14, flex: 1, minWidth: 0 }}>
                        {line.label}
                    </Typography>
                    <SlotGlyphs slot={line} size={14} />
                    {line.dollar && <AttachMoneyIcon sx={{ fontSize: 14 }} />}
                </Box>
            ))}
        </Paper>
    );
};

/**
 * Grid view — six tee times across, each a card.
 *
 * Trades the per-position columns of List view for density: you see roughly
 * four hours of the sheet at once, and the card colour alone tells you whether
 * a time is open, booked, paid or blocked.
 */
export const TeeSheetGridView = ({ cards = gridCards, onOpenTime }: { cards?: GridCard[]; onOpenTime?: (time: string) => void }) => (
    <Box sx={{ bgcolor: sheetCanvas, p: 1, display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 1 }}>
        {cards.map((card) => (
            <GridTile key={card.time} card={card} onOpen={onOpenTime ? () => onOpenTime(card.time) : undefined} />
        ))}
    </Box>
);

/* ------------------------------------------------------------------ */
/* Multi view                                                          */
/* ------------------------------------------------------------------ */

/**
 * Multi view — three courses side by side.
 *
 * Each course keeps its own interval (North runs every 14 minutes, East every
 * 10, West every 9), so the rows deliberately do not line up horizontally. The
 * course picker is removed from the bottom bar in this mode.
 */
export const TeeSheetMultiView = ({ columns = multiCourseColumns }: { columns?: typeof multiCourseColumns }) => (
    <Box sx={{ bgcolor: sheetCanvas, px: 1, pb: 1, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
        {columns.map((column) => (
            <Box key={column.course}>
                <Typography sx={{ fontSize: 20, color: appColors.textPrimary, px: 0.5, pb: 0.5 }}>{column.course}</Typography>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {column.cards.map((card) => (
                        <Paper key={card.time} elevation={1} sx={{ p: 1, borderRadius: `${appRadius.card}px` }}>
                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 0.5 }}>
                                <Typography sx={{ fontSize: 18, color: appColors.textPrimary }}>{card.time}</Typography>
                                <SettingsIcon sx={{ fontSize: 26, color: appColors.textPrimary }} />
                            </Box>

                            {card.slots.length > 0 && (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", mt: 1 }}>
                                    {card.slots.map((slot, index) => (
                                        <Box key={index} sx={{ display: "flex", minHeight: slot.tone === "blocked" ? 44 : 56 }}>
                                            <RowSlot slot={slot} />
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Paper>
                    ))}
                </Box>
            </Box>
        ))}
    </Box>
);

/* ------------------------------------------------------------------ */
/* Back 9 view                                                         */
/* ------------------------------------------------------------------ */

/** Back-nine times are printed in a slate blue so the two halves stay separable. */
const backNineTimeColor = "#4A6A9E";

const NineRow = ({ row, half }: { row: SheetRow; half: "front" | "back" }) => (
    <Paper
        elevation={1}
        sx={{
            display: "grid",
            gridTemplateColumns: "70px repeat(4, 1fr) 56px",
            minHeight: 66,
            borderRadius: `${appRadius.card}px`,
        }}
    >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <Typography sx={{ fontSize: 15, lineHeight: 1.1, color: half === "back" ? backNineTimeColor : appColors.textPrimary }}>
                {row.time.split(" ")[0]}
            </Typography>
            <Typography sx={{ fontSize: 15, lineHeight: 1.1, color: half === "back" ? backNineTimeColor : appColors.textPrimary }}>
                {row.time.split(" ")[1]}
            </Typography>
        </Box>

        {row.slots.map((slot, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "stretch", borderRight: `1px solid ${appColors.divider}`, minWidth: 0 }}>
                {slot && <RowSlot slot={slot} compact />}
            </Box>
        ))}

        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <SettingsIcon sx={{ fontSize: 26, color: appColors.textPrimary }} />
        </Box>
    </Paper>
);

/**
 * Back 9 view — the front and back nines of one course, side by side.
 *
 * Used on courses that sell a 9-hole shotgun off both tees. The "9H D35" tags
 * on the 7:00 AM league block are the app's shorthand for a 9-hole round at a
 * named rate. A weather line sits above the two headers; when the forecast
 * service has nothing for the date it still occupies the row.
 */
export const TeeSheetBackNineView = ({ front = backNineFront, back = backNineBack }: { front?: SheetRow[]; back?: SheetRow[] }) => (
    <Box sx={{ bgcolor: sheetCanvas, px: 0.5, pb: 1 }}>
        <Typography sx={{ fontSize: 14, color: appColors.textPrimary, textAlign: "center", pb: 0.5 }}>{forecastNotice}</Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
            {(
                [
                    ["Front", front, "front"],
                    ["Back", back, "back"],
                ] as const
            ).map(([heading, rows, half]) => (
                <Box key={heading}>
                    <Typography sx={{ fontSize: 20, color: appColors.textPrimary, textAlign: "center", pb: 0.5 }}>{heading}</Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {rows.map((row) => (
                            <NineRow key={row.time} row={row} half={half} />
                        ))}
                    </Box>
                </Box>
            ))}
        </Box>
    </Box>
);
