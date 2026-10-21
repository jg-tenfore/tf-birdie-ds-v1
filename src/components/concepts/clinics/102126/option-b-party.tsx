import { useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import GroupIcon from "@mui/icons-material/Group";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { ClinicStepper } from "../102026/clinic-stepper";
import { fitsParty, openSessions, usd, type CatalogClinic } from "./clinic-catalog";
import { BookingSummary, ClinicHeader, GuestForm, SessionTable, StepSection, guestName, type Guest } from "./clinic-parts";

/**
 * **Option B — the party, up front.**
 *
 * Weston, thinking out loud about the thing the shipping flow cannot do:
 *
 * > *"I think I'm leaning towards being able to do multiple, because I'd
 * > imagine nine times out of ten, let's say I register one person, I'm going
 * > to do the exact same thing."*
 *
 * And then the catch he raised himself:
 *
 * > *"Does that make it harder, because now you're checking for two or three or
 * > five people? Does the validation get interesting — what if one session has
 * > one availability but another one you selected has two? We'd have to throw
 * > an error there."*
 *
 * Justin's answer, which Weston took: ask first.
 *
 * > — *"Do you want to ask up front how many people you want to register,
 * >   before we get into this step, just so it can hone down the spots that are
 * >   available?"*
 * > — *"Yeah, yeah… because then here we could just say like, this one spot
 * >   left — but this won't work for 2 participants, so it's greyed out."*
 *
 * That is the whole design. **The party size is a question, asked before the
 * dates, and the dates answer it.** A date with one place left is not an error
 * for a party of two — it is simply not offered. No validation message, because
 * there is nothing left to get wrong.
 *
 * Three steps: **1 Players**, **2 Dates**, **3 Who they are**.
 *
 * **The assumption this version makes, and the one still open:** everyone in
 * the party takes the *same* dates. Weston on the alternative — one person on
 * these dates, another on those, inside one booking:
 *
 * > *"It just feels weird, like you'd start assigning… that should be separate,
 * > right, in that case."*
 *
 * So different dates means a second booking, which is Option A's path. If that
 * turns out to be common, the fix is a *per-player* dates step rather than a
 * shared one, and this flow is where it would go.
 */

const PARTY_CHOICES = [1, 2, 3, 4, 5, 6];

/** A tap target per party size — the whole of step 1. */
const PartyPicker = ({ clinic, party, onParty }: { clinic: CatalogClinic; party: number; onParty?: (count: number) => void }) => (
    <Box sx={{ px: 3, py: 3 }}>
        <Typography sx={{ fontSize: 24, color: appColors.textPrimary, mb: 0.5 }}>How many players?</Typography>
        <Typography sx={{ fontSize: 16, color: appColors.textSecondary, mb: 3 }}>
            Dates that cannot seat everyone are left out of the next step, so nothing has to be undone later.
        </Typography>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 3 }}>
            {PARTY_CHOICES.map((count) => {
                const active = count === party;
                const openForCount = clinic.sessions.filter((session) => fitsParty(session, count)).length;

                return (
                    <Box
                        key={count}
                        onClick={() => onParty?.(count)}
                        role="radio"
                        aria-checked={active}
                        aria-label={`${count} ${count === 1 ? "player" : "players"}`}
                        sx={{
                            width: 128,
                            minHeight: 104,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 0.5,
                            cursor: "pointer",
                            borderRadius: `${appRadius.card}px`,
                            bgcolor: active ? appColors.green : appColors.surface,
                            border: "1px solid",
                            borderColor: active ? appColors.green : appColors.divider,
                        }}
                    >
                        <Typography sx={{ fontSize: 30, fontWeight: 500, color: active ? "#fff" : appColors.textPrimary }}>
                            {count}
                        </Typography>
                        {/* The consequence of the choice, before it is made:
                            picking 4 visibly costs you dates. */}
                        <Typography sx={{ fontSize: 13, color: active ? "rgba(255,255,255,0.9)" : appColors.textSecondary }}>
                            {openForCount === 0 ? "no dates fit" : `${openForCount} dates fit`}
                        </Typography>
                    </Box>
                );
            })}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, maxWidth: 820 }}>
            <GroupIcon sx={{ fontSize: 22, color: appColors.textSecondary }} />
            <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>
                Everyone in the party is booked into the same dates. To put someone on different dates, add this booking and start another —
                the names carry over.
            </Typography>
        </Box>
    </Box>
);

/**
 * One player's search row on step 3.
 *
 * Each card looks up its own person — tap any field and a different family
 * member fills in, so a party of four reads as four people rather than one
 * name repeated.
 */
const PlayerCard = ({ index, guest }: { index: number; guest?: Guest }) => {
    const [found, setFound] = useState<Guest | undefined>(guest);

    const [lastGuest, setLastGuest] = useState(guest);

    // Reset when the recall changes, during render rather than in an effect.
    if (guest !== lastGuest) {
        setLastGuest(guest);
        setFound(guest);
    }

    return (
        <Box sx={{ bgcolor: appColors.surface, borderRadius: `${appRadius.card}px`, px: 2.5, py: 2, mb: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minHeight: 32 }}>
                <Box
                    sx={{
                        width: 26,
                        height: 26,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: "50%",
                        bgcolor: found ? appColors.green : appColors.divider,
                        color: found ? "#fff" : appColors.textSecondary,
                        fontSize: 14,
                    }}
                >
                    {index + 1}
                </Box>
                <Typography sx={{ fontSize: 17, color: appColors.textPrimary }}>
                    {found ? guestName(found) : `Player ${index + 1}`}
                </Typography>
                {index === 0 && guest && found === guest && (
                    <Typography sx={{ fontSize: 14, color: appColors.greenDark }}>carried over from the last booking</Typography>
                )}
            </Box>

            <Box sx={{ mt: 1.5 }}>
                <GuestForm guest={guest} customerIndex={index} compact onFound={setFound} />
            </Box>
        </Box>
    );
};

export const ClinicBookingB = ({
    clinic,
    party = 1,
    selected = [],
    step = 0,
    guest,
    onParty,
    onToggle,
    onSelectAll,
    onStep,
}: {
    clinic: CatalogClinic;
    /** How many people this booking is for. */
    party?: number;
    selected?: string[];
    /** 0 = players, 1 = dates, 2 = who they are. */
    step?: number;
    /** Who the last booking was for — player 1 starts filled in. */
    guest?: Guest;
    onParty?: (count: number) => void;
    onToggle?: (label: string) => void;
    onSelectAll?: () => void;
    onStep?: (index: number) => void;
}) => {
    const chosen = clinic.sessions.filter((session) => selected.includes(session.label));
    const total = chosen.length * clinic.price * party;

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: appColors.canvas }}>
            <ClinicStepper
                steps={[
                    { label: "Players", hint: `${party} ${party === 1 ? "player" : "players"}` },
                    { label: "Dates", hint: chosen.length ? `${chosen.length} chosen · ${usd(total)}` : "None chosen yet" },
                    { label: "Who they are", hint: party === 1 ? "Who is being booked" : `${party} names` },
                ]}
                current={step}
                onStep={onStep}
            />

            {step === 0 && (
                <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                    <PartyPicker clinic={clinic} party={party} onParty={onParty} />
                </Box>
            )}

            {step === 1 && (
                <>
                    <ClinicHeader clinic={clinic} />
                    <Box sx={{ flex: 1, minHeight: 0 }}>
                        <SessionTable clinic={clinic} selected={selected} party={party} onToggle={onToggle} onSelectAll={onSelectAll} />
                    </Box>
                </>
            )}

            {step === 2 && (
                <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 3, py: 2.5 }}>
                    <StepSection label="BOOKING">
                        <BookingSummary clinic={clinic} chosen={chosen} party={party} />
                    </StepSection>

                    <StepSection label={party === 1 ? "WHO IS IT FOR" : "WHO THEY ARE"}>
                        {Array.from({ length: party }, (_, index) => (
                            <PlayerCard key={index} index={index} guest={index === 0 ? guest : undefined} />
                        ))}
                    </StepSection>
                </Box>
            )}
        </Box>
    );
};

/**
 * What SELECT ALL OPEN reaches for a party: the dates that can seat all of
 * them, which is not the same list as the dates that are not full.
 */
export const openLabelsB = (clinic: CatalogClinic, party: number): string[] =>
    openSessions(clinic)
        .filter((session) => fitsParty(session, party))
        .map((session) => session.label);

/** The smallest party the clinic cannot seat anywhere — for the story notes. */
export const partyCeiling = (clinic: CatalogClinic): number => Math.max(0, ...clinic.sessions.map((session) => session.spotsLeft));

export default ClinicBookingB;
