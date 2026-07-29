import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

import { appColors, appRadius } from "@/theme/app-replica-tokens";

/**
 * Order Lookup, as it ships.
 *
 * Transcribed from `references/072926/12-orderlookup/`. Two symmetric columns on
 * a white canvas: on the left the scope of the search (which course, which day),
 * on the right three independent search-by fields. Nothing on the screen is
 * pre-filled and no results are shown until SEARCH is pressed.
 */

/** Small centred caption that sits above every control on this screen. */
const FieldCaption = ({ children }: { children: string }) => (
    <Typography sx={{ fontSize: 13, color: appColors.textSecondary, textAlign: "center", mb: 1 }}>{children}</Typography>
);

/** Grey filled field with a placeholder only — this screen has no filled state. */
export const OrderLookupField = ({ caption, placeholder }: { caption: string; placeholder: string }) => (
    <Box>
        <FieldCaption>{caption}</FieldCaption>
        <Box
            sx={{
                width: 402,
                minHeight: 46,
                display: "flex",
                alignItems: "center",
                px: 1.875,
                bgcolor: "#E0E0E0",
                borderRadius: `${appRadius.button}px ${appRadius.button}px 0 0`,
                borderBottom: "1px solid rgba(0,0,0,0.42)",
            }}
        >
            <Typography sx={{ fontSize: 17, color: appColors.textSecondary }}>{placeholder}</Typography>
        </Box>
    </Box>
);

/** Course picker and date button — the left half of the screen. */
export const OrderLookupScope = ({ course, date }: { course: string; date: string }) => (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", pt: 4 }}>
        <FieldCaption>Golf Course</FieldCaption>

        <Box sx={{ display: "flex", alignItems: "center", gap: 3, mt: 3.5 }}>
            <Typography sx={{ fontSize: 28, color: appColors.textPrimary }}>{course}</Typography>
            <ArrowDropDownIcon sx={{ color: appColors.textSecondary }} />
        </Box>

        <Box sx={{ mt: 6, width: 402 }}>
            <FieldCaption>Date</FieldCaption>
            <Box
                sx={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: 50,
                    px: 2,
                    bgcolor: appColors.slate,
                    borderRadius: `${appRadius.button}px`,
                }}
            >
                <CalendarMonthIcon sx={{ position: "absolute", left: 16, color: "#fff", fontSize: 22 }} />
                <Typography sx={{ fontSize: 14, fontWeight: 500, letterSpacing: "0.08em", color: "#fff" }}>
                    {date}
                </Typography>
            </Box>
        </Box>
    </Box>
);

/** The three search-by fields — the right half of the screen. */
export const OrderLookupSearchFields = () => (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, pt: 1 }}>
        <OrderLookupField caption="Search by Order ID" placeholder="Enter Order ID" />
        <OrderLookupField caption="Search by Payment ID" placeholder="Enter Order Payment ID" />
        <OrderLookupField caption="Search by Product" placeholder="Start typing product name or SKU…" />
    </Box>
);

/** Both halves on the white canvas the screen uses instead of the usual grey. */
export const OrderLookupForm = ({ course, date }: { course: string; date: string }) => (
    <Box sx={{ display: "flex", minHeight: "100%", bgcolor: appColors.surface, pt: 2 }}>
        <Box sx={{ flex: 1 }}>
            <OrderLookupScope course={course} date={date} />
        </Box>
        <Box sx={{ flex: 1 }}>
            <OrderLookupSearchFields />
        </Box>
    </Box>
);
