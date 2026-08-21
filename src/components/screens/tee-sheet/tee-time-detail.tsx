import type { ReactNode } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import HistoryIcon from "@mui/icons-material/History";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import NotesIcon from "@mui/icons-material/Notes";
import PeopleIcon from "@mui/icons-material/People";
import PrintIcon from "@mui/icons-material/Print";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import VpnKeyIcon from "@mui/icons-material/VpnKey";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import type { DetailPlayer, PlayerAction, TeeTimeDetail } from "./tee-sheet-data";

/**
 * Tee time detail — what opens when a position on the sheet is tapped.
 *
 * It is a per-player action surface, not a form: every reservation in the time
 * gets its own card and its own row of operations, and the row differs by
 * state. A player who has already paid loses Cancel / No Show / Add to Cart and
 * gains Print Receipt; a player on a raincheck shows Raincheck in its place.
 *
 * The header is a customer lookup that stays empty until a customer is
 * attached — the dashed `--------` placeholders are what the app actually
 * renders, not a loading state.
 */

/** Detail-card fill: a pale blue that separates the players from the canvas. */
const playerCardFill = "#D8E5EE";

const actionIcon: Partial<Record<PlayerAction, ReactNode>> = {
    Cancel: <CloseIcon />,
    "No Show": <ErrorOutlineOutlinedIcon />,
    Raincheck: <BoltIcon />,
    Clone: <PeopleIcon />,
    History: <HistoryIcon />,
    Edit: <EditIcon />,
    "Print Starter": <PrintIcon />,
    "Print Receipt": <PrintIcon />,
    "Cart Key": <VpnKeyIcon />,
    "Add to Cart": <AddShoppingCartIcon />,
};

/** Red = destructive, green = the one forward action, slate = everything else. */
const actionTone = (action: PlayerAction) => {
    if (action === "Cancel" || action === "No Show" || action === "Raincheck") {
        return { bg: appColors.red, hover: "#C62F43" };
    }
    if (action === "Add to Cart") return { bg: appColors.green, hover: appColors.greenDark };
    return { bg: appColors.slate, hover: appColors.slateDark };
};

const PlayerActionButton = ({ action, onClick }: { action: PlayerAction; onClick?: () => void }) => {
    const tone = actionTone(action);

    return (
        <Button
            startIcon={actionIcon[action]}
            onClick={onClick}
            sx={{
                flex: "1 1 0",
                minHeight: 52,
                // Card actions are sentence case; only the bottom bar is ALL CAPS.
                textTransform: "none",
                fontSize: 15,
                fontWeight: 700,
                letterSpacing: 0,
                bgcolor: tone.bg,
                "&:hover": { bgcolor: tone.hover },
            }}
        >
            {action}
        </Button>
    );
};

const NoteButton = ({ label }: { label: string }) => (
    <Button
        startIcon={label === "Group Notes" ? <PeopleIcon /> : <NotesIcon />}
        color="secondary"
        sx={{ minHeight: 44, textTransform: "none", fontSize: 14, fontWeight: 700, letterSpacing: 0 }}
    >
        {label}
    </Button>
);

/**
 * @param onAction Makes the row's buttons live. Omitted everywhere the screen is
 * documentation, which is most places — this is a transcription of the shipping
 * detail screen, and its buttons do nothing there either.
 */
const PlayerCard = ({ player, onAction }: { player: DetailPlayer; onAction?: (action: PlayerAction, player: DetailPlayer) => void }) => (
    <Box sx={{ bgcolor: playerCardFill, borderRadius: `${appRadius.card}px`, px: 2, py: 1.5, mb: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
            <Typography sx={{ fontSize: 30, color: appColors.textPrimary, lineHeight: 1.2 }}>{player.name}</Typography>

            {player.flags?.includes("dollar") && <AttachMoneyIcon sx={{ fontSize: 26, color: appColors.textPrimary }} />}
            {player.flags?.includes("bolt") && <BoltIcon sx={{ fontSize: 26, color: appColors.textPrimary }} />}

            {player.email && (
                <Typography noWrap sx={{ fontSize: 24, color: appColors.textPrimary, minWidth: 0 }}>
                    {player.email}
                </Typography>
            )}

            <Box sx={{ flex: 1 }} />
            <Typography sx={{ fontSize: 26, color: appColors.textPrimary, whiteSpace: "nowrap" }}>{player.amount}</Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "flex-end", gap: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 13, color: appColors.textSecondary, flex: 1, minWidth: 0, py: 0.5 }}>{player.meta}</Typography>

            {player.showNotes && (
                <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
                    <NoteButton label="Customer Notes" />
                    <NoteButton label="Group Notes" />
                </Box>
            )}
        </Box>

        {player.actions.length > 0 && (
            <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                {player.actions.map((action) => (
                    <PlayerActionButton key={action} action={action} onClick={onAction ? () => onAction(action, player) : undefined} />
                ))}
            </Box>
        )}
    </Box>
);

/** Two free-text lookups on one light grey band — name/email/phone, and member number. */
export const CustomerSearchBand = () => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            bgcolor: "#E0E0E0",
            minHeight: 64,
            px: 2,
            flexShrink: 0,
        }}
    >
        <Typography sx={{ flex: 1, fontSize: 21, color: appColors.textSecondary }}>Search by customer name, email, or phone…</Typography>
        <Typography sx={{ fontSize: 21, color: appColors.textSecondary, pr: 22 }}>Member Number…</Typography>
    </Box>
);

/**
 * The slate summary band.
 *
 * Four read-only columns describing whoever is selected in the search above,
 * plus RESERVE — which stays grey until a customer is attached to the time.
 */
export const CustomerSummaryBand = () => (
    <Box sx={{ display: "flex", alignItems: "center", bgcolor: appColors.slate, color: "#fff", px: 2, py: 1, flexShrink: 0 }}>
        {(
            [
                ["Customer", 2],
                ["Current Membership(s)", 1],
                ["Rounds", 1],
                ["Rewards Balance:", 1],
            ] as const
        ).map(([label, lines]) => (
            <Box key={label} sx={{ flex: 1, textAlign: "center" }}>
                <Typography sx={{ fontSize: 13, color: "rgba(255,255,255,0.9)" }}>{label}</Typography>
                {Array.from({ length: lines }, (_, index) => (
                    <Typography key={index} sx={{ fontSize: 13, color: "rgba(255,255,255,0.75)", letterSpacing: "0.1em" }}>
                        --------
                    </Typography>
                ))}
            </Box>
        ))}

        <Button
            disabled
            startIcon={<CheckIcon />}
            sx={{
                minWidth: 220,
                minHeight: 52,
                bgcolor: appColors.grey,
                "&.Mui-disabled": { bgcolor: appColors.grey, color: "#fff" },
            }}
        >
            Reserve
        </Button>
    </Box>
);

/** Cart + hourglass replace the account cluster on the detail screen's app bar. */
export const TeeTimeDetailTopRight = () => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 3, color: "#fff" }}>
        <ShoppingCartIcon sx={{ fontSize: 30 }} />
        <HourglassEmptyIcon sx={{ fontSize: 28 }} />
    </Box>
);

/** The scrolling body: search band, summary band, one card per reservation. */
export const TeeTimeDetailBody = ({
    detail,
    onAction,
}: {
    detail: TeeTimeDetail;
    onAction?: (action: PlayerAction, player: DetailPlayer) => void;
}) => (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100%", bgcolor: appColors.canvas }}>
        <CustomerSearchBand />
        <CustomerSummaryBand />

        <Box sx={{ p: 1, flex: 1 }}>
            {detail.players.map((player) => (
                <PlayerCard key={`${player.name}-${player.amount}`} player={player} onAction={onAction} />
            ))}
        </Box>
    </Box>
);
