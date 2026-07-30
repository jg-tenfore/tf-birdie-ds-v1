import type { ReactNode } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PauseIcon from "@mui/icons-material/Pause";
import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsIcon from "@mui/icons-material/Settings";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ViewHeadlineIcon from "@mui/icons-material/ViewHeadline";
import ViewModuleIcon from "@mui/icons-material/ViewModule";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { sheetHeader, sheetStats, slotSettingsMenu } from "./tee-sheet-data";

/**
 * Chrome shared by every Tee Sheet view: the date-navigation band, the counts
 * strip, and the bottom bar of view toggles.
 *
 * The sheet does **not** sit on the app's usual light canvas — the background
 * behind the rows, behind the date bar and behind the bottom bar is a mid grey,
 * which is what makes the white open slots read as "available" at a glance.
 */
export const sheetCanvas = "#A8A8A8";

/** The green/dark/orange date navigation band directly under the app bar. */
export const TeeSheetDateBar = ({ course = sheetHeader.facility }: { course?: string }) => (
    <Box sx={{ display: "flex", gap: 1, px: 1, pt: 1, bgcolor: sheetCanvas }}>
        <Button
            aria-label="Previous day"
            sx={{ flex: "1 1 0", minHeight: 52, bgcolor: appColors.green, "&:hover": { bgcolor: appColors.greenDark } }}
        >
            <ChevronLeftIcon sx={{ fontSize: 30 }} />
        </Button>

        {/* Facility name. Flat, non-uppercased — it is a label, not an action. */}
        <Box
            sx={{
                flex: "3 1 0",
                minHeight: 52,
                bgcolor: appColors.slate,
                color: "#fff",
                borderRadius: `${appRadius.button}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Typography sx={{ fontSize: 15 }}>{course}</Typography>
        </Box>

        {/* Orange is used for exactly one thing in the whole app: the tee sheet date. */}
        <Box
            sx={{
                flex: "5 1 0",
                minHeight: 52,
                bgcolor: appColors.orange,
                color: "#fff",
                borderRadius: `${appRadius.button}px`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Typography sx={{ fontSize: 14, fontWeight: 700, letterSpacing: "0.08em" }}>{sheetHeader.date}</Typography>
        </Box>

        <Button color="secondary" sx={{ flex: "3 1 0", minHeight: 52, letterSpacing: "0.08em" }}>
            Go to today
        </Button>

        <Button
            aria-label="Next day"
            sx={{ flex: "1 1 0", minHeight: 52, bgcolor: appColors.green, "&:hover": { bgcolor: appColors.greenDark } }}
        >
            <ChevronRightIcon sx={{ fontSize: 30 }} />
        </Button>
    </Box>
);

/** Counts strip: course label, five totals, and a live clock on the right. */
export const TeeSheetStatStrip = () => (
    <Box sx={{ display: "flex", alignItems: "baseline", gap: 3, px: 1.5, pt: 1, pb: 0.75, bgcolor: sheetCanvas }}>
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: appColors.textPrimary }}>{sheetStats.courseLabel}</Typography>

        {(
            [
                ["Total", sheetStats.total],
                ["Booked", sheetStats.booked],
                ["Paid", sheetStats.paid],
                ["No Shows", sheetStats.noShows],
                ["Available", sheetStats.available],
            ] as const
        ).map(([label, value]) => (
            <Typography key={label} sx={{ fontSize: 15, color: appColors.textSecondary }}>
                {label}{" "}
                <Box component="span" sx={{ fontWeight: 700, color: appColors.textPrimary }}>
                    {value}
                </Box>
            </Typography>
        ))}

        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: 15, fontWeight: 700, color: appColors.textPrimary }}>{sheetStats.clock}</Typography>
    </Box>
);

/** Both bands together — pass this to `AppShell`'s `subBar`. */
export const TeeSheetSubBar = ({ course }: { course?: string }) => (
    <Box sx={{ flexShrink: 0 }}>
        <TeeSheetDateBar course={course} />
        <TeeSheetStatStrip />
    </Box>
);

export type SheetView = "grid" | "list" | "multi" | "back9";

const ToggleButton = ({ label, icon, active, secondLine }: { label: string; icon: ReactNode; active: boolean; secondLine?: string }) => (
    <Button
        startIcon={icon}
        sx={{
            flex: "1 1 0",
            minHeight: 56,
            lineHeight: 1.15,
            bgcolor: active ? appColors.green : appColors.slate,
            "&:hover": { bgcolor: active ? appColors.greenDark : appColors.slateDark },
        }}
    >
        {secondLine ? (
            <Box component="span" sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span>{label}</span>
                <span>{secondLine}</span>
            </Box>
        ) : (
            label
        )}
    </Button>
);

/**
 * The bottom bar.
 *
 * Four mutually exclusive view toggles (Grid, List, Multi, Back 9) sit in the
 * middle with the current one filled green. The course picker between Pro Shop
 * and the toggles disappears in Multi view, because Multi already shows every
 * course at once. PAY is grey until something is in the cart.
 */
export const TeeSheetActionBar = ({
    view,
    course = sheetHeader.course,
    /** Rendered above the course button — the open course picker menu. */
    courseMenu,
}: {
    view: SheetView;
    course?: string;
    courseMenu?: ReactNode;
}) => (
    <Box sx={{ display: "flex", gap: 1, px: 1, py: 1, bgcolor: sheetCanvas, flexShrink: 0 }}>
        <Button color="secondary" startIcon={<StorefrontIcon />} sx={{ flex: "3 1 0", minHeight: 56 }}>
            Pro Shop
        </Button>

        {view !== "multi" && (
            <Box sx={{ flex: "3 1 0", position: "relative", display: "flex" }}>
                {courseMenu}
                <Box
                    sx={{
                        flex: 1,
                        minHeight: 56,
                        bgcolor: appColors.slate,
                        color: "#fff",
                        borderRadius: `${appRadius.button}px`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <Typography sx={{ fontSize: 15 }}>{course}</Typography>
                </Box>
            </Box>
        )}

        <ToggleButton label="Grid" icon={<ViewModuleIcon />} active={view === "grid"} />
        <ToggleButton label="List" icon={<ViewHeadlineIcon />} active={view === "list"} />
        <ToggleButton label="Multi" icon={<PauseIcon />} active={view === "multi"} />
        {/* "Back 9" wraps onto two lines in List and Grid, where the row is
            tightest, and sits on one line as "Back9" in Multi and Back 9. */}
        <ToggleButton
            label={view === "list" || view === "grid" ? "Back" : "Back9"}
            secondLine={view === "list" || view === "grid" ? "9" : undefined}
            icon={<SettingsIcon />}
            active={view === "back9"}
        />

        <Button color="secondary" aria-label="Refresh" sx={{ flex: "0 0 auto", minWidth: 72, minHeight: 56 }}>
            <RefreshIcon />
        </Button>

        <Button
            disabled
            startIcon={<ShoppingCartIcon />}
            sx={{
                flex: "4 1 0",
                minHeight: 56,
                bgcolor: appColors.greyLight,
                color: "#fff",
                "&.Mui-disabled": { bgcolor: appColors.greyLight, color: "#fff" },
            }}
        >
            Pay
        </Button>
    </Box>
);

/**
 * The per-tee-time gear menu, open.
 *
 * Everything in it operates on the *time*, not on a reservation: Squeeze
 * inserts an extra tee time either side of this one, Clone copies the whole
 * time with its players, Clear Time empties it, and Move Player(s) hands the
 * group to a different time. It opens downward from the gear and floats over
 * the rows beneath.
 */
export const SlotSettingsMenu = ({
    items = slotSettingsMenu,
    onSelect,
}: {
    items?: string[];
    /** Supplied by the prototype; the stories render it inert. */
    onSelect?: (item: string) => void;
}) => (
    <Paper
        elevation={8}
        sx={{
            position: "absolute",
            top: "100%",
            right: 0,
            mt: 0.5,
            width: 300,
            zIndex: 3,
            bgcolor: appColors.surface,
        }}
    >
        {items.map((item, index) => (
            <Box
                key={item}
                role={onSelect ? "button" : undefined}
                tabIndex={onSelect ? 0 : undefined}
                onClick={() => onSelect?.(item)}
                sx={{
                    minHeight: 62,
                    display: "flex",
                    alignItems: "center",
                    px: 2.5,
                    cursor: onSelect ? "pointer" : "default",
                    borderTop: index === 0 ? "none" : `1px solid ${appColors.divider}`,
                    "&:hover": onSelect ? { bgcolor: appColors.canvas } : undefined,
                }}
            >
                <Typography sx={{ fontSize: 19, color: appColors.textPrimary }}>{item}</Typography>
            </Box>
        ))}
    </Paper>
);

/**
 * The course picker, open.
 *
 * It is a dark sheet that opens *upward* from the bottom bar and overlaps the
 * tee sheet, rather than a dropdown anchored below — the button is already at
 * the bottom edge of the screen.
 */
export const CourseMenu = ({ options = sheetHeader.courses }: { options?: readonly string[] }) => (
    <Paper
        elevation={8}
        sx={{
            position: "absolute",
            bottom: "100%",
            left: 0,
            right: 0,
            mb: 1,
            bgcolor: appColors.slate,
            color: "#fff",
            py: 1,
        }}
    >
        {options.map((option) => (
            <Box key={option} sx={{ minHeight: 64, display: "flex", alignItems: "center", justifyContent: "center", px: 2 }}>
                <Typography sx={{ fontSize: 16 }}>{option}</Typography>
            </Box>
        ))}
    </Paper>
);
