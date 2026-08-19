import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import Slider from "@mui/material/Slider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RemoveIcon from "@mui/icons-material/Remove";

import { raincheckPercentLabel, raincheckValue } from "@/data/rainchecks";
import { appColors } from "@/theme/app-replica-tokens";

/**
 * **Concept.** Not the shipping screen — see `screens/tee-sheet/raincheck-form`
 * for that.
 *
 * This is Weston's rework of raincheck issuance, drawn from the Aug 12 and
 * Aug 13 walkthroughs. Built in the *existing* design system rather than the
 * target one, deliberately: his words were "use this as a good breeding ground
 * — a new flow with the old design system". Nothing here is a new token, a new
 * button style or a new colour. Everything here is a different arrangement of
 * the same parts.
 *
 * The shipping screen answers one question — how many holes — and leaves three
 * others implicit. This one asks all four out loud:
 *
 *   1. **Which round** is being refunded. Four positions, listed, one selected.
 *   2. **How much** of it comes back. The holes-played control, unchanged.
 *   3. **Whose account** receives it. The case Weston described: "let's say
 *      you're my buddy and you're visiting — just issue the raincheck to me."
 *   4. **What has already happened** on this reservation. A round that has
 *      already been credited says so, greys out, and cannot be credited twice.
 *
 * The sentence above the commit is the load-bearing part. Weston asked for it
 * almost verbatim — "maybe it's just like a dialogue, like *you are issuing a
 * raincheck to Weston Farnsworth*" — and it is the only element that states the
 * outcome in full rather than leaving the operator to assemble it from three
 * separate controls.
 */

export interface RaincheckFee {
    name: string;
    price: number;
}

/** One position on the reservation, with the fee structure the credit derives from. */
export interface RaincheckPosition {
    /** The reservation id, which is what a raincheck is actually anchored to. */
    id: string;
    name: string;
    holes: number;
    greenFee: RaincheckFee;
    cartFee: RaincheckFee;
    /**
     * Already credited. Present means this round is spent as far as issuing
     * goes — a round cannot be rainchecked twice.
     *
     * `since` is what has happened to that credit *after* it was cut. Issuance
     * and redemption are different screens on different days, and this row is
     * the only place they meet: without it, "already issued" is where the story
     * stops, and nobody at this screen can tell whether the money was ever
     * actually taken.
     */
    issued?: { raincheckId: string; amount: number; at: string; to: string; since?: string };
}

export const positionTotal = (p: RaincheckPosition) => +(p.greenFee.price + p.cartFee.price).toFixed(2);

/** One line of the reservation's raincheck history. */
export interface IssuanceEvent {
    at: string;
    what: string;
}

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

/* --------------------------------------------------------------- positions */

const PositionRow = ({
    position,
    selected,
    onSelect,
}: {
    position: RaincheckPosition;
    selected: boolean;
    onSelect?: () => void;
}) => {
    const done = Boolean(position.issued);
    return (
        <ButtonBase
            onClick={done ? undefined : onSelect}
            disabled={done}
            sx={{
                display: "block",
                width: "100%",
                textAlign: "left",
                px: 2,
                py: 1.5,
                bgcolor: selected ? "#EAF3EC" : appColors.surface,
                // A left edge rather than a fill — the row still has to be
                // readable, and a solid selected state on a row this dense
                // costs more than it says.
                borderLeft: "4px solid",
                borderLeftColor: selected ? appColors.greenTee : "transparent",
                borderBottom: `1px solid ${appColors.divider}`,
                opacity: done ? 0.55 : 1,
            }}
        >
            <Stack direction="row" sx={{ alignItems: "baseline", gap: 1.5 }}>
                <Typography sx={{ fontSize: 20, flex: 1 }}>{position.name}</Typography>
                <Typography sx={{ fontSize: 20 }}>{usd(positionTotal(position))}</Typography>
            </Stack>

            {/* The fee structure, because this is what the credit is computed
                from — "it has the tee fee that you booked, the cart fees, that
                whole structure is built off of that reservation". */}
            <Typography sx={{ fontSize: 14, color: appColors.textSecondary, mt: 0.25 }}>
                {position.holes} holes · {position.greenFee.name} {usd(position.greenFee.price)} · {position.cartFee.name}{" "}
                {usd(position.cartFee.price)} · ID:{position.id}
            </Typography>

            {done ? (
                <Stack sx={{ mt: 0.75, gap: 0.25 }}>
                    <Stack direction="row" sx={{ alignItems: "center", gap: 0.75 }}>
                        <CheckCircleIcon sx={{ fontSize: 18, color: appColors.greenTee }} />
                        <Typography sx={{ fontSize: 14, color: appColors.greenTee }}>
                            Raincheck {position.issued!.raincheckId} · {usd(position.issued!.amount)} to {position.issued!.to} ·{" "}
                            {position.issued!.at}
                        </Typography>
                    </Stack>
                    {position.issued!.since && (
                        <Typography sx={{ fontSize: 13, color: appColors.textSecondary, pl: 3.25 }}>{position.issued!.since}</Typography>
                    )}
                </Stack>
            ) : (
                <Typography sx={{ fontSize: 14, color: appColors.textSecondary, mt: 0.75 }}>No raincheck issued</Typography>
            )}
        </ButtonBase>
    );
};

/* -------------------------------------------------------------- recipients */

const RecipientChip = ({ label, selected, onClick }: { label: string; selected: boolean; onClick?: () => void }) => (
    <ButtonBase
        onClick={onClick}
        sx={{
            px: 2,
            py: 1,
            borderRadius: 0.5,
            border: "1px solid",
            borderColor: selected ? appColors.greenTee : appColors.divider,
            bgcolor: selected ? appColors.greenTee : appColors.surface,
            color: selected ? "#fff" : appColors.textPrimary,
            fontSize: 15,
        }}
    >
        {label}
    </ButtonBase>
);

/* ----------------------------------------------------------- holes played */

/**
 * Holes played, as a stepper over a slider.
 *
 * The shipping screen offers eighteen radio buttons in two ragged rows. They
 * work, and they are wrong for this: the value is ordinal, the operator almost
 * always wants a number near one they can already see, and eighteen 32px targets
 * on glass is a lot of small things to hit correctly when the number sets a
 * refund amount.
 *
 * So: a slider for the coarse move and a pair of 48dp keys for the fine one.
 * The number is stated once, large, between them — it is the thing being set,
 * and on the radio version it was never written down anywhere as a figure.
 *
 * The scale stops one short of a full round, as the radios did: `max` is
 * `holes − 1`, because a completed round has nothing to give back. The end
 * labels say so rather than leaving it to be discovered.
 */
const HolesPlayed = ({ max, value, onChange }: { max: number; value: number; onChange?: (holes: number) => void }) => {
    const clamp = (n: number) => Math.max(0, Math.min(max, n));
    return (
        <>
            <Stack direction="row" sx={{ alignItems: "center", gap: 2 }}>
                <IconButton
                    aria-label="One fewer hole played"
                    disabled={value <= 0}
                    onClick={() => onChange?.(clamp(value - 1))}
                    sx={{ width: 48, height: 48, border: `1px solid ${appColors.divider}`, borderRadius: 1 }}
                >
                    <RemoveIcon />
                </IconButton>

                <Stack sx={{ flex: 1, alignItems: "center" }}>
                    <Typography sx={{ fontSize: 34, lineHeight: 1.1 }}>{value}</Typography>
                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>
                        {value === 1 ? "hole played" : "holes played"}
                    </Typography>
                </Stack>

                <IconButton
                    aria-label="One more hole played"
                    disabled={value >= max}
                    onClick={() => onChange?.(clamp(value + 1))}
                    sx={{ width: 48, height: 48, border: `1px solid ${appColors.divider}`, borderRadius: 1 }}
                >
                    <AddIcon />
                </IconButton>
            </Stack>

            <Box sx={{ px: 1, mt: 1 }}>
                <Slider
                    value={value}
                    min={0}
                    max={max}
                    step={1}
                    marks
                    onChange={(_, v) => onChange?.(clamp(Array.isArray(v) ? v[0] : v))}
                    valueLabelDisplay="auto"
                    aria-label="Holes played"
                    sx={{
                        color: appColors.greenTee,
                        // Fatter than the default — this is a landscape tablet
                        // being used standing up, and the value it sets is money.
                        height: 8,
                        "& .MuiSlider-thumb": { width: 28, height: 28 },
                        "& .MuiSlider-mark": { height: 8, opacity: 0.4 },
                    }}
                />
                <Stack direction="row" sx={{ justifyContent: "space-between", mt: -0.5 }}>
                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>0 — never teed off</Typography>
                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{max} — all but the last</Typography>
                </Stack>
            </Box>
        </>
    );
};

/* ------------------------------------------------------------------ screen */

export interface ReservationRaincheckProps {
    /** Course, date, tee time and confirmation — the reservation's own identity. */
    heading: string;
    positions: RaincheckPosition[];
    /** Which round is being refunded. Defaults to the player whose button was tapped. */
    selectedId: string;
    onSelect?: (id: string) => void;
    holesPlayed: number;
    onHolesPlayed?: (holes: number) => void;
    /** Whose account receives the credit. Starts equal to the selected round's player. */
    recipientId: string;
    onRecipient?: (id: string) => void;
    /** Everything that has already happened to this reservation. */
    log?: IssuanceEvent[];
}

export const ReservationRaincheck = ({
    heading,
    positions,
    selectedId,
    onSelect,
    holesPlayed,
    onHolesPlayed,
    recipientId,
    onRecipient,
    log = [],
}: ReservationRaincheckProps) => {
    const selected = positions.find((p) => p.id === selectedId) ?? positions[0];
    const recipient = positions.find((p) => p.id === recipientId) ?? selected;
    const price = positionTotal(selected);
    const credit = raincheckValue(price, selected.holes, holesPlayed);
    // One short of the round: a completed round has nothing to give back.
    const maxHoles = Math.max(0, selected.holes - 1);
    const onBehalf = recipient.id !== selected.id;

    return (
        <Stack sx={{ height: "100%", bgcolor: appColors.canvas, overflowY: "auto" }}>
            {/* Says what the screen is for. The shipping version is titled just
                "Raincheck", which names the object and not the operation. */}
            <Box sx={{ bgcolor: appColors.surface, px: 3, py: 2, borderBottom: `1px solid ${appColors.divider}` }}>
                <Typography sx={{ fontSize: 22 }}>Issue a raincheck for this reservation</Typography>
                <Typography sx={{ fontSize: 14, color: appColors.textSecondary, mt: 0.25 }}>{heading}</Typography>
            </Box>

            <Stack direction="row" sx={{ flex: 1, minHeight: 0, gap: 2, p: 2, alignItems: "flex-start" }}>
                {/* 1 — which round. */}
                <Stack sx={{ width: "52%", minWidth: 0 }}>
                    <Typography sx={{ fontSize: 15, color: appColors.textSecondary, mb: 0.75 }}>Which round are you refunding?</Typography>
                    <Box sx={{ border: `1px solid ${appColors.divider}`, bgcolor: appColors.surface }}>
                        {positions.map((p) => (
                            <PositionRow key={p.id} position={p} selected={p.id === selected.id} onSelect={() => onSelect?.(p.id)} />
                        ))}
                    </Box>

                    {log.length > 0 && (
                        <>
                            <Typography sx={{ fontSize: 15, color: appColors.textSecondary, mt: 2.5, mb: 0.75 }}>
                                Raincheck history for this reservation
                            </Typography>
                            <Box sx={{ border: `1px solid ${appColors.divider}`, bgcolor: appColors.surface, px: 2, py: 1 }}>
                                {log.map((e) => (
                                    <Stack key={`${e.at}-${e.what}`} direction="row" sx={{ gap: 2, py: 0.6 }}>
                                        <Typography sx={{ fontSize: 14, color: appColors.textSecondary, minWidth: 150 }}>{e.at}</Typography>
                                        <Typography sx={{ fontSize: 14 }}>{e.what}</Typography>
                                    </Stack>
                                ))}
                            </Box>
                        </>
                    )}
                </Stack>

                {/* 2 — how much, and 3 — to whom. */}
                <Stack sx={{ flex: 1, minWidth: 0, gap: 2 }}>
                    <Box sx={{ bgcolor: appColors.surface, border: `1px solid ${appColors.divider}`, p: 2 }}>
                        <Typography sx={{ fontSize: 15, color: appColors.textSecondary, mb: 1 }}>How many holes did they play?</Typography>
                        <HolesPlayed max={maxHoles} value={holesPlayed} onChange={onHolesPlayed} />

                        {/* Below the control that produces it, not above — the one
                            layout change that needs no explanation. */}
                        <Stack direction="row" sx={{ alignItems: "baseline", gap: 1.5, mt: 2, pt: 1.5, borderTop: `1px solid ${appColors.divider}` }}>
                            <Typography sx={{ fontSize: 15, color: appColors.textSecondary, flex: 1 }}>
                                {selected.holes - holesPlayed} of {selected.holes} holes unplayed, on {usd(price)}
                            </Typography>
                            <Typography sx={{ fontSize: 30, color: appColors.greenTee }}>{usd(credit)}</Typography>
                            <Typography sx={{ fontSize: 18, color: appColors.textSecondary }}>
                                ({raincheckPercentLabel(selected.holes, holesPlayed)})
                            </Typography>
                        </Stack>
                    </Box>

                    <Box sx={{ bgcolor: appColors.surface, border: `1px solid ${appColors.divider}`, p: 2 }}>
                        <Typography sx={{ fontSize: 15, color: appColors.textSecondary, mb: 1 }}>Whose account should hold it?</Typography>
                        <Stack direction="row" sx={{ flexWrap: "wrap", gap: 1 }}>
                            {positions.map((p) => (
                                <RecipientChip key={p.id} label={p.name} selected={p.id === recipient.id} onClick={() => onRecipient?.(p.id)} />
                            ))}
                        </Stack>
                        {onBehalf && (
                            <Typography sx={{ fontSize: 14, color: appColors.textSecondary, mt: 1.25 }}>
                                {selected.name} is not keeping this credit — it goes on {recipient.name}&rsquo;s account.
                            </Typography>
                        )}
                    </Box>

                    {/* The sentence Weston asked for, near enough verbatim. */}
                    <Box sx={{ bgcolor: appColors.navy, color: "#fff", p: 2, display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                        <BoltIcon sx={{ fontSize: 22, mt: 0.25 }} />
                        <Typography sx={{ fontSize: 18, lineHeight: 1.45 }}>
                            You are issuing a <strong>{usd(credit)}</strong> raincheck to <strong>{recipient.name}</strong>
                            {onBehalf ? (
                                <>
                                    {" "}
                                    for <strong>{selected.name}</strong>&rsquo;s round.
                                </>
                            ) : (
                                <> for their own round.</>
                            )}
                        </Typography>
                    </Box>
                </Stack>
            </Stack>
        </Stack>
    );
};

/* ---------------------------------------------------------------- fixtures */

/** A foursome, one round already credited. The case Weston asked to see. */
export const foursome: RaincheckPosition[] = [
    {
        id: "10314910",
        name: "Weston Farnsworth",
        holes: 18,
        greenFee: { name: "Dunes Rack Prime", price: 73.18 },
        cartFee: { name: "Dunes Cart", price: 26.82 },
    },
    {
        id: "10314911",
        name: "Justin Girard",
        holes: 18,
        greenFee: { name: "Dunes Rack Prime", price: 73.18 },
        cartFee: { name: "Dunes Cart", price: 26.82 },
        issued: {
            raincheckId: "51380",
            amount: 72.22,
            at: "2:30 PM",
            to: "Justin Girard",
            since: "Spent in full — $72.22 on 8/2/2026, order #5734120",
        },
    },
    {
        id: "10314912",
        name: "Oda Brennevin",
        holes: 18,
        greenFee: { name: "Birdie (25%)", price: 46.5 },
        cartFee: { name: "Dunes Walking", price: 8.58 },
    },
    {
        id: "10314913",
        name: "Tom Watson",
        holes: 9,
        greenFee: { name: "Senior Weekday", price: 17.0 },
        cartFee: { name: "Dunes Cart", price: 13.41 },
    },
];

export const foursomeHeading = "The Dunes of Delgado PROD — North Course — Monday, July 20 2026 7:00 PM — 9024770 — FRONT";

export const foursomeLog: IssuanceEvent[] = [
    { at: "7/20/2026 2:30 PM", what: "Justin Girard was issued raincheck 51380 for $72.22 — by John Admin" },
];
