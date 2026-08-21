import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { appColors } from "@/theme/app-replica-tokens";
import { VoidDialog, type RaincheckPosition } from "./reservation-raincheck";
import {
    AlreadyIssued,
    HeaderRow,
    HoleStepper,
    IncludeBox,
    PlayerCell,
    RecipientSelect,
    ReviewBand,
    clampHoles,
    draftPercent,
    draftValue,
    groupTotals,
    usd,
    type GroupDraft,
} from "./group-issue";

/**
 * **Concept — Aug 20, Option B: one stop for the group, exceptions after.**
 *
 * Same list, same ticks, same dropdown on the right. One question moves.
 *
 * **What this option is betting on:** that the hole count is a fact about the
 * *weather*, not about each player. The horn goes on the ninth and a foursome
 * walks off the ninth. Asked once, at the top, it is one number to get right
 * instead of four — and the operator is answering the question they were
 * actually just asked at the counter: *where were you when it stopped?*
 *
 * The rows then carry only what genuinely differs per player: whether they get
 * one at all, whose account it lands on, and how much their own fee structure
 * turns that into. Four different prices, one hole count.
 *
 * **What it costs:** the split group. Two quit at the turn and two played on, so
 * somebody has to be taken off the group number. That is one extra tap on the
 * rows that differ — the hole count on each row is a button, and tapping it
 * turns that row into a stepper — and those rows then say `SET BY HAND`, so a
 * group number changed afterwards does not silently drag them back.
 *
 * **The case that makes this concrete** is Tom Watson's nine-hole booking in a
 * foursome that otherwise played eighteen. A group stop of 13 cannot mean 13 for
 * him, so his row clamps to 8 and says so. Neither the shipping screen nor the
 * earlier concept has anywhere to put that sentence, because neither has a
 * number that spans players.
 */
export interface GroupIssueOneStopProps {
    heading: string;
    positions: RaincheckPosition[];
    /** Where play stopped, for everyone who has not been set by hand. */
    groupHoles: number;
    onGroupHoles?: (holes: number) => void;
    drafts: GroupDraft[];
    onDraft?: (positionId: string, patch: Partial<GroupDraft>) => void;
    onToggleAll?: (include: boolean) => void;
    /**
     * Cancels an already-issued credit and frees its round, so a correct one
     * can be cut. Omit for a read-only screen.
     */
    onVoid?: (positionId: string, reason: string) => void;
}

export const GroupIssueOneStop = ({
    heading,
    positions,
    groupHoles,
    onGroupHoles,
    drafts,
    onDraft,
    onToggleAll,
    onVoid,
}: GroupIssueOneStopProps) => {
    // Rows that follow the group carry the group's number, not their own stale
    // one — resolved once here so the totals, the band and the rows can never
    // disagree about what is about to be issued.
    const effectiveDrafts: GroupDraft[] = drafts.map((d) => {
        const position = positions.find((p) => p.id === d.positionId);
        if (!position) return d;
        return { ...d, holesPlayed: clampHoles(position, d.custom ? d.holesPlayed : groupHoles) };
    });
    const [voiding, setVoiding] = useState<RaincheckPosition | null>(null);
    const totals = groupTotals(positions, effectiveDrafts);
    const issuable = positions.filter((p) => !p.issued);
    const allOn = issuable.length > 0 && issuable.every((p) => drafts.find((d) => d.positionId === p.id)?.include);
    // The longest round in the group sets the scale. Shorter rounds clamp and
    // say so, rather than the control quietly refusing to reach 13 because one
    // person booked the nine.
    const groupMax = Math.max(1, ...positions.map((p) => p.holes - 1));
    const longest = Math.max(...positions.map((p) => p.holes));
    const clampedRows = positions.filter((p) => {
        const d = drafts.find((x) => x.positionId === p.id);
        return d?.include && !p.issued && !d.custom && p.holes - 1 < groupHoles;
    });

    return (
        <Stack sx={{ height: "100%", bgcolor: appColors.canvas, minHeight: 0 }}>
            <Box sx={{ bgcolor: appColors.surface, px: 3, py: 2, borderBottom: `1px solid ${appColors.divider}` }}>
                <Typography sx={{ fontSize: 22 }}>Issue rainchecks for this reservation</Typography>
                <Typography sx={{ fontSize: 14, color: appColors.textSecondary, mt: 0.25 }}>{heading}</Typography>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 2 }}>
                {/* One question, asked once, at the top — the whole bet. */}
                <Stack
                    direction="row"
                    sx={{ bgcolor: appColors.surface, border: `1px solid ${appColors.divider}`, p: 2, gap: 3, alignItems: "center", mb: 2 }}
                >
                    <Stack sx={{ minWidth: 260 }}>
                        <Typography sx={{ fontSize: 17 }}>Where did play stop?</Typography>
                        <Typography sx={{ fontSize: 14, color: appColors.textSecondary, mt: 0.25 }}>
                            Applies to everyone below unless you set them separately.
                        </Typography>
                    </Stack>

                    <HoleStepper value={groupHoles} max={groupMax} label="the group" onChange={onGroupHoles} />

                    <Box sx={{ flex: 1, px: 1 }}>
                        <Slider
                            value={groupHoles}
                            min={0}
                            max={groupMax}
                            step={1}
                            marks
                            onChange={(_, v) => onGroupHoles?.(Array.isArray(v) ? v[0] : v)}
                            valueLabelDisplay="auto"
                            aria-label="Holes played by the group"
                            sx={{
                                color: appColors.greenTee,
                                height: 8,
                                "& .MuiSlider-thumb": { width: 28, height: 28 },
                                "& .MuiSlider-mark": { height: 8, opacity: 0.4 },
                            }}
                        />
                        <Stack direction="row" sx={{ justifyContent: "space-between", mt: -0.5 }}>
                            <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>0 — never teed off</Typography>
                            <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{groupMax} — all but the last</Typography>
                        </Stack>
                    </Box>

                    <Stack sx={{ minWidth: 190, textAlign: "right" }}>
                        <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>Everyone gets back</Typography>
                        <Typography sx={{ fontSize: 22 }}>
                            {Math.max(0, longest - groupHoles)} of {longest} holes
                        </Typography>
                    </Stack>
                </Stack>

                {clampedRows.length > 0 && (
                    <Stack sx={{ bgcolor: "#FFF4E6", border: `1px solid ${appColors.orange}`, px: 2, py: 1.25, mb: 2 }}>
                        <Typography sx={{ fontSize: 15, color: appColors.textPrimary }}>
                            {clampedRows.map((p) => p.name).join(", ")} booked a shorter round than the group stop, so{" "}
                            {clampedRows.length === 1 ? "their credit is" : "those credits are"} worked out from the end of the round
                            {clampedRows.length === 1 ? "" : "s"} actually booked.
                        </Typography>
                    </Stack>
                )}

                <Stack direction="row" sx={{ alignItems: "center", mb: 0.75 }}>
                    <Typography sx={{ fontSize: 15, color: appColors.textSecondary, flex: 1 }}>
                        {issuable.length} of {positions.length} {positions.length === 1 ? "round" : "rounds"} can still be credited
                    </Typography>
                    <ButtonBase
                        onClick={() => onToggleAll?.(!allOn)}
                        sx={{ px: 1.5, py: 1, fontSize: 15, color: appColors.greenTee, minHeight: 44 }}
                    >
                        {allOn ? "Clear all" : "Select all"}
                    </ButtonBase>
                </Stack>

                <Box sx={{ border: `1px solid ${appColors.divider}`, bgcolor: appColors.surface }}>
                    <HeaderRow
                        columns={[
                            { label: "", width: 48 },
                            { label: "Player" },
                            { label: "Holes played", width: 190, align: "center" },
                            { label: "Raincheck", width: 170, align: "right" },
                            { label: "Issue it to", width: 210 },
                        ]}
                    />

                    {positions.map((position) => {
                        const draft = drafts.find((d) => d.positionId === position.id)!;
                        const done = Boolean(position.issued);
                        const off = done || !draft.include;
                        const shown = effectiveDrafts.find((d) => d.positionId === position.id)!;
                        const effective = shown.holesPlayed;
                        const clamped = !draft.custom && position.holes - 1 < groupHoles;

                        return (
                            <Stack
                                key={position.id}
                                sx={{
                                    px: 2,
                                    py: 1.25,
                                    borderBottom: `1px solid ${appColors.divider}`,
                                    "&:last-of-type": { borderBottom: "none" },
                                    bgcolor: off ? appColors.canvas : appColors.surface,
                                }}
                            >
                                <Stack direction="row" sx={{ alignItems: "center", gap: 2 }}>
                                    <Box sx={{ width: 48 }}>
                                        <IncludeBox
                                            checked={draft.include && !done}
                                            disabled={done}
                                            label={position.name}
                                            onChange={(next) => onDraft?.(position.id, { include: next })}
                                        />
                                    </Box>

                                    <Box sx={{ flex: 1, minWidth: 0, opacity: off ? 0.55 : 1 }}>
                                        <Stack direction="row" sx={{ alignItems: "center", gap: 1 }}>
                                            <PlayerCell position={position} />
                                            {!done && draft.custom && (
                                                <Typography
                                                    sx={{
                                                        fontSize: 11,
                                                        letterSpacing: "0.06em",
                                                        color: appColors.orange,
                                                        border: `1px solid ${appColors.orange}`,
                                                        px: 0.75,
                                                        py: 0.15,
                                                        borderRadius: 0.5,
                                                        whiteSpace: "nowrap",
                                                    }}
                                                >
                                                    SET BY HAND
                                                </Typography>
                                            )}
                                        </Stack>
                                        {done && (
                                            <Box sx={{ mt: 0.5 }}>
                                                <AlreadyIssued
                                                    position={position}
                                                    onVoid={onVoid ? () => setVoiding(position) : undefined}
                                                />
                                            </Box>
                                        )}
                                    </Box>

                                    {/* Same column, same width as Option A's — so
                                        the two screens differ in what this column
                                        *is* rather than in where anything sits.
                                        Here it reads the group's number back and
                                        is a way out of it; there it is the only
                                        place the number exists. */}
                                    <Box sx={{ width: 190, minWidth: 190, display: "flex", justifyContent: "center" }}>
                                        {done ? (
                                            <Typography sx={{ fontSize: 14, color: appColors.textDisabled }}>—</Typography>
                                        ) : draft.custom ? (
                                            <Stack sx={{ alignItems: "center" }}>
                                                <HoleStepper
                                                    value={effective}
                                                    max={Math.max(0, position.holes - 1)}
                                                    disabled={!draft.include}
                                                    label={position.name}
                                                    onChange={(h) => onDraft?.(position.id, { holesPlayed: h, custom: true })}
                                                />
                                                <ButtonBase
                                                    onClick={() => onDraft?.(position.id, { custom: false, holesPlayed: groupHoles })}
                                                    sx={{ fontSize: 13, color: appColors.greenTee, mt: 0.25 }}
                                                >
                                                    Back to the group
                                                </ButtonBase>
                                            </Stack>
                                        ) : (
                                            // Reads the group number back, and is
                                            // the way off it. A row that follows
                                            // the group still has to say what it
                                            // is following — a number you cannot
                                            // see on the row is a number nobody
                                            // checks.
                                            <ButtonBase
                                                onClick={() => onDraft?.(position.id, { custom: true, holesPlayed: effective })}
                                                disabled={!draft.include}
                                                sx={{
                                                    flexDirection: "column",
                                                    px: 2,
                                                    py: 0.75,
                                                    minHeight: 48,
                                                    borderRadius: 0.5,
                                                    border: `1px solid ${clamped ? appColors.orange : appColors.divider}`,
                                                    bgcolor: clamped ? "#FFF4E6" : appColors.surface,
                                                    opacity: draft.include ? 1 : 0.4,
                                                }}
                                            >
                                                <Typography sx={{ fontSize: 22, lineHeight: 1.1 }}>{effective}</Typography>
                                                <Typography
                                                    sx={{ fontSize: 12, color: clamped ? appColors.orange : appColors.textSecondary }}
                                                >
                                                    {clamped ? `capped — booked ${position.holes}` : "same as the group"}
                                                </Typography>
                                            </ButtonBase>
                                        )}
                                    </Box>

                                    <Stack sx={{ width: 170, alignItems: "flex-end" }}>
                                        {done ? (
                                            <Typography sx={{ fontSize: 14, color: appColors.textDisabled, textAlign: "center" }}>
                                                —
                                            </Typography>
                                        ) : (
                                            <>
                                                <Typography
                                                    sx={{
                                                        fontSize: 24,
                                                        color: draft.include ? appColors.greenTee : appColors.textDisabled,
                                                    }}
                                                >
                                                    {usd(draftValue(position, shown))}
                                                </Typography>
                                                <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>
                                                    {draftPercent(position, shown)} back
                                                </Typography>
                                            </>
                                        )}
                                    </Stack>

                                    <Box sx={{ width: 210, minWidth: 210 }}>
                                        {done ? (
                                            <Typography sx={{ fontSize: 14, color: appColors.textDisabled, textAlign: "center" }}>
                                                —
                                            </Typography>
                                        ) : (
                                            <RecipientSelect
                                                positions={positions}
                                                value={draft.recipientId}
                                                owner={position.id}
                                                disabled={!draft.include}
                                                onChange={(id) => onDraft?.(position.id, { recipientId: id })}
                                            />
                                        )}
                                    </Box>
                                </Stack>
                            </Stack>
                        );
                    })}
                </Box>
            </Box>

            <ReviewBand totals={totals} />

            {/* The same dialog the single-issue concept used, imported rather
                than reimplemented — one void dialog and one reason list, so the
                two cannot drift apart. */}
            <VoidDialog
                position={voiding}
                onCancel={() => setVoiding(null)}
                onConfirm={(reason) => {
                    if (voiding) onVoid?.(voiding.id, reason);
                    setVoiding(null);
                }}
            />
        </Stack>
    );
};
