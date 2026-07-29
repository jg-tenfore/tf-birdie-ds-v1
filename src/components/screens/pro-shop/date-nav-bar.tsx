import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { appColors, appRadius } from "@/theme/app-replica-tokens";

/**
 * The date band under the app bar on the Court Sheet and Bay Sheet.
 *
 * Four buttons on one row: green step-back, the orange current date, a slate
 * GO TO TODAY, and green step-forward. The orange is used for nothing else in
 * the app. The two sheets weight the middle two buttons differently, so the
 * ratios are props rather than fixed.
 */

export interface DateNavBarProps {
    /** Already formatted and upper-cased by the caller, e.g. "TUESDAY, MAY 12 2026". */
    date: string;
    /** Flex ratios for [back, date, today, forward]. */
    ratios?: [number, number, number, number];
    onPrevious?: () => void;
    onNext?: () => void;
    onToday?: () => void;
}

const barButtonSx = {
    minHeight: 56,
    borderRadius: `${appRadius.button}px`,
    color: "#fff",
    fontSize: 14,
    letterSpacing: "0.08em",
};

export const DateNavBar = ({ date, ratios = [1, 5, 3, 1], onPrevious, onNext, onToday }: DateNavBarProps) => (
    <Box sx={{ display: "flex", gap: "8px", px: 1, py: 1, bgcolor: appColors.surface, flexShrink: 0 }}>
        <Button
            disableElevation
            aria-label="Previous day"
            onClick={onPrevious}
            sx={{ ...barButtonSx, flex: `${ratios[0]} 1 0`, bgcolor: appColors.green, "&:hover": { bgcolor: appColors.greenDark } }}
        >
            <ChevronLeftIcon sx={{ fontSize: 32 }} />
        </Button>

        <Button
            disableElevation
            sx={{ ...barButtonSx, flex: `${ratios[1]} 1 0`, bgcolor: appColors.orange, "&:hover": { bgcolor: "#DE8A3E" } }}
        >
            {date}
        </Button>

        <Button
            disableElevation
            onClick={onToday}
            sx={{ ...barButtonSx, flex: `${ratios[2]} 1 0`, bgcolor: appColors.slate, "&:hover": { bgcolor: appColors.slateDark } }}
        >
            Go to today
        </Button>

        <Button
            disableElevation
            aria-label="Next day"
            onClick={onNext}
            sx={{ ...barButtonSx, flex: `${ratios[3]} 1 0`, bgcolor: appColors.green, "&:hover": { bgcolor: appColors.greenDark } }}
        >
            <ChevronRightIcon sx={{ fontSize: 32 }} />
        </Button>
    </Box>
);

export default DateNavBar;
