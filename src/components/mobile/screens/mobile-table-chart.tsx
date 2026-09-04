import { useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { type ChartTable, chartRooms } from "@/components/screens/restaurant/table-chart-canvas";
import { appColors } from "@/theme/app-replica-tokens";
import { MobileEmpty, MobileRow, MobileSectionHeading } from "../mobile-parts";
import {
    MobileActionArea,
    MobileAppBar,
    MobileBottomSheet,
    MobilePrimary,
    MobileScreen,
    MobileSecondary,
    MobileSecondaryRow,
} from "../mobile-shell";

/**
 * **Mobile Screens — 10-tablechart.** Laid out against `App Screens →
 * 10-tablechart`. No phone reference exists; this is the hardest of the
 * extrapolations and the one with the largest honest gap.
 *
 * ## The phone does not get the editor
 *
 * Table Chart is not a list that happens to be drawn spatially — it **is** the
 * spatial thing. Its whole purpose is to make the screen match the room: you
 * drag a 95×80 token to where the table actually stands, and the value of the
 * result is entirely in the x/y you dragged it to. That capability has three
 * requirements a 402×797 canvas cannot meet at once:
 *
 * 1. **Enough canvas to be a room.** The tablet places tokens at x≈800; the
 *    phone has 402px of width, so a floor plan either scales until a table is a
 *    thumbnail or crops until you are dragging blind.
 * 2. **A drag that is not also a scroll.** The body scrolls vertically on a
 *    phone. Drag-to-position inside a scrolling view is the classic gesture
 *    conflict, and resolving it costs a long-press before every move.
 * 3. **Two hands and a fixed device.** Laying out twenty tables is a
 *    sit-down task on a counter terminal, not something done one-handed while
 *    walking.
 *
 * So: **the visual editor stays a tablet capability, and this is said out loud
 * rather than faked.** A squashed, unusable floor plan that technically renders
 * at 402px would be worse than not shipping the screen, because it would look
 * like the capability exists.
 *
 * ## What the phone does get
 *
 * The **roster**, which is the half of this screen that is not spatial: which
 * rooms exist, which tables are in the room you picked, adding a table, and
 * saving. A runner can check that Table 10 is in *banquet* and add the table
 * someone just set up in the corner; they cannot say where in the corner.
 *
 * | Tablet | Mobile |
 * | :-- | :-- |
 * | Tokens dragged on a canvas | A list of the tables in the room |
 * | The room button in the bottom bar | A `Room` row that raises the same list as a sheet |
 * | NEW TABLE in the app bar | The same text action, opening a full screen |
 * | SAVE in the bottom bar | The full-width primary, still green, still disabled until something changes |
 *
 * ## One thing the list does better
 *
 * The tablet token clips its label at both ends — `Detached 27699` renders as
 * `ached 276`, which is why chart tables are normally numbered. A row gives the
 * label its full width, so the detached tables are legible here and are not
 * legible there. Worth keeping when the editor is revisited.
 */

export interface MobileTableChartProps {
    /** One of `chartRooms`. Shown on the Room row and used by the picker. */
    room?: string;
    /** The tables configured in that room. Positions are carried, not drawn. */
    tables?: ChartTable[];
    /** Raises the room list as a bottom sheet — the tablet's over-canvas panel. */
    picker?: boolean;
    /** The green confirmation band that follows a successful SAVE. */
    saved?: boolean;
    /** SAVE greys out until the layout changes, and while the picker is open. */
    canSave?: boolean;
}

export const MobileTableChart = ({
    room = "banquet",
    tables = [],
    picker = false,
    saved = false,
    canSave = true,
}: MobileTableChartProps) => {
    const [sheet, setSheet] = useState(picker);
    const [active, setActive] = useState(room);
    const isEmpty = tables.length === 0;

    return (
        <MobileScreen
            appBar={<MobileAppBar title="Table Chart" leading="back" action="New Table" showOverflow={false} />}
            actions={
                <MobileActionArea>
                    {isEmpty && (
                        <MobileSecondaryRow>
                            <MobileSecondary>Set Up Tables</MobileSecondary>
                        </MobileSecondaryRow>
                    )}
                    <MobilePrimary disabled={!canSave || sheet}>Save</MobilePrimary>
                </MobileActionArea>
            }
            overlay={
                sheet ? (
                    <MobileBottomSheet
                        onDismiss={() => setSheet(false)}
                        items={chartRooms.map((r) => ({
                            label: r,
                            onClick: () => {
                                setActive(r);
                                setSheet(false);
                            },
                        }))}
                    />
                ) : undefined
            }
        >
            {saved && (
                // The same green band the tablet pushes under its app bar, at
                // this width. `mobile-tables` draws "Table Fired!" identically.
                <Stack direction="row" sx={{ alignItems: "center", justifyContent: "center", bgcolor: appColors.green, py: 1.25 }}>
                    <Typography sx={{ fontSize: 15, color: "#fff" }}>Table layout saved successfully!</Typography>
                </Stack>
            )}

            <MobileRow title="Room" trailing={active} drills onClick={() => setSheet(true)} />

            <MobileSectionHeading>
                {isEmpty ? "Tables" : `${tables.length} ${tables.length === 1 ? "table" : "tables"}`}
            </MobileSectionHeading>

            {isEmpty ? (
                <MobileEmpty message="No active tables." />
            ) : (
                tables.map((t) => <MobileRow key={t.label} title={t.label} overflow onOverflow={() => {}} />)
            )}

            {/* Said on the screen, not only in the docs — an operator who came
                looking for the floor plan should be told where it went. */}
            <Box sx={{ px: 1.5, py: 2 }}>
                <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>
                    Positions are set on the terminal. This device lists the tables in a room and can add one; it does not place them.
                </Typography>
            </Box>
        </MobileScreen>
    );
};

/**
 * **Create Table**, as a screen.
 *
 * Two free-text fields over SAVE. The tablet draws it as a 550px dialog; the
 * category's fourth rule turns a dialog that wide into a full screen, and the
 * dialog's SAVE becomes the full-width primary. The underlined MD2 fields are
 * kept as they are — this is the shipping app's field, not a new one.
 *
 * The new table still lands unsaved: this SAVE creates the table, the chart's
 * SAVE commits the layout. Two saves for two different things is confusing on
 * the tablet and no less so here, but it is what the app does and this is a
 * replica.
 */
export const MobileCreateTable = () => (
    <MobileScreen
        appBar={<MobileAppBar title="Create Table" leading="close" showOverflow={false} />}
        actions={
            <MobileActionArea>
                <MobilePrimary tone="default">Save</MobilePrimary>
            </MobileActionArea>
        }
    >
        <Stack sx={{ px: 2, pt: 2, gap: 3 }}>
            {["Enter table number…", "How many guests can sit here?"].map((placeholder) => (
                <Box
                    key={placeholder}
                    sx={{ borderBottom: "1px solid", borderColor: appColors.textSecondary, pb: 1, bgcolor: appColors.canvas }}
                >
                    <Box
                        component="input"
                        placeholder={placeholder}
                        aria-label={placeholder}
                        sx={{
                            width: "100%",
                            minHeight: 44,
                            border: "none",
                            outline: "none",
                            bgcolor: "transparent",
                            fontFamily: "inherit",
                            fontSize: 16,
                            color: appColors.textPrimary,
                        }}
                    />
                </Box>
            ))}
        </Stack>
    </MobileScreen>
);
