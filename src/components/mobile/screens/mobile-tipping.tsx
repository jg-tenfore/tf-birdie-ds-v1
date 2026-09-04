import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import BackspaceOutlinedIcon from "@mui/icons-material/BackspaceOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ContactlessIcon from "@mui/icons-material/Contactless";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { MobileActionArea, MobileAppBar, MobilePrimary, MobileScreen, MobileSecondary, MobileSecondaryRow } from "../mobile-shell";
import { MobileSectionHeading } from "../mobile-parts";

/**
 * **Mobile Screens — the tipping flow.** From the Sept 4 call with Weston.
 *
 * The handheld is not a Clover, so the tip flow it used to borrow has to be
 * built. This is that flow.
 *
 * > *"It would be before the transaction finishes. The employee would hit pay,
 * > it would authorize, they'd tap their card… once we get an OK from the
 * > processor on the backend, then it would go to that tip screen — because it's
 * > like, yep, we're going to charge that card, do you want to add a tip?"*
 *
 * ## The load-bearing detail: where the tip sits in the sequence
 *
 * **After authorisation, before capture.** Not before the card is presented and
 * not after the sale closes. That ordering is the whole design:
 *
 * ```
 * employee taps PAY
 *   → customer taps card
 *     → processor authorises          ← the card is now good for the money
 *       → HAND THE DEVICE OVER
 *         → customer picks a tip
 *           → customer approves       ← capture happens here, at total + tip
 *             → receipt choice
 *               → HAND THE DEVICE BACK
 * ```
 *
 * Because the card is already approved when the tip is chosen, the tip raises
 * the **captured** amount rather than requiring a second authorisation. An
 * implementation that asks for the tip first has to re-auth when it changes, and
 * one that asks after the sale closes has to void and re-run it.
 *
 * ## The device changes hands twice, and the screen says so
 *
 * This is the part a desktop-shaped design misses. A handheld is passed to the
 * customer and passed back, and both moments are **explicit screens** rather
 * than implied:
 *
 * > *"the employee would then hand that to the customer"* … *"Please hand the
 * > device back to the employee."*
 *
 * Without them, an employee watches a customer poke at a screen wondering
 * whether it is their turn, and a customer holds a device not knowing they are
 * finished. Two screens is cheap insurance against both.
 *
 * ## No printing, for the golfer
 *
 * > *"this device won't have a printer, so I'd want to avoid that option for
 * > the golfer. They can always go print it in the kitchen area."*
 *
 * So the receipt step offers **email or nothing** — no print button that would
 * fail, and no print button an employee has to explain away.
 *
 * ## Open question, flagged rather than answered
 *
 * **Is the tip calculated on the subtotal or the total?** Justin asked directly
 * on the call and it was not answered. Weston's own example — *"the total was
 * $74, do you want to add 20%"* — reads as the total, and that is what is drawn
 * here, but tipping on tax is a real policy difference and a course may have a
 * view. `tipBasis` makes it a one-word change rather than a rewrite.
 */

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

/**
 * The suggested percentages.
 *
 * Weston floated both shapes on the call — fixed dollars (*"$18, $20, $25…
 * probably $20 is the bare minimum"*) and percentages (*"20%, 25%, 28%"*) — and
 * settled on describing percentages. Percentages are also the safer default:
 * a fixed $20 suggestion on a $9 beer is absurd, while 20% scales.
 */
export const TIP_PERCENTAGES = [20, 25, 28] as const;

export interface TipStepProps {
    /** What the goods came to, before any tip. */
    total: number;
    subtotal?: number;
    /**
     * Which figure the percentages are taken from.
     *
     * `total` matches Weston's example on the call. `subtotal` excludes tax,
     * which some operators insist on. **Not settled** — see the note above.
     */
    tipBasis?: "total" | "subtotal";
}

/* ------------------------------------------------------------ 1. authorise */

/**
 * The card is presented and the processor is asked.
 *
 * The employee is still holding the device here — nothing on screen asks the
 * customer for anything yet, because until the processor says yes there is
 * nothing to ask about.
 */
export const TipAuthorising = ({ total }: { total: number }) => (
    <MobileScreen appBar={<MobileAppBar title="Card Payment" subtitle={usd(total)} leading="close" showOverflow={false} />}>
        <Stack sx={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 2, px: 4, textAlign: "center" }}>
            <ContactlessIcon sx={{ fontSize: 56, color: appColors.slate }} />
            <Typography sx={{ fontSize: 22 }}>Tap, insert or swipe</Typography>
            <Typography sx={{ fontSize: 16, color: appColors.textSecondary }}>{usd(total)}</Typography>
            <CircularProgress size={22} sx={{ color: appColors.slate, mt: 1 }} />
            <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>Authorising with the processor…</Typography>
        </Stack>
    </MobileScreen>
);

/* --------------------------------------------------------------- 2. handoff */

/**
 * The first handoff.
 *
 * A deliberate full-screen beat. The card is approved, the amount is fixed, and
 * the next person to touch the device is the customer — so the screen stops and
 * says exactly that rather than letting a tip prompt appear in the employee's
 * hands.
 */
export const TipHandoff = ({ total, onContinue }: { total: number; onContinue?: () => void }) => (
    <MobileScreen
        appBar={<MobileAppBar title="Approved" leading="none" showOverflow={false} />}
        actions={
            <MobileActionArea>
                <MobilePrimary icon={<SwapHorizIcon sx={{ fontSize: 20 }} />} onClick={onContinue}>
                    Hand to the customer
                </MobilePrimary>
            </MobileActionArea>
        }
    >
        <Stack sx={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 1.5, px: 4, textAlign: "center" }}>
            <CheckCircleIcon sx={{ fontSize: 56, color: appColors.green }} />
            <Typography sx={{ fontSize: 22, color: appColors.green }}>Card approved</Typography>
            <Typography sx={{ fontSize: 16, color: appColors.textSecondary }}>
                {usd(total)} is authorised. Nothing has been charged yet.
            </Typography>
            <Typography sx={{ fontSize: 14, color: appColors.textSecondary, mt: 1 }}>
                Pass the device to the customer to add a tip.
            </Typography>
        </Stack>
    </MobileScreen>
);

/* ------------------------------------------------------------------ 3. tip */

/**
 * The tip screen — the one the customer holds.
 *
 * Every suggestion shows **the percentage and the money it comes to**, because
 * a customer choosing between `20%` and `25%` on a $74 bill is doing arithmetic
 * under mild social pressure with an employee watching. Showing `$14.80` next
 * to `20%` removes the arithmetic.
 *
 * The chrome is deliberately bare: no drawer, no overflow, no back. The device
 * is in a stranger's hands and every control that is not the task is a way out
 * of it.
 */
export const TipSelect = ({
    total,
    subtotal,
    tipBasis = "total",
    selected,
    onSelect,
    onCustom,
    onApprove,
}: TipStepProps & {
    /** The chosen tip in dollars, or `null` for none yet. */
    selected?: number | null;
    onSelect?: (amount: number) => void;
    onCustom?: () => void;
    onApprove?: () => void;
}) => {
    const basis = tipBasis === "subtotal" ? (subtotal ?? total) : total;
    const chosen = selected ?? null;

    return (
        <MobileScreen
            appBar={<MobileAppBar title="Add a tip?" leading="none" showOverflow={false} />}
            actions={
                <MobileActionArea>
                    <MobileSecondaryRow>
                        <MobileSecondary tone="muted" onClick={() => onSelect?.(0)}>
                            No tip
                        </MobileSecondary>
                        <MobileSecondary onClick={onCustom}>Custom</MobileSecondary>
                    </MobileSecondaryRow>
                    {/* "Approve", not "Save" — Weston corrected himself on the
                        call, and it is the right word: the customer is agreeing
                        to a charge, not filing a preference. */}
                    <MobilePrimary disabled={chosen === null} icon={<CheckCircleIcon sx={{ fontSize: 20 }} />} onClick={onApprove}>
                        {chosen === null ? "Choose an amount" : `Approve ${usd(total + chosen)}`}
                    </MobilePrimary>
                </MobileActionArea>
            }
        >
            <Stack
                sx={{ px: 1.5, py: 2, alignItems: "center", bgcolor: appColors.surface, borderBottom: `1px solid ${appColors.divider}` }}
            >
                <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>Your total</Typography>
                <Typography sx={{ fontSize: 34 }}>{usd(total)}</Typography>
            </Stack>

            <MobileSectionHeading>Add a tip for your server</MobileSectionHeading>

            <Stack sx={{ px: 1.5, gap: 1 }}>
                {TIP_PERCENTAGES.map((pct) => {
                    const amount = +((basis * pct) / 100).toFixed(2);
                    const isOn = chosen !== null && Math.abs(chosen - amount) < 0.005;
                    return (
                        <ButtonBase
                            key={pct}
                            onClick={() => onSelect?.(amount)}
                            sx={{
                                minHeight: 68,
                                px: 2,
                                borderRadius: `${appRadius.button}px`,
                                border: "2px solid",
                                borderColor: isOn ? appColors.green : appColors.divider,
                                bgcolor: isOn ? "#EAF3EC" : appColors.surface,
                                justifyContent: "space-between",
                            }}
                        >
                            <Typography sx={{ fontSize: 22 }}>{pct}%</Typography>
                            {/* The money, next to the percentage. This is the
                                whole reason the row is 68dp rather than 48. */}
                            <Typography sx={{ fontSize: 20, color: isOn ? appColors.greenTee : appColors.textSecondary }}>
                                {usd(amount)}
                            </Typography>
                        </ButtonBase>
                    );
                })}
            </Stack>

            {chosen !== null && (
                <Typography sx={{ px: 1.5, pt: 2, fontSize: 14, color: appColors.textSecondary, textAlign: "center" }}>
                    {usd(total)} + {usd(chosen)} tip
                </Typography>
            )}
        </MobileScreen>
    );
};

/* --------------------------------------------------------------- 4. custom */

/**
 * Custom tip entry.
 *
 * > *"If they hit custom, then they can add a dollar amount."*
 *
 * A **dollar amount**, not a percentage — which is what Weston said and also
 * what a customer means when they reject the suggestions. Its own keypad for
 * the same reason sign-in has one: a POS should not summon a QWERTY keyboard to
 * collect four digits, and the OS keyboard would cover half the screen.
 */
export const TipCustom = ({
    total,
    value = "",
    onKey,
    onApprove,
    onBack,
}: {
    total: number;
    value?: string;
    onKey?: (k: string) => void;
    onApprove?: () => void;
    onBack?: () => void;
}) => {
    const amount = Number(value || "0") / 100;
    return (
        <MobileScreen
            appBar={<MobileAppBar title="Custom tip" leading="back" onLeading={onBack} showOverflow={false} />}
            actions={
                <MobileActionArea>
                    <MobilePrimary disabled={amount <= 0} icon={<CheckCircleIcon sx={{ fontSize: 20 }} />} onClick={onApprove}>
                        {amount > 0 ? `Approve ${usd(total + amount)}` : "Enter an amount"}
                    </MobilePrimary>
                </MobileActionArea>
            }
        >
            <Stack sx={{ alignItems: "center", py: 3, bgcolor: appColors.surface, borderBottom: `1px solid ${appColors.divider}` }}>
                <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>Tip amount</Typography>
                <Typography sx={{ fontSize: 40 }}>{usd(amount)}</Typography>
                <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>on {usd(total)}</Typography>
            </Stack>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, p: 1.5 }}>
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "00", "0", "del"].map((k) => (
                    <ButtonBase
                        key={k}
                        onClick={() => onKey?.(k)}
                        aria-label={k === "del" ? "Delete" : k}
                        sx={{
                            height: 60,
                            borderRadius: `${appRadius.button}px`,
                            bgcolor: appColors.canvasAlt,
                            fontSize: 22,
                            color: appColors.textPrimary,
                        }}
                    >
                        {k === "del" ? <BackspaceOutlinedIcon sx={{ fontSize: 22 }} /> : k}
                    </ButtonBase>
                ))}
            </Box>
        </MobileScreen>
    );
};

/* -------------------------------------------------------------- 5. receipt */

/**
 * The receipt choice.
 *
 * > *"Do you want emailed receipt or no receipt?"* … *"this device won't have a
 * > printer, so I'd want to avoid that option for the golfer."*
 *
 * Two options, and print is not one of them. Offering a print button that
 * cannot print would be worse than offering nothing — the customer taps it, the
 * employee explains, and the device has cost time instead of saving it.
 */
export const TipReceipt = ({
    total,
    tip,
    email = "",
    onEmail,
    onFinish,
}: {
    total: number;
    tip: number;
    email?: string;
    onEmail?: (v: string) => void;
    onFinish?: (choice: "email" | "none") => void;
}) => (
    <MobileScreen
        appBar={<MobileAppBar title="Receipt" leading="none" showOverflow={false} />}
        actions={
            <MobileActionArea>
                <MobilePrimary
                    disabled={!email.includes("@")}
                    icon={<EmailOutlinedIcon sx={{ fontSize: 20 }} />}
                    onClick={() => onFinish?.("email")}
                >
                    Email my receipt
                </MobilePrimary>
                <MobileSecondary tone="muted" onClick={() => onFinish?.("none")}>
                    No receipt
                </MobileSecondary>
            </MobileActionArea>
        }
    >
        <Stack sx={{ px: 1.5, py: 2, gap: 0.5, bgcolor: appColors.surface, borderBottom: `1px solid ${appColors.divider}` }}>
            {[
                ["Order", usd(total)],
                ["Tip", usd(tip)],
            ].map(([label, value]) => (
                <Stack key={label} direction="row" sx={{ justifyContent: "space-between" }}>
                    <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>{label}</Typography>
                    <Typography sx={{ fontSize: 15 }}>{value}</Typography>
                </Stack>
            ))}
            <Stack direction="row" sx={{ justifyContent: "space-between", pt: 0.5, borderTop: `1px solid ${appColors.divider}`, mt: 0.5 }}>
                <Typography sx={{ fontSize: 18 }}>Charged</Typography>
                <Typography sx={{ fontSize: 18, color: appColors.greenTee }}>{usd(total + tip)}</Typography>
            </Stack>
        </Stack>

        <MobileSectionHeading>Where should it go?</MobileSectionHeading>
        <Box sx={{ mx: 1.5, px: 1.5, bgcolor: appColors.canvasAlt, borderBottom: `1px solid ${appColors.textSecondary}` }}>
            <Box
                component="input"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onEmail?.(e.target.value)}
                placeholder="Email address"
                aria-label="Email address"
                type="email"
                inputMode="email"
                sx={{
                    width: "100%",
                    minHeight: 48,
                    border: "none",
                    outline: "none",
                    bgcolor: "transparent",
                    fontSize: 16,
                    fontFamily: "inherit",
                }}
            />
        </Box>
        <Typography sx={{ px: 1.5, pt: 1.5, fontSize: 13, color: appColors.textSecondary }}>
            This device has no printer. A paper copy can be printed at the kitchen counter.
        </Typography>
    </MobileScreen>
);

/* ----------------------------------------------------------- 6. hand back */

/**
 * The second handoff, and the end of the flow.
 *
 * > *"that would give them a completion screen, like, yeah, you did it. Please
 * > hand the device back to the employee."*
 *
 * The customer needs to know they are finished, and the employee needs to know
 * they can take the device. One screen does both.
 */
export const TipComplete = ({ total, tip, receipt }: { total: number; tip: number; receipt: "email" | "none" }) => (
    <MobileScreen appBar={<MobileAppBar title="Done" leading="none" showOverflow={false} />}>
        <Stack sx={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 1.5, px: 4, textAlign: "center" }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: appColors.green }} />
            <Typography sx={{ fontSize: 26, color: appColors.green }}>Thank you</Typography>
            <Typography sx={{ fontSize: 18 }}>{usd(total + tip)} charged</Typography>
            {tip > 0 && <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>including a {usd(tip)} tip</Typography>}
            <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>
                {receipt === "email" ? "Your receipt is on its way." : "No receipt sent."}
            </Typography>

            <Stack
                direction="row"
                sx={{
                    alignItems: "center",
                    gap: 1,
                    mt: 3,
                    px: 2,
                    py: 1.5,
                    bgcolor: appColors.canvasAlt,
                    borderRadius: `${appRadius.button}px`,
                }}
            >
                <SwapHorizIcon sx={{ fontSize: 22, color: appColors.textSecondary }} />
                <Typography sx={{ fontSize: 16 }}>Please hand the device back.</Typography>
            </Stack>
        </Stack>
    </MobileScreen>
);

/* ------------------------------------------------------------------ flow */

export type TipStep = "authorising" | "handoff" | "tip" | "custom" | "receipt" | "complete";

/**
 * The whole thing, walkable.
 *
 * Runs the six steps in Weston's order. `authorising` advances on a timer
 * because that is what it does on the device — the wait is the point, and a
 * flow that skips it hides the one moment where the customer is not yet
 * committed.
 */
export const TippingFlow = ({ total = 74, subtotal, tipBasis = "total", start = "authorising" }: TipStepProps & { start?: TipStep }) => {
    const [step, setStep] = useState<TipStep>(start);
    const [tip, setTip] = useState<number | null>(null);
    const [digits, setDigits] = useState("");
    const [email, setEmail] = useState("");
    const [receipt, setReceipt] = useState<"email" | "none">("none");

    // The processor answers on its own schedule; nothing the operator does
    // makes it faster, so the screen has no control to press.
    if (step === "authorising") {
        setTimeout(() => setStep("handoff"), 1400);
        return <TipAuthorising total={total} />;
    }

    if (step === "handoff") return <TipHandoff total={total} onContinue={() => setStep("tip")} />;

    if (step === "tip")
        return (
            <TipSelect
                total={total}
                subtotal={subtotal}
                tipBasis={tipBasis}
                selected={tip}
                onSelect={setTip}
                onCustom={() => setStep("custom")}
                onApprove={() => setStep("receipt")}
            />
        );

    if (step === "custom")
        return (
            <TipCustom
                total={total}
                value={digits}
                onKey={(k) => setDigits((d) => (k === "del" ? d.slice(0, -1) : (d + k).replace(/^0+/, "").slice(0, 6)))}
                onApprove={() => {
                    setTip(Number(digits || "0") / 100);
                    setStep("receipt");
                }}
                onBack={() => setStep("tip")}
            />
        );

    if (step === "receipt")
        return (
            <TipReceipt
                total={total}
                tip={tip ?? 0}
                email={email}
                onEmail={setEmail}
                onFinish={(choice) => {
                    setReceipt(choice);
                    setStep("complete");
                }}
            />
        );

    return <TipComplete total={total} tip={tip ?? 0} receipt={receipt} />;
};
