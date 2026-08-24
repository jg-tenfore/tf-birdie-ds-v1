import { useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ReplayIcon from "@mui/icons-material/Replay";
import ReportProblemIcon from "@mui/icons-material/ReportProblem";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { checkoutTotals } from "@/components/screens/checkout/checkout-fixtures";
import { RedeemBody } from "./redeem-screen";
import { creditsForCustomer, isRedeemable, noCreditsSummary, rainchecks, type Raincheck } from "@/data/rainchecks";
import { appColors } from "@/theme/app-replica-tokens";
import { CreditRow, NothingSpendable, NotUsableDivider } from "./credit-history";
import { OrderCompleteCredit } from "./order-complete-credit";

/**
 * **Concept — Aug 24.** The incident, walkable, start to finish.
 *
 * Weston described a sequence, not a screen, so this is built as one. The same
 * customer and the same ticket run through it either way; what changes is
 * whether the register can answer the question it is asked.
 *
 * Run **Today** first. It ends where the real one did — with a manager and a
 * different system.
 */

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

const CUSTOMER = "Weston Senior";
// The redeem screen's own ticket. Weston's telling says "$100"; the figure is
// not the point, and using the screen's real numbers keeps this a comparison
// with the shipping screen rather than a redrawing of it.
const OWED = checkoutTotals.total;

type Step = "ticket" | "lookup" | "deadend" | "answer" | "complete";

/* -------------------------------------------------------------- narration */

/**
 * What is being said out loud at this step.
 *
 * Kept on screen because the failure is a *conversation* failure — the screen is
 * only where it starts. "I don't see it here" is the line that costs the money,
 * and it needs to be visible next to the pane that produces it.
 */
const Narration = ({ lines, tone }: { lines: { who: string; said: string }[]; tone?: "bad" | "good" }) => (
    <Stack
        sx={{
            px: 3,
            py: 1.5,
            gap: 0.5,
            bgcolor: tone === "bad" ? "#FDECEA" : tone === "good" ? "#E7F3EA" : appColors.canvasAlt,
            borderBottom: `1px solid ${appColors.divider}`,
        }}
    >
        {lines.map((l) => (
            <Stack key={l.said} direction="row" sx={{ gap: 1.5, alignItems: "baseline" }}>
                <Typography
                    sx={{ fontSize: 13, color: appColors.textSecondary, minWidth: 76, textTransform: "uppercase", letterSpacing: "0.05em" }}
                >
                    {l.who}
                </Typography>
                <Typography sx={{ fontSize: 16, flex: 1 }}>{l.said}</Typography>
            </Stack>
        ))}
    </Stack>
);

/* ------------------------------------------------------- the lookup panes */

/** What ships today: spendable credits only, so this customer gets nothing. */
const TodayLookup = ({ query }: { query: string }) => (
    <Stack sx={{ flex: 1, minHeight: 0 }}>
        <Box sx={{ px: 3, py: 2 }}>
            <Typography sx={{ fontSize: 13, letterSpacing: "0.08em", color: appColors.textSecondary, mb: 0.75 }}>
                RAINCHECK AMOUNT
            </Typography>
            <Box sx={{ bgcolor: appColors.greenTee, color: "#fff", px: 2, py: 1.25, fontSize: 24 }}>---</Box>
        </Box>
        <Box sx={{ px: 3, pb: 2 }}>
            <Box
                sx={{
                    bgcolor: appColors.fieldFill,
                    px: 1.5,
                    minHeight: 48,
                    display: "flex",
                    alignItems: "center",
                    fontSize: 16,
                    color: appColors.textPrimary,
                }}
            >
                {query || "Enter Raincheck id, customer name, or email"}
            </Box>
        </Box>
        <Stack sx={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 1, px: 3 }}>
            <Typography sx={{ fontSize: 17, color: appColors.textSecondary }}>No results</Typography>
            <Typography sx={{ fontSize: 14, color: appColors.textDisabled, textAlign: "center" }}>
                This is the whole screen. It is also the whole problem — the customer&rsquo;s raincheck exists, and nothing here says so.
            </Typography>
        </Stack>
    </Stack>
);

/** The proposal: ranked, never empty, and it names the course. */
const ProposedLookup = ({
    credits,
    owed,
    onSelect,
    selectedId,
}: {
    credits: Raincheck[];
    owed: number;
    onSelect?: (id: string) => void;
    selectedId?: string;
}) => {
    const usable = credits.filter((c) => isRedeemable(c));
    const dead = credits.filter((c) => !isRedeemable(c));
    return (
        <Stack sx={{ flex: 1, minHeight: 0 }}>
            <Box sx={{ overflowY: "auto" }}>
                {usable.length === 0 ? (
                    <NothingSpendable customerName={CUSTOMER} summary={noCreditsSummary(credits)} />
                ) : (
                    usable.map((c) => (
                        <CreditRow key={c.id} credit={c} owed={owed} selected={selectedId === c.id} onSelect={() => onSelect?.(c.id)} />
                    ))
                )}
                {dead.length > 0 && <NotUsableDivider count={dead.length} />}
                {dead.map((c) => (
                    <CreditRow key={c.id} credit={c} showActivity />
                ))}
            </Box>
        </Stack>
    );
};

/* -------------------------------------------------------------- the flow */

export interface CounterMomentFlowProps {
    /** `today` walks the shipping behaviour to its real ending. */
    variant: "today" | "proposed";
    /**
     * `used-elsewhere` is Weston's story exactly. `found` is the near miss: the
     * credit is live, and only invisible because of where it was issued.
     */
    ending: "used-elsewhere" | "found";
}

export const CounterMomentFlow = ({ variant, ending }: CounterMomentFlowProps) => {
    const [step, setStep] = useState<Step>("ticket");
    const [selectedId, setSelectedId] = useState<string | undefined>();

    const customerId = rainchecks.find((r) => r.customerName === CUSTOMER)?.customerId ?? rainchecks[0].customerId;
    const all = creditsForCustomer(customerId);
    // Weston's case: nothing spendable. The near miss: one live credit, issued
    // at another course, which today's per-course scoping may well hide.
    const credits = ending === "found" ? all : all.filter((c) => !isRedeemable(c));
    const live = credits.find((c) => isRedeemable(c));

    const restart = () => {
        setStep("ticket");
        setSelectedId(undefined);
    };

    /**
     * The action bar, keyed on the step rather than on the variant.
     *
     * Keying it on `variant` first was a bug: on the dead-end and resolution
     * steps the "today" branch matched again, so the only button on screen set
     * the step it was already on and there was no way out of either. Every
     * terminal step now ends in `Start over`, and every step from `lookup`
     * onward carries a `Back`, because a walkthrough somebody cannot reverse is
     * one they only get to see once.
     */
    const back = (
        <ActionButton icon={<ArrowBackIcon />} onClick={() => setStep(step === "lookup" ? "ticket" : "lookup")}>
            Back
        </ActionButton>
    );

    const bar = (() => {
        switch (step) {
            case "ticket":
                return null;

            case "lookup":
                if (variant === "today")
                    return (
                        <>
                            {back}
                            <ActionButton icon={<ReportProblemIcon />} tone="danger" grow={1.6} onClick={() => setStep("deadend")}>
                                Ask a manager
                            </ActionButton>
                        </>
                    );
                if (live)
                    return (
                        <>
                            {back}
                            <ActionButton
                                icon={<ArrowForwardIcon />}
                                tone={selectedId ? "primary" : "disabled"}
                                grow={1.6}
                                onClick={() => selectedId && setStep("complete")}
                            >
                                {selectedId ? `Apply ${usd(live.balance)}` : "Pick a raincheck"}
                            </ActionButton>
                        </>
                    );
                return (
                    <>
                        {back}
                        <ActionButton icon={<ArrowForwardIcon />} grow={1.6} onClick={() => setStep("answer")}>
                            Customer accepts — take another tender
                        </ActionButton>
                    </>
                );

            // Both endings. Terminal, so both offer the way back.
            case "deadend":
            case "answer":
            case "complete":
                return (
                    <>
                        {back}
                        <ActionButton icon={<ReplayIcon />} grow={1.6} onClick={restart}>
                            Start over
                        </ActionButton>
                    </>
                );
        }
    })();

    const narration = (() => {
        switch (step) {
            case "ticket":
                return {
                    tone: undefined,
                    lines: [
                        { who: "Employee", said: `That'll be ${usd(OWED)}.` },
                        { who: "Customer", said: "I have a raincheck that covers this." },
                    ],
                };
            case "lookup":
                return variant === "today"
                    ? {
                          tone: "bad" as const,
                          lines: [
                              { who: "Employee", said: "…I don't see it here." },
                              { who: "Customer", said: "I definitely have one." },
                          ],
                      }
                    : live
                      ? {
                            tone: "good" as const,
                            lines: [
                                { who: "Employee", said: `Found it — ${usd(live.balance)}, issued at ${live.course}. That covers it.` },
                            ],
                        }
                      : {
                            tone: "good" as const,
                            lines: [
                                {
                                    who: "Employee",
                                    said: "You did have one — it was spent on 5/02 at Falls Road, on a twilight green fee.",
                                },
                                { who: "Customer", said: "Oh. That was me, yes." },
                            ],
                        };
            case "deadend":
                return {
                    tone: "bad" as const,
                    lines: [
                        { who: "Manager", said: "Give me a minute, I'll look it up in Buck." },
                        { who: "Customer", said: "…" },
                    ],
                };
            case "answer":
                return { tone: "good" as const, lines: [{ who: "Customer", said: "Fine — put it on the card." }] };
            case "complete":
                return {
                    tone: "good" as const,
                    lines: [{ who: "Employee", said: "Here's your receipt — it says what's left on the raincheck." }],
                };
        }
    })();

    return (
        <AppShell title="Pro Shop Order" active="proshop" accountLabel="" showLogOut={false} actionBar={bar ?? undefined}>
            <Stack sx={{ height: "100%", minHeight: 0 }}>
                <Narration lines={narration.lines} tone={narration.tone} />

                {/* The real screen: CheckoutTicketPane on the left, the tender
                    tabs on the right. Step one is the same screen on the CASH
                    tab — tapping RAIN is the actual entry point, not a mock of
                    one. */}
                {(step === "ticket" || step === "lookup") && (
                    <Box sx={{ flex: 1, minHeight: 0 }}>
                        <RedeemBody tab={step === "ticket" ? "CASH" : "RAIN"} onTab={(t) => t === "RAIN" && setStep("lookup")}>
                            {step === "ticket" ? (
                                <Stack sx={{ flex: 1, alignItems: "center", justifyContent: "center", px: 4, textAlign: "center", gap: 1 }}>
                                    <Typography sx={{ fontSize: 17, color: appColors.textSecondary }}>
                                        Tap <strong>RAIN</strong> above — the customer says they have one.
                                    </Typography>
                                </Stack>
                            ) : variant === "today" ? (
                                <TodayLookup query={CUSTOMER} />
                            ) : (
                                <ProposedLookup credits={credits} owed={OWED} selectedId={selectedId} onSelect={setSelectedId} />
                            )}
                        </RedeemBody>
                    </Box>
                )}

                {step === "deadend" && (
                    <Stack sx={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 2, px: 6, textAlign: "center" }}>
                        <ReportProblemIcon sx={{ fontSize: 46, color: appColors.red }} />
                        <Typography sx={{ fontSize: 20 }}>The sale stops here.</Typography>
                        <Typography sx={{ fontSize: 16, color: appColors.textSecondary, maxWidth: 620, lineHeight: 1.6 }}>
                            A manager opens <strong>Buck</strong> and finds it: raincheck 29115, spent at Falls Road on 5/02/2026. The
                            register held that fact the whole time and had no way to say it — the lookup filters out anything that cannot be
                            spent, so &ldquo;used&rdquo; and &ldquo;never existed&rdquo; produce the same empty screen.
                        </Typography>
                        <Typography sx={{ fontSize: 15, color: appColors.textSecondary, maxWidth: 620 }}>
                            Cost: a queue, an angry customer, a manager pulled off the floor, and a second system opened to answer a
                            question the terminal could have answered.
                        </Typography>
                    </Stack>
                )}

                {step === "answer" && (
                    <Stack sx={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 2, px: 6, textAlign: "center" }}>
                        <Typography sx={{ fontSize: 20 }}>Settled at the counter.</Typography>
                        <Typography sx={{ fontSize: 16, color: appColors.textSecondary, maxWidth: 620, lineHeight: 1.6 }}>
                            No manager, no second system, no queue. The customer was not wrong and was not told they were — they were told{" "}
                            <strong>what happened to their raincheck and where</strong>, which is a sentence the register could always have
                            produced and never did.
                        </Typography>
                    </Stack>
                )}

                {step === "complete" && live && (
                    <Box sx={{ flex: 1, minHeight: 0 }}>
                        <OrderCompleteCredit credit={live} applied={Math.min(live.balance, OWED)} orderNumber="5741330" total={OWED} />
                    </Box>
                )}
            </Stack>
        </AppShell>
    );
};
