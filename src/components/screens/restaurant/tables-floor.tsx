import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { appColors, appRadius } from "@/theme/app-replica-tokens";

/**
 * The Restaurant Tables floor — the screen the Tables nav item opens.
 *
 * Open tables sit on a plain grey canvas at their saved chart coordinates. In
 * the `[Detached Tables]` room they stack into the top-left corner, because a
 * detached table has no chart position of its own.
 */

export interface FloorTable {
    /** Full name, e.g. "Detached 27699". The card clips it rather than wrapping. */
    name: string;
    /** Customer on the open order. Also clipped. */
    customer: string;
    /** Running total, e.g. "$11.94". */
    total: string;
    x: number;
    y: number;
}

/**
 * An open table.
 *
 * The teal fill is specific to this screen — it is not one of the seat colors
 * and has no token, so it is declared here.
 */
const openTableFill = "#2E6076";

export const FloorTableCard = ({ table }: { table: FloorTable }) => (
    <ButtonBase
        sx={{
            position: "absolute",
            left: table.x,
            top: table.y,
            width: 99,
            height: 76,
            bgcolor: openTableFill,
            color: "#fff",
            display: "block",
            overflow: "hidden",
            textAlign: "center",
            px: 0.5,
        }}
    >
        {/* nowrap + overflow:hidden is the app's behaviour: long names lose both ends. */}
        <Typography sx={{ fontSize: 15, whiteSpace: "nowrap" }}>{table.name}</Typography>
        <Typography sx={{ fontSize: 13, whiteSpace: "nowrap" }}>{table.customer}</Typography>
        <Typography sx={{ fontSize: 13, whiteSpace: "nowrap" }}>{table.total}</Typography>
    </ButtonBase>
);

export const RestaurantTablesFloor = ({ tables }: { tables: FloorTable[] }) => (
    <Box sx={{ position: "relative", width: "100%", height: "100%", minHeight: 560, bgcolor: appColors.canvasAlt }}>
        {tables.map((table) => (
            <FloorTableCard key={table.name} table={table} />
        ))}
    </Box>
);

/**
 * Merge Tables.
 *
 * Dragging one table onto another opens this dialog. The two tokens are shown
 * touching, in the position they were dropped, and SAVE commits the merge.
 */
export const MergeTablesDialog = ({ tables }: { tables: string[] }) => (
    <Box sx={{ width: 895, bgcolor: appColors.surface, px: 6, py: 5 }}>
        <Typography sx={{ fontSize: 20, textAlign: "center", mb: 4 }}>Merge Tables</Typography>

        <Stack direction="row" sx={{ mb: 5, ml: 6 }}>
            {tables.map((name) => (
                <Box
                    key={name}
                    sx={{
                        width: 80,
                        height: 57,
                        bgcolor: appColors.green,
                        color: "#fff",
                        display: "grid",
                        placeItems: "center",
                        overflow: "hidden",
                        px: 0.5,
                    }}
                >
                    {/* Word and number stack; the word is clipped, not wrapped. */}
                    <Box sx={{ textAlign: "center" }}>
                        {name
                            .toUpperCase()
                            .split(" ")
                            .map((part) => (
                                <Typography
                                    key={part}
                                    sx={{ fontSize: 12, fontWeight: 500, letterSpacing: "0.06em", whiteSpace: "nowrap", lineHeight: 1.5 }}
                                >
                                    {part}
                                </Typography>
                            ))}
                    </Box>
                </Box>
            ))}
        </Stack>

        <Button fullWidth sx={{ minHeight: 56, bgcolor: appColors.green, borderRadius: `${appRadius.button}px` }}>
            Save
        </Button>
    </Box>
);
