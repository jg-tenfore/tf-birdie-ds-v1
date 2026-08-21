import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SouthEastIcon from "@mui/icons-material/SouthEast";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { CartCredits } from "@/components/concepts/rainchecks/cart-credits";
import { RainChecksTable } from "@/components/screens/operations/customer-search-panel";
import type { PlayerAction } from "@/components/screens/tee-sheet/tee-sheet-data";
import { TeeTimeDetailScreen } from "@/components/screens/tee-sheet/tee-sheet-frames";
import type { Raincheck } from "@/data/rainchecks";
import { appColors } from "@/theme/app-replica-tokens";
import { GroupIssueOneStop } from "./group-issue-one-stop";
import { GroupIssuePerPlayer } from "./group-issue-per-player";
import { clampHoles, draftValue, groupTotals, makeDrafts, usd, type GroupDraft } from "./group-issue";
import { positionTotal, type RaincheckPosition } from "./reservation-raincheck";

/**
 * **Concept — Aug 20, end to end.** Tee sheet → the group screen → where the
 * credits land.
 *
 * The two option stories show the screen. This shows the *trip*, and it is the
 * only place the batch's actual claim can be checked: that a rained-off foursome
 * is **one** visit to this screen rather than four.
 *
 * Both options run through the same harness and differ only in the middle step,
 * which is the whole point — switch between the two stories and the entry, the
 * commit and the landing are identical, so anything that feels different is the
 * hole-count question and nothing else.
 *
 * Three things this shows that neither option story can:
 *
 * 1. **The entry point is unchanged.** Step one is the shipping detail screen
 *    itself — the same component **Flows → Rainchecks → 1 — Booking with a
 *    raincheck** renders — with its buttons made live. Weston asked for the red
 *    RAINCHECK button to stay exactly where it is; what changes is where it
 *    *goes*. Tapping it on any one player now opens the whole group, which is
 *    his own *"anytime you hit rain check, it just takes you there"* extended
 *    from one round to four.
 * 2. **Coming back.** After the batch, every player on the tee time carries a
 *    credit and none of them offers RAINCHECK any more. The single-issue flow
 *    reaches that state after four round trips; this reaches it after one.
 * 3. **What reassignment is actually for.** The landing groups the new credits
 *    by the account holding them, so a foursome that put two credits on one name
 *    shows up as one account with two — which is the thing the dropdown exists
 *    to produce and is invisible on the issue screen itself.
 */

const AT = "3:14 PM";
const ISSUED_ON = "08/19/2026";
const EXPIRES_ON = "08/19/2027";

/**
 * Turn the ticked rows into credits, and mark their rounds spent.
 *
 * Pure, and shared by both options — the batch is the same commit either way.
 * The credits it produces are the same `Raincheck` the record and the till
 * already understand, which is what lets the landing step render them in the
 * real components rather than in a mock-up of them.
 */
export const commitDrafts = (
    positions: RaincheckPosition[],
    drafts: GroupDraft[],
    firstId: number,
    teeTime: string,
): { positions: RaincheckPosition[]; credits: Raincheck[] } => {
    let id = firstId;
    const credits: Raincheck[] = [];

    const next = positions.map((p) => {
        const draft = drafts.find((d) => d.positionId === p.id);
        if (!draft?.include || p.issued) return p;

        const holes = clampHoles(p, draft.holesPlayed);
        const amount = draftValue(p, draft);
        const holder = positions.find((x) => x.id === draft.recipientId) ?? p;
        const raincheckId = String(id);
        id += 1;

        credits.push({
            id: raincheckId,
            customerId: holder.id,
            customerName: holder.name,
            // The reservation the round came from, not the account it landed on
            // — Weston's point, and the thing that makes a credit checkable when
            // the customer comes back with a question about it.
            reservation: p.id,
            teeTime,
            issued: ISSUED_ON,
            expires: EXPIRES_ON,
            roundPrice: positionTotal(p),
            totalHoles: p.holes,
            holesPlayed: holes,
            awarded: amount,
            spent: 0,
            balance: amount,
        });

        return { ...p, issued: { raincheckId, amount, at: AT, to: holder.name } };
    });

    return { positions: next, credits };
};

/* ----------------------------------------------------------------- landing */

/**
 * Where the batch ended up.
 *
 * One card per **account**, not per credit. Four credits off one booking can
 * land on four accounts or on two, and which of those happened is the only thing
 * the reassignment dropdown was ever for — so it is what this screen leads with.
 */
const Landed = ({ credits, positions, onRestart }: { credits: Raincheck[]; positions: RaincheckPosition[]; onRestart: () => void }) => {
    const total = +credits.reduce((sum, c) => sum + c.awarded, 0).toFixed(2);
    const byAccount = credits.reduce<Record<string, Raincheck[]>>((acc, c) => {
        (acc[c.customerName] ??= []).push(c);
        return acc;
    }, {});
    const accounts = Object.entries(byAccount);
    // The account holding the most is the interesting one at the till — it is
    // where reassignment shows up as more than one credit on one name.
    const [tillName, tillCredits] = accounts.reduce((best, entry) => (entry[1].length > best[1].length ? entry : best), accounts[0]);
    const nameOf = (reservation: string) => positions.find((p) => p.id === reservation)?.name ?? reservation;

    return (
        <Stack sx={{ height: "100%", bgcolor: appColors.canvas, p: 2, gap: 2, overflowY: "auto" }}>
            <Stack direction="row" sx={{ alignItems: "center", gap: 1, bgcolor: "#E7F3EA", px: 2, py: 1.5 }}>
                <CheckCircleIcon sx={{ fontSize: 22, color: appColors.greenTee }} />
                <Typography sx={{ fontSize: 18, color: appColors.greenTee, flex: 1 }}>
                    {credits.length} {credits.length === 1 ? "raincheck" : "rainchecks"} issued · {usd(total)} · in one press
                </Typography>
                {/* Going back is the action bar's job — it is the app's own
                    affordance and it is already on screen. All this band needs
                    to add is the way to run the trip again from scratch. */}
                <ButtonBase
                    onClick={onRestart}
                    sx={{
                        border: `1px solid ${appColors.divider}`,
                        bgcolor: appColors.surface,
                        px: 2,
                        py: 1,
                        fontSize: 15,
                        borderRadius: 0.5,
                    }}
                >
                    Start over
                </ButtonBase>
            </Stack>

            <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>
                {credits.length} credits, {accounts.length} {accounts.length === 1 ? "account" : "accounts"}. Each credit still carries the
                reservation and the {credits[0]?.teeTime} round it was cut from — the batch changed how many were issued at once, not what
                any one of them is.
            </Typography>

            {accounts.map(([name, rows]) => {
                const moved = rows.filter((c) => c.reservation !== c.customerId);
                return (
                    <Box key={name} sx={{ bgcolor: appColors.surface, border: `1px solid ${appColors.divider}` }}>
                        <Stack direction="row" sx={{ bgcolor: appColors.navy, px: 2, py: 1.25, alignItems: "center", gap: 1 }}>
                            <Typography sx={{ fontSize: 15, color: "#fff", flex: 1 }}>
                                On {name}&rsquo;s record — {rows.length} {rows.length === 1 ? "credit" : "credits"},{" "}
                                {usd(+rows.reduce((s, c) => s + c.awarded, 0).toFixed(2))}
                            </Typography>
                            {moved.length > 0 && (
                                <Stack direction="row" sx={{ alignItems: "center", gap: 0.75 }}>
                                    <SouthEastIcon sx={{ fontSize: 18, color: appColors.orange }} />
                                    <Typography sx={{ fontSize: 14, color: appColors.orange }}>
                                        including {moved.map((c) => `${nameOf(c.reservation)}'s round`).join(" and ")}
                                    </Typography>
                                </Stack>
                            )}
                        </Stack>
                        <RainChecksTable rows={rows} />
                    </Box>
                );
            })}

            <Box sx={{ bgcolor: appColors.surface, border: `1px solid ${appColors.divider}` }}>
                <Box sx={{ bgcolor: appColors.navy, px: 2, py: 1.25 }}>
                    <Typography sx={{ fontSize: 15, color: "#fff" }}>
                        At the till, on the RAIN tender — {tillName}&rsquo;s ticket
                    </Typography>
                </Box>
                <CartCredits customerName={tillName} credits={tillCredits} owed={53.48} />
            </Box>
        </Stack>
    );
};

/* -------------------------------------------------------------------- flow */

export interface GroupIssueFlowProps {
    /** Which middle screen. Everything else is identical between the two. */
    variant: "per-player" | "one-stop";
    seed: RaincheckPosition[];
    heading: string;
    teeTime: string;
    startHoles?: number;
}

export const GroupIssueFlow = ({ variant, seed, heading, teeTime, startHoles = 5 }: GroupIssueFlowProps) => {
    const [positions, setPositions] = useState(seed);
    const [drafts, setDrafts] = useState<GroupDraft[]>(() => makeDrafts(seed, startHoles));
    const [groupHoles, setGroupHoles] = useState(startHoles);
    const [step, setStep] = useState<"booking" | "issue" | "done">("booking");
    const [credits, setCredits] = useState<Raincheck[]>([]);
    const [nextId, setNextId] = useState(51390);

    // Option B's rows follow the group unless taken off it; Option A's carry
    // their own. Resolved here so the commit and the action bar agree with the
    // rows either way.
    const effective: GroupDraft[] =
        variant === "one-stop"
            ? drafts.map((d) => {
                  const position = positions.find((p) => p.id === d.positionId);
                  return position ? { ...d, holesPlayed: clampHoles(position, d.custom ? d.holesPlayed : groupHoles) } : d;
              })
            : drafts;

    const totals = groupTotals(positions, effective);

    const patch = (positionId: string, next: Partial<GroupDraft>) =>
        setDrafts((prev) => prev.map((d) => (d.positionId === positionId ? { ...d, ...next } : d)));

    const openGroup = () => {
        // Everyone still owed a credit comes in ticked. The player whose button
        // was tapped gets no special treatment — the screen is about the group,
        // and singling one out would only invite the operator to think the
        // others are somebody else's problem.
        setDrafts(makeDrafts(positions, groupHoles));
        setStep("issue");
    };

    const issue = () => {
        if (totals.count === 0) return;
        const result = commitDrafts(positions, effective, nextId, teeTime);
        setPositions(result.positions);
        setCredits(result.credits);
        setNextId(nextId + result.credits.length);
        setStep("done");
    };

    const restart = () => {
        setPositions(seed);
        setDrafts(makeDrafts(seed, startHoles));
        setGroupHoles(startHoles);
        setCredits([]);
        setNextId(51390);
        setStep("booking");
    };

    if (step === "booking") {
        return (
            <TeeTimeDetailScreen
                detail={{
                    title: heading,
                    players: positions.map((p) => ({
                        name: p.name,
                        amount: usd(positionTotal(p)),
                        flags: p.issued ? (["bolt"] as const).slice() : undefined,
                        meta: `${p.holes} holes   ${p.greenFee.name} : ${usd(p.greenFee.price)}   ${p.cartFee.name} : ${usd(
                            p.cartFee.price,
                        )}   ID:${p.id}${p.issued ? `   Raincheck ${p.issued.raincheckId} : ${usd(p.issued.amount)} to ${p.issued.to}` : ""}`,
                        actions: p.issued
                            ? (["History", "Edit", "Cart Signout", "Print Starter", "Print Receipt", "Cart Key"] as PlayerAction[])
                            : ([
                                  "Raincheck",
                                  "History",
                                  "Edit",
                                  "Cart Signout",
                                  "Print Starter",
                                  "Print Receipt",
                                  "Cart Key",
                              ] as PlayerAction[]),
                    })),
                }}
                onAction={(action) => {
                    if (action === "Raincheck") openGroup();
                }}
            />
        );
    }

    return (
        <AppShell
            title="Raincheck"
            active="teesheet"
            accountLabel=""
            showLogOut={false}
            actionBar={
                step === "issue" ? (
                    <>
                        <ActionButton icon={<ArrowBackIosNewIcon />} onClick={() => setStep("booking")}>
                            Back
                        </ActionButton>
                        <ActionButton icon={<BoltIcon />} tone={totals.count === 0 ? "disabled" : "primary"} grow={1.6} onClick={issue}>
                            {totals.count === 0
                                ? "Nothing selected"
                                : `Issue ${totals.count} ${totals.count === 1 ? "raincheck" : "rainchecks"} · ${usd(totals.amount)}`}
                        </ActionButton>
                    </>
                ) : (
                    <ActionButton icon={<ArrowBackIosNewIcon />} onClick={() => setStep("booking")}>
                        Back to the tee time
                    </ActionButton>
                )
            }
        >
            {step === "issue" &&
                (variant === "one-stop" ? (
                    <GroupIssueOneStop
                        heading={heading}
                        positions={positions}
                        groupHoles={groupHoles}
                        onGroupHoles={setGroupHoles}
                        drafts={drafts}
                        onDraft={patch}
                        onToggleAll={(include) => setDrafts((prev) => prev.map((d) => ({ ...d, include })))}
                    />
                ) : (
                    <GroupIssuePerPlayer
                        heading={heading}
                        positions={positions}
                        drafts={drafts}
                        onDraft={patch}
                        onToggleAll={(include) => setDrafts((prev) => prev.map((d) => ({ ...d, include })))}
                    />
                ))}

            {step === "done" && <Landed credits={credits} positions={positions} onRestart={restart} />}
        </AppShell>
    );
};
