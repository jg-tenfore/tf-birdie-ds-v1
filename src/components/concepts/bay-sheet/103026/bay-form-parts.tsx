import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import ConfirmationNumberIcon from "@mui/icons-material/ConfirmationNumber";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutlineOutlined";
import SearchIcon from "@mui/icons-material/Search";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
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
 */

/* ------------------------------------------------------------ the heading */

export const DialogHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => (
    <Box sx={{ bgcolor: appColors.navy, color: "#fff", px: 3, py: 2 }}>
        <Typography sx={{ fontSize: 21 }}>{title}</Typography>
        {subtitle && <Typography sx={{ fontSize: 15, color: "rgba(255,255,255,0.78)" }}>{subtitle}</Typography>}
    </Box>
);

export const FieldLabel = ({ children }: { children: React.ReactNode }) => (
    <Typography sx={{ fontSize: 13, letterSpacing: "0.08em", color: appColors.textSecondary, mb: 0.75 }}>{children}</Typography>
);

/* ------------------------------------------------------------ the steppers */

/** One control for both minutes and people; they differ only in their step. */
export const Stepper = ({
    value,
    onChange,
    step = 1,
    min = 1,
    max = 99,
    format,
    label,
}: {
    value: number;
    onChange: (value: number) => void;
    step?: number;
    min?: number;
    max?: number;
    format?: (value: number) => string;
    label: string;
}) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {[-step, step].map((delta, index) => (
            <Box key={delta} sx={{ order: index === 0 ? 0 : 2 }}>
                <ButtonBase
                    onClick={() => onChange(Math.min(max, Math.max(min, value + delta)))}
                    aria-label={`${delta < 0 ? "Less" : "More"} ${label}`}
                    disabled={delta < 0 ? value <= min : value >= max}
                    sx={{
                        width: touchTarget.min,
                        height: touchTarget.min,
                        borderRadius: `${appRadius.button}px`,
                        border: "1px solid",
                        borderColor: appColors.divider,
                        bgcolor: appColors.surface,
                        fontSize: 22,
                        lineHeight: 1,
                        color: appColors.textPrimary,
                        "&.Mui-disabled": { color: appColors.textDisabled },
                    }}
                >
                    {delta < 0 ? "−" : "+"}
                </ButtonBase>
            </Box>
        ))}
        <Typography sx={{ order: 1, minWidth: 92, textAlign: "center", fontSize: 19, color: appColors.textPrimary }}>
            {format ? format(value) : value}
        </Typography>
    </Box>
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
                    minHeight: 64,
                    px: 2,
                    bgcolor: appColors.surface,
                    border: "1px solid",
                    borderColor: appColors.green,
                    borderRadius: `${appRadius.card}px`,
                }}
            >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontSize: 18, color: appColors.textPrimary }}>{customer.name}</Typography>
                    <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>
                        {customer.tier}
                        {customer.punchCardName ? ` · ${customer.punchCardName}: ${customer.punchesLeft} left` : ""}
                    </Typography>
                </Box>
                {onClear && (
                    <Typography
                        onClick={onClear}
                        role="button"
                        sx={{ fontSize: 14, letterSpacing: "0.04em", color: appColors.greenDark, cursor: "pointer", px: 1 }}
                    >
                        CHANGE
                    </Typography>
                )}
            </Box>
        );
    }

    return (
        <Box>
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    minHeight: touchTarget.comfortable,
                    px: 2,
                    bgcolor: appColors.fieldFill,
                    borderBottom: "1px solid rgba(0,0,0,0.42)",
                    borderRadius: `${appRadius.button}px ${appRadius.button}px 0 0`,
                }}
            >
                <SearchIcon sx={{ fontSize: 22, color: appColors.textSecondary }} />
                <Box
                    component="input"
                    value={query}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) => setQuery(event.target.value)}
                    placeholder="Search name, email or phone"
                    aria-label="Search for a customer"
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        border: "none",
                        outline: "none",
                        bgcolor: "transparent",
                        fontFamily: "inherit",
                        fontSize: 18,
                        color: appColors.textPrimary,
                        "&::placeholder": { color: appColors.textSecondary },
                    }}
                />
            </Box>

            {results.length > 0 && (
                <Box
                    sx={{
                        mt: 1,
                        bgcolor: appColors.surface,
                        borderRadius: `${appRadius.card}px`,
                        overflow: "hidden",
                        maxHeight: 220,
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
                                px: 2,
                                py: 1.25,
                                borderBottom: "1px solid",
                                borderColor: appColors.divider,
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

/** Requirement 13's four cadences, and the "does not repeat" that is the default. */
export const RepeatPicker = ({ value, onChange }: { value: RepeatFreq; onChange: (value: RepeatFreq) => void }) => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
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
                        minHeight: touchTarget.min,
                        px: 2,
                        borderRadius: `${appRadius.button}px`,
                        border: "1px solid",
                        borderColor: active ? appColors.green : appColors.divider,
                        bgcolor: active ? appColors.green : appColors.surface,
                        color: active ? "#fff" : appColors.textPrimary,
                        fontSize: 15,
                    }}
                >
                    {repeatLabels[freq]}
                </ButtonBase>
            );
        })}
    </Box>
);

/* --------------------------------------------------------------- the bays */

/** Requirement 22: *"Staff can move the reservation to a different bay."* */
export const BayPicker = ({ value, onChange }: { value: string; onChange: (bayId: string) => void }) => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {bays.map((bay) => {
            const active = bay.id === value;

            return (
                <ButtonBase
                    key={bay.id}
                    onClick={() => onChange(bay.id)}
                    role="radio"
                    aria-checked={active}
                    aria-label={bay.name}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.75,
                        minHeight: touchTarget.min,
                        px: 1.75,
                        borderRadius: `${appRadius.button}px`,
                        border: "1px solid",
                        borderColor: active ? appColors.textPrimary : appColors.divider,
                        bgcolor: active ? "#ECEFF1" : appColors.surface,
                        fontSize: 15,
                        color: appColors.textPrimary,
                    }}
                >
                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: bay.color }} />
                    {bay.name.replace(" Bay", "")}
                </ButtonBase>
            );
        })}
    </Box>
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
        <Box sx={{ bgcolor: appColors.surface, borderRadius: `${appRadius.card}px`, px: 2.5, py: 2 }}>
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
            bgcolor: "#FDECEA",
            borderLeft: "4px solid",
            borderColor: appColors.red,
            borderRadius: `${appRadius.button}px`,
        }}
    >
        <ErrorOutlineIcon sx={{ fontSize: 22, color: appColors.red }} />
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
            borderRadius: `${appRadius.button}px`,
        }}
    >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <WarningAmberIcon sx={{ fontSize: 22, color: "#A9661F" }} />
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
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <Switch
            checked={skip}
            onChange={(event) => onSkip(event.target.checked)}
            slotProps={{ input: { "aria-label": "Don't send confirmation" } }}
        />
        <Box>
            <Typography sx={{ fontSize: 16, color: appColors.textPrimary }}>Don&rsquo;t send confirmation</Typography>
            <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>A confirmation email goes out when this is off.</Typography>
        </Box>
    </Box>
);
