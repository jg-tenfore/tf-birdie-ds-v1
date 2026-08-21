import ButtonBase from "@mui/material/ButtonBase";
import Radio from "@mui/material/Radio";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { holesPlayedOptions, raincheckPercentLabel, raincheckValue } from "@/data/rainchecks";
import { appColors } from "@/theme/app-replica-tokens";

/**
 * Create Raincheck, from `references/072926/2-teesheet/`.
 *
 * Reached from a paid booking's **Raincheck** button. The whole screen exists to
 * answer one question — how many holes did they actually play — and to show what
 * that is worth before anyone commits.
 *
 * Two columns. The left restates the round so the operator can check they are
 * refunding the right one; nothing on it is editable. The right is the decision:
 * the resulting credit in large type, then eighteen radio buttons.
 *
 * Worth noticing for the redesign: the amount is the *output* and sits above the
 * input that produces it, so the number moves when you touch something below it.
 * It reads well once you know the rule and is baffling before then, and there is
 * no other cue that the radios are what drives it.
 *
 * Rendering only — the caller owns which hole count is chosen and what CREATE
 * RAINCHECK does with it.
 */

/** One position on the booking. Unnamed ones print their reservation id alone. */
export interface RaincheckPlayer {
    id: string;
    name?: string;
}

export interface RaincheckFormProps {
    reservation: string;
    customerEmail: string;
    roundPrice: number;
    /** 18 or 9. Drives how many radios appear and what each hole is worth. */
    totalHoles: number;
    holesPlayed: number;
    onHolesPlayed?: (holes: number) => void;
    /** Every position on the tee time — a raincheck is cut for one of them. */
    players?: RaincheckPlayer[];
    selectedPlayerId?: string;
    onSelectPlayer?: (id: string) => void;
}

/** The left column's stacked label-over-value pairs, centred as the device has them. */
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <Stack sx={{ alignItems: "center", mb: 3 }}>
        <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{label}</Typography>
        {children}
    </Stack>
);

export const RaincheckForm = ({
    reservation,
    customerEmail,
    roundPrice,
    totalHoles,
    holesPlayed,
    onHolesPlayed,
    players = [],
    selectedPlayerId,
    onSelectPlayer,
}: RaincheckFormProps) => {
    const options = holesPlayedOptions(totalHoles);
    // Ten to a row, as the device wraps them — which puts 0–9 on top and the
    // rest underneath, so the two rows are different lengths.
    const rows = [options.slice(0, 10), options.slice(10)].filter((r) => r.length > 0);

    return (
        <Stack sx={{ height: "100%", bgcolor: appColors.surface, pt: 4, px: 3 }}>
            <Stack direction="row" sx={{ alignItems: "flex-start" }}>
                {/* The round, restated. Read-only. */}
                <Stack sx={{ width: "34%", minWidth: 0 }}>
                    <Field label="Reservation #">
                        <Typography sx={{ fontSize: 17 }}>{reservation}</Typography>
                    </Field>
                    <Field label="Customer">
                        <Typography sx={{ fontSize: 17, wordBreak: "break-all", textAlign: "center" }}>{customerEmail}</Typography>
                    </Field>
                    <Field label="Total Price">
                        <Typography sx={{ fontSize: 17 }}>${roundPrice.toFixed(2)}</Typography>
                        <Typography sx={{ fontSize: 17 }}>{totalHoles} Holes</Typography>
                    </Field>
                </Stack>

                {/* The credit, and the control that sets it. */}
                <Stack sx={{ flex: 1, minWidth: 0, alignItems: "center" }}>
                    <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>Raincheck Total</Typography>
                    <Typography sx={{ fontSize: 30, mb: 3 }}>
                        ${raincheckValue(roundPrice, totalHoles, holesPlayed).toFixed(2)} ({raincheckPercentLabel(totalHoles, holesPlayed)})
                    </Typography>

                    <Typography sx={{ fontSize: 17, mb: 1 }}>Holes Played</Typography>
                    {rows.map((row) => (
                        <Stack key={row[0]} direction="row" sx={{ flexWrap: "wrap", justifyContent: "center" }}>
                            {row.map((n) => (
                                <Stack key={n} direction="row" sx={{ alignItems: "center", mr: 0.5 }}>
                                    <Radio
                                        size="small"
                                        checked={n === holesPlayed}
                                        onChange={() => onHolesPlayed?.(n)}
                                        // The device's radios are unlabelled to
                                        // assistive tech; a name is cheap here.
                                        slotProps={{ input: { "aria-label": `${n} holes played` } }}
                                        sx={{ p: 0.75 }}
                                    />
                                    <Typography sx={{ fontSize: 16 }}>{n}</Typography>
                                </Stack>
                            ))}
                        </Stack>
                    ))}
                </Stack>
            </Stack>

            {/* Which position on the time the credit belongs to. */}
            {players.length > 0 && (
                <Stack direction="row" spacing={1.5} sx={{ mt: 6, pl: "26%" }}>
                    {players.map((p) => {
                        const selected = p.id === selectedPlayerId;
                        return (
                            <ButtonBase
                                key={p.id}
                                onClick={() => onSelectPlayer?.(p.id)}
                                sx={{
                                    flexDirection: "column",
                                    minWidth: 92,
                                    px: 1.5,
                                    py: 1,
                                    borderRadius: 0.5,
                                    // Green is "this is the one", not "this is
                                    // done" — the same green the action bar uses
                                    // for the commit, one tap earlier.
                                    bgcolor: selected ? appColors.greenTee : appColors.navy,
                                    color: "#fff",
                                }}
                            >
                                {p.name && <Typography sx={{ fontSize: 13 }}>{p.name}</Typography>}
                                <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.85)" }}>{p.id}</Typography>
                            </ButtonBase>
                        );
                    })}
                </Stack>
            )}
        </Stack>
    );
};
