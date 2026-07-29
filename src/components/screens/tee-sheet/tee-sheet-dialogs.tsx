import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Typography from "@mui/material/Typography";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { reservationHistory } from "./tee-sheet-data";

/**
 * The three dialogs reachable from a tee time.
 *
 * All are modal, all dim the screen behind them to near-black, and none of them
 * can be dismissed by tapping outside — every one carries an explicit button.
 * Their headers are inconsistent in the shipping app: History gets a solid navy
 * title bar, while the notes dialogs use a plain left-aligned label. That is
 * reproduced rather than harmonised.
 */

/** History — an append-only audit log for one reservation ID. */
export const ReservationHistoryDialog = ({ open = true }: { open?: boolean }) => (
    <Dialog open={open} maxWidth={false} slotProps={{ paper: { sx: { width: 700, borderRadius: `${appRadius.card}px` } } }}>
        <Box sx={{ bgcolor: appColors.navy, color: "#fff", textAlign: "center", py: 2 }}>
            <Typography sx={{ fontSize: 24 }}>Reservation History {reservationHistory.id}</Typography>
        </Box>

        {/* The body keeps its full height even with a single entry. */}
        <Box sx={{ minHeight: 320, px: 1 }}>
            {reservationHistory.entries.map((entry) => (
                <Box
                    key={entry.when}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        py: 1.5,
                        borderBottom: `1px solid ${appColors.textPrimary}`,
                    }}
                >
                    <Typography sx={{ flex: 1, fontSize: 14, pl: 1 }}>{entry.when}</Typography>
                    <Typography sx={{ flex: 1, fontSize: 14, textAlign: "center" }}>{entry.who}</Typography>
                    <Typography sx={{ flex: 1.4, fontSize: 14, textAlign: "center" }}>{entry.what}</Typography>
                </Box>
            ))}
        </Box>

        <Box sx={{ p: 1 }}>
            <Button fullWidth sx={{ minHeight: 60, bgcolor: appColors.green, "&:hover": { bgcolor: appColors.greenDark } }}>
                OK
            </Button>
        </Box>
    </Dialog>
);

/**
 * Customer Notes / Group Notes — the same dialog with a different title.
 *
 * Both buttons are slate: the app does not treat Save here as the confirming
 * action, so Cancel and Save carry identical weight.
 */
export const NotesDialog = ({ title, open = true }: { title: "Customer Notes" | "Group Notes"; open?: boolean }) => (
    <Dialog open={open} maxWidth={false} slotProps={{ paper: { sx: { width: 740, borderRadius: `${appRadius.card}px`, p: 2 } } }}>
        <Typography sx={{ fontSize: 20, color: appColors.textPrimary, pb: 1.5 }}>{title}</Typography>

        <Box sx={{ bgcolor: "#E0E0E0", borderBottom: `1px solid ${appColors.textSecondary}`, px: 2, py: 3, minHeight: 130 }}>
            <Typography sx={{ fontSize: 21, color: appColors.textSecondary }}>Enter notes for this customer</Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1, pt: 1.5 }}>
            <Button color="secondary" sx={{ flex: 1, minHeight: 56 }}>
                Cancel
            </Button>
            <Button color="secondary" sx={{ flex: 1, minHeight: 56 }}>
                Save
            </Button>
        </Box>
    </Dialog>
);

/**
 * Tee Time Notes — attached to the time itself rather than to a player, which
 * is why it is reached from the bottom bar and has no Cancel.
 */
export const TeeTimeNotesDialog = ({ open = true }: { open?: boolean }) => (
    <Dialog open={open} maxWidth={false} slotProps={{ paper: { sx: { width: 550, borderRadius: `${appRadius.card}px`, p: 2.5 } } }}>
        <Typography sx={{ fontSize: 20, color: appColors.textPrimary, pb: 3 }}>Tee Time Notes</Typography>

        <Box sx={{ borderBottom: `1px solid ${appColors.textSecondary}`, pb: 1, mb: 4 }}>
            <Typography sx={{ fontSize: 21, color: appColors.textSecondary }}>Enter notes for this tee time</Typography>
        </Box>

        <Button color="secondary" fullWidth sx={{ minHeight: 56 }}>
            Save
        </Button>
    </Dialog>
);
