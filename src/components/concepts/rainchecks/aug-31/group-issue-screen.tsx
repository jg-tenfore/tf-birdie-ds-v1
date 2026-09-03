import { useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { appColors } from "@/theme/app-replica-tokens";
import { GroupIssueOneStop } from "../group-issue-one-stop";
import { clampHoles, draftValue, groupTotals, makeDrafts, rainedOutHeading, usd, type GroupDraft } from "../group-issue";
import type { RaincheckPosition } from "../reservation-raincheck";

/**
 * **Aug 31.** The issue screen, as chosen — Option B, one stop for the group.
 *
 * Aug 20 drew two options for this screen and left the choice open in WJ-84.
 * **The choice is now made: Option B.** The hole count is asked once, at the
 * top, for everybody; rows that differ are taken off it by hand.
 *
 * The bet B makes, and which is now the design's assumption: **the hole count
 * is a fact about the weather, not about each player.** The horn goes on the
 * ninth and the foursome walks off the ninth. So it is one number to get right
 * instead of four, and the rows carry only what genuinely differs — whether a
 * player gets a credit at all, whose account it lands on, and how their own fee
 * structure turns the shared number into money.
 *
 * Option A — a stepper on every row — is retired, the same way Aug 24's options
 * A and C were once the tender decision was made. It survives in
 * `Flows → Rainchecks → Aug 20` as the record of how the choice was made, and
 * as source at `../group-issue-per-player.tsx`.
 *
 * ## What this component is
 *
 * The harness around `GroupIssueOneStop` — the app shell, the action bar that
 * names what it is about to do, and the confirmation band. Extracted here rather
 * than written inline in a story file so the Aug 31 stories and anything built
 * later share one, and so the screen can be opened without the whole
 * tee-sheet → issue → landing trip around it.
 *
 * For the trip, use `GroupIssueFlow` with `variant="one-stop"` — that is the
 * end-to-end story, and it is the one to open first.
 */
export interface GroupIssueScreenProps {
    seed: RaincheckPosition[];
    heading?: string;
    /** Where the group stop starts. Stories use it to set up a specific case. */
    startHoles?: number;
    /** Pre-adjust the drafts so a story can open on an exception or an exclusion. */
    tweak?: (drafts: GroupDraft[]) => GroupDraft[];
}

export const GroupIssueScreen = ({ seed, heading = rainedOutHeading, startHoles = 5, tweak }: GroupIssueScreenProps) => {
    const [positions, setPositions] = useState(seed);
    const [groupHoles, setGroupHoles] = useState(startHoles);
    const [drafts, setDrafts] = useState<GroupDraft[]>(() => {
        const base = makeDrafts(seed, startHoles);
        return tweak ? tweak(base) : base;
    });
    const [nextId, setNextId] = useState(51381);
    const [flash, setFlash] = useState<string | null>(null);

    /**
     * Rows follow the group number unless taken off it.
     *
     * Resolved in one place so the rows, the review band and the action-bar
     * total can never disagree with the credits actually issued — which is the
     * failure a shared control invites and the reason `custom` is stored rather
     * than inferred from whether the value differs.
     */
    const effective: GroupDraft[] = drafts.map((d) => {
        const position = positions.find((p) => p.id === d.positionId);
        if (!position) return d;
        return { ...d, holesPlayed: clampHoles(position, d.custom ? d.holesPlayed : groupHoles) };
    });
    const totals = groupTotals(positions, effective);

    const patch = (positionId: string, next: Partial<GroupDraft>) => {
        setDrafts((prev) => prev.map((d) => (d.positionId === positionId ? { ...d, ...next } : d)));
        setFlash(null);
    };

    /**
     * Cancels a credit and frees its round.
     *
     * A round can only be rainchecked once, so without this a credit cut for the
     * wrong player leaves the round locked as well as the money misplaced. The
     * reason is required and comes from a fixed list — free text would be left
     * blank, and *"issued to the wrong player"* is the count that would justify
     * redesigning this screen.
     */
    const voidCredit = (positionId: string, reason: string) => {
        const target = positions.find((p) => p.id === positionId);
        if (!target?.issued) return;
        const { raincheckId, amount, to } = target.issued;
        setPositions((prev) => prev.map((p) => (p.id === positionId ? { ...p, issued: undefined } : p)));
        setDrafts((prev) => prev.map((d) => (d.positionId === positionId ? { ...d, include: true } : d)));
        setFlash(`Raincheck ${raincheckId} (${usd(amount)} to ${to}) voided — ${reason}. ${target.name}'s round can be rainchecked again.`);
    };

    const issue = () => {
        if (totals.count === 0) return;
        let id = nextId;
        const done: string[] = [];
        const next = positions.map((p) => {
            const draft = effective.find((d) => d.positionId === p.id);
            if (!draft?.include || p.issued) return p;
            const amount = draftValue(p, draft);
            const to = positions.find((x) => x.id === draft.recipientId)?.name ?? p.name;
            done.push(`${p.name} → ${usd(amount)}`);
            const issued = { raincheckId: String(id), amount, at: "2:41 PM", to };
            id += 1;
            return { ...p, issued };
        });

        setPositions(next);
        setNextId(id);
        setFlash(
            `${totals.count} ${totals.count === 1 ? "raincheck" : "rainchecks"} issued, ${usd(totals.amount)} in total — ${done.join(", ")}.`,
        );
    };

    return (
        <AppShell
            title="Raincheck"
            active="teesheet"
            accountLabel=""
            showLogOut={false}
            actionBar={
                <>
                    <ActionButton icon={<ArrowBackIosNewIcon />}>Back</ActionButton>
                    {/* The button says what it is about to do before it is
                        pressed. Four credits leaving the course is not something
                        to commit behind a bare verb. */}
                    <ActionButton icon={<BoltIcon />} tone={totals.count === 0 ? "disabled" : "primary"} grow={1.6} onClick={issue}>
                        {totals.count === 0
                            ? "Nothing selected"
                            : `Issue ${totals.count} ${totals.count === 1 ? "raincheck" : "rainchecks"} · ${usd(totals.amount)}`}
                    </ActionButton>
                </>
            }
        >
            <Stack sx={{ height: "100%", minHeight: 0 }}>
                {flash && (
                    <Stack direction="row" sx={{ alignItems: "center", gap: 1, bgcolor: "#E7F3EA", px: 3, py: 1.25 }}>
                        <CheckCircleIcon sx={{ fontSize: 20, color: appColors.greenTee }} />
                        <Typography sx={{ fontSize: 16, color: appColors.greenTee }}>{flash}</Typography>
                    </Stack>
                )}
                <Box sx={{ flex: 1, minHeight: 0 }}>
                    <GroupIssueOneStop
                        heading={heading}
                        positions={positions}
                        groupHoles={groupHoles}
                        onGroupHoles={(h) => {
                            setGroupHoles(h);
                            setFlash(null);
                        }}
                        drafts={drafts}
                        onDraft={patch}
                        onVoid={voidCredit}
                        onToggleAll={(include) => {
                            setDrafts((prev) => prev.map((d) => ({ ...d, include })));
                            setFlash(null);
                        }}
                    />
                </Box>
            </Stack>
        </AppShell>
    );
};
