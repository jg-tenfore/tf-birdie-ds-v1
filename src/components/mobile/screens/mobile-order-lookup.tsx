import { useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PrintIcon from "@mui/icons-material/Print";
import SearchIcon from "@mui/icons-material/Search";

import { appColors } from "@/theme/app-replica-tokens";
import { MobileNavDrawer } from "../mobile-drawer";
import { MobileRow, MobileSectionHeading } from "../mobile-parts";
import { MobileActionArea, MobileAppBar, MobilePrimary, MobileScreen, MobileSecondary, MobileSecondaryRow } from "../mobile-shell";

/**
 * **Mobile Screens — 12-orderlookup.** Laid out against `App Screens → 12-orderlookup`.
 *
 * The luckiest screen in this category, and worth saying why: **the three
 * search fields are already 402px wide.** `OrderLookupField` hardcodes
 * `width: 402` because that is half of the tablet's right column. It is also,
 * exactly, the width of this phone. So the fields need no narrowing at all —
 * they only need to stop sitting beside something.
 *
 * ## The two columns become one scroll
 *
 * The tablet is symmetric: scope on the left (which course, which day), the
 * three ways in on the right. Two `flex: 1` halves of 1290px. Here they stack
 * in reading order — scope first, because scoping to the wrong day and then
 * typing an order ID is the failure this arrangement is trying to prevent.
 *
 * ## The course picker
 *
 * On tablet the course is set at **28px** with a dropdown arrow beside it,
 * centred in a 645px column. `The Dunes of Delgado PROD` at 28px is ~340px of
 * type before the arrow — it fits there and it does not fit here beside an
 * icon with 16px of gutter each side.
 *
 * So it becomes a row: the course as the 16px title, `Golf Course` — the
 * tablet's caption — as the secondary line, and a `>` where the dropdown arrow
 * was. Same control, same two strings, in the shape a phone opens a picker
 * from.
 *
 * ## The date button
 *
 * Kept almost verbatim. The tablet draws a 402px slate block with a calendar
 * glyph pinned left and `WEDNESDAY, JULY 29 2026` set in 14px caps — which is
 * `MobileSecondary` with an icon, at the same fill, the same casing and the
 * same tracking. One of the few landscape elements that transfers without an
 * argument, because it was already sized for this width.
 *
 * ## The three fields
 *
 * Unchanged in substance: same captions, same placeholders, same order, and
 * still **alternatives rather than combining filters** — you search by order
 * ID *or* payment ID *or* product. What changes is the 48px gap between them,
 * which was buying air in a tall column and here would push the third field
 * below the fold; and the caption, which moves from centred above the field to
 * inside it, matching the filled-field pattern `MobileOpenFood` established.
 *
 * ## The action bar
 *
 * `BACK / PRINT SNAPSHOT / SEARCH` — three buttons, 430px each on tablet, 134px
 * each here, and `PRINT SNAPSHOT` needs about 150. BACK is the app bar's job.
 * PRINT SNAPSHOT is not a search — it prints the day's summary for the scope
 * above without searching at all — so it stays visible as a secondary rather
 * than hiding in the overflow. SEARCH commits, so it takes the full width.
 *
 * ## The white canvas is kept
 *
 * This screen sits on `appColors.surface` rather than the grey every other
 * screen uses. That is unusual enough in the shipping app to be worth carrying
 * over rather than normalising — a re-layout does not get to tidy up a
 * background.
 */

/** The MD2 filled field, caption inside — the pattern `MobileOpenFood` uses. */
const LookupField = ({ caption, placeholder }: { caption: string; placeholder: string }) => (
    <Box sx={{ px: 1.75, py: 1, bgcolor: appColors.canvasAlt, borderBottom: `1px solid ${appColors.grey}` }}>
        <Typography sx={{ fontSize: 12, color: appColors.textSecondary, lineHeight: 1.4 }}>{caption}</Typography>
        <Typography sx={{ fontSize: 16, color: appColors.textSecondary, lineHeight: 1.4 }} noWrap>
            {placeholder}
        </Typography>
    </Box>
);

export interface MobileOrderLookupProps {
    course?: string;
    date?: string;
    drawerOpen?: boolean;
}

export const MobileOrderLookup = ({
    course = "The Dunes of Delgado PROD",
    date = "Wednesday, July 29 2026",
    drawerOpen = false,
}: MobileOrderLookupProps) => {
    const [drawer, setDrawer] = useState(drawerOpen);

    return (
        <MobileScreen
            appBar={<MobileAppBar title="Order Lookup" leading="menu" onLeading={() => setDrawer(true)} showOverflow={false} />}
            actions={
                <MobileActionArea>
                    <MobileSecondaryRow>
                        <MobileSecondary>
                            <PrintIcon sx={{ fontSize: 18, mr: 1 }} />
                            Print Snapshot
                        </MobileSecondary>
                    </MobileSecondaryRow>
                    <MobilePrimary icon={<SearchIcon sx={{ fontSize: 20 }} />}>Search</MobilePrimary>
                </MobileActionArea>
            }
            overlay={
                drawer ? (
                    <MobileNavDrawer active="orderlookup" onDismiss={() => setDrawer(false)} onPick={() => setDrawer(false)} />
                ) : undefined
            }
        >
            {/* The white canvas this screen uses instead of the usual grey. */}
            <Box sx={{ minHeight: "100%", bgcolor: appColors.surface }}>
                <MobileSectionHeading>Scope</MobileSectionHeading>
                <MobileRow title={course} subtitle="Golf Course" drills onClick={() => {}} />

                <Box sx={{ px: 1.5, pt: 1.5 }}>
                    <Stack direction="row">
                        <MobileSecondary>
                            <CalendarMonthIcon sx={{ fontSize: 18, mr: 1 }} />
                            {date}
                        </MobileSecondary>
                    </Stack>
                </Box>

                <MobileSectionHeading>Search by</MobileSectionHeading>
                <Stack sx={{ px: 1.5, pb: 2, gap: 1.25 }}>
                    <LookupField caption="Search by Order ID" placeholder="Enter Order ID" />
                    <LookupField caption="Search by Payment ID" placeholder="Enter Order Payment ID" />
                    <LookupField caption="Search by Product" placeholder="Start typing product name or SKU…" />
                </Stack>
            </Box>
        </MobileScreen>
    );
};
