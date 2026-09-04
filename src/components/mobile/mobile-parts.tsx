import type { ReactNode } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import TuneIcon from "@mui/icons-material/Tune";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { assetUrl } from "@/utils/asset-url";

/**
 * **Mobile Screens — the parts.** From `references/090426/`.
 *
 * The pieces every mobile screen is assembled from. All of them exist because
 * a landscape element could not survive the narrowing, and each one keeps the
 * shipping design system's colours, casing and radii unchanged.
 */

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

/* ------------------------------------------------------------------- chips */

/**
 * The menu filter row — `All` / `Dinner` / `19th Hole Menu` / `Blue Sky`.
 *
 * On tablet these are four wide slate chips. Four chips at 402px would each get
 * ~92px and `19th Hole Menu` would truncate, so they become an underlined tab
 * row that scrolls if it has to. Same four words, same order, same default.
 */
export const MobileFilterTabs = ({ tabs, active, onChange }: { tabs: string[]; active: string; onChange?: (t: string) => void }) => (
    <Stack
        direction="row"
        sx={{
            bgcolor: appColors.surface,
            borderBottom: `1px solid ${appColors.divider}`,
            overflowX: "auto",
            flexShrink: 0,
            "&::-webkit-scrollbar": { display: "none" },
        }}
    >
        {tabs.map((t) => {
            const isActive = t === active;
            return (
                <ButtonBase
                    key={t}
                    onClick={() => onChange?.(t)}
                    sx={{
                        flex: "1 0 auto",
                        px: 1.5,
                        minHeight: 48,
                        fontSize: 14,
                        fontWeight: isActive ? 600 : 400,
                        whiteSpace: "nowrap",
                        // A 2px rule in the text colour is not enough on a strip
                        // that scrolls — on a six-tab sheet the selected tab can
                        // be half off-screen, and the underline goes with it.
                        // Weight and a tinted ground say "this one" from the
                        // middle of the row.
                        color: isActive ? appColors.green : appColors.textSecondary,
                        bgcolor: isActive ? "rgba(0,0,0,0.035)" : "transparent",
                        borderBottom: "3px solid",
                        borderBottomColor: isActive ? appColors.green : "transparent",
                    }}
                >
                    {t}
                </ButtonBase>
            );
        })}
    </Stack>
);

/* ------------------------------------------------------------------ search */

/**
 * The search field.
 *
 * The landscape screens run a full-width `Start typing product name or SKU…`
 * rule across the top of the content pane. Here it is a filled row with the
 * glyph on the trailing edge, as the references show — 48dp tall, 16px face,
 * which is the size below which a mobile browser zooms on focus.
 */
export const MobileSearch = ({
    placeholder,
    value = "",
    onChange,
    trailing = "search",
}: {
    placeholder: string;
    value?: string;
    onChange?: (v: string) => void;
    /** `tune` is the customer lookup's filter affordance. */
    trailing?: "search" | "tune";
}) => (
    <Stack
        direction="row"
        sx={{
            m: 1.5,
            px: 1.75,
            alignItems: "center",
            gap: 1,
            bgcolor: appColors.canvasAlt,
            borderRadius: `${appRadius.button}px`,
            flexShrink: 0,
        }}
    >
        <Box
            component="input"
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            sx={{
                flex: 1,
                minWidth: 0,
                minHeight: 48,
                border: "none",
                outline: "none",
                bgcolor: "transparent",
                fontSize: 16,
                fontFamily: "inherit",
                color: appColors.textPrimary,
            }}
        />
        {trailing === "search" ? (
            <SearchIcon sx={{ fontSize: 20, color: appColors.textSecondary }} />
        ) : (
            <TuneIcon sx={{ fontSize: 20, color: appColors.textSecondary }} />
        )}
    </Stack>
);

/* ------------------------------------------------------------------- rows */

export interface MobileRowProps {
    title: string;
    subtitle?: string;
    /** Product photo or avatar. A tinted initial block stands in when absent. */
    image?: string;
    price?: number;
    /** Free-text trailing value where a price is wrong — a time, a count. */
    trailing?: string;
    /** A `>` means this row drills into a sub-list rather than adding to the order. */
    drills?: boolean;
    /** The per-line kebab, which opens a bottom sheet rather than an anchored menu. */
    overflow?: boolean;
    onOverflow?: () => void;
    onClick?: () => void;
    /** A leading colour bar — the tee sheet and the seat lists use it. */
    accent?: string;
    dense?: boolean;
    /**
     * A bookable slot — taller, with a bigger target and a heavier title.
     *
     * The sheets had this backwards. A **taken** slot carries a name and a
     * subtitle, so it grows to two lines; an **open** slot carries a time and
     * the word `Open`, so it collapses to the shortest row on the screen. The
     * result is that the row an operator is actually aiming for — the one they
     * hit to sell something — was the hardest one to hit, and it shrank exactly
     * as the sheet filled up and the times got harder to tell apart.
     *
     * 64dp, which is the same figure the register row already uses for the same
     * reason: it is the control that gets pressed hundreds of times a shift.
     */
    tall?: boolean;
}

/**
 * The list row that replaces the tablet's product tile.
 *
 * A tile is a 150px square that is mostly padding and a photo; six across the
 * content pane is fine, two across a phone is not. A row gives the name its
 * full width, keeps the price on the right where it is scannable down a column,
 * and fits ten in the space four tiles took.
 *
 * 64dp tall — above the 48dp floor, because this is the control an operator
 * hits hundreds of times a shift.
 */
export const MobileRow = ({
    title,
    subtitle,
    image,
    price,
    trailing,
    drills,
    overflow,
    onOverflow,
    onClick,
    accent,
    dense,
    tall,
}: MobileRowProps) => {
    const body = (
        <Stack
            direction="row"
            sx={{
                alignItems: "center",
                gap: 1.5,
                width: "100%",
                px: 1.5,
                py: tall ? 1.5 : dense ? 0.75 : 1,
                // A floor, not a height: a row with a subtitle still grows. 48dp
                // is Material's minimum target and `dense` was landing under it
                // on single-line rows.
                minHeight: tall ? 64 : 48,
            }}
        >
            {accent && <Box sx={{ width: 4, alignSelf: "stretch", bgcolor: accent, flexShrink: 0, ml: -1.5 }} />}
            {image !== undefined && (
                <Box
                    sx={{
                        width: dense ? 36 : 44,
                        height: dense ? 36 : 44,
                        flexShrink: 0,
                        bgcolor: appColors.canvasAlt,
                        backgroundImage: image ? `url(${image})` : undefined,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        borderRadius: `${appRadius.tile}px`,
                    }}
                />
            )}
            <Stack sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: tall ? 18 : 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {title}
                </Typography>
                {subtitle && (
                    <Typography
                        sx={{
                            fontSize: 13,
                            color: appColors.textSecondary,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {subtitle}
                    </Typography>
                )}
            </Stack>
            {price !== undefined && <Typography sx={{ fontSize: 15, flexShrink: 0 }}>{usd(price)}</Typography>}
            {trailing && (
                <Typography sx={{ fontSize: tall ? 15 : 14, color: appColors.textSecondary, flexShrink: 0 }}>{trailing}</Typography>
            )}
            {drills && <ChevronRightIcon sx={{ fontSize: 22, color: appColors.textSecondary, flexShrink: 0 }} />}
            {overflow && (
                <ButtonBase
                    onClick={(e) => {
                        e.stopPropagation();
                        onOverflow?.();
                    }}
                    aria-label={`More options for ${title}`}
                    sx={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, color: appColors.textSecondary, mr: -1 }}
                >
                    <MoreVertIcon sx={{ fontSize: 20 }} />
                </ButtonBase>
            )}
        </Stack>
    );

    const sx = {
        display: "block",
        width: "100%",
        textAlign: "left" as const,
        bgcolor: appColors.surface,
        borderBottom: `1px solid ${appColors.divider}`,
    };
    return onClick ? (
        <ButtonBase onClick={onClick} sx={sx}>
            {body}
        </ButtonBase>
    ) : (
        <Box sx={sx}>{body}</Box>
    );
};

/* ------------------------------------------------------------------ bands */

/**
 * A seat band. Full-width, coloured, exactly as the landscape order panel
 * draws it — `SeatBand` in `order-panel.tsx` uses the same `appColors.seat`
 * cycle, and this is the same element at a different width.
 */
export const MobileSeatBand = ({ label, color }: { label: string; color: string }) => (
    <Box sx={{ bgcolor: color, px: 1.5, py: 0.5, flexShrink: 0 }}>
        <Typography sx={{ fontSize: 13, color: "#fff" }}>{label}</Typography>
    </Box>
);

/** A grey section heading inside a scrolling body — `Fees`, `Taxes`, `Notes`. */
export const MobileSectionHeading = ({ children }: { children: ReactNode }) => (
    <Typography sx={{ px: 1.5, pt: 2, pb: 0.5, fontSize: 15, color: appColors.textPrimary }}>{children}</Typography>
);

/* ------------------------------------------------------------------ empty */

/**
 * The antler empty state, at phone scale.
 *
 * The landscape version centres the mark in a 390px panel. Here it centres in
 * whatever is left between the app bar and the actions, which on a short screen
 * can be very little — so the mark is smaller and the sentence does the work.
 */
export const MobileEmpty = ({ message }: { message: string }) => (
    <Stack sx={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 1.5, py: 6, px: 3 }}>
        {/* Same mark and same 0.18 opacity as `OrderPanelEmpty`, at 88 rather
            than 150 — the panel had a 390px column to fill and this has 402
            minus the list above it. */}
        <Box component="img" src={assetUrl("logos/tf-square-black.svg")} alt="" sx={{ width: 88, opacity: 0.18 }} />
        <Typography sx={{ fontSize: 15, color: appColors.textSecondary, textAlign: "center" }}>{message}</Typography>
    </Stack>
);

/* --------------------------------------------------------------- attached */

/**
 * The customer attached to the order, pinned above the bottom nav.
 *
 * On tablet this sits at the foot of the order panel, always visible beside the
 * menu. There is no second column here, so it pins instead — because *whose
 * order this is* is the one fact an operator must never have to navigate to
 * check. The count on the right is the number of items on it.
 */
export const MobileAttachedCustomer = ({ name, count, avatar }: { name: string; count?: number; avatar?: string }) => (
    <Stack
        direction="row"
        sx={{
            alignItems: "center",
            gap: 1.5,
            px: 1.5,
            py: 1,
            bgcolor: appColors.navy,
            color: "#fff",
            flexShrink: 0,
        }}
    >
        <Box
            sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                bgcolor: appColors.slate,
                backgroundImage: avatar ? `url(${avatar})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                flexShrink: 0,
            }}
        />
        <Typography sx={{ fontSize: 15, flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {name}
        </Typography>
        {count !== undefined && (
            <Box
                sx={{
                    minWidth: 24,
                    height: 24,
                    px: 0.5,
                    borderRadius: 12,
                    bgcolor: appColors.surface,
                    color: appColors.textPrimary,
                    fontSize: 13,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                {count}
            </Box>
        )}
    </Stack>
);

/* -------------------------------------------------------------------- fab */

/**
 * The floating green pill — `+ Create Tab`, `+ Create Order`, `+ Quick Order`.
 *
 * On tablet these are buttons in the bottom action bar. That bar is gone, and
 * the reference floats them over the list instead, anchored bottom-right above
 * whatever is pinned. Green, ALL-CAPS off — the references render these in
 * sentence case, and that is what is copied.
 */
export const MobileFab = ({ label, onClick, offset = 0 }: { label: string; onClick?: () => void; offset?: number }) => (
    <ButtonBase
        onClick={onClick}
        sx={{
            position: "absolute",
            right: 12,
            bottom: 12 + offset,
            zIndex: 5,
            gap: 0.75,
            px: 2,
            minHeight: 40,
            borderRadius: 20,
            bgcolor: appColors.green,
            color: "#fff",
            fontSize: 14,
            boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        }}
    >
        <AddIcon sx={{ fontSize: 18 }} />
        {label}
    </ButtonBase>
);

/* ------------------------------------------------------------------ totals */

/**
 * The totals stack and its green `Total Owed` band.
 *
 * Unchanged in substance from the landscape order panel — same rows, same
 * order, same green band closing it. It simply sits above the actions rather
 * than at the foot of a side panel.
 */
export const MobileTotals = ({
    rows,
    owed,
    label = "Total Owed",
}: {
    rows: { label: string; value: number; green?: boolean }[];
    owed: number;
    label?: string;
}) => (
    <Box sx={{ flexShrink: 0, bgcolor: appColors.surface, borderTop: `1px solid ${appColors.divider}` }}>
        <Stack sx={{ px: 1.5, py: 1, gap: 0.25 }}>
            {rows.map((r) => (
                <Stack key={r.label} direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 14, color: r.green ? appColors.greenTee : appColors.textSecondary }}>{r.label}</Typography>
                    <Typography sx={{ fontSize: 14, color: r.green ? appColors.greenTee : appColors.textPrimary }}>
                        {usd(r.value)}
                    </Typography>
                </Stack>
            ))}
        </Stack>
        <Stack direction="row" sx={{ justifyContent: "space-between", px: 1.5, py: 1.25, bgcolor: appColors.green, color: "#fff" }}>
            <Typography sx={{ fontSize: 16 }}>{label}</Typography>
            <Typography sx={{ fontSize: 16 }}>{usd(owed)}</Typography>
        </Stack>
    </Box>
);

export { usd as mobileUsd };
