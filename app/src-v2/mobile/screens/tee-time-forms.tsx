import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckIcon from "@mui/icons-material/Check";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import { useNavigate, useParams } from "react-router-dom";

import { cartSignOut } from "@/components/screens/tee-sheet/tee-sheet-data";
import { MobileEmpty, MobileSectionHeading } from "@/components/mobile/mobile-parts";
import { MobileActionArea, MobilePrimary, MobileSecondary, MobileSecondaryRow } from "@/components/mobile/mobile-shell";
import { holesPlayedOptions, raincheckPercentLabel, raincheckValue } from "@/data/rainchecks";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { money, slashDate, useActions, useStore, type Position } from "../../store";
import { GREEN_FEES, TRANSPORT_FEES, feeLabel, nameOf } from "../../screens/tee-time-edit";
import { MobileShell } from "../mobile-shell";

/**
 * The three screens a reservation pushes onto: **Edit fees**, **Cart sign out**
 * and **Create raincheck**. All three write to the store.
 *
 * On the terminal these are `app/src/screens/tee-time-edit.tsx` and
 * `create-raincheck.tsx`, each of which wraps a Storybook body in the landscape
 * `Shell` and a five-button action bar. The bodies do not narrow, so the phone
 * rebuilds them from the mobile primitives — but the **pricing tables, the
 * waiver text and the raincheck maths are imported, not retyped**, so the two
 * devices cannot drift on what a round costs or what a credit is worth.
 *
 * ## What changed, per screen
 *
 * **Edit fees.** Two fee groups side by side on tablet, each ~200px wide with
 * its own subtotal. Side by side is impossible here, so they stack — and because
 * they stack, each group's subtotal now sits directly under the options that
 * produce it, which is arguably clearer than the original. `SAVE FEES TO ALL`
 * stays a separate button rather than folding into `SAVE`: it rewrites every
 * player on the time, and that is a different act.
 *
 * **Cart sign out.** The one screen the phone arguably improves. The waiver is
 * 60 words that the tablet sets beside a signature box; here it gets the full
 * width above one. Both gates the landscape screen enforces are kept — a cart
 * number *and* the tick — because the device itself lets a cart leave with
 * neither, which is how a cart leaves with nobody's name against it.
 *
 * **Create raincheck.** The tablet lays out **eighteen hole radios in two ragged
 * rows**. Eighteen ~32px targets do not survive 402px, and this number sets a
 * refund amount, so it becomes a stepper with the credit recomputing above it —
 * the money always visible beside the number that produces it. The player chips
 * at the foot stay: two golfers on one time can have paid different rates, so
 * switching who is being refunded has to change the amount.
 */

/* -------------------------------------------------------------- shared bits */

/** Reads the time and position index out of the URL, and finds the booking. */
const usePosition = () => {
    const { time = "", index = "0" } = useParams();
    const decoded = decodeURIComponent(time);
    const slot = Number(index);
    const { teeTimes } = useStore();
    const booking = teeTimes.find((t) => t.time === decoded) ?? null;
    return { decoded, slot, booking, position: booking?.positions[slot] ?? null };
};

/** The screen shown when the booking went away while you were on this screen. */
const GoneScreen = ({ title, onBack }: { title: string; onBack: () => void }) => (
    <MobileShell title={title} active="teesheet" leading="close" onLeading={onBack} showOverflow={false}>
        <MobileEmpty message="That position is no longer booked." />
        <Box sx={{ p: 1.5 }}>
            <MobilePrimary onClick={onBack}>Back to the tee time</MobilePrimary>
        </Box>
    </MobileShell>
);

/** A fee option. Selected is filled navy, exactly as the tablet draws it. */
const FeeRow = ({ label, amount, selected, onClick }: { label: string; amount: number; selected: boolean; onClick: () => void }) => (
    <ButtonBase
        onClick={onClick}
        sx={{
            display: "flex",
            width: "100%",
            justifyContent: "space-between",
            px: 1.5,
            minHeight: 48,
            bgcolor: selected ? appColors.navy : appColors.surface,
            color: selected ? "#fff" : appColors.textPrimary,
            borderBottom: `1px solid ${appColors.divider}`,
        }}
    >
        <Typography sx={{ fontSize: 15 }}>{label}</Typography>
        <Typography sx={{ fontSize: 15 }}>{money(amount)}</Typography>
    </ButtonBase>
);

/** A group's SubTotal / Grand Total pair, sitting under the options it comes from. */
const FeeTotals = ({ subTotal, grandTotal }: { subTotal: number; grandTotal: number }) => (
    <Stack sx={{ px: 1.5, py: 1, gap: 0.25, bgcolor: appColors.canvas }}>
        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>SubTotal</Typography>
            <Typography sx={{ fontSize: 13 }}>{money(subTotal)}</Typography>
        </Stack>
        <Stack direction="row" sx={{ justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: 14 }}>Grand Total</Typography>
            <Typography sx={{ fontSize: 14 }}>{money(grandTotal)}</Typography>
        </Stack>
    </Stack>
);

/* ------------------------------------------------------------------- edit */

export const MobileTeeTimeEditScreen = () => {
    const navigate = useNavigate();
    const { state, teeTimes } = useStore();
    const { editPositionFees } = useActions();
    const { decoded, slot, position } = usePosition();

    const [green, setGreen] = useState(() => nameOf(position?.rateName) || "Birdie (25%)");
    const [transport, setTransport] = useState(() => nameOf(position?.cartLabel) || "Dunes Cart");
    const [eighteen, setEighteen] = useState(position?.holes !== 9);

    const back = () => navigate(`/teesheet/${encodeURIComponent(decoded)}`);
    if (!position) return <GoneScreen title="Edit Reservation" onBack={back} />;

    // Nine holes halves the green fee but not the cart — the cart goes out
    // either way, which is why the two totals stay apart on this screen.
    const greenAmount = +((GREEN_FEES[green] ?? 0) / (eighteen ? 1 : 2)).toFixed(2);
    const transportAmount = TRANSPORT_FEES[transport] ?? 0;

    const save = (toAll: boolean) => {
        const rateName = feeLabel(green, greenAmount);
        const cartLabel = feeLabel(transport, transportAmount);
        const price = +(greenAmount + transportAmount).toFixed(2);
        const targets = toAll
            ? (teeTimes
                  .find((t) => t.time === decoded)
                  ?.positions.map((p, i) => (p ? i : null))
                  .filter((i): i is number => i !== null) ?? [])
            : [slot];
        for (const i of targets) editPositionFees(decoded, i, rateName, cartLabel, price);
        back();
    };

    return (
        <MobileShell
            title="Edit Reservation"
            subtitle={position.name}
            active="teesheet"
            leading="close"
            onLeading={back}
            showOverflow={false}
            actions={
                <MobileActionArea>
                    <MobileSecondaryRow>
                        <MobileSecondary onClick={() => save(true)}>Save Fees To All</MobileSecondary>
                    </MobileSecondaryRow>
                    <MobilePrimary icon={<CheckIcon sx={{ fontSize: 20 }} />} onClick={() => save(false)}>
                        Save · {money(+(greenAmount + transportAmount).toFixed(2))}
                    </MobilePrimary>
                </MobileActionArea>
            }
        >
            <Stack sx={{ px: 1.5, py: 1.25, bgcolor: appColors.surface, borderBottom: `1px solid ${appColors.divider}` }}>
                <Typography sx={{ fontSize: 16 }}>{position.name}</Typography>
                <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>
                    {slashDate(state.sheetDate)} {decoded} · {state.course}
                </Typography>
                <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>{position.email ?? "—"}</Typography>
            </Stack>

            {/* The tablet's holes control is a labelled switch. Two 50% targets
                read faster at this width and cannot be half-thrown. */}
            <MobileSectionHeading>Holes</MobileSectionHeading>
            <Stack direction="row" sx={{ gap: 1, px: 1.5, pb: 0.5 }}>
                {([18, 9] as const).map((n) => (
                    <ButtonBase
                        key={n}
                        onClick={() => setEighteen(n === 18)}
                        sx={{
                            flex: 1,
                            minHeight: 48,
                            borderRadius: `${appRadius.button}px`,
                            bgcolor: (n === 18) === eighteen ? appColors.navy : appColors.surface,
                            color: (n === 18) === eighteen ? "#fff" : appColors.textPrimary,
                            border: `1px solid ${appColors.divider}`,
                            fontSize: 15,
                        }}
                    >
                        {n} holes
                    </ButtonBase>
                ))}
            </Stack>

            <MobileSectionHeading>Green Fees</MobileSectionHeading>
            {Object.keys(GREEN_FEES).map((name) => (
                <FeeRow
                    key={name}
                    label={name}
                    amount={+((GREEN_FEES[name] ?? 0) / (eighteen ? 1 : 2)).toFixed(2)}
                    selected={name === green}
                    onClick={() => setGreen(name)}
                />
            ))}
            <FeeTotals subTotal={+(greenAmount * 0.94).toFixed(2)} grandTotal={greenAmount} />

            <MobileSectionHeading>Transportation</MobileSectionHeading>
            {Object.keys(TRANSPORT_FEES).map((name) => (
                <FeeRow
                    key={name}
                    label={name}
                    amount={TRANSPORT_FEES[name] ?? 0}
                    selected={name === transport}
                    onClick={() => setTransport(name)}
                />
            ))}
            <FeeTotals subTotal={+(transportAmount * 0.883).toFixed(2)} grandTotal={transportAmount} />

            <Box sx={{ height: 8 }} />
        </MobileShell>
    );
};

/* --------------------------------------------------------- cart sign out */

export const MobileCartSignOutScreen = () => {
    const navigate = useNavigate();
    const { signOutCart } = useActions();
    const { decoded, slot, position } = usePosition();

    const [cartNumber, setCartNumber] = useState("");
    const [consented, setConsented] = useState(false);

    const back = () => navigate(`/teesheet/${encodeURIComponent(decoded)}`);
    if (!position) return <GoneScreen title="Cart Sign Out" onBack={back} />;

    const ready = cartNumber.trim().length > 0 && consented;

    return (
        <MobileShell
            title="Cart Sign Out"
            subtitle={`Reservation #${position.id}`}
            active="teesheet"
            leading="close"
            onLeading={back}
            showOverflow={false}
            actions={
                <MobileActionArea>
                    <MobilePrimary
                        disabled={!ready}
                        icon={<CheckIcon sx={{ fontSize: 20 }} />}
                        onClick={() => {
                            if (!ready) return;
                            signOutCart(decoded, slot);
                            back();
                        }}
                    >
                        {ready ? `Sign out cart ${cartNumber.trim()}` : "Cart number and consent required"}
                    </MobilePrimary>
                </MobileActionArea>
            }
        >
            <Stack sx={{ px: 1.5, py: 1.5, gap: 2 }}>
                <Box>
                    <Typography sx={{ fontSize: 12, color: appColors.textSecondary }}>Customer</Typography>
                    <Typography sx={{ fontSize: 20 }}>{position.name}</Typography>
                </Box>

                <Box sx={{ borderBottom: `1px solid ${appColors.textSecondary}` }}>
                    <Typography sx={{ fontSize: 12, color: appColors.textSecondary }}>Cart Number</Typography>
                    {/* `inputMode="numeric"` rather than `type="number"` — the
                        phone keyboard is the whole point, and spinners are not. */}
                    <Box
                        component="input"
                        value={cartNumber}
                        inputMode="numeric"
                        placeholder="—"
                        aria-label="Cart number"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCartNumber(e.target.value)}
                        sx={{
                            width: "100%",
                            minHeight: 44,
                            border: "none",
                            outline: "none",
                            bgcolor: "transparent",
                            fontSize: 20,
                            fontFamily: "inherit",
                            color: appColors.textPrimary,
                        }}
                    />
                </Box>

                <ButtonBase
                    onClick={() => setConsented((c) => !c)}
                    sx={{ display: "flex", alignItems: "flex-start", textAlign: "left", gap: 1.25, py: 0.5 }}
                >
                    <Box
                        sx={{
                            width: 20,
                            height: 20,
                            mt: 0.25,
                            flexShrink: 0,
                            border: `2px solid ${consented ? appColors.green : appColors.textSecondary}`,
                            bgcolor: consented ? appColors.green : "transparent",
                            borderRadius: 0.5,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {consented && <CheckIcon sx={{ fontSize: 14, color: "#fff" }} />}
                    </Box>
                    <Typography sx={{ fontSize: 13, lineHeight: 1.5 }}>{cartSignOut.consent}</Typography>
                </ButtonBase>

                <Box sx={{ height: 96, border: `1px dashed ${appColors.textSecondary}`, display: "grid", placeItems: "center" }}>
                    <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{cartSignOut.signHere}</Typography>
                </Box>
            </Stack>
        </MobileShell>
    );
};

/* ------------------------------------------------------------- raincheck */

export const MobileCreateRaincheckScreen = () => {
    const navigate = useNavigate();
    const { issueRaincheck } = useActions();
    const { decoded, slot: slot0, booking } = usePosition();

    /** Which position is being refunded. The chips at the foot change it. */
    const [slot, setSlot] = useState(slot0);
    const [holes, setHoles] = useState(0);

    const back = () => navigate(`/teesheet/${encodeURIComponent(decoded)}`);
    const position = booking?.positions[slot] ?? null;
    if (!booking || !position) return <GoneScreen title="Raincheck" onBack={back} />;

    const totalHoles = position.holes;
    const max = holesPlayedOptions(totalHoles).length - 1;
    const value = raincheckValue(position.price, totalHoles, holes);
    const others = booking.positions.map((p, i) => ({ p, i })).filter((x): x is { p: Position; i: number } => Boolean(x.p));

    return (
        <MobileShell
            title="Raincheck"
            subtitle={`Reservation ${position.id} · ${decoded}`}
            active="teesheet"
            leading="close"
            onLeading={back}
            showOverflow={false}
            actions={
                <MobileActionArea>
                    <MobilePrimary
                        icon={<BoltIcon sx={{ fontSize: 20 }} />}
                        onClick={() => {
                            // Lands in `state.rainchecks`, which is the same
                            // ledger the register's RAIN tab spends from — the
                            // credit is findable at the till a moment later.
                            issueRaincheck(decoded, slot, holes);
                            back();
                        }}
                    >
                        Create Raincheck · {money(value)}
                    </MobilePrimary>
                </MobileActionArea>
            }
        >
            <Stack sx={{ alignItems: "center", py: 2.5, bgcolor: appColors.surface, borderBottom: `1px solid ${appColors.divider}` }}>
                <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>Raincheck value</Typography>
                <Typography sx={{ fontSize: 36, color: appColors.greenTee }}>{money(value)}</Typography>
                <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>
                    {raincheckPercentLabel(totalHoles, holes)} of {money(position.price)}
                </Typography>
            </Stack>

            <MobileSectionHeading>Holes played</MobileSectionHeading>
            <Stack direction="row" sx={{ alignItems: "center", gap: 2, px: 1.5, py: 1.5, bgcolor: appColors.surface }}>
                <ButtonBase
                    onClick={() => setHoles((h) => Math.max(0, h - 1))}
                    disabled={holes === 0}
                    aria-label="One fewer hole"
                    sx={{
                        width: 48,
                        height: 48,
                        border: `1px solid ${appColors.divider}`,
                        borderRadius: `${appRadius.button}px`,
                        fontSize: 24,
                    }}
                >
                    −
                </ButtonBase>
                <Typography sx={{ flex: 1, textAlign: "center", fontSize: 28 }}>{holes}</Typography>
                <ButtonBase
                    onClick={() => setHoles((h) => Math.min(max, h + 1))}
                    disabled={holes === max}
                    aria-label="One more hole"
                    sx={{
                        width: 48,
                        height: 48,
                        border: `1px solid ${appColors.divider}`,
                        borderRadius: `${appRadius.button}px`,
                        fontSize: 24,
                    }}
                >
                    +
                </ButtonBase>
            </Stack>
            <Stack direction="row" sx={{ justifyContent: "space-between", px: 1.5, pb: 1.5, bgcolor: appColors.surface }}>
                <Typography sx={{ fontSize: 12, color: appColors.textSecondary }}>0 — never teed off</Typography>
                <Typography sx={{ fontSize: 12, color: appColors.textSecondary }}>{max} — all but the last</Typography>
            </Stack>

            <MobileSectionHeading>Issue it to</MobileSectionHeading>
            {others.map(({ p, i }) => (
                <ButtonBase
                    key={`${p.id}-${i}`}
                    onClick={() => {
                        setSlot(i);
                        // A different player can be on a different rate and a
                        // different hole count, so the refund resets with them.
                        setHoles(0);
                    }}
                    sx={{
                        display: "flex",
                        width: "100%",
                        justifyContent: "space-between",
                        px: 1.5,
                        minHeight: 52,
                        bgcolor: i === slot ? "#EAF3EC" : appColors.surface,
                        borderLeft: "4px solid",
                        borderLeftColor: i === slot ? appColors.greenTee : "transparent",
                        borderBottom: `1px solid ${appColors.divider}`,
                    }}
                >
                    <Stack sx={{ minWidth: 0, alignItems: "flex-start" }}>
                        <Typography sx={{ fontSize: 15 }}>{p.name}</Typography>
                        <Typography sx={{ fontSize: 12, color: appColors.textSecondary }}>
                            {p.holes} holes · {p.paid ? "paid" : "unpaid"}
                        </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: 15 }}>{money(p.price)}</Typography>
                </ButtonBase>
            ))}

            {/* The tablet reaches this screen only from a paid round's button.
                The phone's sheet does the same, but the chips can land on an
                unpaid one — worth saying rather than silently refunding air. */}
            {!position.paid && (
                <Stack direction="row" sx={{ gap: 1, px: 1.5, py: 1.5, alignItems: "center" }}>
                    <DoneAllIcon sx={{ fontSize: 18, color: appColors.orange }} />
                    <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>
                        This round has not been paid for. A credit issued against it is a goodwill credit.
                    </Typography>
                </Stack>
            )}

            <Box sx={{ height: 8 }} />
        </MobileShell>
    );
};
