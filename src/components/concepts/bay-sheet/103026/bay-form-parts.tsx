import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { appColors } from "@/theme/app-replica-tokens";
import { touchTarget } from "@/theme/tokens";
import {
    DAILY_LIMIT,
    bayById,
    bays,
    fmtDuration,
    fmtTime,
    punchesNeeded,
    repeatLabels,
    searchBayCustomers,
    usd,
    type BayBlock,
    type BayCustomer,
    type RepeatFreq,
    type Reservation,
} from "./bay-data";

/**
 * **The controls the booking and details screens share.**
 *
 * Both screens ask the same questions — who, how long, how many, which bay,
 * does it repeat, what does it cost — so they ask them with the same parts,
 * and the two screens differ only in what they do with the answers.
 *
 * ## Nov 1 — the field shell
 *
 * These were MD2 filled fields: grey block, dark underline, label floating
 * above. They are now **outlined cards with the label inside**, which is the
 * layout Justin asked for.
 *
 * The departure is deliberate and it is only here. The rest of the replica is
 * Material Design 2 because the shipping Android app is, and `appRadius.card`
 * is 4px for that reason — but a dialog that asks eight questions reads far
 * better when every answer sits in its own bordered box, and nothing about a
 * bordered box is un-Material. Two local constants below are the whole of the
 * difference; everything else still comes from `appColors`.
 */

/** The field border and corner. Local on purpose — see the note above. */
export const FIELD_BORDER = "#D5DAE0";
export const FIELD_RADIUS = 8;

/* ------------------------------------------------------------ the heading */

export const DialogHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <Box sx={{ flexShrink: 0, bgcolor: appColors.navy, color: "#fff", px: 3, py: 2 }}>
        <Typography sx={{ fontSize: 22 }}>{title}</Typography>
        {subtitle && <Typography sx={{ fontSize: 15, color: "rgba(255,255,255,0.78)" }}>{subtitle}</Typography>}
    </Box>
);

/**
 * The heading above a group of fields — *Billing details* in the reference.
 *
 * It takes a `hint`, because the one thing the reference layout does that the
 * old one did not is explain a group before asking about it.
 */
export const SectionTitle = ({ children, hint }: { children: React.ReactNode; hint?: string }) => (
    <Box sx={{ mb: 1.5 }}>
        <Typography sx={{ fontSize: 17, fontWeight: 600, color: appColors.textPrimary }}>{children}</Typography>
        {hint && <Typography sx={{ fontSize: 14, lineHeight: 1.45, color: appColors.textSecondary, mt: 0.5 }}>{hint}</Typography>}
    </Box>
);

/** Kept for the few places that want a bare label outside a shell. */
export const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <Typography sx={{ fontSize: 13, letterSpacing: "0.08em", color: appColors.textSecondary, mb: 0.75 }}>{children}</Typography>
);

/* --------------------------------------------------------- the field shell */

/**
 * **One bordered box, label inside, value under it.**
 *
 * Every question in the three dialogs is asked in one of these, so a dialog
 * reads as a column of equal boxes rather than as a pile of different
 * controls. `trailing` is the chevron on a dropdown or the info mark on a
 * field that needs one.
 */
export const FieldShell = ({
    label,
    hint,
    trailing,
    tone = "default",
    align = "center",
    children,
}: {
    label: string;
    hint?: string;
    trailing?: React.ReactNode;
    tone?: "default" | "error";
    /** `start` for a tall field — the note — so the label stays at the top. */
    align?: "center" | "start";
    children: React.ReactNode;
}) => (
    <Box>
        <Box
            sx={{
                display: "flex",
                alignItems: align === "center" ? "center" : "flex-start",
                gap: 1.5,
                minHeight: 72,
                px: 2,
                py: 1.25,
                bgcolor: appColors.surface,
                border: "1px solid",
                borderColor: tone === "error" ? appColors.red : FIELD_BORDER,
                borderRadius: `${FIELD_RADIUS}px`,
            }}
        >
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography component="span" sx={{ display: "block", fontSize: 13, color: appColors.textSecondary, mb: 0.4 }}>
                    {label}
                </Typography>
                {children}
            </Box>
            {trailing && <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center", pt: align === "start" ? 1 : 0 }}>{trailing}</Box>}
        </Box>
        {hint && (
            <Typography sx={{ fontSize: 13.5, lineHeight: 1.45, color: appColors.textSecondary, mt: 0.75, px: 0.5 }}>{hint}</Typography>
        )}
    </Box>
);

/** A row of fields that share a line, as the reference pairs them two across. */
export const FieldRow = ({ children, columns = 2 }: { children: React.ReactNode; columns?: number }) => (
    <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 2 }}>{children}</Box>
);

/* ------------------------------------------------------------ the dropdown */

export interface SelectOption {
    value: string;
    label: string;
    /** A colour swatch before the label — the bays use it. */
    dot?: string;
    caption?: string;
}

/** The reference's dropdown: label inside the box, value below, chevron right. */
export const SelectField = ({
    label,
    value,
    options,
    onChange,
    hint,
    ariaLabel,
}: {
    label: string;
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
    hint?: string;
    ariaLabel?: string;
}) => {
    const chosen = options.find((option) => option.value === value);

    return (
        <FieldShell label={label} hint={hint} trailing={<ExpandMoreIcon sx={{ fontSize: 26, color: appColors.textSecondary }} />}>
            <Select
                value={chosen ? value : ""}
                onChange={(event) => onChange(String(event.target.value))}
                variant="standard"
                fullWidth
                IconComponent={() => null}
                inputProps={{ "aria-label": ariaLabel ?? label }}
                MenuProps={{ slotProps: { paper: { sx: { mt: 0.5, borderRadius: `${FIELD_RADIUS}px`, maxHeight: 420 } } } }}
                renderValue={(raw) => {
                    const option = options.find((candidate) => candidate.value === raw);
                    if (!option) return null;

                    return (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
                            {option.dot && <Box sx={{ flexShrink: 0, width: 12, height: 12, borderRadius: "50%", bgcolor: option.dot }} />}
                            <Typography component="span" sx={{ fontSize: 18, color: appColors.textPrimary, minWidth: 0 }} noWrap>
                                {option.label}
                            </Typography>
                        </Box>
                    );
                }}
                sx={{
                    "&::before, &::after": { display: "none" },
                    "& .MuiSelect-select": {
                        p: 0,
                        minHeight: "0 !important",
                        bgcolor: "transparent !important",
                        display: "flex",
                        alignItems: "center",
                    },
                }}
            >
                {options.map((option) => (
                    <MenuItem key={option.value} value={option.value} sx={{ minHeight: touchTarget.min, gap: 1.25, fontSize: 17 }}>
                        {option.dot && <Box sx={{ flexShrink: 0, width: 12, height: 12, borderRadius: "50%", bgcolor: option.dot }} />}
                        <Box sx={{ minWidth: 0 }}>
                            {option.label}
                            {option.caption && (
                                <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{option.caption}</Typography>
                            )}
                        </Box>
                    </MenuItem>
                ))}
            </Select>
        </FieldShell>
    );
};

/* ------------------------------------------------------------ the steppers */

const StepButton = ({ sign, onClick, disabled, label }: { sign: "−" | "+"; onClick: () => void; disabled: boolean; label: string }) => (
    <ButtonBase
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        sx={{
            flexShrink: 0,
            width: touchTarget.min,
            height: touchTarget.min,
            borderRadius: `${FIELD_RADIUS}px`,
            border: "1px solid",
            borderColor: FIELD_BORDER,
            bgcolor: appColors.surface,
            fontSize: 24,
            lineHeight: 1,
            color: appColors.textPrimary,
            "&.Mui-disabled": { color: appColors.textDisabled },
        }}
    >
        {sign}
    </ButtonBase>
);

/** One control for both minutes and people; they differ only in their step. */
export const Stepper = ({
    value,
    onChange,
    step = 1,
    min = 1,
    max = 99,
    format,
    label,
    fullWidth = false,
}: {
    value: number;
    onChange: (value: number) => void;
    step?: number;
    min?: number;
    max?: number;
    format?: (value: number) => string;
    label: string;
    /** Pushes the two keys to the ends of the row and centres the value. */
    fullWidth?: boolean;
}) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: fullWidth ? "100%" : "auto" }}>
        <StepButton sign="−" label={`Less ${label}`} disabled={value <= min} onClick={() => onChange(Math.max(min, value - step))} />
        <Typography
            sx={{
                flex: fullWidth ? 1 : "0 0 auto",
                minWidth: 92,
                textAlign: "center",
                fontSize: 20,
                color: appColors.textPrimary,
            }}
        >
            {format ? format(value) : value}
        </Typography>
        <StepButton sign="+" label={`More ${label}`} disabled={value >= max} onClick={() => onChange(Math.min(max, value + step))} />
    </Box>
);

/** A stepper in a field shell, which is how the dialogs use it. */
export const StepperField = ({
    label,
    hint,
    fullWidth = true,
    ...stepper
}: {
    label: string;
    hint?: string;
    fullWidth?: boolean;
    value: number;
    onChange: (value: number) => void;
    step?: number;
    min?: number;
    max?: number;
    format?: (value: number) => string;
    ariaLabel: string;
}) => (
    <FieldShell label={label} hint={hint}>
        <Stepper {...stepper} label={stepper.ariaLabel} fullWidth={fullWidth} />
    </FieldShell>
);

/* ------------------------------------------------------------- the inputs */

/** A single-line text field — the block's reason. */
export const TextInputField = ({
    label,
    value,
    onChange,
    placeholder,
    hint,
    tone,
}: {
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    hint?: string;
    tone?: "default" | "error";
}) => (
    <FieldShell label={label} hint={hint} tone={tone}>
        <Box
            component="input"
            value={value}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
            placeholder={placeholder}
            aria-label={label}
            sx={{
                display: "block",
                width: "100%",
                p: 0,
                border: "none",
                outline: "none",
                bgcolor: "transparent",
                fontFamily: "inherit",
                fontSize: 18,
                color: appColors.textPrimary,
                "&::placeholder": { color: appColors.textSecondary },
            }}
        />
    </FieldShell>
);

/**
 * **The note.**
 *
 * Six rows rather than two. Requirement 4 puts notes on the sheet itself, so
 * the thing staff type here is read by everyone all day — *"Birthday — needs
 * the big screen and two extra chairs"* does not fit in two rows, and a field
 * that hides what you wrote invites the shorter, less useful note.
 */
export const NoteField = ({
    value,
    onChange,
    label = "Note",
    placeholder = "Anything the staff should know",
    rows = 6,
}: {
    value: string;
    onChange: (value: string) => void;
    label?: string;
    placeholder?: string;
    rows?: number;
}) => (
    <FieldShell label={label} align="start">
        <Box
            component="textarea"
            value={value}
            onChange={(event: React.ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)}
            placeholder={placeholder}
            aria-label={label}
            rows={rows}
            sx={{
                display: "block",
                width: "100%",
                minHeight: 136,
                resize: "vertical",
                p: 0,
                border: "none",
                outline: "none",
                bgcolor: "transparent",
                fontFamily: "inherit",
                fontSize: 17,
                lineHeight: 1.5,
                color: appColors.textPrimary,
                "&::placeholder": { color: appColors.textSecondary },
            }}
        />
    </FieldShell>
);

/* ----------------------------------------------------------- the customer */

/**
 * Requirement 6: *"Staff search for and select a customer."*
 *
 * Weston's open question — *"can staff create a new customer from the booking
 * flow, or book a walk-in without a profile?"* — is unanswered, so both doors
 * are drawn and neither is wired.
 */
export const CustomerPicker = ({
    customer,
    onPick,
    onClear,
}: {
    customer?: BayCustomer;
    onPick: (customer: BayCustomer) => void;
    onClear?: () => void;
}) => {
    const [query, setQuery] = useState("");
    const results = searchBayCustomers(query);

    if (customer) {
        return (
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    minHeight: 72,
                    px: 2,
                    py: 1.25,
                    bgcolor: appColors.surface,
                    border: "1px solid",
                    borderColor: appColors.green,
                    borderRadius: `${FIELD_RADIUS}px`,
                }}
            >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary, mb: 0.4 }}>Customer</Typography>
                    <Typography sx={{ fontSize: 18, color: appColors.textPrimary }}>{customer.name}</Typography>
                    <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>
                        {customer.tier}
                        {customer.punchCardName ? ` · ${customer.punchCardName}: ${customer.punchesLeft} left` : ""}
                    </Typography>
                </Box>
                {onClear && (
                    <ButtonBase
                        onClick={onClear}
                        sx={{
                            flexShrink: 0,
                            minHeight: touchTarget.min,
                            px: 2,
                            borderRadius: `${FIELD_RADIUS}px`,
                            border: "1px solid",
                            borderColor: FIELD_BORDER,
                            fontSize: 15,
                            letterSpacing: "0.04em",
                            color: appColors.greenDark,
                        }}
                    >
                        CHANGE
                    </ButtonBase>
                )}
            </Box>
        );
    }

    return (
        <Box>
            <FieldShell label="Customer" trailing={<SearchIcon sx={{ fontSize: 24, color: appColors.textSecondary }} />}>
                <Box
                    component="input"
                    value={query}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
                    placeholder="Search name, email or phone"
                    aria-label="Search for a customer"
                    sx={{
                        display: "block",
                        width: "100%",
                        p: 0,
                        border: "none",
                        outline: "none",
                        bgcolor: "transparent",
                        fontFamily: "inherit",
                        fontSize: 18,
                        color: appColors.textPrimary,
                        "&::placeholder": { color: appColors.textSecondary },
                    }}
                />
            </FieldShell>

            {results.length > 0 && (
                <Box
                    sx={{
                        mt: 1,
                        bgcolor: appColors.surface,
                        border: "1px solid",
                        borderColor: FIELD_BORDER,
                        borderRadius: `${FIELD_RADIUS}px`,
                        overflow: "hidden",
                        maxHeight: 260,
                        overflowY: "auto",
                    }}
                >
                    {results.map((result) => (
                        <ButtonBase
                            key={result.id}
                            onClick={() => onPick(result)}
                            sx={{
                                display: "block",
                                textAlign: "left",
                                width: "100%",
                                minHeight: touchTarget.min,
                                px: 2,
                                py: 1.25,
                                borderBottom: "1px solid",
                                borderColor: appColors.divider,
                                "&:last-of-type": { borderBottom: "none" },
                            }}
                        >
                            <Typography sx={{ fontSize: 17, color: appColors.textPrimary }}>{result.name}</Typography>
                            <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>
                                {result.tier} · {result.phone}
                            </Typography>
                        </ButtonBase>
                    ))}
                </Box>
            )}
        </Box>
    );
};

/* ------------------------------------------------------------- the repeat */

/**
 * Requirement 13's four cadences, and the "does not repeat" that is the
 * default. Flexed across the full width, so the five read as one control
 * rather than as a drift of chips.
 */
export const RepeatPicker = ({
    value,
    onChange,
    label = "Repeats",
    hint,
}: {
    value: RepeatFreq;
    onChange: (value: RepeatFreq) => void;
    label?: string;
    hint?: string;
}) => (
    <FieldShell label={label} hint={hint}>
        <Box sx={{ display: "flex", gap: 1, width: "100%" }} role="radiogroup" aria-label={label}>
            {(Object.keys(repeatLabels) as RepeatFreq[]).map((freq) => {
                const active = freq === value;

                return (
                    <ButtonBase
                        key={freq}
                        onClick={() => onChange(freq)}
                        role="radio"
                        aria-checked={active}
                        aria-label={repeatLabels[freq]}
                        sx={{
                            flex: 1,
                            minWidth: 0,
                            minHeight: touchTarget.min,
                            px: 1,
                            borderRadius: `${FIELD_RADIUS}px`,
                            border: "1px solid",
                            borderColor: active ? appColors.green : FIELD_BORDER,
                            bgcolor: active ? appColors.green : appColors.surface,
                            color: active ? "#fff" : appColors.textPrimary,
                            fontSize: 14.5,
                            lineHeight: 1.25,
                        }}
                    >
                        {repeatLabels[freq]}
                    </ButtonBase>
                );
            })}
        </Box>
    </FieldShell>
);

/* --------------------------------------------------------------- the bays */

/**
 * Requirement 22: *"Staff can move the reservation to a different bay."*
 *
 * A dropdown rather than eight chips. Eight chips were a row and a half of
 * targets that read as a toolbar; one line that says which bay you are in is
 * both smaller and more honest, since the sheet behind the dialog is already
 * showing you the alternatives.
 */
export const BayPicker = ({
    value,
    onChange,
    label = "Bay",
    hint,
}: {
    value: string;
    onChange: (bayId: string) => void;
    label?: string;
    hint?: string;
}) => (
    <SelectField
        label={label}
        hint={hint}
        ariaLabel="Bay"
        value={bayById(value).id}
        onChange={onChange}
        options={bays.map((bay) => ({ value: bay.id, label: bay.name, dot: bay.color }))}
    />
);

/* ---------------------------------------------------------- the fee panel */

/**
 * Requirements 7, 8 and 23.
 *
 * The fee is never typed: it is derived from who, when and how long, and it
 * recalculates the moment any of the three changes. The punch card sits under
 * it because it does not change the fee, it covers it — and **Weston's open
 * question, "what happens if a punch card only covers part of the fee?", is
 * unanswered**, so this shows the shortfall rather than hiding it.
 */
export const FeePanel = ({
    fee,
    duration,
    customer,
    usePunch,
    onUsePunch,
}: {
    fee: { name: string; hourly: number; amount: number };
    duration: number;
    customer?: BayCustomer;
    usePunch: boolean;
    onUsePunch: (value: boolean) => void;
}) => {
    const needed = punchesNeeded(duration);
    const available = customer?.punchesLeft ?? 0;
    const covered = Math.min(needed, available);
    const shortfall = needed - covered;
    const owed = usePunch ? Number(((fee.amount * shortfall) / needed).toFixed(2)) : fee.amount;

    return (
        <Box
            sx={{
                bgcolor: appColors.surface,
                border: "1px solid",
                borderColor: FIELD_BORDER,
                borderRadius: `${FIELD_RADIUS}px`,
                px: 2.5,
                py: 2,
            }}
        >
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                <Typography sx={{ flex: 1, minWidth: 0, fontSize: 17, color: appColors.textPrimary }}>{fee.name}</Typography>
                <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>
                    {usd(fee.hourly)}/hr × {fmtDuration(duration)}
                </Typography>
                <Typography sx={{ fontSize: 19, color: appColors.textPrimary }}>{usd(fee.amount)}</Typography>
            </Box>

            {customer?.punchCardName && (
                <Box sx={{ borderTop: "1px solid", borderColor: appColors.divider, mt: 1.5, pt: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                        <ConfirmationNumberIcon
                            sx={{ fontSize: 20, color: available > 0 ? appColors.greenDark : appColors.textDisabled }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontSize: 16, color: appColors.textPrimary }}>
                                {customer.punchCardName} — {available} {available === 1 ? "punch" : "punches"} left
                            </Typography>
                            <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>This booking needs {needed}.</Typography>
                        </Box>
                        <Switch
                            checked={usePunch && available > 0}
                            disabled={available === 0}
                            onChange={(event) => onUsePunch(event.target.checked)}
                            slotProps={{ input: { "aria-label": "Apply punch card" } }}
                        />
                    </Box>

                    {/* The part nobody has decided yet, stated rather than hidden. */}
                    {usePunch && shortfall > 0 && available > 0 && (
                        <Typography sx={{ fontSize: 15, color: "#A9661F", mt: 1 }}>
                            {covered} {covered === 1 ? "punch covers" : "punches cover"} {fmtDuration(covered * 60)}. The remaining{" "}
                            {fmtDuration(shortfall * 60)} is still charged.
                        </Typography>
                    )}
                </Box>
            )}

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    borderTop: "1px solid",
                    borderColor: appColors.divider,
                    mt: 1.5,
                    pt: 1.5,
                }}
            >
                <Typography sx={{ flex: 1, minWidth: 0, fontSize: 17, color: appColors.textSecondary }}>Due</Typography>
                <Typography sx={{ fontSize: 24, fontWeight: 500, color: appColors.textPrimary }}>{usd(owed)}</Typography>
            </Box>
        </Box>
    );
};

/* ------------------------------------------------------- the inline cards */

/**
 * A bordered row with an explanation on the left and one action on the right
 * — requirement 30's *open a tab*, and anything else that is a side errand
 * rather than an answer to a question.
 */
export const InlineActionCard = ({
    title,
    description,
    actionLabel,
    onAction,
}: {
    title: string;
    description: string;
    actionLabel: string;
    onAction?: () => void;
}) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            bgcolor: appColors.surface,
            border: "1px solid",
            borderColor: FIELD_BORDER,
            borderRadius: `${FIELD_RADIUS}px`,
            px: 2.5,
            py: 2,
        }}
    >
        <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 17, color: appColors.textPrimary }}>{title}</Typography>
            <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>{description}</Typography>
        </Box>
        <ButtonBase
            onClick={onAction}
            sx={{
                flexShrink: 0,
                minHeight: touchTarget.comfortable,
                px: 3,
                borderRadius: `${FIELD_RADIUS}px`,
                bgcolor: appColors.slate,
                color: "#fff",
                fontSize: 15,
                letterSpacing: "0.04em",
                "&:hover": { bgcolor: appColors.slateDark },
            }}
        >
            {actionLabel}
        </ButtonBase>
    </Box>
);

/**
 * **The destructive actions, in the body rather than the footer.**
 *
 * They were four red keys in the action bar beside SAVE, which made the most
 * irreversible things on the screen the most prominent and left the footer
 * reading like a menu. The footer is now only *cancel* and *save*; these live
 * where the thing they destroy is — outlined rather than solid, because they
 * are available, not recommended.
 *
 * Each is its own button and they flex to fill the width together.
 */
export const DangerActions = ({ actions }: { actions: { label: string; onClick?: () => void }[] }) => (
    <Box sx={{ display: "flex", gap: 1.5 }}>
        {actions.map((action) => (
            <ButtonBase
                key={action.label}
                onClick={action.onClick}
                sx={{
                    flex: 1,
                    minWidth: 0,
                    minHeight: touchTarget.comfortable,
                    px: 1.5,
                    borderRadius: `${FIELD_RADIUS}px`,
                    border: "1px solid",
                    borderColor: appColors.red,
                    bgcolor: appColors.surface,
                    color: appColors.red,
                    fontSize: 15,
                    letterSpacing: "0.04em",
                    lineHeight: 1.25,
                    "&:hover": { bgcolor: "#FDECEA" },
                }}
            >
                {action.label}
            </ButtonBase>
        ))}
    </Box>
);

/* ------------------------------------------------------------ the warnings */

/** Requirement 10 — the overlap the system must not let through. */
export const ConflictWarning = ({
    conflict,
}: {
    conflict: { kind: "reservation"; with: Reservation } | { kind: "block"; with: BayBlock };
}) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            minHeight: 60,
            px: 2,
            py: 1.5,
            bgcolor: "#FDECEA",
            borderLeft: "4px solid",
            borderColor: appColors.red,
            borderRadius: `${FIELD_RADIUS}px`,
        }}
    >
        <ErrorOutlineIcon sx={{ flexShrink: 0, fontSize: 22, color: appColors.red }} />
        <Typography sx={{ fontSize: 16, color: appColors.textPrimary }}>
            {conflict.kind === "reservation" ? (
                <>
                    That time is taken — <strong>{conflict.with.customer.name}</strong> has {bayById(conflict.with.bayId).name} from{" "}
                    {fmtTime(conflict.with.start)} for {fmtDuration(conflict.with.duration)}.
                </>
            ) : (
                <>
                    That time is blocked — <strong>{conflict.with.label}</strong>, from {fmtTime(conflict.with.start)} for{" "}
                    {fmtDuration(conflict.with.duration)}.
                </>
            )}
        </Typography>
    </Box>
);

/**
 * Requirements 17 and 18.
 *
 * > *"When a booking would put a golfer over the limit, the bay sheet shows a
 * > warning… staff can override the limit on the bay sheet and complete the
 * > booking."*
 *
 * So this is a warning with a switch in it, not a refusal — the difference
 * between the limit and the overlap check above, which has no override.
 */
export const LimitWarning = ({
    customer,
    count,
    override,
    onOverride,
}: {
    customer: BayCustomer;
    count: number;
    override: boolean;
    onOverride: (value: boolean) => void;
}) => (
    <Box
        sx={{
            px: 2,
            py: 1.5,
            bgcolor: "#FDF3E7",
            borderLeft: "4px solid",
            borderColor: appColors.orange,
            borderRadius: `${FIELD_RADIUS}px`,
        }}
    >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <WarningAmberIcon sx={{ flexShrink: 0, fontSize: 22, color: "#A9661F" }} />
            <Typography sx={{ flex: 1, minWidth: 0, fontSize: 16, color: appColors.textPrimary }}>
                <strong>{customer.name}</strong> already has {count} {count === 1 ? "booking" : "bookings"} today. The limit is{" "}
                {DAILY_LIMIT}.
            </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1, pl: 4.5 }}>
            <Switch
                checked={override}
                onChange={(event) => onOverride(event.target.checked)}
                slotProps={{ input: { "aria-label": "Override the daily limit" } }}
            />
            <Typography sx={{ fontSize: 16, color: appColors.textPrimary }}>Override and book anyway</Typography>
        </Box>
        {/* No-shows count, per requirement 29 — worth saying, since it is the
            kind of rule a counter argues with a golfer about. */}
        <Typography sx={{ fontSize: 14, color: appColors.textSecondary, mt: 0.5, pl: 4.5 }}>
            No-shows count toward the limit; cancellations do not.
        </Typography>
    </Box>
);

/** Requirement 12 — the toggle that skips the confirmation email. */
export const ConfirmationToggle = ({ skip, onSkip }: { skip: boolean; onSkip: (value: boolean) => void }) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            minHeight: 72,
            px: 2,
            py: 1.25,
            bgcolor: appColors.surface,
            border: "1px solid",
            borderColor: FIELD_BORDER,
            borderRadius: `${FIELD_RADIUS}px`,
        }}
    >
        <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 17, color: appColors.textPrimary }}>Don&rsquo;t send confirmation</Typography>
            <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>A confirmation email goes out when this is off.</Typography>
        </Box>
        <Switch
            checked={skip}
            onChange={(event) => onSkip(event.target.checked)}
            slotProps={{ input: { "aria-label": "Don't send confirmation" } }}
        />
    </Box>
);
