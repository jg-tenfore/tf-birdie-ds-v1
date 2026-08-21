import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { appColors } from "@/theme/app-replica-tokens";
import type { RaincheckPosition } from "./reservation-raincheck";
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
 * **Concept — Aug 20, Option A: one row per player.**
 *
 * The note's shape, taken literally. Name on the left, dropdown on the right,
 * tick to include, and — the part the note does not mention — the hole count on
 * the row too, so every row is a complete raincheck that owes nothing to any
 * other row.
 *
 * **What this option is betting on:** that players in a group do not all stop at
 * the same hole. Two quit at the turn, two played on to fourteen, and the horn
 * only accounts for some walk-offs. If that is common, a group-wide number is a
 * default you fight, and every row needs its own control anyway.
 *
 * **What it costs:** four steppers down a page is four money amounts to set. The
 * common case — everybody walked off the ninth — costs four identical
 * adjustments instead of one, which is a smaller version of exactly the
 * repetition the note is complaining about. Option B is the other bet.
 *
 * There is a compromise neither file draws: A with B's group control at the top
 * as a bulk-set. It would probably win. It is left out so the two bets stay
 * legible against each other, and so the question — *do groups stop together?* —
 * gets answered rather than designed around.
 */
export interface GroupIssuePerPlayerProps {
    heading: string;
    positions: RaincheckPosition[];
    drafts: GroupDraft[];
    onDraft?: (positionId: string, patch: Partial<GroupDraft>) => void;
    onToggleAll?: (include: boolean) => void;
}

export const GroupIssuePerPlayer = ({ heading, positions, drafts, onDraft, onToggleAll }: GroupIssuePerPlayerProps) => {
    const totals = groupTotals(positions, drafts);
    const issuable = positions.filter((p) => !p.issued);
    const allOn = issuable.length > 0 && issuable.every((p) => drafts.find((d) => d.positionId === p.id)?.include);

    return (
        <Stack sx={{ height: "100%", bgcolor: appColors.canvas, minHeight: 0 }}>
            <Box sx={{ bgcolor: appColors.surface, px: 3, py: 2, borderBottom: `1px solid ${appColors.divider}` }}>
                <Typography sx={{ fontSize: 22 }}>Issue rainchecks for this reservation</Typography>
                <Typography sx={{ fontSize: 14, color: appColors.textSecondary, mt: 0.25 }}>{heading}</Typography>
            </Box>

            <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", p: 2 }}>
                <Stack direction="row" sx={{ alignItems: "center", mb: 0.75 }}>
                    <Typography sx={{ fontSize: 15, color: appColors.textSecondary, flex: 1 }}>
                        {issuable.length} of {positions.length} {positions.length === 1 ? "round" : "rounds"} can still be credited
                    </Typography>
                    {/* Four ticks is not a hardship, but "none of them, actually"
                        is a real outcome — the group came in, argued, and took a
                        refund instead. */}
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
                            { label: "Raincheck", width: 130, align: "right" },
                            { label: "Issue it to", width: 210 },
                        ]}
                    />

                    {positions.map((position) => {
                        const draft = drafts.find((d) => d.positionId === position.id)!;
                        const done = Boolean(position.issued);
                        const off = done || !draft.include;
                        const holes = clampHoles(position, draft.holesPlayed);

                        return (
                            <Stack
                                key={position.id}
                                direction="row"
                                sx={{
                                    alignItems: "center",
                                    gap: 2,
                                    px: 2,
                                    py: 1.25,
                                    borderBottom: `1px solid ${appColors.divider}`,
                                    "&:last-of-type": { borderBottom: "none" },
                                    // Excluded rows stay legible rather than
                                    // vanishing — you have to be able to see what
                                    // you turned off.
                                    bgcolor: off ? appColors.canvas : appColors.surface,
                                }}
                            >
                                <Box sx={{ width: 48 }}>
                                    <IncludeBox
                                        checked={draft.include && !done}
                                        disabled={done}
                                        label={position.name}
                                        onChange={(next) => onDraft?.(position.id, { include: next })}
                                    />
                                </Box>

                                <Box sx={{ flex: 1, minWidth: 0, opacity: off ? 0.55 : 1 }}>
                                    <PlayerCell position={position} />
                                    {done && (
                                        <Box sx={{ mt: 0.5 }}>
                                            <AlreadyIssued position={position} />
                                        </Box>
                                    )}
                                </Box>

                                <Box sx={{ width: 190, display: "flex", justifyContent: "center" }}>
                                    {done ? (
                                        <Typography sx={{ fontSize: 14, color: appColors.textDisabled }}>—</Typography>
                                    ) : (
                                        <HoleStepper
                                            value={holes}
                                            max={Math.max(0, position.holes - 1)}
                                            disabled={!draft.include}
                                            label={position.name}
                                            onChange={(h) => onDraft?.(position.id, { holesPlayed: h })}
                                        />
                                    )}
                                </Box>

                                <Stack sx={{ width: 130, alignItems: "flex-end" }}>
                                    {done ? (
                                        <Typography sx={{ fontSize: 14, color: appColors.textDisabled }}>—</Typography>
                                    ) : (
                                        <>
                                            <Typography sx={{ fontSize: 24, color: draft.include ? appColors.greenTee : appColors.textDisabled }}>
                                                {usd(draftValue(position, draft))}
                                            </Typography>
                                            <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>
                                                {draftPercent(position, draft)} back
                                            </Typography>
                                        </>
                                    )}
                                </Stack>

                                <Box sx={{ width: 210, minWidth: 210 }}>
                                    {done ? (
                                        <Typography sx={{ fontSize: 14, color: appColors.textDisabled, textAlign: "center" }}>—</Typography>
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
                        );
                    })}
                </Box>
            </Box>

            <ReviewBand totals={totals} />
        </Stack>
    );
};
