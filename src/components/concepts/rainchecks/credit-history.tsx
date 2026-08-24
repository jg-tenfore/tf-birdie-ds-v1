import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import BlockIcon from "@mui/icons-material/Block";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import GolfCourseIcon from "@mui/icons-material/GolfCourse";
import HistoryIcon from "@mui/icons-material/History";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

import { THIS_COURSE, creditState, whyNotUsable, type CreditState, type Raincheck } from "@/data/rainchecks";
import { appColors } from "@/theme/app-replica-tokens";

/**
 * **Concept — Aug 24.** The parts that make a credit's history readable at the
 * counter.
 *
 * The incident these exist for, in Weston's words:
 *
 * > *"Employee clicks raincheck payment type and searches customer name. Nothing
 * > comes up. Employee says 'I don't see it here.' Customer gets mad. Employee
 * > has to talk to the manager to look it up in buck and then they find out
 * > customer used it at a different course a few weeks ago."*
 *
 * The register's lookup filters to spendable credits, so a customer holding a
 * used one gets an **empty list** — and empty reads as *you never had one*. That
 * is a different fact. Collapsing the two is what sends people to a manager.
 *
 * Two things follow, and both are in here:
 *
 * 1. **A credit is never hidden, only ranked.** Spendable first; the rest below,
 *    greyed, each carrying one line that says why and **where**.
 * 2. **Where matters.** A credit issued at one course and spent at another is
 *    the ordinary case in a multi-course operation, and it is the fact the
 *    terminal could not state until the model gained `course`.
 */

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

const STATE_STYLE: Record<CreditState, { label: string; colour: string }> = {
    available: { label: "AVAILABLE", colour: appColors.greenTee },
    "part spent": { label: "PART SPENT", colour: appColors.greenTee },
    used: { label: "USED", colour: appColors.textDisabled },
    expired: { label: "EXPIRED", colour: appColors.orange },
    voided: { label: "VOIDED", colour: appColors.red },
};

export const StateChip = ({ state }: { state: CreditState }) => {
    const s = STATE_STYLE[state];
    return (
        <Typography
            sx={{
                fontSize: 11,
                letterSpacing: "0.06em",
                color: s.colour,
                border: `1px solid ${s.colour}`,
                px: 0.75,
                py: 0.15,
                borderRadius: 0.5,
                whiteSpace: "nowrap",
            }}
        >
            {s.label}
        </Typography>
    );
};

/**
 * Where a credit came from, said in words a customer recognises.
 *
 * "51381, $72.22" settles nothing at a counter. "The 7:00 PM on July 20th at the
 * Dunes" settles it — and if the course is not this one, that is the single most
 * useful thing on the row.
 */
export const CreditOrigin = ({ credit }: { credit: Raincheck }) => {
    const elsewhere = credit.course && credit.course !== THIS_COURSE;
    return (
        <Stack direction="row" sx={{ alignItems: "center", gap: 0.75, flexWrap: "wrap" }}>
            <GolfCourseIcon sx={{ fontSize: 16, color: elsewhere ? appColors.orange : appColors.textSecondary }} />
            <Typography sx={{ fontSize: 13, color: elsewhere ? appColors.orange : appColors.textSecondary }}>
                Issued {credit.issued}
                {credit.course ? ` at ${credit.course}` : ""}
                {credit.teeTime ? ` · ${credit.teeTime} round` : ""}
            </Typography>
        </Stack>
    );
};

/** Every activity on a credit, in order, each naming its course. */
export const CreditActivity = ({ credit, dense }: { credit: Raincheck; dense?: boolean }) => {
    const rows: { at: string; what: string; amount?: number; course?: string; kind: "issued" | "spent" | "voided" }[] = [
        { at: credit.issued, what: `Issued for ${usd(credit.awarded)}`, course: credit.course, kind: "issued" },
        ...(credit.redemptions ?? []).map((r) => ({ at: r.at, what: r.what, amount: r.amount, course: r.course, kind: "spent" as const })),
        ...(credit.voided
            ? [{ at: credit.voided.at, what: `Voided — ${credit.voided.reason}`, course: credit.course, kind: "voided" as const }]
            : []),
    ];

    return (
        <Stack sx={{ gap: dense ? 0.25 : 0.6 }}>
            {rows.map((r) => (
                <Stack key={`${r.at}-${r.what}`} direction="row" sx={{ gap: 1.5, alignItems: "baseline" }}>
                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary, minWidth: 78 }}>{r.at.split(" ")[0]}</Typography>
                    <Typography sx={{ fontSize: 13, flex: 1, color: r.kind === "voided" ? appColors.red : appColors.textPrimary }}>
                        {r.what}
                        {r.course && (
                            <Typography component="span" sx={{ fontSize: 13, color: appColors.textSecondary }}>
                                {" "}
                                · {r.course}
                            </Typography>
                        )}
                    </Typography>
                    {r.amount !== undefined && (
                        <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>−{usd(r.amount)}</Typography>
                    )}
                </Stack>
            ))}
        </Stack>
    );
};

/**
 * A credit as a row in a list, in whatever state it is in.
 *
 * Unusable rows are **shown, not hidden** — greyed, not tappable, and carrying
 * the sentence that ends the conversation. That sentence is the entire point:
 * the operator can read it out loud without leaving the sale.
 */
export const CreditRow = ({
    credit,
    owed,
    selected,
    onSelect,
    showActivity,
}: {
    credit: Raincheck;
    /** What the ticket owes, so the row can say whether it clears it. */
    owed?: number;
    selected?: boolean;
    onSelect?: () => void;
    showActivity?: boolean;
}) => {
    const state = creditState(credit);
    const why = whyNotUsable(credit);
    const usable = why === null;
    const clears = owed !== undefined && credit.balance >= owed;

    const body = (
        <>
            <Stack direction="row" sx={{ alignItems: "baseline", gap: 1.5 }}>
                <Typography sx={{ fontSize: 22, color: usable ? appColors.greenTee : appColors.textDisabled }}>
                    {usd(credit.balance)}
                </Typography>
                <StateChip state={state} />
                <Box sx={{ flex: 1 }} />
                <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>#{credit.id}</Typography>
            </Stack>

            <Box sx={{ mt: 0.5 }}>
                <CreditOrigin credit={credit} />
            </Box>

            {/* The line that ends the conversation. */}
            {why && (
                <Stack direction="row" sx={{ alignItems: "flex-start", gap: 0.75, mt: 0.75 }}>
                    {state === "expired" ? (
                        <EventBusyIcon sx={{ fontSize: 16, color: appColors.orange, mt: 0.2 }} />
                    ) : state === "voided" ? (
                        <BlockIcon sx={{ fontSize: 16, color: appColors.red, mt: 0.2 }} />
                    ) : (
                        <HistoryIcon sx={{ fontSize: 16, color: appColors.textSecondary, mt: 0.2 }} />
                    )}
                    <Typography sx={{ fontSize: 14, color: appColors.textPrimary }}>{why}</Typography>
                </Stack>
            )}

            {usable && owed !== undefined && (
                <Typography sx={{ fontSize: 14, color: appColors.textSecondary, mt: 0.75 }}>
                    {clears ? "Covers this ticket in full" : `${usd(owed - credit.balance)} would still be owed`}
                </Typography>
            )}

            {showActivity && (credit.redemptions?.length || credit.voided) && (
                <Box sx={{ mt: 1, pt: 1, borderTop: `1px solid ${appColors.divider}` }}>
                    <CreditActivity credit={credit} dense />
                </Box>
            )}
        </>
    );

    const sx = {
        display: "block",
        width: "100%",
        textAlign: "left" as const,
        px: 2,
        py: 1.5,
        borderBottom: `1px solid ${appColors.divider}`,
        bgcolor: selected ? "#EAF3EC" : usable ? appColors.surface : appColors.canvas,
        borderLeft: "4px solid",
        borderLeftColor: selected ? appColors.greenTee : "transparent",
        opacity: usable ? 1 : 0.85,
    };

    // A row you cannot spend should not look pressable.
    return usable && onSelect ? (
        <ButtonBase onClick={onSelect} sx={sx}>
            {body}
        </ButtonBase>
    ) : (
        <Box sx={sx}>{body}</Box>
    );
};

/**
 * The divider that separates what you can spend from what you cannot.
 *
 * Ranking rather than filtering is the whole argument: the common case stays
 * first on screen, and the awkward case stops being invisible.
 */
export const NotUsableDivider = ({ count }: { count: number }) => (
    <Stack direction="row" sx={{ alignItems: "center", gap: 1, px: 2, py: 1, bgcolor: appColors.canvasAlt }}>
        <InfoOutlinedIcon sx={{ fontSize: 18, color: appColors.textSecondary }} />
        <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>
            {count} {count === 1 ? "raincheck" : "rainchecks"} on this name that cannot pay for this ticket
        </Typography>
    </Stack>
);

/**
 * What the tender says when nothing is spendable.
 *
 * The fix for the incident, and it needs no search at all. The shipping screen
 * shows an empty pane here, the operator says *"I don't see it here"*, and the
 * conversation goes wrong. This says what the customer actually had.
 */
export const NothingSpendable = ({ customerName, summary }: { customerName: string; summary: string }) => (
    <Stack sx={{ px: 2, py: 2.5, gap: 1, bgcolor: "#FFF4E6", borderLeft: `4px solid ${appColors.orange}` }}>
        <Typography sx={{ fontSize: 17 }}>No credits available for {customerName}</Typography>
        <Typography sx={{ fontSize: 15, color: appColors.textPrimary, lineHeight: 1.5 }}>{summary}</Typography>
        <Typography sx={{ fontSize: 13, color: appColors.textSecondary, mt: 0.5 }}>
            Read that out rather than saying &ldquo;I don&rsquo;t see it here&rdquo; — it is the sentence that ends the conversation.
        </Typography>
    </Stack>
);
