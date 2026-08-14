import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";

import type { Raincheck } from "@/data/rainchecks";
import { appColors } from "@/theme/app-replica-tokens";

/**
 * **Concept.** The RAIN tender, rearranged.
 *
 * In the Aug 13 walkthrough Weston never searched for anything: "because I'm in
 * the cart on the bottom it says Weston Senior — that's the person who's in the
 * cart. It shows the rainchecks that I have to my name." The ticket already
 * knows who it belongs to, so the tender should open on that person's credits
 * and treat search as the fallback for the case it cannot cover — a credit
 * issued to somebody else's account, which is exactly the guest case the
 * issuance concept supports.
 *
 * The other change is what a result says. The shipping chips carry an id and a
 * balance in 12px, which is the least a counter can be told: two credits for one
 * customer are distinguishable only by numbers neither party recognises. These
 * cards name the round the credit came from, because that is what the customer
 * remembers — not "51381", but "the seven o'clock on the twentieth".
 *
 * Same tokens, same palette, same button shapes as the shipping tender. Only the
 * arrangement and the defaults are new.
 */

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

const CreditCard = ({ credit, selected, onSelect, owed }: { credit: Raincheck; selected: boolean; onSelect?: () => void; owed: number }) => {
    const covers = credit.balance + 0.001 >= owed;
    return (
        <ButtonBase
            onClick={onSelect}
            sx={{
                display: "block",
                width: "100%",
                textAlign: "left",
                px: 2,
                py: 1.5,
                bgcolor: selected ? "#EAF3EC" : appColors.surface,
                border: "1px solid",
                borderColor: selected ? appColors.greenTee : appColors.divider,
                borderLeft: "4px solid",
                borderLeftColor: selected ? appColors.greenTee : "transparent",
            }}
        >
            <Stack direction="row" sx={{ alignItems: "baseline", gap: 2 }}>
                <Typography sx={{ fontSize: 26, flex: 1, color: appColors.greenTee }}>{usd(credit.balance)}</Typography>
                <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>Raincheck {credit.id}</Typography>
            </Stack>

            {/* What the customer will actually recognise. */}
            <Typography sx={{ fontSize: 16, mt: 0.25 }}>{credit.teeTime ?? `Reservation ${credit.reservation}`}</Typography>
            <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>
                {credit.holesPlayed} of {credit.totalHoles} holes played on {usd(credit.roundPrice)}
                {credit.spent > 0 ? ` · ${usd(credit.spent)} already spent` : ""} · expires {credit.expires}
            </Typography>

            {/* Says whether it settles the ticket before the operator commits,
                rather than after — the shipping flow only finds out on apply. */}
            <Typography sx={{ fontSize: 14, mt: 0.75, color: covers ? appColors.greenTee : appColors.orange }}>
                {covers ? "Covers this ticket in full" : `${usd(owed - credit.balance)} would still be owed`}
            </Typography>
        </ButtonBase>
    );
};

export interface CartCreditsProps {
    /** Who the ticket belongs to. The tender opens on their credits. */
    customerName: string;
    credits: Raincheck[];
    selectedId?: string;
    onSelect?: (id: string) => void;
    /** What the ticket owes, so each card can say whether it clears it. */
    owed: number;
    /** The fallback for a credit held on somebody else's account. */
    query?: string;
    onQuery?: (query: string) => void;
    searchResults?: Raincheck[];
    /** Forces the searching state, so a story can show it without focus. */
    searching?: boolean;
    onSearchingChange?: (searching: boolean) => void;
}

/**
 * The search field. One component, two positions.
 *
 * Idle it sits at the foot of the pane, quiet, out of the way of the answer the
 * operator usually wants. Focused it moves to the top — which is where the
 * shipping RAIN tender puts its lookup, so the moment search is actually being
 * used the layout matches the screen everyone already knows.
 */
const SearchField = ({
    query,
    onQuery,
    onFocus,
    autoFocus,
}: {
    query: string;
    onQuery?: (q: string) => void;
    onFocus?: () => void;
    autoFocus?: boolean;
}) => (
    <Stack
        direction="row"
        sx={{ alignItems: "center", gap: 1, bgcolor: "#E4E6E8", px: 2, borderBottom: `1px solid ${appColors.textSecondary}` }}
    >
        <SearchIcon sx={{ fontSize: 20, color: appColors.textSecondary }} />
        <InputBase
            value={query}
            autoFocus={autoFocus}
            onFocus={onFocus}
            onChange={(e) => onQuery?.(e.target.value)}
            placeholder="Find a raincheck on another account — id, name or email"
            inputProps={{ "aria-label": "Find a raincheck on another account" }}
            sx={{ flex: 1, "& input": { fontSize: 16, py: 1.5 } }}
        />
    </Stack>
);

export const CartCredits = ({
    customerName,
    credits,
    selectedId,
    onSelect,
    owed,
    query = "",
    onQuery,
    searchResults,
    searching: searchingProp,
    onSearchingChange,
}: CartCreditsProps) => {
    // Focus opens search, not two typed characters. A field that looks the same
    // whether or not it is about to change everything below it is the thing that
    // makes people type into it by accident.
    const [focused, setFocused] = useState(false);
    const searching = searchingProp ?? (focused || query.trim().length > 0);
    const typed = query.trim().length >= 2;
    const shown = searching ? (typed ? (searchResults ?? []) : []) : credits;

    const setSearching = (next: boolean) => {
        setFocused(next);
        onSearchingChange?.(next);
        if (!next) onQuery?.("");
    };

    return (
        <Stack sx={{ flex: 1, minHeight: 0, bgcolor: "#F4F6F8", p: 2, gap: 2, overflowY: "auto" }}>
            {searching ? (
                <>
                    {/* The way back. Without it, opening search is a one-way door
                        out of the list the operator wanted in the first place. */}
                    <ButtonBase
                        onClick={() => setSearching(false)}
                        sx={{ alignSelf: "flex-start", gap: 0.5, px: 0.5, py: 0.75, color: appColors.textSecondary, fontSize: 15 }}
                    >
                        <ArrowBackIcon sx={{ fontSize: 18 }} />
                        {customerName}&rsquo;s rainchecks
                    </ButtonBase>

                    <SearchField query={query} onQuery={onQuery} autoFocus />

                    <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>
                        Searching every account, not just this ticket&rsquo;s — for a credit issued to somebody else.
                    </Typography>
                </>
            ) : (
                <Box>
                    <Typography sx={{ fontSize: 20 }}>Rainchecks for {customerName}</Typography>
                    <Typography sx={{ fontSize: 14, color: appColors.textSecondary, mt: 0.25 }}>
                        This ticket&rsquo;s customer. Search below for a credit held on another account.
                    </Typography>
                </Box>
            )}

            {shown.length === 0 ? (
                <Box sx={{ bgcolor: appColors.surface, border: `1px solid ${appColors.divider}`, px: 2, py: 3 }}>
                    <Typography sx={{ fontSize: 17, color: appColors.textSecondary }}>
                        {!searching
                            ? `${customerName} has no rainchecks.`
                            : typed
                              ? `No rainchecks match “${query.trim()}”.`
                              : "Type a raincheck id, a customer name or an email."}
                    </Typography>
                </Box>
            ) : (
                <Stack sx={{ gap: 1 }}>
                    {shown.map((c) => (
                        <CreditCard key={c.id} credit={c} owed={owed} selected={c.id === selectedId} onSelect={() => onSelect?.(c.id)} />
                    ))}
                </Stack>
            )}

            {!searching && (
                <Box sx={{ mt: "auto" }}>
                    <SearchField query={query} onQuery={onQuery} onFocus={() => setSearching(true)} />
                </Box>
            )}
        </Stack>
    );
};
