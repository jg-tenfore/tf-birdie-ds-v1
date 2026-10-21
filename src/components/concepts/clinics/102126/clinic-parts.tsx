import { useState, type ReactNode } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SearchIcon from "@mui/icons-material/Search";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { touchTarget } from "@/theme/tokens";
import {
    clinicCatalog,
    datesOpenLabel,
    fitsParty,
    isNearlyFull,
    openSessions,
    searchClinics,
    spotsLabel,
    usd,
    type CatalogClinic,
    type CatalogSession,
} from "./clinic-catalog";

/**
 * **Oct 21 — the parts both versions share.**
 *
 * The Oct 20 round put three versions side by side and Weston picked the shape
 * of one of them:
 *
 * > *"I kind of like the line, like having them be line items instead of the
 * > boxes… there's like 30 boxes here. With the line, at least we could scroll.
 * > It makes sense time-wise too, as you're going, earliest to latest. And
 * > you're not going left to right and then left to right — it's just a lot of
 * > mental load."*
 *
 * > *"And then I do like the stepping. I really like that."*
 *
 * So the argument about rows versus chips is over, and these pieces are settled
 * for both versions. What is still open — how more than one person gets
 * registered — is the only thing A and B disagree about.
 *
 * Three things changed from the Oct 20 build, all of them subtractions:
 *
 * 1. **The roster bar is gone.** *"64 of 100 places taken"* told him nothing;
 *    `datesOpenLabel` replaced it with the sentence he asked for.
 * 2. **The per-date meters stay.** *"I like adding the little bars there… it's
 *    way easier to just see that and quickly scan"* — against a column of
 *    `1 spot left`, `6 spots left` read one line at a time.
 * 3. **The guest step lost its furniture.** The clinic stats above it and the
 *    `3 of 8 open dates chosen · $67.41` strip below it both went: *"this is
 *    more of just a confirmation of what you're doing and the customer you're
 *    adding… we're showing it here. Seems a little redundant."* The total is on
 *    the button, where it already was.
 */

/* --------------------------------------------------------------- the bar */

/** Grey track, green fill, amber once a session is nearly gone. */
export const FillBar = ({ taken, capacity }: { taken: number; capacity: number }) => {
    const share = Math.min(1, capacity === 0 ? 1 : taken / capacity);

    return (
        <Box sx={{ width: "100%", height: 8, bgcolor: appColors.divider, borderRadius: 4, overflow: "hidden" }}>
            <Box sx={{ width: `${share * 100}%`, height: "100%", bgcolor: share >= 0.8 ? appColors.orange : appColors.green }} />
        </Box>
    );
};

/* -------------------------------------------------------------- the list */

/** The MD2 filled search field above the clinic list. */
const SearchField = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => (
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
            value={value}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.value)}
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
);

const ClinicRow = ({ clinic, onOpen }: { clinic: CatalogClinic; onOpen?: () => void }) => {
    const open = openSessions(clinic).length;
    const soldOut = open === 0;

    return (
        <Box
            onClick={soldOut ? undefined : onOpen}
            role={soldOut ? undefined : "button"}
            aria-disabled={soldOut}
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                minHeight: 72,
                px: 2.5,
                bgcolor: appColors.surface,
                borderBottom: "1px solid",
                borderColor: appColors.divider,
                cursor: soldOut ? "default" : "pointer",
                "&:hover": soldOut ? undefined : { bgcolor: "#F7F9F8" },
            }}
        >
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 18, color: soldOut ? appColors.textDisabled : appColors.textPrimary }}>
                    {clinic.name}
                </Typography>
                <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>
                    {clinic.category} · {clinic.capacity} per session · {usd(clinic.price)} each
                </Typography>
            </Box>

            {/* The one figure the card carries, after the roster bar came off. */}
            <Typography
                sx={{
                    width: 180,
                    textAlign: "right",
                    fontSize: 16,
                    color: soldOut ? appColors.textDisabled : appColors.greenDark,
                }}
            >
                {datesOpenLabel(clinic)}
            </Typography>

            <ChevronRightIcon sx={{ fontSize: 26, color: soldOut ? appColors.textDisabled : appColors.textSecondary }} />
        </Box>
    );
};

/**
 * **Twenty clinics, searchable.**
 *
 * Weston: *"Do like 20… I'm assuming you just scroll and find the tile"* →
 * *"a search would be great."* Both: the rows scroll, and the field above them
 * filters on name and category as it is typed.
 */
export const ClinicSearchList = ({ clinics = clinicCatalog, onOpen }: { clinics?: CatalogClinic[]; onOpen?: (id: string) => void }) => {
    const [query, setQuery] = useState("");
    const matches = searchClinics(clinics, query);

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: appColors.canvas }}>
            <Box sx={{ flexShrink: 0, px: 3, pt: 2.5, pb: 2 }}>
                <Box sx={{ maxWidth: 520 }}>
                    <SearchField value={query} onChange={setQuery} />
                </Box>
                <Typography sx={{ fontSize: 15, color: appColors.textSecondary, mt: 1.5 }}>
                    {matches.length} of {clinics.length} clinics
                </Typography>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 3, pb: 3 }}>
                <Box sx={{ bgcolor: appColors.surface, borderRadius: `${appRadius.card}px`, overflow: "hidden" }}>
                    {matches.map((clinic) => (
                        <ClinicRow key={clinic.id} clinic={clinic} onOpen={() => onOpen?.(clinic.id)} />
                    ))}
                    {matches.length === 0 && (
                        <Typography sx={{ fontSize: 17, color: appColors.textSecondary, px: 2.5, py: 4 }}>
                            No clinic matches “{query}”.
                        </Typography>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

/* ------------------------------------------------------------ the header */

/**
 * The clinic, named once above whichever step is showing.
 *
 * What it no longer carries: the fill bar and *64 of 100 places taken*. Weston:
 * *"that doesn't tell me anything… if you just said 8 dates are still open,
 * then I know that they're open."*
 */
export const ClinicHeader = ({ clinic }: { clinic: CatalogClinic }) => (
    <Box
        sx={{
            flexShrink: 0,
            display: "flex",
            alignItems: "baseline",
            gap: 2,
            px: 3,
            py: 1.75,
            bgcolor: appColors.surface,
            borderBottom: "1px solid",
            borderColor: appColors.divider,
        }}
    >
        <Typography sx={{ fontSize: 20, fontWeight: 500, color: appColors.textPrimary }}>{clinic.name}</Typography>
        <Typography sx={{ fontSize: 16, color: appColors.textSecondary, flex: 1, minWidth: 0 }}>
            {clinic.category} · {clinic.capacity} per session · {usd(clinic.price)} each
        </Typography>
        <Typography sx={{ fontSize: 16, color: appColors.greenDark }}>{datesOpenLabel(clinic)}</Typography>
    </Box>
);

/* ------------------------------------------------------------- the dates */

const COLUMNS = { date: 150, time: 110, meter: 190, price: 90 } as const;

export const SessionRow = ({
    session,
    price,
    selected,
    party = 1,
    onToggle,
}: {
    session: CatalogSession;
    price: number;
    selected?: boolean;
    /** How many places this booking needs. A date that cannot hold them is out. */
    party?: number;
    onToggle?: () => void;
}) => {
    const full = session.spotsLeft === 0;
    const tooSmall = !full && !fitsParty(session, party);
    const blocked = full || tooSmall;

    return (
        <Box
            onClick={blocked ? undefined : onToggle}
            role={blocked ? undefined : "checkbox"}
            aria-checked={selected ?? false}
            aria-label={`${session.label} — ${spotsLabel(session.spotsLeft)}`}
            aria-disabled={blocked}
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                minHeight: touchTarget.comfortable,
                px: 2,
                bgcolor: blocked ? appColors.canvas : selected ? "#F3F7F4" : appColors.surface,
                borderBottom: "1px solid",
                borderColor: appColors.divider,
                cursor: blocked ? "default" : "pointer",
            }}
        >
            <Box sx={{ width: 28, display: "grid", placeItems: "center" }}>
                {blocked ? null : selected ? (
                    <Box
                        sx={{ width: 22, height: 22, display: "grid", placeItems: "center", borderRadius: "50%", bgcolor: appColors.green }}
                    >
                        <CheckIcon sx={{ fontSize: 15, color: "#fff" }} />
                    </Box>
                ) : (
                    <Box sx={{ width: 20, height: 20, borderRadius: 1, border: "2px solid", borderColor: appColors.textSecondary }} />
                )}
            </Box>

            <Typography sx={{ width: COLUMNS.date, fontSize: 17, color: blocked ? appColors.textDisabled : appColors.textPrimary }}>
                {session.date}
            </Typography>
            <Typography sx={{ width: COLUMNS.time, fontSize: 17, color: blocked ? appColors.textDisabled : appColors.textSecondary }}>
                {session.time}
            </Typography>

            <Box sx={{ width: COLUMNS.meter, display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 64 }}>
                    <FillBar taken={session.capacity - session.spotsLeft} capacity={session.capacity} />
                </Box>
                <Typography
                    sx={{
                        fontSize: 15,
                        color: blocked ? appColors.textDisabled : isNearlyFull(session.spotsLeft) ? "#A9661F" : appColors.textSecondary,
                    }}
                >
                    {spotsLabel(session.spotsLeft)}
                </Typography>
            </Box>

            {/* Why a date with places left is still unavailable, said on the row
                rather than left for the operator to work out. */}
            <Typography sx={{ flex: 1, minWidth: 0, fontSize: 15, color: "#A9661F" }}>
                {tooSmall ? `Needs ${party} — only ${session.spotsLeft} left` : ""}
            </Typography>

            <Typography
                sx={{
                    width: COLUMNS.price,
                    textAlign: "right",
                    fontSize: 17,
                    color: blocked ? appColors.textDisabled : appColors.textPrimary,
                }}
            >
                {usd(price * party)}
            </Typography>
        </Box>
    );
};

export const SessionTable = ({
    clinic,
    selected = [],
    party = 1,
    onToggle,
    onSelectAll,
}: {
    clinic: CatalogClinic;
    selected?: string[];
    party?: number;
    onToggle?: (label: string) => void;
    onSelectAll?: () => void;
}) => (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Box sx={{ flexShrink: 0, display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, pt: 2.5, pb: 1 }}>
            <Typography sx={{ fontSize: 13, letterSpacing: "0.08em", color: appColors.textSecondary }}>
                DATES {party > 1 && `· ${party} places on each`}
            </Typography>
            <Box sx={{ width: 200 }}>
                <ActionButton onClick={onSelectAll}>SELECT ALL OPEN</ActionButton>
            </Box>
        </Box>

        <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 3, pb: 3 }}>
            <Box sx={{ bgcolor: appColors.surface, borderRadius: `${appRadius.card}px`, overflow: "hidden" }}>
                {clinic.sessions.map((session) => (
                    <SessionRow
                        key={session.label}
                        session={session}
                        price={clinic.price}
                        party={party}
                        selected={selected.includes(session.label)}
                        onToggle={() => onToggle?.(session.label)}
                    />
                ))}
            </Box>
        </Box>
    </Box>
);

/* ------------------------------------------------------ the booking card */

/**
 * What the guest step opens with: the dates, and nothing else.
 *
 * This is the whole of what Weston left on that screen — *"this is more of just
 * a confirmation of this is what you're doing, this is the customer you're
 * adding."*
 */
export const BookingSummary = ({ clinic, chosen, party = 1 }: { clinic: CatalogClinic; chosen: CatalogSession[]; party?: number }) => {
    const total = chosen.length * clinic.price * party;

    return (
        <Box sx={{ bgcolor: appColors.surface, borderRadius: `${appRadius.card}px`, px: 2, py: 1 }}>
            {chosen.map((session) => (
                <Box
                    key={session.label}
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        minHeight: 40,
                        alignItems: "center",
                        borderBottom: "1px solid",
                        borderColor: appColors.divider,
                    }}
                >
                    <Typography sx={{ fontSize: 15, color: appColors.textPrimary }}>{session.label}</Typography>
                    <Typography sx={{ fontSize: 15, color: appColors.textPrimary }}>{usd(clinic.price * party)}</Typography>
                </Box>
            ))}
            <Box sx={{ display: "flex", justifyContent: "space-between", minHeight: 44, alignItems: "center" }}>
                <Typography sx={{ fontSize: 16, fontWeight: 500, color: appColors.textPrimary }}>
                    {chosen.length} {chosen.length === 1 ? "session" : "sessions"}
                    {party > 1 && ` · ${party} players`}
                </Typography>
                <Typography sx={{ fontSize: 18, fontWeight: 500, color: appColors.textPrimary }}>{usd(total)}</Typography>
            </Box>
        </Box>
    );
};

/* ------------------------------------------------------------- the guest */

export interface Guest {
    first: string;
    last: string;
    email: string;
    phone: string;
}

export const guestName = (guest: Guest): string => `${guest.first} ${guest.last}`.trim();

/** One MD2 filled field — empty and searchable, or filled with a known value. */
export const GuestField = ({ label, value, searchable = true }: { label: string; value?: string; searchable?: boolean }) => (
    <Box
        sx={{
            flex: "1 1 360px",
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
        {searchable && !value && <SearchIcon sx={{ fontSize: 22, color: appColors.textSecondary }} />}
        <Box sx={{ minWidth: 0 }}>
            {value && <Typography sx={{ fontSize: 12, color: appColors.textSecondary, lineHeight: 1.2 }}>{label}</Typography>}
            <Typography sx={{ fontSize: 18, color: value ? appColors.textPrimary : appColors.textSecondary }}>{value || label}</Typography>
        </Box>
    </Box>
);

/** The six-field customer search, with whatever is already known filled in. */
export const GuestForm = ({ guest }: { guest?: Guest }) => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, maxWidth: 880 }}>
        <GuestField label="First Name" value={guest?.first} />
        <GuestField label="Last Name" value={guest?.last} />
        <GuestField label="Email" value={guest?.email} />
        <GuestField label="Phone" value={guest?.phone} />
        <GuestField label="Customer Birthday" searchable={false} />
        <GuestField label="Golf Course Customer ID" searchable={false} />
    </Box>
);

/** A labelled band inside a step. */
export const StepSection = ({ label, children, sx }: { label: string; children: ReactNode; sx?: object }) => (
    <Box sx={{ mb: 3, ...sx }}>
        <Typography sx={{ fontSize: 13, letterSpacing: "0.08em", color: appColors.textSecondary, mb: 1 }}>{label}</Typography>
        {children}
    </Box>
);
