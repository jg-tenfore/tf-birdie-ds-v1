import { useMemo, useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";

import { COURSES, CREDIT_STATES, creditState, rainchecks as allCredits, type CreditState, type Raincheck } from "@/data/rainchecks";
import { appColors } from "@/theme/app-replica-tokens";
import { CreditActivity, CreditOrigin, StateChip } from "./credit-history";

/**
 * **Concept — Aug 24.** The searchable raincheck listing.
 *
 * > *"Add a searchable raincheck listing, including filters like expired.
 * > Ability to see raincheck issuance date/course and any activities on that
 * > raincheck."*
 *
 * This is the screen the manager currently opens **Buck** for. That detour is
 * the expensive part of the incident: the escalation exists because the POS
 * cannot answer a question the back office can.
 *
 * It answers a different question from the customer record. The record answers
 * *"what does this person have?"* — you already know who they are. This answers
 * *"find me this raincheck"* when the name is not matching: a misspelling, a
 * spouse's booking, a company account, or a slip with only an id on it.
 */

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

// Derived, so the chips read in the same order the tender's History tab
// ranks — a sequence the operator learns on one screen and meets on the other.
const STATES: (CreditState | "all")[] = ["all", ...CREDIT_STATES];

const FilterChip = ({
    label,
    count,
    active,
    onClick,
    /** Course names are proper nouns — capitalising them gives "The Dunes Of Delgado". */
    asIs,
}: {
    label: string;
    count: number;
    active: boolean;
    onClick: () => void;
    asIs?: boolean;
}) => (
    <ButtonBase
        onClick={onClick}
        sx={{
            px: 1.75,
            minHeight: 44,
            gap: 0.75,
            borderRadius: 0.5,
            border: "1px solid",
            borderColor: active ? appColors.greenTee : appColors.divider,
            bgcolor: active ? appColors.greenTee : appColors.surface,
            color: active ? "#fff" : appColors.textPrimary,
            fontSize: 15,
            textTransform: asIs ? "none" : "capitalize",
        }}
    >
        {label}
        <Typography component="span" sx={{ fontSize: 13, opacity: 0.75 }}>
            {count}
        </Typography>
    </ButtonBase>
);

export interface RaincheckListingProps {
    credits?: Raincheck[];
    /** Pre-set so a story can show a filtered state without clicking. */
    query?: string;
    state?: CreditState | "all";
    course?: string;
    /** Opens a row's full activity inline. */
    expandedId?: string;
}

export const RaincheckListing = ({
    credits = allCredits,
    query: q0 = "",
    state: s0 = "all",
    course: c0 = "all",
    expandedId: e0,
}: RaincheckListingProps) => {
    const [query, setQuery] = useState(q0);
    const [state, setState] = useState<CreditState | "all">(s0);
    const [course, setCourse] = useState<string>(c0);
    const [expanded, setExpanded] = useState<string | undefined>(e0);

    const counts = useMemo(() => {
        const c: Record<string, number> = { all: credits.length };
        for (const r of credits) c[creditState(r)] = (c[creditState(r)] ?? 0) + 1;
        return c;
    }, [credits]);

    const rows = useMemo(() => {
        const q = query.trim().toLowerCase();
        return credits
            .filter((r) => (state === "all" ? true : creditState(r) === state))
            .filter((r) => (course === "all" ? true : r.course === course))
            .filter(
                (r) =>
                    q.length === 0 ||
                    r.id.includes(q) ||
                    r.customerName.toLowerCase().includes(q) ||
                    (r.email ?? "").toLowerCase().includes(q) ||
                    (r.course ?? "").toLowerCase().includes(q),
            )
            .sort((a, b) => b.issued.localeCompare(a.issued));
    }, [credits, query, state, course]);

    const owed = rows.filter((r) => creditState(r) === "available" || creditState(r) === "part spent").reduce((s, r) => s + r.balance, 0);

    return (
        <Stack sx={{ height: "100%", bgcolor: appColors.canvas, minHeight: 0 }}>
            <Box sx={{ bgcolor: appColors.surface, px: 3, py: 2, borderBottom: `1px solid ${appColors.divider}` }}>
                <Typography sx={{ fontSize: 22 }}>Rainchecks</Typography>
                <Typography sx={{ fontSize: 14, color: appColors.textSecondary, mt: 0.25 }}>
                    Every credit across all {COURSES.length} courses — the lookup that currently means opening Buck
                </Typography>
            </Box>

            <Stack sx={{ px: 2, py: 1.5, gap: 1.25, bgcolor: appColors.surface, borderBottom: `1px solid ${appColors.divider}` }}>
                <Stack
                    direction="row"
                    sx={{ alignItems: "center", gap: 1, border: `1px solid ${appColors.divider}`, px: 1.5, borderRadius: 0.5 }}
                >
                    <SearchIcon sx={{ fontSize: 20, color: appColors.textSecondary }} />
                    <Box
                        component="input"
                        value={query}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                        placeholder="Raincheck id, customer name, email, or course"
                        aria-label="Search all rainchecks"
                        sx={{
                            flex: 1,
                            minHeight: 48,
                            border: "none",
                            outline: "none",
                            fontSize: 16,
                            bgcolor: "transparent",
                            fontFamily: "inherit",
                        }}
                    />
                </Stack>

                <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap" }}>
                    {STATES.map((st) => (
                        <FilterChip key={st} label={st} count={counts[st] ?? 0} active={state === st} onClick={() => setState(st)} />
                    ))}
                </Stack>

                <Stack direction="row" sx={{ gap: 0.75, flexWrap: "wrap" }}>
                    <FilterChip
                        asIs
                        label="All courses"
                        count={credits.length}
                        active={course === "all"}
                        onClick={() => setCourse("all")}
                    />
                    {COURSES.map((c) => (
                        <FilterChip
                            asIs
                            key={c}
                            label={c}
                            count={credits.filter((r) => r.course === c).length}
                            active={course === c}
                            onClick={() => setCourse(c)}
                        />
                    ))}
                </Stack>
            </Stack>

            <Stack direction="row" sx={{ px: 2, py: 1, alignItems: "baseline", gap: 1.5 }}>
                <Typography sx={{ fontSize: 15, color: appColors.textSecondary, flex: 1 }}>
                    {rows.length} of {credits.length}
                </Typography>
                <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>Still owed in this view</Typography>
                <Typography sx={{ fontSize: 18, color: appColors.greenTee }}>{usd(+owed.toFixed(2))}</Typography>
            </Stack>

            <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 2, pb: 2 }}>
                <Box sx={{ border: `1px solid ${appColors.divider}`, bgcolor: appColors.surface }}>
                    {rows.length === 0 ? (
                        <Typography sx={{ px: 2, py: 3, fontSize: 16, color: appColors.textSecondary }}>
                            Nothing matches. Clear a filter, or search by raincheck id if the name is not the one it was booked under.
                        </Typography>
                    ) : (
                        rows.map((r) => {
                            const open = expanded === r.id;
                            return (
                                <Box key={r.id} sx={{ borderBottom: `1px solid ${appColors.divider}` }}>
                                    <ButtonBase
                                        onClick={() => setExpanded(open ? undefined : r.id)}
                                        sx={{ display: "block", width: "100%", textAlign: "left", px: 2, py: 1.25 }}
                                    >
                                        <Stack direction="row" sx={{ alignItems: "baseline", gap: 1.5 }}>
                                            <Typography sx={{ fontSize: 17, minWidth: 150 }}>{r.customerName}</Typography>
                                            <StateChip state={creditState(r)} />
                                            <Box sx={{ flex: 1 }} />
                                            <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>#{r.id}</Typography>
                                            <Typography sx={{ fontSize: 18, minWidth: 90, textAlign: "right", color: appColors.greenTee }}>
                                                {usd(r.balance)}
                                            </Typography>
                                        </Stack>
                                        <Box sx={{ mt: 0.4 }}>
                                            <CreditOrigin credit={r} />
                                        </Box>
                                    </ButtonBase>
                                    {open && (
                                        <Box sx={{ px: 2, pb: 1.5, bgcolor: appColors.canvas }}>
                                            <Typography sx={{ fontSize: 13, color: appColors.textSecondary, pt: 1, pb: 0.5 }}>
                                                Everything that has happened to this credit
                                            </Typography>
                                            <CreditActivity credit={r} />
                                        </Box>
                                    )}
                                </Box>
                            );
                        })
                    )}
                </Box>
            </Box>
        </Stack>
    );
};
