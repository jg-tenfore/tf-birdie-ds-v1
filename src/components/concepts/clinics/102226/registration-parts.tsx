import { useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import EditIcon from "@mui/icons-material/Edit";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import PersonIcon from "@mui/icons-material/Person";
import SearchIcon from "@mui/icons-material/Search";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { touchTarget } from "@/theme/tokens";
import { datesOpenLabel, searchClinics, spotsLabel, usd, type CatalogClinic, type CatalogSession } from "../102126/clinic-catalog";
import { FillBar, GuestForm } from "../102126/clinic-parts";
import {
    bookingsFor,
    canTakeDate,
    datesFor,
    discountFor,
    discountNudges,
    playerName,
    priceBooking,
    registrationTotals,
    spotsRemaining,
    type Player,
    type Registration,
} from "./registration";

/**
 * **The parts all three Oct 22 versions share.**
 *
 * Everything up to the dates is settled: the player count, the names, the
 * clinic multi-select, the confirmation screen, the discount nudge, and the
 * rail Weston asked to put back. Only the dates step differs between A, B
 * and C.
 */

/* --------------------------------------------------------- step 1: count */

const COUNTS = [1, 2, 3, 4, 5, 6];

export const PlayerCountStep = ({ count, onCount }: { count: number; onCount?: (value: number) => void }) => (
    <Box sx={{ px: 3, py: 3 }}>
        <Typography sx={{ fontSize: 24, color: appColors.textPrimary, mb: 0.5 }}>How many players?</Typography>
        <Typography sx={{ fontSize: 16, color: appColors.textSecondary, mb: 3 }}>
            Everyone gets their own clinics and their own dates. You can copy one player onto the next.
        </Typography>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            {COUNTS.map((value) => {
                const active = value === count;

                return (
                    <Box
                        key={value}
                        onClick={() => onCount?.(value)}
                        role="radio"
                        aria-checked={active}
                        aria-label={`${value} ${value === 1 ? "player" : "players"}`}
                        sx={{
                            width: 128,
                            minHeight: 104,
                            display: "grid",
                            placeItems: "center",
                            cursor: "pointer",
                            borderRadius: `${appRadius.card}px`,
                            bgcolor: active ? appColors.green : appColors.surface,
                            border: "1px solid",
                            borderColor: active ? appColors.green : appColors.divider,
                        }}
                    >
                        <Typography sx={{ fontSize: 30, fontWeight: 500, color: active ? "#fff" : appColors.textPrimary }}>
                            {value}
                        </Typography>
                    </Box>
                );
            })}
        </Box>
    </Box>
);

/* --------------------------------------------------------- step 2: names */

/**
 * Everyone's details, before any clinic is chosen.
 *
 * Weston's order: *"let's collect all the info for who they are, and then take
 * you to this page."* It front-loads the typing, which is the price of never
 * being interrupted by a search once the picking starts.
 */
export const PlayerInfoStep = ({ players, onFind }: { players: Player[]; onFind?: (index: number) => void }) => (
    <Box sx={{ px: 3, py: 2.5 }}>
        <Typography sx={{ fontSize: 13, letterSpacing: "0.08em", color: appColors.textSecondary, mb: 1 }}>WHO IS COMING</Typography>

        {players.map((player, index) => (
            <Box key={player.id} sx={{ bgcolor: appColors.surface, borderRadius: `${appRadius.card}px`, px: 2.5, py: 2, mb: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minHeight: 32 }}>
                    <Box
                        sx={{
                            width: 26,
                            height: 26,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: "50%",
                            bgcolor: player.customer ? appColors.green : appColors.divider,
                            color: player.customer ? "#fff" : appColors.textSecondary,
                            fontSize: 14,
                        }}
                    >
                        {index + 1}
                    </Box>
                    <Typography sx={{ fontSize: 17, color: appColors.textPrimary }}>{playerName(player, index)}</Typography>
                </Box>

                <Box sx={{ mt: 1.5 }}>
                    <GuestForm guest={player.customer} customerIndex={index} compact onFound={() => onFind?.(index)} />
                </Box>
            </Box>
        ))}
    </Box>
);

/* ------------------------------------------------- the "this is for" band */

/** Whose turn it is, said out loud above every per-player step. */
export const PlayerBand = ({
    player,
    index,
    total,
    onCopy,
    copyFrom,
}: {
    player: Player;
    index: number;
    total: number;
    /** Offered from player 2 onward — Weston's "same as Justin". */
    onCopy?: () => void;
    copyFrom?: string;
}) => (
    <Box
        sx={{
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            px: 3,
            py: 1.5,
            bgcolor: appColors.surface,
            borderBottom: "1px solid",
            borderColor: appColors.divider,
        }}
    >
        <PersonIcon sx={{ fontSize: 22, color: appColors.textSecondary }} />
        <Typography sx={{ fontSize: 19, color: appColors.textPrimary }}>
            This is for <strong>{playerName(player, index)}</strong>
        </Typography>
        <Typography sx={{ flex: 1, minWidth: 0, fontSize: 15, color: appColors.textSecondary }}>
            Player {index + 1} of {total}
        </Typography>

        {onCopy && copyFrom && (
            <Box
                onClick={onCopy}
                role="button"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    minHeight: touchTarget.min,
                    px: 2,
                    cursor: "pointer",
                    borderRadius: `${appRadius.button}px`,
                    bgcolor: appColors.slate,
                }}
            >
                <CheckIcon sx={{ fontSize: 18, color: "#fff" }} />
                <Typography sx={{ fontSize: 15, letterSpacing: "0.04em", color: "#fff" }}>SAME AS {copyFrom.toUpperCase()}</Typography>
            </Box>
        )}
    </Box>
);

/* ------------------------------------------- the clinic multi-select step */

/**
 * **Several clinics at once.**
 *
 * > *"What if I want to do the putting lab and the junior golf academy? Like, I
 * > want them to do both. So if you could select both — it's more of like a
 * > multi-select."*
 *
 * Twenty clinics, so the search from the Oct 21 round stays.
 */
export const ClinicMultiSelect = ({
    clinics,
    chosen,
    onToggle,
}: {
    clinics: CatalogClinic[];
    chosen: string[];
    onToggle?: (clinicId: string) => void;
}) => {
    const [query, setQuery] = useState("");
    const matches = searchClinics(clinics, query);

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Box sx={{ flexShrink: 0, px: 3, pt: 2.5, pb: 1.5 }}>
                <Box
                    sx={{
                        maxWidth: 520,
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
                        placeholder="Search clinics"
                        aria-label="Search clinics"
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
                <Typography sx={{ fontSize: 15, color: appColors.textSecondary, mt: 1.25 }}>
                    {chosen.length === 0 ? "Pick one or more" : `${chosen.length} chosen`}
                </Typography>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 3, pb: 3 }}>
                <Box sx={{ bgcolor: appColors.surface, borderRadius: `${appRadius.card}px`, overflow: "hidden" }}>
                    {matches.map((clinic) => {
                        const picked = chosen.includes(clinic.id);
                        const deal = discountFor(clinic.id);

                        return (
                            <Box
                                key={clinic.id}
                                onClick={() => onToggle?.(clinic.id)}
                                role="checkbox"
                                aria-checked={picked}
                                aria-label={clinic.name}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 2,
                                    minHeight: 72,
                                    px: 2,
                                    cursor: "pointer",
                                    bgcolor: picked ? "#F3F7F4" : appColors.surface,
                                    borderBottom: "1px solid",
                                    borderColor: appColors.divider,
                                }}
                            >
                                <Box sx={{ width: 28, display: "grid", placeItems: "center" }}>
                                    {picked ? (
                                        <Box
                                            sx={{
                                                width: 22,
                                                height: 22,
                                                display: "grid",
                                                placeItems: "center",
                                                borderRadius: "50%",
                                                bgcolor: appColors.green,
                                            }}
                                        >
                                            <CheckIcon sx={{ fontSize: 15, color: "#fff" }} />
                                        </Box>
                                    ) : (
                                        <Box
                                            sx={{
                                                width: 20,
                                                height: 20,
                                                borderRadius: 1,
                                                border: "2px solid",
                                                borderColor: appColors.textSecondary,
                                            }}
                                        />
                                    )}
                                </Box>

                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontSize: 18, color: appColors.textPrimary }}>{clinic.name}</Typography>
                                    <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>
                                        {clinic.category} · {usd(clinic.price)} each · {datesOpenLabel(clinic)}
                                    </Typography>
                                </Box>

                                {/* The offer, before the dates are chosen — so it
                                    can change how many get chosen. */}
                                {deal && (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                        <LocalOfferIcon sx={{ fontSize: 17, color: "#A9661F" }} />
                                        <Typography sx={{ fontSize: 14, color: "#A9661F" }}>
                                            {deal.quantity}+ dates, {deal.percentOff}% off
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        );
                    })}
                </Box>
            </Box>
        </Box>
    );
};

/* ----------------------------------------------------- the dates, by date */

/**
 * One date, with what is left **after** the rest of this registration.
 *
 * Put two of a family on a date with one place and the second has to be
 * refused, so the count comes down as players are assigned rather than at the
 * till.
 */
export const DateRow = ({
    session,
    clinic,
    registration,
    playerId,
    chosen,
    onToggle,
}: {
    session: CatalogSession;
    clinic: CatalogClinic;
    registration: Registration;
    playerId: string;
    chosen: boolean;
    onToggle?: () => void;
}) => {
    const left = spotsRemaining(registration, clinic.id, session, playerId);
    const allowed = canTakeDate(registration, playerId, clinic.id, session);
    const taken = session.spotsLeft - left;

    return (
        <Box
            onClick={allowed ? onToggle : undefined}
            role={allowed ? "checkbox" : undefined}
            aria-checked={chosen}
            aria-label={`${session.label} — ${spotsLabel(left)}`}
            aria-disabled={!allowed}
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                minHeight: touchTarget.comfortable,
                px: 2,
                bgcolor: !allowed ? appColors.canvas : chosen ? "#F3F7F4" : appColors.surface,
                borderBottom: "1px solid",
                borderColor: appColors.divider,
                cursor: allowed ? "pointer" : "default",
            }}
        >
            <Box sx={{ width: 28, display: "grid", placeItems: "center" }}>
                {!allowed ? null : chosen ? (
                    <Box
                        sx={{ width: 22, height: 22, display: "grid", placeItems: "center", borderRadius: "50%", bgcolor: appColors.green }}
                    >
                        <CheckIcon sx={{ fontSize: 15, color: "#fff" }} />
                    </Box>
                ) : (
                    <Box sx={{ width: 20, height: 20, borderRadius: 1, border: "2px solid", borderColor: appColors.textSecondary }} />
                )}
            </Box>

            <Typography sx={{ width: 140, fontSize: 17, color: allowed ? appColors.textPrimary : appColors.textDisabled }}>
                {session.date}
            </Typography>
            <Typography sx={{ width: 104, fontSize: 17, color: allowed ? appColors.textSecondary : appColors.textDisabled }}>
                {session.time}
            </Typography>

            <Box sx={{ width: 180, display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 64 }}>
                    <FillBar taken={session.capacity - left} capacity={session.capacity} />
                </Box>
                <Typography
                    sx={{ fontSize: 15, color: !allowed ? appColors.textDisabled : left <= 2 ? "#A9661F" : appColors.textSecondary }}
                >
                    {spotsLabel(left)}
                </Typography>
            </Box>

            {/* Said on the row rather than worked out: this family took it. */}
            <Typography sx={{ flex: 1, minWidth: 0, fontSize: 15, color: "#A9661F" }}>
                {taken > 0 && !chosen ? `${taken} taken by this group` : ""}
            </Typography>

            <Typography
                sx={{ width: 90, textAlign: "right", fontSize: 17, color: allowed ? appColors.textPrimary : appColors.textDisabled }}
            >
                {usd(clinic.price)}
            </Typography>
        </Box>
    );
};

/** A clinic's dates for one player, under its own heading. */
export const ClinicDates = ({
    clinic,
    registration,
    playerId,
    onToggle,
}: {
    clinic: CatalogClinic;
    registration: Registration;
    playerId: string;
    onToggle?: (label: string) => void;
}) => {
    const chosen = datesFor(registration, playerId, clinic.id);
    const deal = discountFor(clinic.id);
    const price = priceBooking({ clinicId: clinic.id, dates: chosen });

    return (
        <Box sx={{ mb: 3 }}>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 2, mb: 1 }}>
                <Typography sx={{ fontSize: 18, fontWeight: 500, color: appColors.textPrimary }}>{clinic.name}</Typography>
                <Typography sx={{ flex: 1, minWidth: 0, fontSize: 15, color: appColors.textSecondary }}>
                    {chosen.length} {chosen.length === 1 ? "date" : "dates"} · {usd(price.net)}
                </Typography>
                {deal && (
                    <Typography sx={{ fontSize: 15, color: price.saved > 0 ? appColors.greenDark : "#A9661F" }}>
                        {price.saved > 0
                            ? `${deal.percentOff}% off — saving ${usd(price.saved)}`
                            : `${deal.quantity}+ dates, ${deal.percentOff}% off`}
                    </Typography>
                )}
            </Box>

            <Box sx={{ bgcolor: appColors.surface, borderRadius: `${appRadius.card}px`, overflow: "hidden" }}>
                {clinic.sessions.map((session) => (
                    <DateRow
                        key={session.label}
                        session={session}
                        clinic={clinic}
                        registration={registration}
                        playerId={playerId}
                        chosen={chosen.includes(session.label)}
                        onToggle={() => onToggle?.(session.label)}
                    />
                ))}
            </Box>
        </Box>
    );
};

/* --------------------------------------------------------- the last step */

/** The offer, called out where it can still change the answer. */
export const DiscountNudges = ({ registration }: { registration: Registration }) => {
    const nudges = discountNudges(registration);
    if (nudges.length === 0) return null;

    return (
        <Box sx={{ mb: 2 }}>
            {nudges.map((nudge) => (
                <Box
                    key={`${nudge.player}-${nudge.clinic}`}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.5,
                        minHeight: 56,
                        px: 2,
                        mb: 1,
                        bgcolor: "#FDF3E7",
                        borderLeft: "4px solid",
                        borderColor: appColors.orange,
                        borderRadius: `${appRadius.button}px`,
                    }}
                >
                    <LocalOfferIcon sx={{ fontSize: 22, color: "#A9661F" }} />
                    <Typography sx={{ fontSize: 16, color: appColors.textPrimary }}>
                        <strong>{nudge.player}</strong> is one date short on <strong>{nudge.clinic}</strong> — add one more and all{" "}
                        {nudge.discount.quantity} are {nudge.discount.percentOff}% off.
                    </Typography>
                </Box>
            ))}
        </Box>
    );
};

/**
 * **The confirmation screen.**
 *
 * > *"Hey Justin, yeah, I've got Stevie and Tyler for these dates. Does that
 * > all look good? Okay, sweet. I'll add to cart and then let's check out."*
 *
 * Every player, every clinic, every date, with an **edit** on each row —
 * *"maybe there's edit buttons so you can edit like, oh wait, Justin, actually
 * I'm going to put you on Wednesdays."*
 */
export const ConfirmationStep = ({
    registration,
    onEdit,
}: {
    registration: Registration;
    /** Jumps back to that player's dates. */
    onEdit?: (playerIndex: number) => void;
}) => {
    const totals = registrationTotals(registration);

    return (
        <Box sx={{ px: 3, py: 2.5 }}>
            <DiscountNudges registration={registration} />

            {registration.players.map((player, index) => {
                const prices = bookingsFor(registration, player.id).map(priceBooking);

                return (
                    <Box key={player.id} sx={{ bgcolor: appColors.surface, borderRadius: `${appRadius.card}px`, px: 2.5, py: 2, mb: 1.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minHeight: 40 }}>
                            <Typography sx={{ flex: 1, minWidth: 0, fontSize: 19, fontWeight: 500, color: appColors.textPrimary }}>
                                {playerName(player, index)}
                            </Typography>
                            <Box
                                onClick={() => onEdit?.(index)}
                                role={onEdit ? "button" : undefined}
                                aria-label={`Edit ${playerName(player, index)}`}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.75,
                                    minHeight: touchTarget.min,
                                    px: 1.5,
                                    cursor: onEdit ? "pointer" : "default",
                                }}
                            >
                                <EditIcon sx={{ fontSize: 18, color: appColors.greenDark }} />
                                <Typography sx={{ fontSize: 15, letterSpacing: "0.04em", color: appColors.greenDark }}>EDIT</Typography>
                            </Box>
                        </Box>

                        {prices.length === 0 && (
                            <Typography sx={{ fontSize: 16, color: appColors.textSecondary, py: 1 }}>
                                Not registered for anything.
                            </Typography>
                        )}

                        {prices.map((price) => (
                            <Box key={price.clinic.id} sx={{ borderTop: "1px solid", borderColor: appColors.divider, py: 1 }}>
                                <Box sx={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                                    <Typography sx={{ flex: 1, minWidth: 0, fontSize: 17, color: appColors.textPrimary }}>
                                        {price.clinic.name}
                                    </Typography>
                                    {price.saved > 0 && (
                                        <Typography sx={{ fontSize: 15, color: appColors.greenDark }}>
                                            {price.discount?.percentOff}% off — saving {usd(price.saved)}
                                        </Typography>
                                    )}
                                    <Typography sx={{ fontSize: 17, color: appColors.textPrimary }}>{usd(price.net)}</Typography>
                                </Box>
                                <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>{price.dates.join(" · ")}</Typography>
                            </Box>
                        ))}
                    </Box>
                );
            })}

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    minHeight: 64,
                    px: 2.5,
                    bgcolor: appColors.surface,
                    borderRadius: `${appRadius.card}px`,
                }}
            >
                <Typography sx={{ flex: 1, minWidth: 0, fontSize: 17, color: appColors.textSecondary }}>
                    {registration.players.length} {registration.players.length === 1 ? "player" : "players"} · {totals.dates} dates
                </Typography>
                {totals.saved > 0 && (
                    <Typography sx={{ fontSize: 16, color: appColors.greenDark }}>Discounts −{usd(totals.saved)}</Typography>
                )}
                <Typography sx={{ fontSize: 22, fontWeight: 500, color: appColors.textPrimary }}>{usd(totals.net)}</Typography>
            </Box>
        </Box>
    );
};
