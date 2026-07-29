import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";

import { appColors, appRadius } from "@/theme/app-replica-tokens";

/**
 * Table Chart — the floor-plan editor.
 *
 * A room is picked from the bottom bar, tables are dragged around a blank
 * canvas, NEW TABLE adds one, and SAVE writes the layout back. Nothing else is
 * on the screen: no account cluster, no overflow menu.
 */

export interface ChartTable {
    /** Label drawn inside the token. Long names are clipped on both sides. */
    label: string;
    x: number;
    y: number;
}

/**
 * A draggable table token — a dark rounded square with a single centered,
 * non-wrapping label. "Detached 27699" renders as "ached 276".
 */
export const TableToken = ({ table }: { table: ChartTable }) => (
    <ButtonBase
        sx={{
            position: "absolute",
            left: table.x,
            top: table.y,
            width: 95,
            height: 80,
            bgcolor: appColors.slate,
            color: "#fff",
            borderRadius: `${appRadius.button}px`,
            overflow: "hidden",
            display: "grid",
            placeItems: "center",
            cursor: "grab",
        }}
    >
        <Typography sx={{ fontSize: 19, whiteSpace: "nowrap" }}>{table.label}</Typography>
    </ButtonBase>
);

export const TableChartCanvas = ({ tables }: { tables: ChartTable[] }) => (
    <Box sx={{ position: "relative", width: "100%", height: "100%", minHeight: 560, bgcolor: appColors.canvas }}>
        {tables.map((table) => (
            <TableToken key={table.label} table={table} />
        ))}
    </Box>
);

/**
 * The room picker.
 *
 * Tapping the middle bottom-bar button raises this list straight over the
 * canvas — a dark panel with no scrim, anchored to the bottom bar.
 */
export const RoomPickerSheet = ({ rooms }: { rooms: string[] }) => (
    <Box
        sx={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            bottom: 0,
            width: 414,
            maxHeight: 560,
            overflowY: "auto",
            bgcolor: "#3B434B",
            boxShadow: "0 -2px 12px rgba(0,0,0,0.3)",
            zIndex: 1200,
        }}
    >
        {rooms.map((room) => (
            <ButtonBase key={room} sx={{ width: "100%", minHeight: 51, px: 2, justifyContent: "center" }}>
                <Typography sx={{ fontSize: 14, color: "#fff" }}>{room}</Typography>
            </ButtonBase>
        ))}
    </Box>
);

/** NEW TABLE. Both fields are free text; SAVE drops the token onto the canvas. */
export const CreateTableDialog = () => (
    <Box sx={{ width: 550, bgcolor: appColors.surface, px: 3, py: 3 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 500, mb: 2 }}>Create Table</Typography>

        {["Enter table number…", "How many guests can sit here?"].map((placeholder) => (
            <Box key={placeholder} sx={{ borderBottom: "1px solid", borderColor: appColors.textSecondary, pb: 1, mb: 2.5 }}>
                <Typography sx={{ fontSize: 19, color: appColors.textSecondary }}>{placeholder}</Typography>
            </Box>
        ))}

        <Button fullWidth sx={{ minHeight: 48, bgcolor: appColors.slate, borderRadius: `${appRadius.button}px` }}>
            Save
        </Button>
    </Box>
);

/** Confirmation band shown under the app bar after SAVE succeeds. */
export const SaveConfirmationBanner = ({ message }: { message: string }) => (
    <Box sx={{ flexShrink: 0, bgcolor: appColors.green, minHeight: 55, display: "grid", placeItems: "center" }}>
        <Typography sx={{ fontSize: 17, color: "#fff" }}>{message}</Typography>
    </Box>
);

/** Rooms configured on the reference device, in the order the app lists them. */
export const chartRooms = [
    "[Detached Tables]",
    "smallroom",
    "bigroom",
    "Private Hall",
    "banquet",
    "Lounge",
    "Trivia Pub/Bar",
    "Astor Creek Test Room",
    "Big Bar",
    "Open Tabs",
    "New Table Designer Room",
];
