import { useMemo, useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import HistoryIcon from "@mui/icons-material/History";
import SearchIcon from "@mui/icons-material/Search";

import {
    creditsForCustomer,
    isRedeemable,
    noCreditsSummary,
    searchAllRainchecks,
    searchRainchecks,
    type Raincheck,
} from "@/data/rainchecks";
import { appColors } from "@/theme/app-replica-tokens";
import { CreditRow, NothingSpendable } from "../credit-history";

/**
 * **Aug 31 — the chosen solution.** The RAIN tender, as two tabs.
 *
 * Aug 24 put three options on the table. The stakeholder picked **Option B**:
 *
 * > **AVAILABLE** — what ships today, never slowed down by anything.
 * > **HISTORY** — everything else, one tap away, with a count badge.
 *
 * Everything in the `Aug 31` folder is branched from that decision. A and C are
 * not alternatives any more; where this file departs from Aug 24's `OptionBTabs`
 * it is because B had two known holes, and a chosen solution has to have them
 * closed before anyone builds it.
 *
 * ## The two holes, and what closes them
 *
 * **1. The badge was the only thing preventing a repeat of the incident.**
 *
 * Aug 24's own note said so: *"An operator who does not notice it says 'I don't
 * see it here' exactly as before."* A 20px amber pill is not a load-bearing
 * structure. So the Available tab **is never allowed to render as empty**. When
 * nothing is spendable it states what the customer actually had — the sentence
 * meant to be read out loud — and offers a labelled, 48dp route into History
 * that names the count. See {@link HandoffBanner}.
 *
 * That is the whole fix for the incident as Weston told it, and it involves no
 * search: the tender already opens on the cart customer.
 *
 * **2. A credit found under another name could not be spent.**
 *
 * Aug 24 rendered every History row read-only. But History search spans *all*
 * customers — a misspelling, a spouse's booking, a company account — so it can
 * surface a credit that is perfectly live. Finding it and not being able to
 * tap it is a new dead end where the old one was. **History rows are selectable
 * whenever the credit is spendable**, and read-only otherwise. See
 * {@link HistoryTab}.
 *
 * ## What is reused rather than rebuilt
 *
 * `StateChip`, `CreditRow`, `CreditOrigin`, `CreditActivity` and
 * `NothingSpendable` all come from `../credit-history` unchanged. They were
 * built for Aug 24 and are shared by every screen in this folder, the listing
 * and the payment result included. **There is one credit row in this design, in
 * five states** — not one per surface.
 */

/* ------------------------------------------------------------------- tabs */

export type CreditTab = "available" | "history";

/**
 * The two-tab bar.
 *
 * Reads as the tender's own sub-navigation, one level below the seven-icon
 * tender strip that already sits above it. Deliberately a different shape from
 * that strip — text and an underline rather than icons over labels — so two
 * bands of tabs stacked on one pane do not read as one control.
 *
 * **The badge counts the cart customer's non-spendable credits**, not search
 * results, and is suppressed at zero. It is amber rather than red: a customer
 * with spent rainchecks is an ordinary fact, not an error.
 */
export const RaincheckTabs = ({
    tab,
    onTab,
    historyCount,
}: {
    tab: CreditTab;
    onTab: (t: CreditTab) => void;
    /** Non-spendable credits on the cart customer's name. Zero hides the badge. */
    historyCount: number;
}) => (
    <Stack direction="row" role="tablist" sx={{ bgcolor: appColors.surface, borderBottom: `1px solid ${appColors.divider}` }}>
        {(["available", "history"] as const).map((t) => {
            const active = tab === t;
            return (
                <ButtonBase
                    key={t}
                    role="tab"
                    aria-selected={active}
                    onClick={() => onTab(t)}
                    sx={{
                        flex: 1,
                        // The 48dp touch floor. Every reference device is a
                        // tablet held at arm's length behind a counter.
                        minHeight: 52,
                        gap: 0.75,
                        fontSize: 15,
                        letterSpacing: "0.06em",
                        borderBottom: "3px solid",
                        borderBottomColor: active ? appColors.greenTee : "transparent",
                        color: active ? appColors.greenTee : appColors.textSecondary,
                    }}
                >
                    {t === "available" ? "AVAILABLE" : "HISTORY"}
                    {t === "history" && historyCount > 0 && (
                        <Box
                            aria-label={`${historyCount} past rainchecks`}
                            sx={{
                                minWidth: 22,
                                height: 22,
                                px: 0.6,
                                borderRadius: 11,
                                bgcolor: appColors.orange,
                                color: "#fff",
                                fontSize: 13,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                            }}
                        >
                            {historyCount}
                        </Box>
                    )}
                </ButtonBase>
            );
        })}
    </Stack>
);

/* ----------------------------------------------------------------- search */

/**
 * The lookup field, on both tabs.
 *
 * Same control, **different scope**, and that is the whole answer to Weston's
 * performance worry:
 *
 * > *"My worry is if we include all exhausted rainchecks it will slow down the
 * > search for the more common use case."*
 *
 * On **Available** it queries spendable credits only — byte for byte the query
 * that ships today, so the common path cannot get slower. On **History** it
 * queries everything. Nothing was hidden to keep the fast path fast; the two
 * questions were simply separated.
 */
export const TenderSearch = ({ query, onQuery, placeholder }: { query: string; onQuery: (q: string) => void; placeholder: string }) => (
    <Stack
        direction="row"
        sx={{
            alignItems: "center",
            gap: 1,
            mx: 2,
            mt: 2,
            mb: 1,
            px: 1.5,
            bgcolor: appColors.fieldFill,
            borderBottom: `1px solid ${appColors.textSecondary}`,
        }}
    >
        <SearchIcon sx={{ fontSize: 20, color: appColors.textSecondary }} />
        <Box
            component="input"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onQuery(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            sx={{
                flex: 1,
                minHeight: 48,
                border: "none",
                outline: "none",
                bgcolor: "transparent",
                fontSize: 16,
                fontFamily: "inherit",
                color: appColors.textPrimary,
            }}
        />
    </Stack>
);

/* -------------------------------------------------------------- hand-off */

/**
 * The control that keeps Option B from rebuilding the incident.
 *
 * When Available has nothing on it, this is what sits under the summary: a
 * full-width, 48dp, amber-edged button that **names the number of credits
 * waiting on the other tab** and moves you there.
 *
 * Aug 24 left this job to a 20px badge in the tab bar and said as much in its
 * own risk note. The badge stays — it is the ambient signal — but the moment
 * the pane would otherwise be empty is exactly the moment ambient is not
 * enough, and the operator is one glance from saying the sentence that costs
 * the money.
 *
 * **Not auto-switching is deliberate.** Jumping straight to History would hide
 * the fact that Available was empty, which is half of what the operator has to
 * tell the customer, and it would fight with the tab the operator picks next.
 * One labelled tap keeps both facts. Flagged in the Linear issue as a question
 * worth putting to a pro shop rather than settling from a desk.
 */
export const HandoffBanner = ({
    count,
    onOpen,
    /**
     * What the count is counting.
     *
     * `customer` is the empty-tab case — these are the credits on the name
     * attached to the ticket. `search` follows a lookup that found nothing
     * spendable, and the operator may well have typed a raincheck **id** off a
     * slip rather than a name, so "on this name" would be plainly wrong there.
     */
    context = "customer",
}: {
    count: number;
    onOpen: () => void;
    context?: "customer" | "search";
}) => (
    <Box sx={{ px: 2, pb: 2 }}>
        <ButtonBase
            // Wrapped, not passed straight through. `onClick={onOpen}` hands
            // the click event to the caller as its first argument, and callers
            // here take an optional string — so the event would arrive as the
            // seed query and `query.trim()` would throw. Same shape as the
            // `filter(isRedeemable)` trap in the data layer.
            onClick={() => onOpen()}
            sx={{
                width: "100%",
                minHeight: 52,
                gap: 1,
                px: 2,
                border: `1px solid ${appColors.orange}`,
                borderRadius: 0.5,
                bgcolor: appColors.surface,
                color: appColors.orange,
                fontSize: 16,
            }}
        >
            <HistoryIcon sx={{ fontSize: 20 }} />
            <Box sx={{ flex: 1, textAlign: "left" }}>
                See {count} past {count === 1 ? "raincheck" : "rainchecks"} {context === "customer" ? "on this name" : "in History"}
            </Box>
            <ArrowForwardIcon sx={{ fontSize: 20 }} />
        </ButtonBase>
    </Box>
);

/* ------------------------------------------------------------- available */

export interface TabBodyProps {
    customerName: string;
    customerId: string;
    /** What the ticket owes, so a row can say whether it clears it. */
    owed: number;
    /** Overrides the cart customer's ledger. Stories use it to force a state. */
    credits?: Raincheck[];
    selectedId?: string;
    onSelect?: (id: string) => void;
    query: string;
    onQuery: (q: string) => void;
}

/**
 * **AVAILABLE — the common path, unchanged in shape and never empty.**
 *
 * What is on this tab today: the cart customer's spendable credits, with no
 * search needed to get them. What is different: each row says what it is
 * (WJ-76's card), and the zero case says something.
 *
 * The zero case is the incident. `NothingSpendable` names the customer, states
 * what they actually had and where the money went, and is written to be read
 * aloud across a counter. `HandoffBanner` follows it.
 */
export const AvailableTab = ({
    customerName,
    customerId,
    owed,
    credits,
    selectedId,
    onSelect,
    query,
    onQuery,
    onOpenHistory,
}: TabBodyProps & {
    /**
     * Moves to History. The seed carries the string the operator already typed,
     * so handing off from a failed search does not make them type it twice.
     */
    onOpenHistory: (seed?: string) => void;
}) => {
    const all = credits ?? creditsForCustomer(customerId);
    const usable = useMemo(() => all.filter((c) => isRedeemable(c)), [all]);
    const dead = useMemo(() => all.filter((c) => !isRedeemable(c)), [all]);

    // Scoped to spendable credits — literally the query that ships today, so
    // this path cannot regress on speed no matter what History does.
    const searched = query.trim().length >= 2 ? searchRainchecks(query) : null;
    const rows = searched ?? usable;
    // What the same string would turn up on the other tab, so the hand-off can
    // promise a number rather than a maybe.
    const elsewhere = searched ? searchAllRainchecks(query).length : 0;

    return (
        <Stack sx={{ height: "100%", minHeight: 0, bgcolor: appColors.surface }}>
            <TenderSearch query={query} onQuery={onQuery} placeholder="Enter Raincheck id, customer name, or email" />

            <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                {rows.length > 0 ? (
                    rows.map((c) => (
                        <CreditRow key={c.id} credit={c} owed={owed} selected={selectedId === c.id} onSelect={() => onSelect?.(c.id)} />
                    ))
                ) : searched ? (
                    // A search that found nothing spendable. Still not a dead
                    // end: History searches the same string across everything.
                    <>
                        <Box sx={{ px: 2, py: 2.5 }}>
                            <Typography sx={{ fontSize: 16, color: appColors.textPrimary }}>
                                Nothing spendable matches &ldquo;{query}&rdquo;.
                            </Typography>
                            <Typography sx={{ fontSize: 14, color: appColors.textSecondary, mt: 0.5 }}>
                                History searches this across every course, including credits that have been used up.
                            </Typography>
                        </Box>
                        {elsewhere > 0 && <HandoffBanner context="search" count={elsewhere} onOpen={() => onOpenHistory(query)} />}
                    </>
                ) : (
                    // The incident. This is the branch that decides whether the
                    // redesign worked.
                    <>
                        <NothingSpendable customerName={customerName} summary={noCreditsSummary(all)} />
                        {dead.length > 0 && <Box sx={{ height: 12 }} />}
                        {dead.length > 0 && <HandoffBanner count={dead.length} onOpen={() => onOpenHistory()} />}
                    </>
                )}
            </Box>
        </Stack>
    );
};

/* --------------------------------------------------------------- history */

/**
 * **HISTORY — everything else, and it names the course.**
 *
 * Opens on the cart customer's non-spendable credits, ranked, each carrying the
 * `whyNotUsable` sentence and the course that consumed it. That sentence is the
 * one the register could always have produced and never did:
 *
 * > *"Used up 5/02/2026 at Falls Road — Twilight green fee."*
 *
 * Search here spans **every customer**, because the reason to be on this tab is
 * often that the name on the ticket is not the name on the credit — a
 * misspelling, a spouse's booking, a company account, or a slip carrying
 * nothing but an id.
 *
 * **Spendable rows found here are selectable.** Aug 24 made every History row
 * read-only, which was fine while the tab only ever showed dead credits — but
 * a cross-customer search can turn up a live one, and finding a credit you
 * cannot then apply is the same dead end wearing different clothes.
 */
export const HistoryTab = ({ customerId, owed, credits, selectedId, onSelect, query, onQuery }: TabBodyProps) => {
    const all = credits ?? creditsForCustomer(customerId);
    const dead = useMemo(() => all.filter((c) => !isRedeemable(c)), [all]);

    const searched = query.trim().length >= 2 ? searchAllRainchecks(query) : null;
    const rows = searched ?? dead;

    return (
        <Stack sx={{ height: "100%", minHeight: 0, bgcolor: appColors.surface }}>
            <TenderSearch query={query} onQuery={onQuery} placeholder="Search every raincheck — id, name, email" />

            <Typography sx={{ px: 2, pb: 1, fontSize: 13, color: appColors.textSecondary }}>
                {searched
                    ? `${rows.length} ${rows.length === 1 ? "raincheck" : "rainchecks"} match “${query}” across all courses`
                    : "Used, expired and cancelled credits on this customer — every course"}
            </Typography>

            <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                {rows.length === 0 ? (
                    <Typography sx={{ px: 2, py: 3, fontSize: 16, color: appColors.textSecondary }}>
                        {searched
                            ? `No raincheck has ever been issued under “${query}” at any course.`
                            : "Nothing has ever been issued to this customer."}
                    </Typography>
                ) : (
                    rows.map((c) =>
                        // A live credit surfaced by a cross-customer search is
                        // still spendable, and has to be tappable here.
                        isRedeemable(c) ? (
                            <CreditRow key={c.id} credit={c} owed={owed} selected={selectedId === c.id} onSelect={() => onSelect?.(c.id)} />
                        ) : (
                            <CreditRow key={c.id} credit={c} showActivity />
                        ),
                    )
                )}
            </Box>
        </Stack>
    );
};

/* ---------------------------------------------------------------- the pane */

export interface RaincheckTenderProps {
    customerName: string;
    customerId: string;
    owed: number;
    credits?: Raincheck[];
    selectedId?: string;
    onSelect?: (id: string) => void;
    /** Which tab a story opens on. */
    tab?: CreditTab;
    /** Pre-filled, so a story can show a searched state without typing. */
    availableQuery?: string;
    historyQuery?: string;
}

/**
 * The whole RAIN panel body: tabs over one of two tabs' contents.
 *
 * Renders **inside** the shipping redeem screen — see `../redeem-screen` — which
 * carries the app bar, the ticket pane, the seven-tender strip and the action
 * bar. Nothing outside this panel changes, which is what keeps the proposal
 * comparable against the screen it replaces.
 *
 * Each tab keeps **its own query**. They ask different questions of different
 * scopes, and carrying a string across the boundary would silently change what
 * it means.
 */
export const RaincheckTender = ({
    customerName,
    customerId,
    owed,
    credits,
    selectedId: selected0,
    onSelect,
    tab: tab0 = "available",
    availableQuery = "",
    historyQuery = "",
}: RaincheckTenderProps) => {
    const [tab, setTab] = useState<CreditTab>(tab0);
    const [availQ, setAvailQ] = useState(availableQuery);
    const [histQ, setHistQ] = useState(historyQuery);
    const [selectedId, setSelectedId] = useState<string | undefined>(selected0);

    const all = credits ?? creditsForCustomer(customerId);
    const historyCount = all.filter((c) => !isRedeemable(c)).length;

    const pick = (id: string) => {
        setSelectedId(id);
        onSelect?.(id);
    };

    const body: TabBodyProps = {
        customerName,
        customerId,
        owed,
        credits,
        selectedId,
        onSelect: pick,
        query: tab === "available" ? availQ : histQ,
        onQuery: tab === "available" ? setAvailQ : setHistQ,
    };

    return (
        <Stack sx={{ height: "100%", minHeight: 0, bgcolor: appColors.surface }}>
            <RaincheckTabs tab={tab} onTab={setTab} historyCount={historyCount} />
            {tab === "available" ? (
                <AvailableTab
                    {...body}
                    onOpenHistory={(seed) => {
                        if (seed) setHistQ(seed);
                        setTab("history");
                    }}
                />
            ) : (
                <HistoryTab {...body} />
            )}
        </Stack>
    );
};
