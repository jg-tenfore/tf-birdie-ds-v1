import { useState } from "react";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import ButtonBase from "@mui/material/ButtonBase";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import BusinessCenterIcon from "@mui/icons-material/BusinessCenter";
import CakeIcon from "@mui/icons-material/Cake";
import CelebrationIcon from "@mui/icons-material/Celebration";
import CloseIcon from "@mui/icons-material/Close";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FavoriteIcon from "@mui/icons-material/Favorite";
import SchoolIcon from "@mui/icons-material/School";
import SearchIcon from "@mui/icons-material/Search";
import StraightenIcon from "@mui/icons-material/Straighten";
import WavingHandIcon from "@mui/icons-material/WavingHand";
import WineBarIcon from "@mui/icons-material/WineBar";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { appColors } from "@/theme/app-replica-tokens";
import { touchTarget } from "@/theme/tokens";
import {
    DAILY_LIMIT,
    bayById,
    bays,
    fmtDuration,
    fmtTime,
    occasions,
    punchesNeeded,
    repeatLabels,
    searchBayCustomers,
    usd,
    type BayBlock,
    type BayCustomer,
    type RepeatFreq,
    type Reservation,
    type ReservationStatus,
    statusOf,
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

export const DialogHeader = ({ title, subtitle, onClose }: { title: string; subtitle?: string; onClose?: () => void }) => (
    <Box
        sx={{
            flexShrink: 0,
            display: "flex",
            alignItems: "flex-start",
            gap: 1.5,
            bgcolor: appColors.navy,
            color: "#fff",
            pl: 3,
            pr: onClose ? 1.25 : 3,
            py: 2,
        }}
    >
        <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 22 }}>{title}</Typography>
            {subtitle && <Typography sx={{ fontSize: 15, color: "rgba(255,255,255,0.78)" }}>{subtitle}</Typography>}
        </Box>
        {onClose && <CloseKey onClick={onClose} />}
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
                        {statusOf(customer.status).label}
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
                                {statusOf(result.status).label} · {result.phone}
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

/**
 * **Nov 2 — picking more than one bay.**
 *
 * Weston, in the review: *"being able to block like multiple bays at the same
 * time, because if not, you have to do it one by one."* Cody's answer was to
 * take an array at the endpoint, and Justin's was checkboxes in the dropdown
 * that is already there — so this is the same field, the same chevron and the
 * same menu as `SelectField`, with a box in front of every row.
 *
 * It stays open while you tick, because the whole point is choosing several
 * and a menu that shut after each one would be slower than the one-by-one it
 * replaces.
 */
export const MultiSelectField = ({
    label,
    values,
    options,
    onChange,
    hint,
    ariaLabel,
    summary,
}: {
    label: string;
    values: string[];
    options: SelectOption[];
    onChange: (values: string[]) => void;
    hint?: string;
    ariaLabel?: string;
    /** How to say what is ticked. Defaults to the labels, comma separated. */
    summary?: (chosen: SelectOption[]) => string;
}) => {
    const chosen = options.filter((option) => values.includes(option.value));
    const say = summary ?? ((picked: SelectOption[]) => picked.map((option) => option.label).join(", "));

    return (
        <FieldShell label={label} hint={hint} trailing={<ExpandMoreIcon sx={{ fontSize: 26, color: appColors.textSecondary }} />}>
            <Select
                multiple
                displayEmpty
                value={values}
                onChange={(event) => onChange(typeof event.target.value === "string" ? [event.target.value] : event.target.value)}
                variant="standard"
                fullWidth
                IconComponent={() => null}
                inputProps={{ "aria-label": ariaLabel ?? label }}
                MenuProps={{ slotProps: { paper: { sx: { mt: 0.5, borderRadius: `${FIELD_RADIUS}px`, maxHeight: 420 } } } }}
                renderValue={() => (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                        {/* The ticked swatches, up to four, so a glance at the
                            closed field still shows which bays are in. */}
                        {chosen.slice(0, 4).map(
                            (option) =>
                                option.dot && (
                                    <Box
                                        key={option.value}
                                        sx={{ flexShrink: 0, width: 12, height: 12, borderRadius: "50%", bgcolor: option.dot }}
                                    />
                                ),
                        )}
                        <Typography
                            component="span"
                            noWrap
                            sx={{ fontSize: 18, color: chosen.length ? appColors.textPrimary : appColors.textSecondary, minWidth: 0 }}
                        >
                            {chosen.length ? say(chosen) : "None selected"}
                        </Typography>
                    </Box>
                )}
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
                    <MenuItem key={option.value} value={option.value} sx={{ minHeight: touchTarget.min, gap: 0.5, fontSize: 17, pl: 0.5 }}>
                        <Checkbox
                            checked={values.includes(option.value)}
                            tabIndex={-1}
                            disableRipple
                            sx={{ color: FIELD_BORDER, "&.Mui-checked": { color: appColors.green } }}
                        />
                        {option.dot && <Box sx={{ flexShrink: 0, width: 12, height: 12, borderRadius: "50%", bgcolor: option.dot }} />}
                        <Box sx={{ minWidth: 0, ml: 0.75 }}>
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

/**
 * The bay picker that takes several.
 *
 * One bay reads as its name, which is what the single picker said and what
 * staff will see almost every time. More than one counts them, because five
 * bay names do not fit the field and "5 bays" is the fact that matters.
 */
export const BayMultiPicker = ({
    values,
    onChange,
    label = "Bays",
    hint,
}: {
    values: string[];
    onChange: (bayIds: string[]) => void;
    label?: string;
    hint?: string;
}) => (
    <MultiSelectField
        label={label}
        hint={hint}
        ariaLabel="Bays"
        values={values}
        onChange={onChange}
        options={bays.map((bay) => ({ value: bay.id, label: bay.name, dot: bay.color }))}
        summary={(chosen) => (chosen.length === 1 ? chosen[0].label : `${chosen.length} bays`)}
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

/* ------------------------------------------------- the reservation dialog */

/**
 * **The parts the reservation dialog is made of.**
 *
 * These arrived as "version D" during the Nov 1 round and became the dialog
 * itself once Justin picked it. They are a different language from the
 * `FieldShell` family above: where a field shell gives every question its own
 * bordered box, these put the questions in one divided list under a heading
 * that sits *outside* the border, which is how the dialog got from 1,430px of
 * body down to something a tablet can hold.
 *
 * The booking and block dialogs still use the older parts. That is not drift
 * — booking asks who, which is a search, and a search needs the room a field
 * shell gives it.
 */

/** A hairline between list rows. Lighter than `divider`, which reads as a border. */
export const ROW_RULE = "#E8EBEE";

/**
 * The breathing room inside D's rows, in theme units.
 *
 * B sat every control on the 48px touch floor and let the row be exactly that
 * tall. It is tight in the good sense and tight in the bad one: nothing in a
 * row has air above or below it. D adds 7px top and bottom, which carries the
 * select rows to 62px and the stepper rows to 52.
 */
export const ROW_PAD = 0.875;

/**
 * A heading cut down to a rule.
 *
 * The Nov 1 version gave every group a 17px title *and* a sentence explaining
 * it. Five of those is 340px — a third of the dialog spent on narration. The
 * explanations move into the one place they are genuinely needed (the repeat
 * rule) and everything else gets this.
 */
export const SectionRule = ({ children }: { children: React.ReactNode }) => (
    <Typography sx={{ fontSize: 12, letterSpacing: "0.1em", fontWeight: 600, color: appColors.textSecondary, mb: 0.75, mt: 0 }}>
        {String(children).toUpperCase()}
    </Typography>
);

/**
 * A heading that sits *outside* the card it names, with room for one fact on
 * the right.
 *
 * Version B had no headings at all: one border around everything, which is
 * what made it tight and also what made it read as a single undifferentiated
 * form. Lifting the label out of the border is the cheapest way to get the
 * grouping back — 20px a section, and it costs the rows nothing, because the
 * label is no longer competing with them for the same left edge.
 *
 * The right-hand slot is where the order's total goes. A section label is
 * already a summary line; giving it the one number staff read out keeps the
 * card underneath as nothing but the itemisation.
 */
export const Section = ({ label, aside, children }: { label: string; aside?: React.ReactNode; children: React.ReactNode }) => (
    <Box sx={{ mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, mb: 0.375 }}>
            <Typography
                sx={{
                    flex: 1,
                    minWidth: 0,
                    fontSize: 12,
                    lineHeight: 1.4,
                    letterSpacing: "0.1em",
                    fontWeight: 600,
                    color: appColors.textSecondary,
                }}
            >
                {label.toUpperCase()}
            </Typography>
            {aside}
        </Box>
        <Box
            sx={{
                bgcolor: appColors.surface,
                border: "1px solid",
                borderColor: FIELD_BORDER,
                borderRadius: `${FIELD_RADIUS}px`,
                overflow: "hidden",
            }}
        >
            {children}
        </Box>
    </Box>
);

/** One line of the list: label left, control right, hairline under it. */
export const ListRow = ({
    label,
    hint,
    last = false,
    padY = 0.5,
    children,
}: {
    label: string;
    hint?: string;
    last?: boolean;
    /** Vertical padding, in theme units, on top of the 48px floor. */
    padY?: number;
    children: React.ReactNode;
}) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            minHeight: touchTarget.min,
            px: 2,
            py: padY,
            borderBottom: last ? "none" : "1px solid",
            borderColor: ROW_RULE,
        }}
    >
        <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 16, color: appColors.textPrimary }}>{label}</Typography>
            {hint && <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{hint}</Typography>}
        </Box>
        <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center" }}>{children}</Box>
    </Box>
);

/** A borderless dropdown for a list row — the value, and a chevron. */
export const RowSelect = ({
    value,
    options,
    onChange,
    ariaLabel,
}: {
    value: string;
    options: { value: string; label: string; dot?: string }[];
    onChange: (value: string) => void;
    ariaLabel: string;
}) => (
    <Select
        value={value}
        onChange={(event) => onChange(String(event.target.value))}
        variant="standard"
        IconComponent={ExpandMoreIcon}
        inputProps={{ "aria-label": ariaLabel }}
        MenuProps={{ slotProps: { paper: { sx: { mt: 0.5, borderRadius: `${FIELD_RADIUS}px`, maxHeight: 420 } } } }}
        renderValue={(raw) => {
            const option = options.find((candidate) => candidate.value === raw);
            if (!option) return null;

            return (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {option.dot && <Box sx={{ flexShrink: 0, width: 10, height: 10, borderRadius: "50%", bgcolor: option.dot }} />}
                    <Typography component="span" sx={{ fontSize: 17, color: appColors.textPrimary }}>
                        {option.label}
                    </Typography>
                </Box>
            );
        }}
        sx={{
            minHeight: touchTarget.min,
            "&::before, &::after": { display: "none" },
            "& .MuiSelect-select": { p: 0, pr: "28px !important", minHeight: "0 !important", bgcolor: "transparent !important" },
            "& .MuiSelect-icon": { color: appColors.textSecondary },
        }}
    >
        {options.map((option) => (
            <MenuItem key={option.value} value={option.value} sx={{ minHeight: touchTarget.min, gap: 1.25, fontSize: 16 }}>
                {option.dot && <Box sx={{ flexShrink: 0, width: 10, height: 10, borderRadius: "50%", bgcolor: option.dot }} />}
                {option.label}
            </MenuItem>
        ))}
    </Select>
);

/** The stepper, shrunk to sit at the right-hand end of a 54px row. */
export const RowStepper = ({
    value,
    onChange,
    step = 1,
    min = 1,
    max = 99,
    format,
    unit,
}: {
    value: number;
    onChange: (value: number) => void;
    step?: number;
    min?: number;
    max?: number;
    format?: (value: number) => string;
    unit: string;
}) => {
    const key = (sign: "−" | "+", to: number, disabled: boolean) => (
        <ButtonBase
            onClick={() => onChange(to)}
            disabled={disabled}
            aria-label={`${sign === "−" ? "Less" : "More"} ${unit}`}
            sx={{
                width: 38,
                height: 38,
                borderRadius: `${FIELD_RADIUS - 2}px`,
                border: "1px solid",
                borderColor: FIELD_BORDER,
                fontSize: 19,
                color: appColors.textPrimary,
                "&.Mui-disabled": { color: appColors.textDisabled },
            }}
        >
            {sign}
        </ButtonBase>
    );

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {key("−", Math.max(min, value - step), value <= min)}
            <Typography sx={{ width: 64, textAlign: "center", fontSize: 17, color: appColors.textPrimary }}>
                {format ? format(value) : value}
            </Typography>
            {key("+", Math.min(max, value + step), value >= max)}
        </Box>
    );
};

/**
 * One line of the order: what it is, the arithmetic behind it, and what it
 * comes to. The detail line is the point — a fee that shows `$30.00/hr × 1h`
 * can be checked, and one that only shows `$30.00` has to be trusted.
 */
export const OrderLine = ({
    name,
    detail,
    amount,
    credit = false,
    last = false,
    children,
}: {
    name: string;
    detail?: string;
    amount?: string;
    /** A discount, which is a different kind of number from a charge. */
    credit?: boolean;
    last?: boolean;
    children?: React.ReactNode;
}) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.75,
            minHeight: touchTarget.min,
            px: 2,
            py: ROW_PAD,
            borderBottom: last ? "none" : "1px solid",
            borderColor: ROW_RULE,
        }}
    >
        <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: 16, color: appColors.textPrimary }} noWrap>
                {name}
            </Typography>
            {detail && (
                <Typography sx={{ fontSize: 13, color: appColors.textSecondary }} noWrap>
                    {detail}
                </Typography>
            )}
        </Box>
        {amount && (
            <Typography sx={{ flexShrink: 0, fontSize: 17, color: credit ? appColors.greenDark : appColors.textPrimary }}>
                {amount}
            </Typography>
        )}
        {children && <Box sx={{ flexShrink: 0, display: "flex", alignItems: "center" }}>{children}</Box>}
    </Box>
);

/** One icon per occasion, so the rail reads at a glance on a busy counter. */
const occasionIcons: Record<string, typeof CakeIcon> = {
    birthday: CakeIcon,
    anniversary: FavoriteIcon,
    date: WineBarIcon,
    business: BusinessCenterIcon,
    party: CelebrationIcon,
    league: EmojiEventsIcon,
    lesson: SchoolIcon,
    fitting: StraightenIcon,
    first: WavingHandIcon,
    holiday: AcUnitIcon,
};

/**
 * The occasion rail: ten optional tags on one scrolling line.
 *
 * A rail rather than a dropdown because the tags are the kind of thing staff
 * recognise faster than they recall — a birthday is spotted, not searched
 * for. It scrolls sideways because ten chips will not fit a 640px dialog and
 * stacking them would cost three rows for something that is optional.
 *
 * Tapping the chosen tag again clears it, which is the only way out of an
 * optional single-choice control that does not need a second affordance.
 */
export const OccasionRail = ({ value, onChange }: { value?: string; onChange: (value: string | undefined) => void }) => (
    <Box
        role="radiogroup"
        aria-label="Occasion"
        sx={{
            display: "flex",
            gap: 1,
            px: 2,
            py: 1.25,
            overflowX: "auto",
            borderBottom: "1px solid",
            borderColor: ROW_RULE,
            scrollSnapType: "x proximity",
            /* Without this the first chip snaps to the scrollport edge, which
               sits inside the padding — the rail opens scrolled 16px and the
               chips sit left of the caption above them. */
            scrollPaddingLeft: "16px",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
        }}
    >
        {occasions.map((occasion) => {
            const active = value === occasion.id;
            const Icon = occasionIcons[occasion.id];

            return (
                <ButtonBase
                    key={occasion.id}
                    role="radio"
                    aria-checked={active}
                    onClick={() => onChange(active ? undefined : occasion.id)}
                    sx={{
                        flexShrink: 0,
                        gap: 0.875,
                        minHeight: 44,
                        px: 1.75,
                        borderRadius: "22px",
                        border: "1px solid",
                        borderColor: active ? appColors.slate : FIELD_BORDER,
                        bgcolor: active ? appColors.slate : appColors.surface,
                        color: active ? "#fff" : appColors.textSecondary,
                        fontSize: 14.5,
                        whiteSpace: "nowrap",
                        scrollSnapAlign: "start",
                        "&:hover": { bgcolor: active ? appColors.slate : appColors.canvasAlt },
                    }}
                >
                    <Icon sx={{ fontSize: 18 }} />
                    {occasion.label}
                </ButtonBase>
            );
        })}
    </Box>
);

/**
 * **Where no-show went.**
 *
 * Three segments, one of them chosen — *this is the state of the booking*,
 * which is a different sentence from *get rid of this booking*. Picking
 * `No-show` is still consequential (requirement 29: it counts toward the
 * daily limit), so the chosen segment is coloured by what it means rather
 * than by brand: green for checked in, red for a no-show.
 */
export const StatusSegments = ({
    status,
    onStatus,
    size = "md",
    fill = false,
}: {
    status: ReservationStatus;
    onStatus?: (status: ReservationStatus) => void;
    size?: "sm" | "md";
    /** Share the full width between the three segments. */
    fill?: boolean;
}) => {
    const options: ReservationStatus[] = ["booked", "checkedIn", "noShow"];
    const tone = (value: ReservationStatus) =>
        value === "noShow" ? appColors.red : value === "checkedIn" ? appColors.green : appColors.slate;

    return (
        <Box
            role="radiogroup"
            aria-label="Status"
            sx={{
                display: "flex",
                p: 0.5,
                gap: 0.5,
                bgcolor: appColors.canvasAlt,
                border: "1px solid",
                borderColor: FIELD_BORDER,
                borderRadius: `${FIELD_RADIUS}px`,
            }}
        >
            {options.map((value) => {
                const active = value === status;

                return (
                    <ButtonBase
                        key={value}
                        role="radio"
                        aria-checked={active}
                        onClick={() => onStatus?.(value)}
                        sx={{
                            flex: fill ? 1 : "0 0 auto",
                            minHeight: size === "sm" ? 34 : 40,
                            px: size === "sm" ? 1.5 : 2.25,
                            borderRadius: `${FIELD_RADIUS - 2}px`,
                            fontSize: size === "sm" ? 14 : 15,
                            whiteSpace: "nowrap",
                            bgcolor: active ? tone(value) : "transparent",
                            color: active ? "#fff" : appColors.textSecondary,
                            "&:hover": { bgcolor: active ? tone(value) : "rgba(0,0,0,0.04)" },
                        }}
                    >
                        {value === "booked" ? "Booked" : value === "checkedIn" ? "Checked in" : "No-show"}
                    </ButtonBase>
                );
            })}
        </Box>
    );
};

/** The removal group, identical in all three — the part Justin kept. */
export const RemoveGroup = ({
    repeating,
    onCancelReservation,
    onClearSeries,
}: {
    repeating: boolean;
    onCancelReservation?: () => void;
    onClearSeries?: () => void;
}) => (
    <Box>
        <SectionRule>Remove this reservation</SectionRule>
        <Box sx={{ display: "flex", gap: 1.5 }}>
            {[
                { label: repeating ? "CANCEL THIS ONE" : "CANCEL BOOKING", onClick: onCancelReservation },
                ...(repeating ? [{ label: "CLEAR SERIES", onClick: onClearSeries }] : []),
            ].map((action) => (
                <ButtonBase
                    key={action.label}
                    onClick={action.onClick}
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        minHeight: touchTarget.min,
                        px: 1.5,
                        borderRadius: `${FIELD_RADIUS}px`,
                        border: "1px solid",
                        borderColor: appColors.red,
                        bgcolor: appColors.surface,
                        color: appColors.red,
                        fontSize: 14.5,
                        letterSpacing: "0.04em",
                        "&:hover": { bgcolor: "#FDECEA" },
                    }}
                >
                    {action.label}
                </ButtonBase>
            ))}
        </Box>
    </Box>
);

/** The overlap, in a band rather than a card — two lines shorter than Nov 1's. */
export const ConflictBand = ({ conflict }: { conflict: { kind: "reservation" | "block"; with: Reservation | BayBlock } }) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            px: 1.75,
            py: 1.25,
            mb: 2,
            bgcolor: "#FDECEA",
            borderLeft: "4px solid",
            borderColor: appColors.red,
            borderRadius: `${FIELD_RADIUS}px`,
        }}
    >
        <ErrorOutlineIcon sx={{ flexShrink: 0, fontSize: 20, color: appColors.red }} />
        <Typography sx={{ fontSize: 15, color: appColors.textPrimary }}>
            That time is taken — {bayById(conflict.with.bayId).name} is busy from {fmtTime(conflict.with.start)} for{" "}
            {fmtDuration(conflict.with.duration)}.
        </Typography>
    </Box>
);

/**
 * The close key in the header's top-right corner.
 *
 * The footer's CANCEL is the deliberate way out; this is the reflexive one,
 * and on a tablet it is the one a thumb finds first. Both run through the
 * same guard, so neither can drop an edit on the floor.
 */
export const CloseKey = ({ onClick }: { onClick?: () => void }) => (
    <ButtonBase
        onClick={onClick}
        aria-label="Close"
        sx={{
            flexShrink: 0,
            width: touchTarget.min,
            height: touchTarget.min,
            borderRadius: "50%",
            color: "rgba(255,255,255,0.85)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.12)", color: "#fff" },
        }}
    >
        <CloseIcon sx={{ fontSize: 24 }} />
    </ButtonBase>
);

/**
 * Has this booking been edited since the dialog opened?
 *
 * The pristine copy is taken once, on the first render, and never refreshed —
 * which is the whole trick. Every edit routes back through `onChange`, so a
 * plain comparison against that first copy catches a stepper nudged twice and
 * back again as *not* dirty, which is the right answer.
 */
export const useDirty = (reservation: Reservation) => {
    /* `useState` rather than a ref, because this is read while rendering: the
       initialiser runs once and the setter is never called, so the snapshot
       is pinned to the booking as it looked when the dialog opened. */
    const [pristine] = useState(reservation);

    return { pristine, dirty: JSON.stringify(reservation) !== JSON.stringify(pristine) };
};
