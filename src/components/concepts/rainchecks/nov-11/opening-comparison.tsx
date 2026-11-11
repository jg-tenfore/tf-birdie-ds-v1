import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import BoltIcon from "@mui/icons-material/Bolt";

import { appColors } from "@/theme/app-replica-tokens";
import { draftValue, includeFor, makeDrafts, usd, type PreselectMode } from "../group-issue";
import type { RaincheckPosition } from "../reservation-raincheck";

/**
 * **Nov 11.** The three opening defaults, next to each other.
 *
 * Not a screen to build — a comparison aid, and the only thing on it that would
 * ever ship is the tick column. Everything else about the issue screen is
 * identical across the three, which is exactly the point: the whole of the Nov
 * 11 change is *which boxes are already ticked when it opens*.
 *
 * It renders the rows rather than three whole tablet screens because three
 * landscape shells side by side are unreadable at any width this Storybook has,
 * and because the shells would be identical anyway. The amounts and the action
 * bar label come from the real helpers — `includeFor`, `draftValue` — so this
 * cannot drift away from what the screens actually do. If a number here is
 * wrong, the screens are wrong too.
 */
export interface OpeningComparisonProps {
    seed: RaincheckPosition[];
    /** The player whose RAINCHECK button was pressed, for the `tapped` column. */
    tappedId: string;
    startHoles?: number;
}

interface ColumnSpec {
    mode: PreselectMode;
    label: string;
    sub: string;
    tone: string;
}

const COLUMNS: ColumnSpec[] = [
    { mode: "all", label: "Today", sub: "Everyone ticked", tone: appColors.red },
    { mode: "none", label: "Option A", sub: "Nobody ticked", tone: appColors.slate },
    { mode: "tapped", label: "Option B", sub: "Only the player you tapped", tone: appColors.greenTee },
];

const Column = ({ column, seed, tappedId, startHoles }: { column: ColumnSpec } & OpeningComparisonProps) => {
    const drafts = makeDrafts(seed, startHoles ?? 5, column.mode, tappedId);
    const live = seed.filter((p) => includeFor(p, column.mode, tappedId));
    const amount = live.reduce(
        (sum, p) =>
            sum +
            draftValue(
                p,
                drafts.find((d) => d.positionId === p.id)!,
            ),
        0,
    );

    return (
        <Stack sx={{ flex: 1, minWidth: 260, bgcolor: appColors.surface, borderRadius: 1, overflow: "hidden" }}>
            <Box sx={{ bgcolor: column.tone, px: 2, py: 1.25 }}>
                <Typography sx={{ fontSize: 17, fontWeight: 700, color: "#FFFFFF" }}>{column.label}</Typography>
                <Typography sx={{ fontSize: 14, color: "rgba(255,255,255,0.85)" }}>{column.sub}</Typography>
            </Box>

            <Stack sx={{ p: 1.5, gap: 0.5, flex: 1 }}>
                {seed.map((position) => {
                    const on = includeFor(position, column.mode, tappedId);
                    const tapped = position.id === tappedId;
                    return (
                        <Stack
                            key={position.id}
                            direction="row"
                            sx={{
                                alignItems: "center",
                                gap: 1.25,
                                px: 1,
                                py: 1,
                                borderRadius: 1,
                                bgcolor: on ? "#EDF5EF" : "transparent",
                            }}
                        >
                            {on ? (
                                <CheckBoxIcon sx={{ fontSize: 22, color: appColors.greenTee }} />
                            ) : (
                                <CheckBoxOutlineBlankIcon sx={{ fontSize: 22, color: appColors.greyLight }} />
                            )}
                            <Typography
                                sx={{
                                    flex: 1,
                                    fontSize: 15,
                                    color: on ? appColors.textPrimary : appColors.textSecondary,
                                    fontWeight: on ? 600 : 400,
                                }}
                            >
                                {position.name}
                                {/* The tap is marked in every column, not just the one that
                                    acts on it — otherwise Option B looks like it ticked
                                    somebody at random. */}
                                {tapped && (
                                    <Typography component="span" sx={{ fontSize: 13, color: appColors.textSecondary, ml: 0.75 }}>
                                        · you tapped
                                    </Typography>
                                )}
                            </Typography>
                            <Typography sx={{ fontSize: 15, color: on ? appColors.textPrimary : appColors.textDisabled }}>
                                {usd(
                                    draftValue(
                                        position,
                                        drafts.find((d) => d.positionId === position.id)!,
                                    ),
                                )}
                            </Typography>
                        </Stack>
                    );
                })}
            </Stack>

            {/* The action bar reads straight off the ticks, so it is the shortest
                honest statement of what each default is about to do. */}
            <Stack
                direction="row"
                sx={{
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 0.75,
                    bgcolor: live.length === 0 ? appColors.fieldFill : appColors.greenTee,
                    px: 2,
                    py: 1.5,
                }}
            >
                {live.length > 0 && <BoltIcon sx={{ fontSize: 20, color: "#FFFFFF" }} />}
                <Typography
                    sx={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: live.length === 0 ? appColors.textDisabled : "#FFFFFF",
                    }}
                >
                    {live.length === 0
                        ? "Nothing selected"
                        : `Issue ${live.length} ${live.length === 1 ? "raincheck" : "rainchecks"} · ${usd(+amount.toFixed(2))}`}
                </Typography>
            </Stack>
        </Stack>
    );
};

export const OpeningComparison = (props: OpeningComparisonProps) => (
    <Stack sx={{ bgcolor: appColors.canvas, p: 3, gap: 2, minHeight: "100vh" }}>
        <Box>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: appColors.textPrimary }}>The moment the issue screen opens</Typography>
            <Typography sx={{ fontSize: 15, color: appColors.textSecondary, maxWidth: 820 }}>
                One operator pressed RAINCHECK on {props.seed.find((p) => p.id === props.tappedId)?.name ?? "one player"}. Three defaults,
                three different things about to happen — and under today&rsquo;s, three of the four credits are ones nobody asked for.
            </Typography>
        </Box>
        <Stack direction="row" sx={{ gap: 2, alignItems: "stretch", flexWrap: "wrap" }}>
            {COLUMNS.map((column) => (
                <Column key={column.mode} column={column} {...props} />
            ))}
        </Stack>
    </Stack>
);
