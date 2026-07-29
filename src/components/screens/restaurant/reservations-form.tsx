import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import SearchIcon from "@mui/icons-material/Search";

import { appColors } from "@/theme/app-replica-tokens";

/**
 * Create a Reservation — the form behind ADD RESERVATION.
 *
 * The date is fixed by the band above; the form supplies time, party size,
 * notes, and a customer. The four customer fields are lookups against the golf
 * course customer record, which is why each carries a magnifier and why the
 * section is labelled with the resolved customer ID (0 until one is chosen).
 */

/** MD2 filled field: grey box, underline, placeholder only. */
const FilledField = ({ placeholder, icon }: { placeholder: string; icon?: boolean }) => (
    <Stack
        direction="row"
        spacing={1.5}
        sx={{
            flex: 1,
            minHeight: 54,
            px: 2,
            alignItems: "center",
            bgcolor: "#DEDEDE",
            borderBottom: "1px solid",
            borderColor: appColors.textSecondary,
        }}
    >
        {icon && <SearchIcon sx={{ fontSize: 22, color: appColors.textPrimary }} />}
        <Typography sx={{ fontSize: 17, color: appColors.textSecondary }}>{placeholder}</Typography>
    </Stack>
);

/** Time picker — underlined, value centered, caret outside the underline. */
const TimeField = ({ value }: { value: string }) => (
    <Stack direction="row" spacing={1} sx={{ flex: 1, alignItems: "flex-end" }}>
        <Box sx={{ flex: 1, borderBottom: "1px solid", borderColor: appColors.textPrimary, pb: 1 }}>
            <Typography sx={{ fontSize: 19, textAlign: "center" }}>{value}</Typography>
        </Box>
        <ArrowDropDownIcon sx={{ color: appColors.textPrimary }} />
    </Stack>
);

export const ReservationForm = ({ time = "12:00 PM", customerId = 0 }: { time?: string; customerId?: number }) => (
    <Box sx={{ px: 1, py: 2 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 1, alignItems: "flex-end" }}>
            <TimeField value={time} />
            <FilledField placeholder="Enter number of guests" />
        </Stack>

        <Stack direction="row" sx={{ mb: 3 }}>
            <FilledField placeholder="Enter notes (optional)" />
        </Stack>

        <Stack direction="row" spacing={3} sx={{ mb: 1.5, alignItems: "center" }}>
            <Typography sx={{ fontSize: 15, color: appColors.textPrimary }}>Customer Info --------</Typography>
            <Typography sx={{ fontSize: 15, color: appColors.textPrimary }}>Golf Course Customer ID {customerId}</Typography>
        </Stack>

        <Stack spacing={1}>
            <Stack direction="row" spacing={2}>
                <FilledField placeholder="First Name" icon />
                <FilledField placeholder="Last Name" icon />
            </Stack>
            <Stack direction="row" spacing={2}>
                <FilledField placeholder="Email" icon />
                <FilledField placeholder="Phone" icon />
            </Stack>
        </Stack>
    </Box>
);
