import { useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ReplayIcon from "@mui/icons-material/Replay";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { checkoutTotals } from "@/components/screens/checkout/checkout-fixtures";
import { creditsForCustomer, isRedeemable, rainchecks, raincheckById } from "@/data/rainchecks";
import { appColors } from "@/theme/app-replica-tokens";
import { OrderCompleteCredit } from "../order-complete-credit";
import { RedeemBody } from "../redeem-screen";
import { AvailableTab, HistoryTab, RaincheckTabs, type CreditTab, type TabBodyProps } from "./raincheck-tender";

/**
 * **Aug 31.** The incident, walked through the chosen solution.
 *
 * Same customer, same ticket, same raincheck as Aug 24's flow — but only one
 * design, because the stakeholder has picked one. For the contrast, open
 * [Aug 24 → 4 — Start to finish → Today] beside this: that story is the
 * shipping behaviour, and it ends with a manager and a second system.
 *
 * The dialogue stays on screen throughout. This is a **conversation** failure
 * and the screen is only where it starts — *"I don't see it here"* is the line
 * that costs the money, and it belongs next to the pane that produces it.
 *
 * The flow drives `RaincheckTabs`, `AvailableTab` and `HistoryTab` directly
 * rather than through `RaincheckTender`, because the narration has to know
 * which tab you are on. Those three are exported separately for exactly this.
 */

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

const CUSTOMER = "Weston Senior";
/** The redeem screen's own ticket. Weston's telling says "$100"; the figure is not the point. */
const OWED = checkoutTotals.total;

type Step = "ticket" | "tender" | "settled" | "complete";

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

export interface CounterFlowBProps {
    /**
     * `used-elsewhere` is Weston's story exactly: nothing spendable, and the
     * answer is on History. `found-elsewhere` is the near miss — the credit is
     * live and only invisible because of where it was issued.
     */
    ending: "used-elsewhere" | "found-elsewhere";
}

export const CounterFlowB = ({ ending }: CounterFlowBProps) => {
    const [step, setStep] = useState<Step>("ticket");
    const [tab, setTab] = useState<CreditTab>("available");
    const [availQ, setAvailQ] = useState("");
    const [histQ, setHistQ] = useState("");
    const [selectedId, setSelectedId] = useState<string | undefined>();

    const customerId = rainchecks.find((r) => r.customerName === CUSTOMER)?.customerId ?? rainchecks[0].customerId;
    const all = creditsForCustomer(customerId);
    const credits = ending === "found-elsewhere" ? all : all.filter((c) => !isRedeemable(c));
    const historyCount = credits.filter((c) => !isRedeemable(c)).length;
    const applied = selectedId ? raincheckById(selectedId) : null;

    const restart = () => {
        setStep("ticket");
        setTab("available");
        setAvailQ("");
        setHistQ("");
        setSelectedId(undefined);
    };

    const body: TabBodyProps = {
        customerName: CUSTOMER,
        customerId,
        owed: OWED,
        credits,
        selectedId,
        onSelect: setSelectedId,
        query: tab === "available" ? availQ : histQ,
        onQuery: tab === "available" ? setAvailQ : setHistQ,
    };

    /**
     * The action bar, keyed on the **step** rather than on any other axis.
     *
     * Aug 24's flow keyed it on the variant first and produced two dead ends —
     * buttons that set the step they were already on. Every terminal step here
     * ends in `Start over`, and everything past `ticket` carries a `Back`.
     */
    const bar = (() => {
        const back = (
            <ActionButton icon={<ArrowBackIcon />} onClick={() => setStep(step === "tender" ? "ticket" : "tender")}>
                Back
            </ActionButton>
        );

        switch (step) {
            case "ticket":
                return null;
            case "tender":
                return (
                    <>
                        {back}
                        {applied ? (
                            <ActionButton icon={<ArrowForwardIcon />} tone="primary" grow={1.6} onClick={() => setStep("complete")}>
                                Apply {usd(Math.min(applied.balance, OWED))}
                            </ActionButton>
                        ) : (
                            <ActionButton icon={<ArrowForwardIcon />} grow={1.6} onClick={() => setStep("settled")}>
                                Customer accepts — take another tender
                            </ActionButton>
                        )}
                    </>
                );
            case "settled":
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
            case "tender":
                if (tab === "available") {
                    return applied
                        ? {
                              tone: "good" as const,
                              lines: [{ who: "Employee", said: `Found it — ${usd(applied.balance)}. That covers it.` }],
                          }
                        : ending === "found-elsewhere"
                          ? {
                                tone: "good" as const,
                                lines: [{ who: "Employee", said: "Let me look — yes, here it is." }],
                            }
                          : {
                                tone: "good" as const,
                                lines: [
                                    {
                                        who: "Employee",
                                        said: "Nothing available on your name — but it says you've had three. Let me check.",
                                    },
                                ],
                            };
                }
                return applied
                    ? {
                          tone: "good" as const,
                          lines: [
                              {
                                  who: "Employee",
                                  said: `There it is — ${usd(applied.balance)}, issued at ${applied.course}. I can take it.`,
                              },
                          ],
                      }
                    : {
                          tone: "good" as const,
                          lines: [
                              { who: "Employee", said: "You did have one — spent on 5/02 at Falls Road, on a twilight green fee." },
                              { who: "Customer", said: "Oh. That was me, yes." },
                          ],
                      };
            case "settled":
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

                {(step === "ticket" || step === "tender") && (
                    <Box sx={{ flex: 1, minHeight: 0 }}>
                        {/* The real screen. Step one is the same screen on the
                            CASH tab — tapping RAIN is the actual entry point,
                            not a mock of one. */}
                        <RedeemBody tab={step === "ticket" ? "CASH" : "RAIN"} onTab={(t) => t === "RAIN" && setStep("tender")}>
                            {step === "ticket" ? (
                                <Stack sx={{ flex: 1, alignItems: "center", justifyContent: "center", px: 4, textAlign: "center" }}>
                                    <Typography sx={{ fontSize: 17, color: appColors.textSecondary }}>
                                        Tap <strong>RAIN</strong> above — the customer says they have one.
                                    </Typography>
                                </Stack>
                            ) : (
                                <Stack sx={{ height: "100%", minHeight: 0 }}>
                                    <RaincheckTabs tab={tab} onTab={setTab} historyCount={historyCount} />
                                    {tab === "available" ? (
                                        <AvailableTab
                                            {...body}
                                            onOpenHistory={(seed) => {
                                                if (seed) setHistQ(seed);
                                                setTab("history");
                                            }}
                                        />
                                    ) : (
                                        <HistoryTab {...body} />
                                    )}
                                </Stack>
                            )}
                        </RedeemBody>
                    </Box>
                )}

                {step === "settled" && (
                    <Stack sx={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 2, px: 6, textAlign: "center" }}>
                        <Typography sx={{ fontSize: 20 }}>Settled at the counter.</Typography>
                        <Typography sx={{ fontSize: 16, color: appColors.textSecondary, maxWidth: 620, lineHeight: 1.6 }}>
                            No manager, no Buck, no queue. The customer was not wrong and was not told they were — they were told{" "}
                            <strong>what happened to their raincheck and where</strong>, which is a sentence the register could always have
                            produced and never did.
                        </Typography>
                        <Typography sx={{ fontSize: 15, color: appColors.textSecondary, maxWidth: 620 }}>
                            Note what it took: the Available tab refusing to render empty, and one labelled tap. No search was typed.
                        </Typography>
                    </Stack>
                )}

                {step === "complete" && applied && (
                    <Box sx={{ flex: 1, minHeight: 0 }}>
                        <OrderCompleteCredit
                            credit={applied}
                            applied={Math.min(applied.balance, OWED)}
                            orderNumber="5741330"
                            total={OWED}
                        />
                    </Box>
                )}
            </Stack>
        </AppShell>
    );
};
