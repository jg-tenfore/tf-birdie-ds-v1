import type { ReactNode } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";

import { appColors, appRadius } from "@/theme/app-replica-tokens";

/**
 * MAKE A NEW RESERVATION — the sheet the Bay Sheet's NEW BOOKING button opens.
 *
 * From `references/072926/4-baysheet/`. It is a near-full-bleed white panel
 * over a heavily dimmed sheet, not a centered MD dialog. Every editable value
 * except the three name/email fields is a tap target rendered as blue-grey
 * text, with bare `-` / `+` steppers on either side of the numeric ones.
 */

/** The blue-grey used for every tappable value in this sheet. */
const linkColor = "#5E7794";
/** CANCEL is a muted slate-blue rather than the app's usual slate. */
const cancelColor = "#64789B";

const Field = ({ placeholder }: { placeholder: string }) => (
    <Box
        sx={{
            flex: 1,
            minWidth: 0,
            height: 50,
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1.5,
            border: "1px solid",
            borderColor: "#2F3338",
            borderRadius: `${appRadius.button}px`,
        }}
    >
        <Typography sx={{ flex: 1, fontSize: 15, color: appColors.textSecondary }}>{placeholder}</Typography>
        <SearchIcon sx={{ fontSize: 22, color: appColors.textPrimary }} />
    </Box>
);

const LabelledValue = ({ label, children }: { label: string; children: ReactNode }) => (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
        <Typography sx={{ fontSize: 15, color: appColors.textPrimary }}>{label}</Typography>
        {children}
    </Stack>
);

const LinkValue = ({ children }: { children: ReactNode }) => (
    <Typography sx={{ fontSize: 18, fontWeight: 700, color: linkColor }}>{children}</Typography>
);

/** A `- value +` stepper. The steps are bare text, not buttons with chrome. */
const Stepper = ({ value, decrement = "-", increment = "+" }: { value: string; decrement?: string; increment?: string }) => (
    <Stack direction="row" spacing={4} sx={{ alignItems: "center" }}>
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: appColors.textPrimary }}>{decrement}</Typography>
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: appColors.textPrimary }}>{value}</Typography>
        <Typography sx={{ fontSize: 18, fontWeight: 700, color: appColors.textPrimary }}>{increment}</Typography>
    </Stack>
);

export interface NewReservationDialogProps {
    bay?: string;
    partySize?: number;
    fee?: string;
    startAt?: string;
    /** Minutes. The steppers on either side move it in 15-minute jumps. */
    duration?: number;
    date?: string;
}

export const NewReservationDialog = ({
    bay = "Red Bay",
    partySize = 1,
    fee = "Sim Hour",
    startAt = "11:30 AM",
    duration = 90,
    date = "Tuesday, May 12",
}: NewReservationDialogProps) => (
    <Box
        role="dialog"
        aria-label="Make a new reservation"
        sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.88)", zIndex: 10, display: "flex" }}
    >
        <Box
            sx={{
                position: "absolute",
                inset: "9% 4% 11% 3%",
                bgcolor: appColors.surface,
                display: "flex",
                flexDirection: "column",
                px: "21px",
                pt: "24px",
                pb: "21px",
            }}
        >
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: appColors.textPrimary, mb: 3.5 }}>MAKE A NEW RESERVATION</Typography>

            {/* Row 1 spreads across most of the panel; row 2 runs tight left. */}
            <Stack
                direction="row"
                sx={{ alignItems: "center", justifyContent: "space-between", maxWidth: "84%", mb: 3, flexWrap: "wrap", rowGap: 2 }}
            >
                <LabelledValue label="Bay:">
                    <LinkValue>{bay}</LinkValue>
                </LabelledValue>
                <LabelledValue label="Party Size:">
                    <Stepper value={String(partySize)} />
                </LabelledValue>
                <LabelledValue label="Fee:">
                    <LinkValue>{fee}</LinkValue>
                </LabelledValue>
            </Stack>

            <Stack direction="row" spacing={5} sx={{ alignItems: "center", mb: 3, flexWrap: "wrap", rowGap: 2 }}>
                <LabelledValue label="Start at:">
                    <Stepper value={startAt} />
                </LabelledValue>
                <LabelledValue label="Duration:">
                    <Stepper value={String(duration)} decrement="-15" increment="+15" />
                </LabelledValue>
                <LabelledValue label="Date:">
                    <LinkValue>{date}</LinkValue>
                </LabelledValue>
            </Stack>

            <Stack direction="row" spacing={1.5} sx={{ mb: 1.5 }}>
                <Field placeholder="First Name" />
                <Field placeholder="Last Name" />
            </Stack>
            <Stack direction="row">
                <Field placeholder="Email" />
            </Stack>

            <Box sx={{ flex: 1 }} />

            <Stack direction="row" spacing={1.5}>
                <Button
                    disableElevation
                    sx={{ flex: 1, minHeight: 52, bgcolor: cancelColor, color: "#fff", "&:hover": { bgcolor: "#586A89" } }}
                >
                    Cancel
                </Button>
                <Button
                    disableElevation
                    sx={{
                        flex: 1,
                        minHeight: 52,
                        bgcolor: appColors.greenDark,
                        color: "#fff",
                        "&:hover": { bgcolor: appColors.greenTee },
                    }}
                >
                    Create
                </Button>
            </Stack>
        </Box>
    </Box>
);

export default NewReservationDialog;
