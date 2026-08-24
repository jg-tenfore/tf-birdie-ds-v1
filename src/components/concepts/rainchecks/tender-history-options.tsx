import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Dialog from "@mui/material/Dialog";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";

import { creditState, creditsForCustomer, isRedeemable, noCreditsSummary, searchAllRainchecks, type Raincheck } from "@/data/rainchecks";
import { appColors } from "@/theme/app-replica-tokens";
import { CreditActivity, CreditOrigin, CreditRow, NothingSpendable, NotUsableDivider, StateChip } from "./credit-history";

/**
 * **Concept — Aug 24.** Three answers to one question: *where does a credit's
 * history live when you are mid-sale?*
 *
 * Weston named the tension himself:
 *
 * > *"We could just tell the employee to go to customer look up to see the
 * > history of rainchecks for that customer but it would send them to another
 * > screen."*
 *
 * All three share the same fix for the **common** case, which is not a search
 * problem at all: the tender opens on the cart customer, and when nothing is
 * spendable it says what they *did* have instead of showing an empty pane. In
 * the incident as described, the employee searched — which means the default
 * view had already failed them.
 *
 * Where the three differ is the **harder** case: the credit is under another
 * name, so you have to go looking.
 */

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

export interface TenderOptionProps {
    customerName: string;
    customerId: string;
    owed: number;
    credits?: Raincheck[];
    selectedId?: string;
    onSelect?: (id: string) => void;
    /** Pre-filled so a story can show the searched state without typing. */
    query?: string;
    onQuery?: (q: string) => void;
}

/* ------------------------------------------------------------------ shared */

/**
 * The panel body only.
 *
 * These render **inside** the shipping redeem screen's RAIN pane — see
 * `RedeemScreen` — which already carries the app bar, the ticket, the tender
 * tabs and the action bar. The concept supplies nothing but the contents of the
 * one panel this feedback is about, so a reviewer looking at it is looking at
 * the real screen with one region changed.
 */
const Pane = ({ children }: { children: React.ReactNode }) => (
    <Stack sx={{ height: "100%", minHeight: 0, bgcolor: appColors.surface }}>{children}</Stack>
);

const SearchBar = ({ query, onQuery }: { query: string; onQuery?: (q: string) => void }) => (
    <Box sx={{ mx: 3, mt: 3, bgcolor: "#E4E6E8", px: 2, pt: 1.25, pb: 1, borderBottom: `1px solid ${appColors.textSecondary}` }}>
        <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>Enter Raincheck id, customer name, or email</Typography>
        <Box
            component="input"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onQuery?.(e.target.value)}
            aria-label="Enter Raincheck id, customer name, or email"
            sx={{ width: "100%", border: "none", outline: "none", bgcolor: "transparent", fontSize: 16, fontFamily: "inherit", p: 0 }}
        />
    </Box>
);

/** The default every option shares: this customer's credits, no search needed. */
const CartCustomerList = ({
    customerName,
    customerId,
    owed,
    credits,
    selectedId,
    onSelect,
    /** Option B hides the unusable ones here and puts them behind a tab. */
    hideUnusable,
}: TenderOptionProps & { hideUnusable?: boolean }) => {
    const all = credits ?? creditsForCustomer(customerId);
    const usable = all.filter((c) => isRedeemable(c));
    const dead = all.filter((c) => !isRedeemable(c));

    if (usable.length === 0 && !hideUnusable) {
        return (
            <Box sx={{ overflowY: "auto" }}>
                <NothingSpendable customerName={customerName} summary={noCreditsSummary(all)} />
                {dead.length > 0 && <NotUsableDivider count={dead.length} />}
                {dead.map((c) => (
                    <CreditRow key={c.id} credit={c} showActivity />
                ))}
            </Box>
        );
    }

    return (
        <Box sx={{ overflowY: "auto" }}>
            {usable.length === 0 ? (
                <NothingSpendable customerName={customerName} summary={noCreditsSummary(all)} />
            ) : (
                usable.map((c) => (
                    <CreditRow key={c.id} credit={c} owed={owed} selected={selectedId === c.id} onSelect={() => onSelect?.(c.id)} />
                ))
            )}
            {!hideUnusable && dead.length > 0 && (
                <>
                    <NotUsableDivider count={dead.length} />
                    {dead.map((c) => (
                        <CreditRow key={c.id} credit={c} showActivity />
                    ))}
                </>
            )}
        </Box>
    );
};

/* ------------------------------------------------- A — never say nothing */

/**
 * **Option A — one list, never empty.**
 *
 * Search returns everything that matches, ranked: spendable at the top and
 * tappable, everything else below a divider, greyed, each with the sentence
 * that explains it.
 *
 * **The bet:** the operator should never have to ask a second question or visit
 * a second screen. Whatever the register knows, it says here.
 *
 * **The cost:** the densest results of the three. Weston's worry lives here —
 * *"if we include all exhausted rainchecks it will slow down the search for the
 * more common use case"*. Ranking is the answer to that rather than omission:
 * the spendable ones are still the first thing on screen, and nothing is hidden
 * to achieve it.
 */
export const OptionAInline = (props: TenderOptionProps) => {
    const { query = "", onQuery, owed, selectedId, onSelect } = props;
    const results = query.trim().length >= 2 ? searchAllRainchecks(query) : null;
    const usable = results?.filter((r) => isRedeemable(r)) ?? [];
    const dead = results?.filter((r) => !isRedeemable(r)) ?? [];

    return (
        <Pane>
            <SearchBar query={query} onQuery={onQuery} />
            {results === null ? (
                <CartCustomerList {...props} />
            ) : results.length === 0 ? (
                <Box sx={{ px: 2, py: 3 }}>
                    <Typography sx={{ fontSize: 16, color: appColors.textSecondary }}>
                        Nothing matches &ldquo;{query}&rdquo; — no raincheck has ever been issued under that name or id.
                    </Typography>
                </Box>
            ) : (
                <Box sx={{ overflowY: "auto" }}>
                    {usable.map((c) => (
                        <CreditRow key={c.id} credit={c} owed={owed} selected={selectedId === c.id} onSelect={() => onSelect?.(c.id)} />
                    ))}
                    {dead.length > 0 && <NotUsableDivider count={dead.length} />}
                    {dead.map((c) => (
                        <CreditRow key={c.id} credit={c} showActivity />
                    ))}
                </Box>
            )}
        </Pane>
    );
};

/* ------------------------------------------------------- B — two views */

/**
 * **Option B — Available and History as siblings.**
 *
 * Two tabs. **Available** is exactly what ships today and is never slowed down
 * by anything. **History** is everything else, one tap away, carrying a badge so
 * the operator can see there *is* something to look at before they say "I don't
 * see it here".
 *
 * **The bet:** Weston's instinct is right — keep the common path pristine and
 * make the awkward one deliberate.
 *
 * **The cost:** the badge is doing a lot of work. If an operator does not notice
 * it, this behaves exactly like the screen that caused the incident.
 */
export const OptionBTabs = (props: TenderOptionProps) => {
    const [tab, setTab] = useState<"available" | "history">("available");
    const { customerId, credits, query = "", onQuery } = props;
    const all = credits ?? creditsForCustomer(customerId);
    const dead = all.filter((c) => !isRedeemable(c));
    const results = query.trim().length >= 2 ? searchAllRainchecks(query) : null;

    return (
        <Pane>
            <Stack direction="row" sx={{ borderBottom: `1px solid ${appColors.divider}` }}>
                {(["available", "history"] as const).map((t) => (
                    <ButtonBase
                        key={t}
                        onClick={() => setTab(t)}
                        sx={{
                            flex: 1,
                            py: 1.5,
                            gap: 0.75,
                            fontSize: 15,
                            letterSpacing: "0.04em",
                            borderBottom: "3px solid",
                            borderBottomColor: tab === t ? appColors.greenTee : "transparent",
                            color: tab === t ? appColors.greenTee : appColors.textSecondary,
                        }}
                    >
                        {t === "available" ? "AVAILABLE" : "HISTORY"}
                        {t === "history" && dead.length > 0 && (
                            <Box
                                sx={{
                                    minWidth: 20,
                                    height: 20,
                                    px: 0.5,
                                    borderRadius: 10,
                                    bgcolor: appColors.orange,
                                    color: "#fff",
                                    fontSize: 12,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {dead.length}
                            </Box>
                        )}
                    </ButtonBase>
                ))}
            </Stack>

            {tab === "available" ? (
                <CartCustomerList {...props} hideUnusable />
            ) : (
                <>
                    <SearchBar query={query} onQuery={onQuery} />
                    <Box sx={{ overflowY: "auto" }}>
                        {(results ?? dead).map((c) => (
                            <CreditRow key={c.id} credit={c} showActivity />
                        ))}
                        {(results ?? dead).length === 0 && (
                            <Typography sx={{ px: 2, py: 3, fontSize: 16, color: appColors.textSecondary }}>
                                Nothing on this name.
                            </Typography>
                        )}
                    </Box>
                </>
            )}
        </Pane>
    );
};

/* --------------------------------------------------- C — the record on top */

/**
 * **Option C — the customer's record, over the sale.**
 *
 * The tender stays exactly as it ships. When the answer is not here, one control
 * opens the customer's raincheck record **as an overlay** — the ticket is not
 * abandoned, the sale is not lost, and the operator is looking at the same
 * screen a manager would open.
 *
 * **The bet:** this history already exists on the customer record and does not
 * want rebuilding inside a tender pane. Weston's objection to sending someone to
 * another screen is answered by not sending them anywhere.
 *
 * **The cost:** it is still a second surface, and the operator has to know to
 * reach for it. Like B, discoverability is doing the work.
 */
export const OptionCOverlay = (props: TenderOptionProps) => {
    const [open, setOpen] = useState(false);
    const { customerId, credits, owed, customerName } = props;
    const all = credits ?? creditsForCustomer(customerId);
    const dead = all.filter((c) => !isRedeemable(c));

    return (
        <Pane>
            <CartCustomerList {...props} hideUnusable />

            <Box sx={{ mt: "auto", p: 2, borderTop: `1px solid ${appColors.divider}` }}>
                <ButtonBase
                    onClick={() => setOpen(true)}
                    sx={{
                        width: "100%",
                        minHeight: 48,
                        gap: 1,
                        border: `1px solid ${dead.length ? appColors.orange : appColors.divider}`,
                        color: dead.length ? appColors.orange : appColors.textSecondary,
                        borderRadius: 0.5,
                        fontSize: 15,
                    }}
                >
                    <PersonSearchIcon sx={{ fontSize: 20 }} />
                    {dead.length
                        ? `${customerName} has ${dead.length} past ${dead.length === 1 ? "raincheck" : "rainchecks"} — see the history`
                        : "See this customer's raincheck history"}
                </ButtonBase>
            </Box>

            <Dialog open={open} onClose={() => setOpen(false)} fullScreen>
                <Stack sx={{ height: "100%", bgcolor: appColors.canvas }}>
                    <Stack direction="row" sx={{ bgcolor: appColors.slate, color: "#fff", px: 2, py: 1.5, alignItems: "center", gap: 1.5 }}>
                        <ButtonBase onClick={() => setOpen(false)} sx={{ color: "#fff", gap: 0.75, fontSize: 15, minHeight: 44, px: 1 }}>
                            <ArrowBackIcon sx={{ fontSize: 20 }} /> Back to the sale
                        </ButtonBase>
                        <Typography sx={{ fontSize: 17, flex: 1 }}>{customerName} — rainchecks</Typography>
                        <Typography sx={{ fontSize: 15 }}>{usd(owed)} owed</Typography>
                    </Stack>
                    <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
                        <Box sx={{ bgcolor: appColors.surface, border: `1px solid ${appColors.divider}` }}>
                            {all.map((c) => (
                                <Box key={c.id} sx={{ borderBottom: `1px solid ${appColors.divider}` }}>
                                    <Stack direction="row" sx={{ alignItems: "baseline", gap: 1.5, px: 2, pt: 1.5 }}>
                                        <Typography sx={{ fontSize: 20 }}>{usd(c.balance)}</Typography>
                                        <StateChip state={creditState(c)} />
                                        <Box sx={{ flex: 1 }} />
                                        <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>#{c.id}</Typography>
                                    </Stack>
                                    <Box sx={{ px: 2, pb: 1.5, pt: 0.5 }}>
                                        <CreditOrigin credit={c} />
                                        <Box sx={{ mt: 1 }}>
                                            <CreditActivity credit={c} />
                                        </Box>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Stack>
            </Dialog>
        </Pane>
    );
};
