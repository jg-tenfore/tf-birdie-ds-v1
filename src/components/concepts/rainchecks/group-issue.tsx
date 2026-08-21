import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RemoveIcon from "@mui/icons-material/Remove";
import SouthEastIcon from "@mui/icons-material/SouthEast";

import { raincheckPercentLabel, raincheckValue } from "@/data/rainchecks";
import { appColors } from "@/theme/app-replica-tokens";
import { positionTotal, type RaincheckPosition } from "./reservation-raincheck";

/**
 * **Concept — Aug 20.** Shared parts for issuing a whole group at once.
 *
 * Both Aug 20 options are answers to the same complaint:
 *
 * > *"It would be nice to set up all the rainchecks on one screen. So you would
 * > not need to click through that flow four separate times for a foursome."*
 *
 * Which is the thing the earlier concept did not fix. **Weston's ideas → 2 —
 * Create raincheck** made one issuance clear — which round, how much, whose
 * account, what already happened — and then made you do it four times. It even
 * advertises the repetition: after each credit it hops selection to the next
 * player still owed one. That is the loop being complained about, drawn as a
 * feature.
 *
 * The event these screens exist for is a single event. It rains, the horn goes,
 * a foursome walks off the ninth together and arrives at the counter as a group.
 * The flow treats that as four separate transactions because a raincheck is
 * cut per round, which is true of the *record* and untrue of the *task*.
 *
 * Three requirements came with the note, and both options meet all three:
 *
 * 1. **Everyone on one screen.** One list, one commit.
 * 2. **Deselect.** *"You would need to be able to deselect the ones you do not
 *    want to issue a raincheck for"* — the twosome that finished, the player who
 *    took a refund instead.
 * 3. **Reassign per player.** *"Name of the player on the left, and on the right
 *    of each player a drop down to assign it to someone else."* Taken literally;
 *    it is the right shape.
 *
 * Where they differ is the hole count — see the two option files.
 */

export const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

/* ------------------------------------------------------------------- model */

/**
 * One player's line in the batch, before anything is committed.
 *
 * The list is a draft of four rainchecks rather than four sequential
 * transactions, so every question the single-issue screen asks becomes a column
 * instead of a step.
 */
export interface GroupDraft {
    positionId: string;
    /** Unticked rows issue nothing. Requirement 2. */
    include: boolean;
    holesPlayed: number;
    /** Whose account holds it. Defaults to the player. Requirement 3. */
    recipientId: string;
    /**
     * Option B only: this row has been taken off the group's hole count and set
     * by hand. Stored rather than derived, because a row that merely *clamps* to
     * a shorter round is not the same as a row somebody deliberately changed,
     * and the screen has to say which.
     */
    custom?: boolean;
}

/** A round that has already been credited cannot be credited again, so it starts out. */
export const makeDrafts = (positions: RaincheckPosition[], holesPlayed: number): GroupDraft[] =>
    positions.map((p) => ({
        positionId: p.id,
        include: !p.issued,
        holesPlayed: clampHoles(p, holesPlayed),
        recipientId: p.id,
    }));

/**
 * A round stops one hole short of complete — a finished round has nothing to
 * give back. Nine-hole rounds in an eighteen-hole group clamp here, which is the
 * whole reason this helper exists rather than being inlined.
 */
export const clampHoles = (position: RaincheckPosition, holes: number) => Math.max(0, Math.min(position.holes - 1, holes));

export const draftValue = (position: RaincheckPosition, draft: GroupDraft) =>
    raincheckValue(positionTotal(position), position.holes, clampHoles(position, draft.holesPlayed));

export const draftPercent = (position: RaincheckPosition, draft: GroupDraft) =>
    raincheckPercentLabel(position.holes, clampHoles(position, draft.holesPlayed));

export interface GroupTotals {
    count: number;
    amount: number;
    /** Credits going to an account other than the player's own. */
    reassigned: number;
}

export const groupTotals = (positions: RaincheckPosition[], drafts: GroupDraft[]): GroupTotals => {
    const live = drafts.filter((d) => d.include && !positions.find((p) => p.id === d.positionId)?.issued);
    return {
        count: live.length,
        amount: +live
            .reduce((sum, d) => {
                const p = positions.find((x) => x.id === d.positionId);
                return p ? sum + draftValue(p, d) : sum;
            }, 0)
            .toFixed(2),
        reassigned: live.filter((d) => d.recipientId !== d.positionId).length,
    };
};

/* -------------------------------------------------------------- primitives */

/**
 * The dropdown from the note, on the right of each player.
 *
 * Options are the other people on the reservation and nobody else. That is a
 * guess worth arguing about — the guest case Weston described earlier ("you're
 * my buddy visiting, just issue it to me") is always inside the group, but a
 * league organiser collecting four credits under one account may not be. There
 * is no "search for another customer" entry here on purpose, so the omission
 * gets noticed rather than assumed.
 *
 * A row whose credit is going somewhere else tints, so an operator can scan four
 * rows and see the exception without reading four names.
 */
export const RecipientSelect = ({
    positions,
    value,
    owner,
    disabled,
    onChange,
}: {
    positions: RaincheckPosition[];
    value: string;
    /** The player whose round this is — used to tell "default" from "reassigned". */
    owner: string;
    disabled?: boolean;
    onChange?: (id: string) => void;
}) => {
    const moved = value !== owner;
    return (
        <Select
            value={value}
            disabled={disabled}
            onChange={(e) => onChange?.(String(e.target.value))}
            aria-label="Issue this raincheck to"
            // Closed, it shows the name and nothing else. The "(themselves)"
            // marker belongs in the open list, where it is the thing being
            // chosen between — on the row it is the longest string in the
            // narrowest column, and the amber tint already says it.
            renderValue={(id) => positions.find((p) => p.id === id)?.name ?? ""}
            sx={{
                // Fills its column rather than sizing to content. `minWidth`
                // let a long name push the control past the column and off the
                // right edge of the tablet, which is not width a 1280 screen has
                // spare.
                width: "100%",
                minWidth: 0,
                // 48dp touch floor, standing up, on glass.
                "& .MuiSelect-select": {
                    py: 1.25,
                    fontSize: 15,
                    minHeight: "48px !important",
                    display: "flex",
                    alignItems: "center",
                    // A name too long for the column truncates. The full one is a
                    // tap away in the list, and a wrapping control would drag the
                    // rows underneath it out of alignment.
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                },
                bgcolor: moved ? "#FFF4E6" : appColors.surface,
                "& .MuiOutlinedInput-notchedOutline": { borderColor: moved ? appColors.orange : appColors.divider },
                borderRadius: 0.5,
            }}
        >
            {positions.map((p) => (
                <MenuItem key={p.id} value={p.id} sx={{ fontSize: 15, minHeight: 48 }}>
                    {p.id === owner ? `${p.name} (themselves)` : p.name}
                </MenuItem>
            ))}
        </Select>
    );
};

/**
 * Holes played, compact.
 *
 * The slider from the single-issue concept does not survive being repeated four
 * times down a page — four sliders is four different money amounts set by four
 * imprecise drags. Stepper only here: the number is stated large, and the keys
 * stay at 48dp.
 */
export const HoleStepper = ({
    value,
    max,
    disabled,
    label,
    onChange,
}: {
    value: number;
    max: number;
    disabled?: boolean;
    label: string;
    onChange?: (holes: number) => void;
}) => {
    const clamp = (n: number) => Math.max(0, Math.min(max, n));
    return (
        <Stack direction="row" sx={{ alignItems: "center", gap: 0.5, opacity: disabled ? 0.4 : 1 }}>
            <IconButton
                aria-label={`One fewer hole for ${label}`}
                disabled={disabled || value <= 0}
                onClick={() => onChange?.(clamp(value - 1))}
                sx={{ width: 48, height: 48, border: `1px solid ${appColors.divider}`, borderRadius: 1 }}
            >
                <RemoveIcon />
            </IconButton>
            <Typography sx={{ fontSize: 22, width: 40, textAlign: "center" }}>{value}</Typography>
            <IconButton
                aria-label={`One more hole for ${label}`}
                disabled={disabled || value >= max}
                onClick={() => onChange?.(clamp(value + 1))}
                sx={{ width: 48, height: 48, border: `1px solid ${appColors.divider}`, borderRadius: 1 }}
            >
                <AddIcon />
            </IconButton>
        </Stack>
    );
};

/** The include/exclude tick. Requirement 2, and the reason this is a list rather than a queue. */
export const IncludeBox = ({
    checked,
    disabled,
    label,
    onChange,
}: {
    checked: boolean;
    disabled?: boolean;
    label: string;
    onChange?: (next: boolean) => void;
}) => (
    <Checkbox
        checked={checked}
        disabled={disabled}
        onChange={(_, next) => onChange?.(next)}
        slotProps={{ input: { "aria-label": `Issue a raincheck to ${label}` } }}
        sx={{ p: 1.5, color: appColors.textSecondary, "&.Mui-checked": { color: appColors.greenTee } }}
    />
);

/** The player's name and the fee structure the credit is computed from. */
export const PlayerCell = ({ position }: { position: RaincheckPosition }) => (
    <Stack sx={{ minWidth: 0 }}>
        <Typography sx={{ fontSize: 19, lineHeight: 1.3 }}>{position.name}</Typography>
        <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>
            {position.holes} holes · {usd(positionTotal(position))} · {position.greenFee.name} {usd(position.greenFee.price)} ·{" "}
            {position.cartFee.name} {usd(position.cartFee.price)}
        </Typography>
    </Stack>
);

/** What an already-credited round says instead of controls. */
export const AlreadyIssued = ({ position }: { position: RaincheckPosition }) => (
    <Stack direction="row" sx={{ alignItems: "center", gap: 0.75 }}>
        <CheckCircleIcon sx={{ fontSize: 18, color: appColors.greenTee }} />
        <Typography sx={{ fontSize: 14, color: appColors.greenTee }}>
            Already issued — {position.issued!.raincheckId} · {usd(position.issued!.amount)} to {position.issued!.to}
        </Typography>
    </Stack>
);

/**
 * The sentence, made plural.
 *
 * The single-issue concept ends on one line stating the whole outcome, which
 * Weston asked for nearly verbatim. A batch cannot fit four outcomes in a
 * sentence, so this states the shape — how many, how much, and how many are
 * going somewhere unusual — and leaves the detail on the rows above it, where it
 * is still on screen.
 */
export const ReviewBand = ({ totals }: { totals: GroupTotals }) => {
    if (totals.count === 0) {
        return (
            <Box sx={{ bgcolor: appColors.slate, color: "#fff", px: 3, py: 1.75 }}>
                <Typography sx={{ fontSize: 17 }}>Nothing selected — no rainchecks will be issued.</Typography>
            </Box>
        );
    }
    return (
        <Stack direction="row" sx={{ bgcolor: appColors.navy, color: "#fff", px: 3, py: 1.75, gap: 1.5, alignItems: "center" }}>
            <BoltIcon sx={{ fontSize: 22 }} />
            <Typography sx={{ fontSize: 18, lineHeight: 1.4, flex: 1 }}>
                You are issuing <strong>{totals.count}</strong> {totals.count === 1 ? "raincheck" : "rainchecks"} worth{" "}
                <strong>{usd(totals.amount)}</strong> in total.
            </Typography>
            {totals.reassigned > 0 && (
                <Stack direction="row" sx={{ alignItems: "center", gap: 0.75 }}>
                    <SouthEastIcon sx={{ fontSize: 18, color: appColors.orange }} />
                    <Typography sx={{ fontSize: 15, color: appColors.orange }}>
                        {totals.reassigned} going to a different account
                    </Typography>
                </Stack>
            )}
        </Stack>
    );
};

/** Column headings, so the dropdown on the right is labelled once instead of never. */
export const HeaderRow = ({ columns }: { columns: { label: string; width?: number | string; align?: "left" | "right" | "center" }[] }) => (
    <Stack
        direction="row"
        sx={{ px: 2, py: 1, bgcolor: appColors.canvasAlt, borderBottom: `1px solid ${appColors.divider}`, alignItems: "center", gap: 2 }}
    >
        {columns.map((c) => (
            <Typography
                key={c.label}
                sx={{
                    fontSize: 13,
                    letterSpacing: "0.04em",
                    color: appColors.textSecondary,
                    textTransform: "uppercase",
                    width: c.width,
                    flex: c.width ? undefined : 1,
                    textAlign: c.align ?? "left",
                }}
            >
                {c.label}
            </Typography>
        ))}
    </Stack>
);

/* ---------------------------------------------------------------- fixtures */

/**
 * The plain case: a foursome walks off together, nothing issued yet.
 *
 * Two full-rate rounds, one discounted, one senior nine — a real group is not
 * four identical prices, and a batch screen that only looks right when they are
 * identical is not finished.
 */
export const rainedOutFoursome: RaincheckPosition[] = [
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
        holes: 18,
        greenFee: { name: "Senior Weekday", price: 17.0 },
        cartFee: { name: "Dunes Cart", price: 13.41 },
    },
];

export const rainedOutHeading = "The Dunes of Delgado PROD — North Course — Monday, July 20 2026 7:00 PM — 9024770 — FRONT";

/** The same group, except Tom booked the nine. The case a single group-wide hole count has to survive. */
export const mixedHoleFoursome: RaincheckPosition[] = rainedOutFoursome.map((p) =>
    p.id === "10314913" ? { ...p, holes: 9 } : p,
);

/** One round already credited earlier in the day, and spent since. */
export const partlyDoneFoursome: RaincheckPosition[] = rainedOutFoursome.map((p) =>
    p.id === "10314911"
        ? {
              ...p,
              issued: {
                  raincheckId: "51380",
                  amount: 72.22,
                  at: "2:30 PM",
                  to: "Justin Girard",
                  since: "Spent in full — $72.22 on 8/2/2026, order #5734120",
                  spent: 72.22,
              },
          }
        : p,
);

/** Most bookings are not foursomes. */
export const twosome: RaincheckPosition[] = rainedOutFoursome.slice(0, 2);
