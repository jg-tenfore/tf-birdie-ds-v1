import { useState } from "react";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { GroupIssueOneStop } from "@/components/concepts/rainchecks/group-issue-one-stop";
import {
    clampHoles,
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
 * **Concept — Aug 20, Option B. One stop for the group, exceptions after.**
 *
 * Same list, same ticks, same dropdown on the right as **Option A**. One
 * question moves: *where did play stop?* is asked once, at the top, for
 * everybody.
 *
 * The bet is that the hole count is a fact about the weather rather than about
 * each player — the horn goes on the ninth and the foursome walks off the ninth
 * — so it is one number to get right instead of four. The rows then carry only
 * what genuinely differs: whether a player gets one at all, whose account it
 * lands on, and how their own fee structure turns the shared number into money.
 *
 * The cost is the split group, which becomes one extra tap on the rows that
 * differ. Whether that trade is worth it is a question about how golf actually
 * behaves, not about layout, and it should be answered by asking a pro shop.
 */
const meta = {
    title: "Flows/Rainchecks/Aug 20/Option B — One stop for the group",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Concept = ({
    seed,
    startHoles = 5,
    tweak,
}: {
    seed: RaincheckPosition[];
    startHoles?: number;
    tweak?: (d: GroupDraft[]) => GroupDraft[];
}) => {
    const [positions, setPositions] = useState(seed);
    const [groupHoles, setGroupHoles] = useState(startHoles);
    const [drafts, setDrafts] = useState<GroupDraft[]>(() => {
        const base = makeDrafts(seed, startHoles);
        return tweak ? tweak(base) : base;
    });
    const [nextId, setNextId] = useState(51381);
    const [flash, setFlash] = useState<string | null>(null);

    // The same resolution the screen does, so the action bar's total and the
    // credits actually issued cannot disagree with what the rows show.
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
                        heading={rainedOutHeading}
                        positions={positions}
                        groupHoles={groupHoles}
                        onGroupHoles={(h) => {
                            setGroupHoles(h);
                            setFlash(null);
                        }}
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
 * **Live.** The same rained-out foursome as Option A, with one number at the top
 * instead of four down the page.
 *
 * Drag the group slider and watch all four amounts move together — four
 * different prices resolving from one hole count, which is the thing a shared
 * control is actually for. Then compare the effort: Option A's version of this
 * move is four steppers.
 *
 * The rows are shorter because the hole count has left them. What is left is
 * what differs per player: the tick, the money their own rate produces, and the
 * account it lands on.
 */
export const Default: Story = {
    name: "Rained-out foursome",
    render: () => <Concept seed={rainedOutFoursome} />,
};

/**
 * The split group — the case Option B has to earn.
 *
 * Oda Brennevin kept going after the rest came in, so her row is off the group
 * number: **They stopped somewhere else** reveals a stepper, and the row picks
 * up a `SET BY HAND` mark. Move the group slider afterwards and hers stays put —
 * that is the whole reason the flag is stored rather than inferred.
 *
 * **Back to the group** puts her back on it.
 *
 * How often this happens is the question that decides between the two options,
 * and nobody in the conversation has said. It is worth one phone call to a pro
 * shop before either of these is built.
 */
export const OneException: Story = {
    name: "One of them played on",
    render: () => <Concept seed={rainedOutFoursome} tweak={(d) => d.map((x) => (x.positionId === "10314912" ? { ...x, custom: true, holesPlayed: 12 } : x))} />,
};

/**
 * The deselect case, as in Option A.
 *
 * Oda Brennevin and Tom Watson finished and are not owed anything. Unticking
 * also takes their rows out of the exception controls, so the list quietens as
 * you narrow it.
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
 * A nine-hole booking inside an eighteen-hole group — the case that only exists
 * because there is a group number at all.
 *
 * Tom Watson booked the nine. Push the group stop past 8 and his round cannot
 * follow it: a banner names him, his row says **Booked 9 holes — credited from
 * hole 8**, and his amount works out of his own round rather than the group's.
 *
 * Compare **Option A's** version of this fixture, where the same situation needs
 * no explanation because no number spans players. This is the clearest single
 * argument against Option B, and it is on screen rather than in a footnote.
 *
 * What the clamp should actually do is **not settled**. Crediting from the last
 * hole of his own round leaves him $3.38 against the others' $33.33, which may
 * be right — he finished his nine — or may be a case for dropping him off the
 * group number automatically rather than clamping him to it.
 */
export const MixedHoles: Story = {
    name: "A nine among the eighteens",
    render: () => <Concept seed={mixedHoleFoursome} startHoles={12} />,
};

/**
 * A round already credited earlier in the day.
 *
 * Justin Girard's row cannot be ticked and carries no controls — a round cannot
 * be rainchecked twice — and the group number does not reach it. The count reads
 * three.
 */
export const OneAlreadyIssued: Story = {
    name: "One round already credited",
    render: () => <Concept seed={partlyDoneFoursome} />,
};

/**
 * Two players, for scale.
 *
 * The group control has a weaker case at this size — two steppers is not four —
 * and it is worth deciding whether the header earns its space below three
 * players or whether small bookings should fall back to the single-issue screen.
 */
export const Twosome: Story = {
    name: "Two players",
    render: () => <Concept seed={twosome} />,
};
