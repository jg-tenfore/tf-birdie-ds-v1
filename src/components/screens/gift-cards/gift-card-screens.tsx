import { useState, type ReactNode } from "react";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import EmailIcon from "@mui/icons-material/Email";
import ErrorIcon from "@mui/icons-material/Error";
import PhoneIcon from "@mui/icons-material/Phone";
import SearchIcon from "@mui/icons-material/Search";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { touchTarget } from "@/theme/tokens";
import {
    defaultExpiration,
    giftCardTypes,
    spendCategories,
    upcDialog,
    type CustomerResult,
    type GiftCardParty,
    type GiftCardType,
} from "./gift-card-data";

/**
 * **Create a Gift Card, as it ships.**
 *
 * One canvas, five jobs: how much, which barcode, what kind, who from, who to.
 * The flaws are reproduced rather than corrected and named in the story notes;
 * the short version is that the biggest control on the screen has no label and
 * the smallest decision — four category switches — has no explanation.
 */

/* -------------------------------------------------------------- the fields */

/**
 * The amount.
 *
 * A white box on a grey canvas, the only white field on the screen, taller than
 * everything else and captioned by nothing at all. Tapping it draws an orange
 * focus ring and raises the number keypad.
 */
export const AmountField = ({ value, focused, onTap }: { value?: string; focused?: boolean; onTap?: () => void }) => (
    <Box
        onClick={onTap}
        role={onTap ? "button" : undefined}
        aria-label={value ? `Amount ${value}` : "Amount — the device prints no label here"}
        sx={{
            display: "grid",
            placeItems: "center",
            minHeight: 76,
            px: 2,
            bgcolor: appColors.surface,
            borderRadius: `${appRadius.card}px`,
            border: "2px solid",
            borderColor: focused ? appColors.orange : "transparent",
            cursor: onTap ? "pointer" : "default",
        }}
    >
        <Typography sx={{ fontSize: 26, color: appColors.textPrimary }}>{value}</Typography>
    </Box>
);

/** A filled MD2 field. `searchable` draws the magnifier the device draws. */
export const GiftCardField = ({
    label,
    value,
    searchable = true,
    error,
    active,
    onTap,
}: {
    label: string;
    value?: string;
    searchable?: boolean;
    /** The red glyph the TO block shows while a record is being chosen. */
    error?: boolean;
    /** The focused field keeps a dark underline. */
    active?: boolean;
    onTap?: () => void;
}) => (
    <Box
        onClick={onTap}
        role={onTap ? "button" : undefined}
        aria-label={value ? `${label}: ${value}` : `${label} — tap to look up a customer`}
        sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            minHeight: 60,
            px: 2,
            bgcolor: appColors.fieldFill,
            borderBottom: active ? "2px solid" : "1px solid rgba(0,0,0,0.42)",
            borderColor: active ? appColors.textPrimary : undefined,
            borderRadius: `${appRadius.button}px ${appRadius.button}px 0 0`,
            cursor: onTap ? "pointer" : "default",
        }}
    >
        {searchable && <SearchIcon sx={{ fontSize: 22, color: appColors.textSecondary, flexShrink: 0 }} />}
        <Box sx={{ flex: 1, minWidth: 0 }}>
            {value && <Typography sx={{ fontSize: 13, color: appColors.textSecondary, lineHeight: 1.2 }}>{label}</Typography>}
            <Typography sx={{ fontSize: 19, color: value ? appColors.textPrimary : appColors.textSecondary }} noWrap>
                {value || label}
            </Typography>
        </Box>
        {error && <ErrorIcon sx={{ fontSize: 24, color: appColors.red, flexShrink: 0 }} />}
    </Box>
);

/**
 * The autocomplete sheet.
 *
 * A white card of raw records, each a name over whichever of email and phone
 * the row happens to hold. Nothing orders them, nothing tells two Westons
 * apart, and the bare `(tr456)` above the first row is unexplained on screen.
 */
export const CustomerResults = ({ results, onPick }: { results: CustomerResult[]; onPick?: (result: CustomerResult) => void }) => (
    <Box
        sx={{
            bgcolor: appColors.surface,
            boxShadow: "0 4px 14px rgba(0,0,0,0.26)",
            maxHeight: 420,
            overflowY: "auto",
        }}
    >
        {results.map((result) => (
            <Box
                key={result.name}
                onClick={() => onPick?.(result)}
                role={onPick ? "button" : undefined}
                sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom: "1px solid",
                    borderColor: appColors.divider,
                    cursor: onPick ? "pointer" : "default",
                    "&:hover": onPick ? { bgcolor: appColors.canvas } : undefined,
                }}
            >
                {result.tag && (
                    <Typography sx={{ fontSize: 15, fontStyle: "italic", color: appColors.textPrimary }}>{result.tag}</Typography>
                )}
                <Typography sx={{ fontSize: 18, fontWeight: 700, color: appColors.textPrimary }}>{result.name}</Typography>
                {result.email && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <EmailIcon sx={{ fontSize: 18, color: appColors.green }} />
                        <Typography sx={{ fontSize: 16, color: appColors.textPrimary }}>{result.email}</Typography>
                    </Box>
                )}
                {result.phone && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <PhoneIcon sx={{ fontSize: 18, color: appColors.green }} />
                        <Typography sx={{ fontSize: 16, color: appColors.textPrimary }}>{result.phone}</Typography>
                    </Box>
                )}
            </Box>
        ))}
    </Box>
);

/* --------------------------------------------------------------- the parts */

/** `Gift Card FROM ——— Golf Course Customer ID 0`, as the device writes it. */
const PartyHeading = ({ which, party }: { which: "FROM" | "TO"; party?: GiftCardParty }) => (
    /*
     * The device fits this on one line. At 1280 with the order panel taking its
     * third it does not always, so it is allowed to wrap rather than truncate —
     * the customer ID is the one number on this screen worth reading twice.
     */
    <Box sx={{ display: "flex", alignItems: "baseline", flexWrap: "wrap", columnGap: 1.5, minHeight: 36, minWidth: 0 }}>
        <Typography sx={{ fontSize: 17, color: appColors.textPrimary }}>Gift Card {which}</Typography>
        <Typography sx={{ fontSize: 17, color: appColors.textSecondary }}>{party ? party.accountName : "--------"}</Typography>
        <Typography sx={{ fontSize: 17, color: appColors.textPrimary }}>Golf Course Customer ID</Typography>
        <Typography sx={{ fontSize: 17, color: appColors.textSecondary }}>{party ? party.customerId : "0"}</Typography>
    </Box>
);

/** The dark `Same as From` copy button, sitting where a secondary action goes. */
const SameAsFrom = ({ onClick }: { onClick?: () => void }) => (
    <Box
        onClick={onClick}
        role={onClick ? "button" : undefined}
        sx={{
            display: "grid",
            placeItems: "center",
            minHeight: 56,
            bgcolor: appColors.slate,
            borderRadius: `${appRadius.button}px`,
            cursor: onClick ? "pointer" : "default",
        }}
    >
        <Typography sx={{ fontSize: 21, color: "#fff" }}>Same as From</Typography>
    </Box>
);

/** The type dropdown. The captures never open it; both options are here. */
const TypeSelect = ({ value, onChange }: { value: GiftCardType; onChange?: (type: GiftCardType) => void }) => {
    const [anchor, setAnchor] = useState<HTMLElement | null>(null);

    return (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>
            <Typography sx={{ fontSize: 18, color: appColors.textSecondary }}>Gift Card Type</Typography>
            <Box
                onClick={(event) => onChange && setAnchor(event.currentTarget)}
                role={onChange ? "button" : undefined}
                aria-label={`Gift Card Type: ${value}`}
                sx={{ display: "flex", alignItems: "center", minHeight: touchTarget.min, cursor: onChange ? "pointer" : "default" }}
            >
                <Typography sx={{ fontSize: 19, color: appColors.textPrimary }}>{value}</Typography>
                <ArrowDropDownIcon sx={{ color: appColors.textSecondary }} />
            </Box>
            <Menu
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => setAnchor(null)}
                slotProps={{ paper: { sx: { borderRadius: 0, minWidth: 300 } }, list: { sx: { py: 0 } } }}
            >
                {giftCardTypes.map((type) => (
                    <MenuItem
                        key={type}
                        selected={type === value}
                        onClick={() => {
                            onChange?.(type);
                            setAnchor(null);
                        }}
                        sx={{ minHeight: 64, px: 3, fontSize: 19 }}
                    >
                        {type}
                    </MenuItem>
                ))}
            </Menu>
        </Box>
    );
};

/**
 * **The dialog SAVE opens.**
 *
 * It fires when the optional UPC box was left empty — which is every time, on
 * a screen that calls the field optional — and it explains a server behaviour
 * rather than asking a question. CANCEL is red and OK is green, so the safe
 * action is the one painted like a warning.
 */
export const UpcDialog = ({ onCancel, onConfirm }: { onCancel?: () => void; onConfirm?: () => void }) => (
    <Box sx={{ position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,0.5)", display: "grid", placeItems: "center", zIndex: 30 }}>
        <Box sx={{ width: 660, bgcolor: appColors.surface, px: 4, py: 3.5 }}>
            <Typography sx={{ fontSize: 22, color: appColors.textPrimary, mb: 1.5 }}>{upcDialog.title}</Typography>
            <Typography sx={{ fontSize: 17, color: appColors.textSecondary, lineHeight: 1.5, mb: 3 }}>{upcDialog.body}</Typography>

            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>
                <Box
                    onClick={onCancel}
                    role={onCancel ? "button" : undefined}
                    sx={{ display: "grid", placeItems: "center", minHeight: touchTarget.min, px: 2.5, cursor: "pointer" }}
                >
                    <Typography sx={{ fontSize: 17, letterSpacing: "0.06em", color: appColors.red }}>{upcDialog.cancel}</Typography>
                </Box>
                <Box
                    onClick={onConfirm}
                    role={onConfirm ? "button" : undefined}
                    sx={{ display: "grid", placeItems: "center", minHeight: touchTarget.min, px: 2.5, cursor: "pointer" }}
                >
                    <Typography sx={{ fontSize: 17, letterSpacing: "0.06em", color: appColors.green }}>{upcDialog.confirm}</Typography>
                </Box>
            </Box>
        </Box>
    </Box>
);

/* -------------------------------------------------------------- the screen */

export interface CreateGiftCardProps {
    amount?: string;
    amountFocused?: boolean;
    type?: GiftCardType;
    from?: GiftCardParty;
    to?: GiftCardParty;
    /** A result sheet hanging under one of the eight fields. */
    results?: { field: string; items: CustomerResult[] };
    /** Which field keeps the dark underline. */
    activeField?: string;
    /** The TO block's red glyphs, which the device shows mid-search. */
    showToErrors?: boolean;
    onAmount?: () => void;
    onType?: (type: GiftCardType) => void;
    onField?: (field: string) => void;
    onPick?: (result: CustomerResult) => void;
    onSameAsFrom?: () => void;
    /** Rendered above the canvas — the UPC dialog, in the flow. */
    overlay?: ReactNode;
}

export const CreateGiftCard = ({
    amount,
    amountFocused,
    type = giftCardTypes[0],
    from,
    to,
    results,
    activeField,
    showToErrors,
    onAmount,
    onType,
    onField,
    onPick,
    onSameAsFrom,
}: CreateGiftCardProps) => {
    /** A field, plus the result sheet when this is the one being searched. */
    const field = (key: string, label: string, value?: string, error?: boolean) => (
        <Box sx={{ position: "relative" }}>
            <GiftCardField
                label={label}
                value={value}
                error={error}
                active={activeField === key}
                onTap={onField ? () => onField(key) : undefined}
            />
            {results?.field === key && (
                <Box sx={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20 }}>
                    <CustomerResults results={results.items} onPick={onPick} />
                </Box>
            )}
        </Box>
    );

    return (
        <Box sx={{ minHeight: "100%", bgcolor: appColors.canvas, px: 3, py: 2, pb: 3 }}>
            <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", columnGap: 3, rowGap: 1.5 }}>
                <AmountField value={amount} focused={amountFocused} onTap={onAmount} />
                <GiftCardField label="Enter UPC Code (optional)" searchable={false} />

                <TypeSelect value={type} onChange={onType} />
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 2 }}>
                    <Typography sx={{ fontSize: 18, color: appColors.textSecondary }}>Expiration Date</Typography>
                    {/* Ninety-six years out, and the device's own default. */}
                    <Box sx={{ px: 2.5, py: 1.5, bgcolor: appColors.slate, borderRadius: `${appRadius.button}px` }}>
                        <Typography sx={{ fontSize: 17, letterSpacing: "0.06em", color: "#fff" }}>{defaultExpiration}</Typography>
                    </Box>
                </Box>

                <Box sx={{ gridColumn: "1 / -1" }}>
                    <PartyHeading which="FROM" party={from} />
                </Box>
                {field("from-first", "First Name", from?.first)}
                {field("from-last", "Last Name", from?.last)}
                {field("from-email", "Email", from?.email)}
                {field("from-phone", "Phone", from?.phone)}

                <PartyHeading which="TO" party={to} />
                <SameAsFrom onClick={onSameAsFrom} />

                {field("to-first", "First Name", to?.first)}
                {field("to-last", "Last Name", to?.last)}
                {field("to-email", "Email", to?.email, showToErrors && !to)}
                {field("to-phone", "Phone", to?.phone, showToErrors && !to)}

                {/* Four switches, all on, with nothing on screen about what
                    turning one off would stop the card paying for. */}
                <Box sx={{ gridColumn: "1 / -1", display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
                    {spendCategories.map((category) => (
                        <Box key={category} sx={{ display: "flex", alignItems: "center", flex: "1 1 0", minWidth: 0 }}>
                            <Checkbox checked readOnly slotProps={{ input: { "aria-label": category } }} sx={{ p: 1 }} />
                            <Typography sx={{ fontSize: 17, color: appColors.textPrimary }} noWrap>
                                {category}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

export default CreateGiftCard;
