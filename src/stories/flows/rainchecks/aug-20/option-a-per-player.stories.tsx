import { useState } from "react";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { GroupIssuePerPlayer } from "@/components/concepts/rainchecks/group-issue-per-player";
import {
    draftValue,
    groupTotals,
    makeDrafts,
    mixedHoleFoursome,
    partlyDoneFoursome,
    rainedOutFoursome,
    rainedOutHeading,
    twosome,
    usd,
    type GroupDraft,
} from "@/components/concepts/rainchecks/group-issue";
import type { RaincheckPosition } from "@/components/concepts/rainchecks/reservation-raincheck";
import { appColors } from "@/theme/app-replica-tokens";

/**
 * **Concept — Aug 20, Option A. One row per player, every question on the row.**
 *
 * The note's shape taken literally: name on the left, dropdown on the right, a
 * tick to include, plus a hole count per row so no row depends on any other.
 *
 * The bet is that groups do **not** stop together — two quit at the turn, two
 * played on — and that a shared number would be a default you spend your time
 * fighting. If that is right, this is the cheaper screen. If it is wrong, this
 * costs four identical adjustments where **Option B** costs one, which is a
 * smaller version of the repetition the note is complaining about.
 *
 * Compare **Option B — One stop for the group**, and **Weston's ideas → 2 —
 * Create raincheck**, which is the one-at-a-time screen both of these replace.
 */
const meta = {
    title: "Flows/Rainchecks/Aug 20/Option A — Row per player",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The batch, wired.
 *
 * ISSUE actually issues — all of the ticked rows at once, in one press. The rows
 * that went through grey out and say what they became; the ones you unticked are
 * still sitting there untouched, which is the point of a batch that can be
 * partial.
 *
 * State lives in the story. Nothing here touches the prototype.
 */
const Concept = ({ seed, startHoles = 5, tweak }: { seed: RaincheckPosition[]; startHoles?: number; tweak?: (d: GroupDraft[]) => GroupDraft[] }) => {
    const [positions, setPositions] = useState(seed);
    const [drafts, setDrafts] = useState<GroupDraft[]>(() => {
        const base = makeDrafts(seed, startHoles);
        return tweak ? tweak(base) : base;
    });
    const [nextId, setNextId] = useState(51381);
    const [flash, setFlash] = useState<string | null>(null);

    const totals = groupTotals(positions, drafts);

    const patch = (positionId: string, next: Partial<GroupDraft>) => {
        setDrafts((prev) => prev.map((d) => (d.positionId === positionId ? { ...d, ...next } : d)));
        setFlash(null);
    };

    const issue = () => {
        if (totals.count === 0) return;
        // Built outside the state updater on purpose — the updater runs twice
        // under StrictMode, and an id counter incremented inside one drifts.
        let id = nextId;
        const done: string[] = [];
        const next = positions.map((p) => {
            const draft = drafts.find((d) => d.positionId === p.id);
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
        setFlash(`${totals.count} ${totals.count === 1 ? "raincheck" : "rainchecks"} issued, ${usd(totals.amount)} in total — ${done.join(", ")}.`);
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
                    {/* The button says what it is about to do. Four credits and
                        $206.18 leaving the course is not something to commit
                        behind a verb on its own. */}
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
                    <GroupIssuePerPlayer
                        heading={rainedOutHeading}
                        positions={positions}
                        drafts={drafts}
                        onDraft={patch}
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

/**
 * **Live.** A foursome walks off after five holes and the whole group is set up
 * on one screen.
 *
 * Four rows, four prices — two rack rate, one Birdie discount, one senior — and
 * one press issues all four. The old flow is this same screen four times.
 *
 * Things worth trying:
 *
 * - **Untick a row.** It stays visible and greys, the count and the total drop,
 *   and the button relabels. Nothing is hidden; you can see what you turned off.
 * - **Change a hole count.** Only that row's money moves.
 * - **Reassign one.** The dropdown tints amber and the band picks it up —
 *   *"1 going to a different account"* — so an exception buried on row three is
 *   still visible from the bottom of the screen.
 * - **Then press ISSUE.** All of them go at once and the rows say what they
 *   became.
 */
export const Default: Story = {
    name: "Rained-out foursome",
    render: () => <Concept seed={rainedOutFoursome} />,
};

/**
 * The deselect case, which the note asked for by name.
 *
 * > *"You would need to be able to deselect the ones you do not want to issue a
 * > raincheck for."*
 *
 * Oda Brennevin and Tom Watson finished their round in the drizzle and are not
 * owed anything. Their rows are unticked: still there, still readable, counted
 * out of the total. The button reads two rainchecks rather than four.
 *
 * This is the case that makes the batch worth building rather than just
 * "raincheck everybody" — the group arrives together and does not always leave
 * together.
 */
export const SomeExcluded: Story = {
    name: "Two of them finished",
    render: () => (
        <Concept
            seed={rainedOutFoursome}
            tweak={(d) => d.map((x) => (x.positionId === "10314912" || x.positionId === "10314913" ? { ...x, include: false } : x))}
        />
    ),
};

/**
 * The dropdown doing the job it was asked for.
 *
 * Tom Watson is visiting and will not be back, so his credit goes onto Weston
 * Farnsworth's account — Weston's own guest case from the earlier walkthrough,
 * except that here it is one dropdown on one row rather than a separate trip
 * through the whole flow.
 *
 * The row tints, the option reads **Weston Farnsworth** where the others read
 * *(themselves)*, and the band counts it. Scanning four rows for the odd one out
 * is a colour, not a reading task.
 */
export const Reassigned: Story = {
    name: "One credit to somebody else",
    render: () => (
        <Concept seed={rainedOutFoursome} tweak={(d) => d.map((x) => (x.positionId === "10314913" ? { ...x, recipientId: "10314910" } : x))} />
    ),
};

/**
 * A round already credited earlier in the day.
 *
 * Justin Girard was rainchecked at 2:30 and the credit has since been spent. His
 * row cannot be ticked, has no controls, and says what happened instead — a
 * round cannot be rainchecked twice. The count reads three, not four.
 *
 * This is the state the shipping screen has nowhere to show: it would happily
 * issue a second credit against the same round.
 */
export const OneAlreadyIssued: Story = {
    name: "One round already credited",
    render: () => <Concept seed={partlyDoneFoursome} />,
};

/**
 * A group where one player booked the nine and the rest booked eighteen.
 *
 * Under Option A this needs no special handling at all — Tom Watson's stepper
 * stops at 8 because that is his round, and nobody else's number is involved.
 * That is the strongest thing this option has going for it, and it is worth
 * looking at **Option B's** version of the same fixture, where one group-wide
 * number has to be reconciled against a shorter round and the screen has to say
 * so out loud.
 */
export const MixedHoles: Story = {
    name: "A nine among the eighteens",
    render: () => <Concept seed={mixedHoleFoursome} />,
};

/**
 * Two players, for scale.
 *
 * Most bookings are not foursomes. Worth checking the screen does not look like
 * a report when the group is the size it usually is — and worth asking whether a
 * twosome should get this screen at all, or drop to the single-issue one.
 */
export const Twosome: Story = {
    name: "Two players",
    render: () => <Concept seed={twosome} />,
};
