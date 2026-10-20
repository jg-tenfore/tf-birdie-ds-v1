import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import SearchIcon from "@mui/icons-material/Search";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { customerFields, type Clinic, type ClinicSession } from "./clinic-data";

/**
 * **Clinics, as it ships.** Transcribed from `references/102026/`.
 *
 * Two screens sit between the Pro Shop grid and the ordinary checkout: a list
 * of clinics, and the one that does the work — a session picker with a customer
 * search under it.
 *
 * The flaws are reproduced rather than corrected, and called out in the story
 * notes beside each screen. The short version:
 *
 * - the listing card prints a bare number with no label;
 * - a full session is told apart from a bookable one by grey text and the word
 *   `(FULL)` inside the same chip, with the radio still drawn;
 * - the radio sits outside the chip's text block, overlapping the first
 *   character on the longer labels;
 * - the customer search has no required field, no result list in the capture,
 *   and no way to tell which combination of the six attaches a guest;
 * - nothing on either screen states the price, so the first time money appears
 *   is in the order panel after SAVE.
 */

/* ------------------------------------------------------------- the list */

/**
 * The clinic listing.
 *
 * One card on a grey canvas — the name, then the clinic's type and capacity as
 * two columns of plain text. The number is the capacity; the card does not say
 * so, and does not say how many of those places are left either.
 */
export const ClinicListCard = ({ clinic, onOpen }: { clinic: Clinic; onOpen?: () => void }) => (
    <Box
        onClick={onOpen}
        role={onOpen ? "button" : undefined}
        sx={{
            width: 305,
            bgcolor: appColors.surface,
            borderRadius: `${appRadius.card}px`,
            boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
            px: 2.5,
            py: 2,
            cursor: onOpen ? "pointer" : "default",
        }}
    >
        <Typography sx={{ fontSize: 20, fontWeight: 700, color: appColors.textPrimary, mb: 0.5 }}>{clinic.name}</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
            <Typography sx={{ fontSize: 17, color: appColors.textSecondary }}>{clinic.category}</Typography>
            <Typography sx={{ fontSize: 17, color: appColors.textSecondary }}>{clinic.capacity}</Typography>
        </Box>
    </Box>
);

export const ClinicList = ({ clinics, onOpen }: { clinics: Clinic[]; onOpen?: (clinic: Clinic) => void }) => (
    <Box sx={{ minHeight: "100%", bgcolor: appColors.canvas, p: 2 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            {clinics.map((clinic) => (
                <ClinicListCard key={clinic.name} clinic={clinic} onOpen={onOpen ? () => onOpen(clinic) : undefined} />
            ))}
        </Box>
    </Box>
);

/* --------------------------------------------------------- the sessions */

/**
 * One session chip.
 *
 * 160 × 72 on the device, five to a row. The radio is pinned to the left edge
 * of the chip rather than laid out with the label, so on a two-line date it
 * overlaps the first character — visible on `10/6/26 2:00 PM` in every capture.
 * That is reproduced here, not tidied.
 *
 * A chosen session swaps the radio for a green check and gains a green border.
 * A full one keeps its radio, greys its text and carries `(FULL)` inside the
 * same label — so the difference between "bookable" and "not" is a word at the
 * end of a date and a shade of grey.
 */
export const SessionChip = ({ session, selected, onToggle }: { session: ClinicSession; selected?: boolean; onToggle?: () => void }) => (
    <Box
        onClick={session.full ? undefined : onToggle}
        role={session.full ? undefined : "checkbox"}
        aria-checked={selected ?? false}
        aria-label={session.label}
        aria-disabled={session.full}
        sx={{
            position: "relative",
            width: 156,
            minHeight: 72,
            display: "grid",
            placeItems: "center",
            px: 2,
            py: 1,
            bgcolor: session.full ? "#F4F4F4" : appColors.surface,
            border: "1px solid",
            borderColor: selected ? appColors.green : appColors.divider,
            borderRadius: `${appRadius.card}px`,
            boxShadow: session.full ? "none" : "0 1px 2px rgba(0,0,0,0.12)",
            cursor: session.full ? "default" : "pointer",
        }}
    >
        {selected ? (
            <Box
                sx={{
                    position: "absolute",
                    left: 6,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 20,
                    height: 20,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: "50%",
                    bgcolor: appColors.green,
                }}
            >
                <CheckIcon sx={{ fontSize: 14, color: "#fff" }} />
            </Box>
        ) : (
            <Box
                sx={{
                    position: "absolute",
                    left: 6,
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    border: "1px solid",
                    borderColor: session.full ? appColors.greyLight : appColors.textSecondary,
                }}
            />
        )}

        <Typography
            sx={{
                fontSize: 19,
                lineHeight: 1.25,
                textAlign: "center",
                color: session.full ? appColors.textDisabled : appColors.textPrimary,
            }}
        >
            {session.label}
        </Typography>
    </Box>
);

/** The dark SELECT ALL button above the chips. It skips the full sessions. */
export const SelectAllButton = ({ onClick }: { onClick?: () => void }) => (
    <Button
        onClick={onClick}
        disableElevation
        startIcon={<CheckIcon />}
        sx={{
            minHeight: 48,
            px: 3,
            bgcolor: appColors.slate,
            color: "#fff",
            borderRadius: `${appRadius.button}px`,
            fontSize: 15,
            letterSpacing: "0.06em",
            "&:hover": { bgcolor: appColors.slateDark },
        }}
    >
        SELECT ALL
    </Button>
);

/** One MD2 filled field from the customer search. */
const CustomerField = ({ label, searchable }: { label: string; searchable: boolean }) => (
    <Box
        sx={{
            flex: "1 1 400px",
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            minHeight: 56,
            px: 2,
            bgcolor: appColors.fieldFill,
            borderBottom: "1px solid rgba(0,0,0,0.42)",
            borderRadius: `${appRadius.button}px ${appRadius.button}px 0 0`,
        }}
    >
        {searchable && <SearchIcon sx={{ fontSize: 22, color: appColors.textSecondary }} />}
        <Typography sx={{ fontSize: 18, color: appColors.textSecondary }}>{label}</Typography>
    </Box>
);

/**
 * The customer search.
 *
 * Six fields in two columns, below the sessions and below the fold — on the
 * 800px device the bottom row is cut off, which is how every capture shows it.
 * Nothing marks a required field and nothing says whether these search an
 * existing customer or create one.
 */
export const ClinicCustomerSearch = () => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, maxWidth: 880 }}>
        {customerFields.map((field) => (
            <CustomerField key={field.label} label={field.label} searchable={field.searchable} />
        ))}
    </Box>
);

/**
 * The clinic screen: SELECT ALL, the sessions, then the customer search.
 *
 * The whole screen is one scroll with no headings on either half, so the
 * relationship between the dates and the name fields underneath is left for the
 * operator to infer.
 */
export const ClinicSessionPicker = ({
    clinic,
    selected = [],
    onToggle,
    onSelectAll,
}: {
    clinic: Clinic;
    /** Session labels currently chosen. */
    selected?: string[];
    onToggle?: (label: string) => void;
    onSelectAll?: () => void;
}) => (
    <Box sx={{ minHeight: "100%", bgcolor: appColors.canvas, px: 3, py: 3 }}>
        <SelectAllButton onClick={onSelectAll} />

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2.5, maxWidth: 820 }}>
            {clinic.sessions.map((session) => (
                <SessionChip
                    key={session.label}
                    session={session}
                    selected={selected.includes(session.label)}
                    onToggle={() => onToggle?.(session.label)}
                />
            ))}
        </Box>

        <Box sx={{ mt: 7 }}>
            <ClinicCustomerSearch />
        </Box>
    </Box>
);

export default ClinicSessionPicker;
