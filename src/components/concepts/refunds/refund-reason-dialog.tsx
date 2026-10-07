import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

import { appColors, appRadius } from "@/theme/app-replica-tokens";

/**
 * "Why are you issuing this refund?" — the last thing between the operator and
 * the money.
 *
 * Transcribed from `references/100626/`. A 470px sheet over a scrim: one
 * question, one underlined field, one green OK. Worth saying plainly what this
 * dialog is and is not.
 *
 * It is **not a confirmation.** It never repeats the amount, the tenders or the
 * item count, and OK is the only way out that the screenshots show — there is no
 * Cancel. The refund is already decided by the time it appears.
 *
 * The field is **free text with no suggestions and no apparent minimum**, so the
 * reason is only as good as what a counter types one-handed at a queue. If
 * refund reasons are ever going to be reported on, this is the screen that
 * decides whether that data is worth anything.
 *
 * And the colors are backwards from the action they confirm: the button that
 * commits a refund is green here, having been red on the screen behind it.
 */
export const RefundReasonDialog = ({
    value = "",
    onChange,
    onOk,
}: {
    value?: string;
    onChange?: (next: string) => void;
    onOk?: () => void;
}) => (
    <Box sx={{ width: 470, bgcolor: appColors.surface, px: 4, pt: 3.5, pb: 3 }}>
        <Typography sx={{ fontSize: 18, color: appColors.textPrimary, textAlign: "center", mb: 2.5 }}>
            Why are you issuing this refund?
        </Typography>

        <Box
            component="input"
            aria-label="Refund reason"
            value={value}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange?.(event.target.value)}
            sx={{
                display: "block",
                width: "100%",
                height: 40,
                mb: 3,
                px: 0,
                fontSize: 18,
                color: appColors.textPrimary,
                border: "none",
                borderBottom: "1px solid",
                borderColor: appColors.textPrimary,
                borderRadius: 0,
                outline: "none",
                bgcolor: "transparent",
            }}
        />

        <Button
            fullWidth
            disableElevation
            onClick={onOk}
            sx={{
                minHeight: 48,
                bgcolor: appColors.green,
                color: "#fff",
                borderRadius: `${appRadius.button}px`,
                fontSize: 15,
                letterSpacing: "0.08em",
                "&:hover": { bgcolor: appColors.greenDark },
            }}
        >
            OK
        </Button>
    </Box>
);

/** Full-bleed scrim the dialog sits on, matching the device's dim. */
export const DialogScrim = ({ children }: { children: React.ReactNode }) => (
    <Box
        sx={{
            position: "absolute",
            inset: 0,
            bgcolor: "rgba(0,0,0,0.5)",
            display: "grid",
            placeItems: "center",
            zIndex: 1300,
        }}
    >
        {children}
    </Box>
);

export default RefundReasonDialog;
