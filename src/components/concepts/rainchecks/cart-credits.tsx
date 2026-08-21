import { useState } from "react";

import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import ButtonBase from "@mui/material/ButtonBase";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";

import { isExpired, isRedeemable, isSpentOut, isVoided, type Raincheck } from "@/data/rainchecks";
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
 * Search sits above the list and opens **full screen**. Finding a credit on
 * somebody else's account is a different job from picking one of this customer's
 * two, and it does not belong in a 45%-wide column under a tender strip — so it
 * takes the whole screen, with one centred field in the app's own lookup shape.
 * The cost is that the ticket goes off screen while you look, which is why the
 * modal's bar restates what is owed.
 *
 * Same tokens, same palette, same button shapes as the shipping tender. Only the
 * arrangement and the defaults are new.
 */

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

/**
 * What a credit has already paid for.
 *
 * The balance says how much is left; this says where the rest went. It is the
 * difference between telling a customer "that one's empty" and telling them
 * "you spent it on the 25th of April on a glove and two sleeves" — and only the
 * second one ends the conversation.
 */
const RedemptionLines = ({ credit }: { credit: Raincheck }) => {
    if (!credit.redemptions?.length) return null;
    return (
        <Stack sx={{ mt: 0.75, pt: 0.75, borderTop: `1px solid ${appColors.divider}`, gap: 0.25 }}>
            {credit.redemptions.map((r) => (
                <Stack key={r.order} direction="row" sx={{ gap: 1, alignItems: "baseline" }}>
                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary, minWidth: 74 }}>{r.at}</Typography>
                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary, minWidth: 62 }}>−{usd(r.amount)}</Typography>
                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary, flex: 1 }}>{r.what}</Typography>
                    <Typography sx={{ fontSize: 13, color: appColors.textDisabled }}>#{r.order}</Typography>
                </Stack>
            ))}
        </Stack>
    );
};

const CreditCard = ({
    credit,
    selected,
    onSelect,
    owed,
}: {
    credit: Raincheck;
    selected: boolean;
    onSelect?: () => void;
    owed: number;
}) => {
    const voided = isVoided(credit);
    const used = !voided && isSpentOut(credit);
    const expired = !voided && !used && isExpired(credit);
    const dead = voided || used || expired;
    const covers = credit.balance + 0.001 >= owed;
    return (
        <ButtonBase
            onClick={dead ? undefined : onSelect}
            disabled={dead}
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
                // Present but plainly not on offer. Hiding it is what the
                // shipping lookup does, and it is why "I know I have one" is an
                // argument the counter cannot win.
                opacity: dead ? 0.6 : 1,
            }}
        >
            <Stack direction="row" sx={{ alignItems: "baseline", gap: 2 }}>
                <Typography sx={{ fontSize: 26, flex: 1, color: dead ? appColors.textSecondary : appColors.greenTee }}>
                    {used ? usd(0) : usd(credit.balance)}
                </Typography>
                {dead && (
                    <Typography
                        sx={{
                            fontSize: 13,
                            color: voided ? appColors.red : expired ? appColors.orange : appColors.textSecondary,
                            border: `1px solid ${voided ? appColors.red : expired ? appColors.orange : appColors.divider}`,
                            px: 1,
                            py: 0.25,
                        }}
                    >
                        {voided ? "VOIDED" : used ? "USED" : "EXPIRED"}
                    </Typography>
                )}
                <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>Raincheck {credit.id}</Typography>
            </Stack>

            {/* What the customer will actually recognise. */}
            <Typography sx={{ fontSize: 16, mt: 0.25 }}>{credit.teeTime ?? `Reservation ${credit.reservation}`}</Typography>
            <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>
                {credit.holesPlayed} of {credit.totalHoles} holes played on {usd(credit.roundPrice)} · issued {usd(credit.awarded)}
                {credit.spent > 0 ? ` · ${usd(credit.spent)} spent` : ""} · expires {credit.expires}
            </Typography>

            {/* Says whether it settles the ticket before the operator commits,
                rather than after — the shipping flow only finds out on apply. */}
            {voided && (
                <Typography sx={{ fontSize: 14, mt: 0.75, color: appColors.red }}>
                    Voided {credit.voided!.at} by {credit.voided!.by} — {credit.voided!.reason}
                </Typography>
            )}
            {expired && (
                <Typography sx={{ fontSize: 14, mt: 0.75, color: appColors.orange }}>
                    Expired {credit.expires} — {usd(credit.balance)} was still on it
                </Typography>
            )}
            {!dead && (
                <Typography sx={{ fontSize: 14, mt: 0.75, color: covers ? appColors.greenTee : appColors.orange }}>
                    {covers ? "Covers this ticket in full" : `${usd(owed - credit.balance)} would still be owed`}
                </Typography>
            )}

            <RedemptionLines credit={credit} />
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
 * The search field, pinned to the top of the pane.
 *
 * Above the list rather than below it, because it is the first thing a hand
 * reaches for when the answer on screen is not the one the customer expects —
 * and because every other lookup in the app puts its field first.
 *
 * Tapping it opens the modal rather than typing in place. A field that quietly
 * swaps the list underneath it gives the operator no signal that the scope just
 * widened from this ticket's customer to every account on the system.
 */
const SearchField = ({ query, onOpen }: { query: string; onOpen?: () => void }) => (
    <ButtonBase
        onClick={onOpen}
        sx={{
            justifyContent: "flex-start",
            gap: 1,
            width: "100%",
            bgcolor: "#E4E6E8",
            px: 2,
            py: 1.5,
            borderBottom: `1px solid ${appColors.textSecondary}`,
        }}
    >
        <SearchIcon sx={{ fontSize: 20, color: appColors.textSecondary }} />
        <Typography sx={{ fontSize: 16, color: query ? appColors.textPrimary : appColors.textSecondary }}>
            {query || "Find a raincheck on another account — id, name or email"}
        </Typography>
    </ButtonBase>
);

/**
 * Search, full screen.
 *
 * The pane behind this is 45% of a 1280px tablet and already carries a list, a
 * heading and a tender strip. Searching every account on the system is a
 * different job from picking one of this customer's two credits, so it gets the
 * whole screen: one field, focused, in the app's own centred-lookup convention,
 * over results with room to be read.
 *
 * The trade is that the ticket goes off screen while you look. That is the cost
 * of the takeover and it is worth naming — an operator cannot check what is owed
 * mid-search, so the total is restated in the bar.
 */
const SearchModal = ({
    open,
    customerName,
    query,
    onQuery,
    results,
    owed,
    onPick,
    onClose,
}: {
    open: boolean;
    customerName: string;
    query: string;
    onQuery?: (q: string) => void;
    results: Raincheck[];
    owed: number;
    onPick?: (id: string) => void;
    onClose: () => void;
}) => {
    const typed = query.trim().length >= 2;
    const available = results.filter((c) => isRedeemable(c));
    const dead = results.filter((c) => !isRedeemable(c));

    return (
        <Dialog fullScreen open={open} onClose={onClose} slotProps={{ paper: { sx: { bgcolor: appColors.canvas } } }}>
            {/* The app bar, in the app's own slate — so the takeover reads as a
                screen this system already has, not a web overlay. */}
            <Stack direction="row" sx={{ alignItems: "center", gap: 1, bgcolor: appColors.slate, color: "#fff", px: 1, py: 1 }}>
                <IconButton aria-label="Close raincheck search" onClick={onClose} sx={{ color: "#fff", width: 48, height: 48 }}>
                    <ArrowBackIcon />
                </IconButton>
                <Typography sx={{ flex: 1, fontSize: 20 }}>Search all accounts</Typography>
                <Typography sx={{ fontSize: 16, color: "rgba(255,255,255,0.8)", pr: 1.5 }}>{usd(owed)} owed</Typography>
            </Stack>

            {/* Centred and underlined — the same field Customer Search uses, which
                is the app's established shape for "find a person or a record". */}
            <Box sx={{ px: 3, pt: 6, pb: 2, maxWidth: 900, mx: "auto", width: "100%" }}>
                <Typography sx={{ fontSize: 22, textAlign: "center", mb: 2 }}>Find a raincheck</Typography>
                <InputBase
                    autoFocus
                    value={query}
                    onChange={(e) => onQuery?.(e.target.value)}
                    placeholder="Raincheck id, customer name, or email"
                    inputProps={{ "aria-label": "Find a raincheck on another account" }}
                    sx={{
                        width: "100%",
                        borderBottom: `1px solid ${appColors.textPrimary}`,
                        "& input": {
                            fontSize: 22,
                            textAlign: "center",
                            py: 1,
                            "&::placeholder": { color: appColors.textSecondary, opacity: 1 },
                        },
                    }}
                />
                <Typography sx={{ fontSize: 14, color: appColors.textSecondary, textAlign: "center", mt: 1.5 }}>
                    Every account, not just {customerName}&rsquo;s — for a credit issued to somebody else.
                </Typography>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 3, pb: 3, maxWidth: 900, mx: "auto", width: "100%" }}>
                {!typed ? (
                    <Typography sx={{ fontSize: 17, color: appColors.textSecondary, textAlign: "center", mt: 2 }}>
                        Two characters is enough to start.
                    </Typography>
                ) : results.length === 0 ? (
                    <Typography sx={{ fontSize: 17, color: appColors.textSecondary, textAlign: "center", mt: 2 }}>
                        No rainchecks match &ldquo;{query.trim()}&rdquo;.
                    </Typography>
                ) : (
                    <Stack sx={{ gap: 1 }}>
                        {available.map((c) => (
                            <CreditCard key={c.id} credit={c} owed={owed} selected={false} onSelect={() => onPick?.(c.id)} />
                        ))}
                        {dead.length > 0 && (
                            <>
                                <Typography sx={{ fontSize: 14, color: appColors.textSecondary, mt: 1 }}>
                                    Cannot be taken — used up or expired
                                </Typography>
                                {dead.map((c) => (
                                    <CreditCard key={c.id} credit={c} owed={owed} selected={false} />
                                ))}
                            </>
                        )}
                    </Stack>
                )}
            </Box>
        </Dialog>
    );
};

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
    const [open, setOpen] = useState(false);
    const searching = searchingProp ?? open;

    // The pane always lists this ticket's customer. Search is a different screen
    // now, so the list underneath never changes out from under the operator.
    const available = credits.filter((c) => isRedeemable(c));
    const expired = credits.filter((c) => !isVoided(c) && !isSpentOut(c) && isExpired(c));
    const used = credits.filter((c) => isVoided(c) || isSpentOut(c));

    const setSearching = (next: boolean) => {
        setOpen(next);
        onSearchingChange?.(next);
        if (!next) onQuery?.("");
    };

    return (
        <Stack sx={{ flex: 1, minHeight: 0, bgcolor: "#F4F6F8", p: 2, gap: 2, overflowY: "auto" }}>
            {/* Field first. */}
            <SearchField query={query} onOpen={() => setSearching(true)} />

            <Box>
                <Typography sx={{ fontSize: 20 }}>Rainchecks for {customerName}</Typography>
                <Typography sx={{ fontSize: 14, color: appColors.textSecondary, mt: 0.25 }}>
                    This ticket&rsquo;s customer. Search above for a credit held on another account.
                </Typography>
            </Box>

            {credits.length === 0 ? (
                <Box sx={{ bgcolor: appColors.surface, border: `1px solid ${appColors.divider}`, px: 2, py: 3 }}>
                    <Typography sx={{ fontSize: 17, color: appColors.textSecondary }}>{customerName} has never had a raincheck.</Typography>
                </Box>
            ) : (
                <Stack sx={{ gap: 1 }}>
                    {available.map((c) => (
                        <CreditCard key={c.id} credit={c} owed={owed} selected={c.id === selectedId} onSelect={() => onSelect?.(c.id)} />
                    ))}

                    {expired.length > 0 && (
                        <>
                            <Typography sx={{ fontSize: 14, color: appColors.textSecondary, mt: 1 }}>
                                Expired — {expired.length === 1 ? "1 raincheck" : `${expired.length} rainchecks`} the terminal will not take
                            </Typography>
                            {expired.map((c) => (
                                <CreditCard key={c.id} credit={c} owed={owed} selected={false} />
                            ))}
                        </>
                    )}

                    {used.length > 0 && (
                        <>
                            {available.length === 0 && expired.length === 0 && (
                                <Box sx={{ bgcolor: appColors.surface, border: `1px solid ${appColors.divider}`, px: 2, py: 2 }}>
                                    <Typography sx={{ fontSize: 17 }}>Nothing left to spend.</Typography>
                                    <Typography sx={{ fontSize: 14, color: appColors.textSecondary, mt: 0.25 }}>
                                        {customerName} has had {used.length === 1 ? "a raincheck" : `${used.length} rainchecks`}, and{" "}
                                        {used.length === 1 ? "it is" : "they are"} spent out. What went where is below.
                                    </Typography>
                                </Box>
                            )}
                            <Typography sx={{ fontSize: 14, color: appColors.textSecondary, mt: 1 }}>
                                Used or voided — {used.length === 1 ? "1 raincheck" : `${used.length} rainchecks`} that cannot be taken
                            </Typography>
                            {used.map((c) => (
                                <CreditCard key={c.id} credit={c} owed={owed} selected={false} />
                            ))}
                        </>
                    )}
                </Stack>
            )}

            <SearchModal
                open={searching}
                customerName={customerName}
                query={query}
                onQuery={onQuery}
                results={searchResults ?? []}
                owed={owed}
                onPick={(id) => {
                    onSelect?.(id);
                    setSearching(false);
                }}
                onClose={() => setSearching(false)}
            />
        </Stack>
    );
};
