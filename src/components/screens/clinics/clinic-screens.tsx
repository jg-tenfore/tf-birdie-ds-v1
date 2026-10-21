import { useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import SearchIcon from "@mui/icons-material/Search";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { customerName, customerValueFor, demoCustomer, type DemoCustomer } from "./demo-customer";
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
 * 160 × 72 on the device, five to a row. The device pins the radio to the
 * chip's left edge and centres the label over the top of it, so on a two-line
 * date the circle sits under the first character — visible on `10/6/26 2:00 PM`
 * in every capture.
 *
 * **That overlap is corrected here**: the radio gets its own column and the
 * date reads left-aligned beside it. It is the one as-is detail this folder
 * does not reproduce, because it made the screen hard to read at a glance and
 * costs nothing to fix. Everything else is the device's — the `(FULL)` inside
 * the label, the grey, and the radio that a full session still draws.
 */
export const SessionChip = ({ session, selected, onToggle }: { session: ClinicSession; selected?: boolean; onToggle?: () => void }) => (
    <Box
        onClick={session.full ? undefined : onToggle}
        role={session.full ? undefined : "checkbox"}
        aria-checked={selected ?? false}
        aria-label={session.label}
        aria-disabled={session.full}
        sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            width: 160,
            minHeight: 76,
            px: 1.5,
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
                    flexShrink: 0,
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
                    flexShrink: 0,
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
                flex: 1,
                minWidth: 0,
                fontSize: 16,
                lineHeight: 1.3,
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
const CustomerField = ({
    label,
    searchable,
    value,
    onFill,
}: {
    label: string;
    searchable: boolean;
    /** What the found record puts here, if one has been found. */
    value?: string;
    onFill?: () => void;
}) => (
    <Box
        onClick={value ? undefined : onFill}
        role={value || !onFill ? undefined : "button"}
        aria-label={value ? `${label}: ${value}` : `${label} — tap to look up a customer`}
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
            cursor: !value && onFill ? "pointer" : "default",
        }}
    >
        {searchable && !value && <SearchIcon sx={{ fontSize: 22, color: appColors.textSecondary }} />}
        <Box sx={{ minWidth: 0 }}>
            {value && <Typography sx={{ fontSize: 12, color: appColors.textSecondary, lineHeight: 1.2 }}>{label}</Typography>}
            <Typography sx={{ fontSize: 18, color: value ? appColors.textPrimary : appColors.textSecondary }} noWrap>
                {value || label}
            </Typography>
        </Box>
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
export const ClinicCustomerSearch = ({ customerIndex = 0 }: { customerIndex?: number }) => {
    /*
     * Tapping any one of the six stands in for the lookup the device would do,
     * and fills all of them — an empty form is the one state of this screen
     * nobody needs to review.
     */
    const [found, setFound] = useState<DemoCustomer | null>(null);

    return (
        <Box sx={{ maxWidth: 880 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
                {customerFields.map((field) => (
                    <CustomerField
                        key={field.label}
                        label={field.label}
                        searchable={field.searchable}
                        value={found ? customerValueFor(found, field.label) : undefined}
                        onFill={() => setFound(demoCustomer(customerIndex))}
                    />
                ))}
            </Box>

            {found && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mt: 1.5 }}>
                    <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>Found {customerName(found)}</Typography>
                    <Typography
                        onClick={() => setFound(null)}
                        role="button"
                        sx={{ fontSize: 14, letterSpacing: "0.06em", color: appColors.textSecondary, cursor: "pointer" }}
                    >
                        CLEAR
                    </Typography>
                </Box>
            )}
        </Box>
    );
};

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

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 2.5, maxWidth: 840 }}>
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
