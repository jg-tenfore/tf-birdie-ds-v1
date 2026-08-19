import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import BoltIcon from "@mui/icons-material/Bolt";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import { CartCredits } from "@/components/concepts/rainchecks/cart-credits";
import {
    ReservationRaincheck,
    foursome,
    foursomeHeading,
    positionTotal,
    type IssuanceEvent,
    type RaincheckPosition,
} from "@/components/concepts/rainchecks/reservation-raincheck";
import { RainChecksTable } from "@/components/screens/operations/customer-search-panel";
import { TeeTimeDetailScreen } from "@/components/screens/tee-sheet/tee-sheet-frames";
import type { PlayerAction } from "@/components/screens/tee-sheet/tee-sheet-data";
import { raincheckValue, type Raincheck } from "@/data/rainchecks";
import { appColors } from "@/theme/app-replica-tokens";

/**
 * **Concept — creating one, end to end.**
 *
 * The other three stories each show a screen. This one shows the *object*: a
 * raincheck cut from a round, landing on the customer's record and at the till
 * as the same thing, because it is the same thing.
 *
 * That is the point Weston kept making and the one hardest to see from a static
 * screen — *"it's not tied to a customer, it's tied to that reservation you've
 * booked"*. Here you can watch it: pick a round, credit it, and the credit turns
 * up in two other places carrying the reservation it came from.
 *
 * Three steps, all live. **Issue another** at the end runs it again against the
 * same reservation, which is how a rained-off foursome actually gets handled —
 * four credits, one at a time, off one booking.
 *
 * Step one is the **shipping detail screen itself**, not a redrawing of it — the
 * same component **Flows → Rainchecks → 1 — Booking with a raincheck** renders,
 * with its buttons made live. The entry point is the one thing Weston asked to
 * leave alone, so a near-miss of it here would quietly undercut the comparison
 * the rest of the folder is making.
 */
const meta = {
    title: "Flows/Rainchecks/Weston's ideas/Create one, end to end",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });

/** Step three: the same credit, in the two places it now exists. */
const LandedStep = ({ credit, onAgain }: { credit: Raincheck; onAgain: () => void }) => (
    <Stack sx={{ height: "100%", bgcolor: appColors.canvas, p: 2, gap: 2, overflowY: "auto" }}>
        <Stack direction="row" sx={{ alignItems: "center", gap: 1, bgcolor: "#E7F3EA", px: 2, py: 1.5 }}>
            <CheckCircleIcon sx={{ fontSize: 22, color: appColors.greenTee }} />
            <Typography sx={{ fontSize: 18, color: appColors.greenTee, flex: 1 }}>
                Raincheck {credit.id} · {usd(credit.awarded)} · issued to {credit.customerName}
            </Typography>
            <ButtonBase onClick={onAgain} sx={{ bgcolor: appColors.slate, color: "#fff", px: 2, py: 1, fontSize: 15, borderRadius: 0.5 }}>
                Issue another
            </ButtonBase>
        </Stack>

        <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>
            One object, two screens. Both carry reservation {credit.reservation} and the {credit.teeTime} round it was cut from — which is
            what makes it checkable when the customer comes back.
        </Typography>

        <Box sx={{ bgcolor: appColors.surface, border: `1px solid ${appColors.divider}` }}>
            <Box sx={{ bgcolor: appColors.navy, px: 2, py: 1.25 }}>
                <Typography sx={{ fontSize: 15, color: "#fff" }}>On {credit.customerName}&rsquo;s record</Typography>
            </Box>
            <RainChecksTable rows={[credit]} />
        </Box>

        <Box sx={{ bgcolor: appColors.surface, border: `1px solid ${appColors.divider}` }}>
            <Box sx={{ bgcolor: appColors.navy, px: 2, py: 1.25 }}>
                <Typography sx={{ fontSize: 15, color: "#fff" }}>At the till, on the RAIN tender</Typography>
            </Box>
            <CartCredits customerName={credit.customerName} credits={[credit]} owed={53.48} />
        </Box>
    </Stack>
);

export const Default: Story = {
    name: "Booking → issue → where it lands",
    render: function CreateEndToEnd() {
        const [positions, setPositions] = useState<RaincheckPosition[]>(foursome.map((p) => ({ ...p, issued: undefined })));
        const [step, setStep] = useState<"booking" | "issue" | "done">("booking");
        const [selectedId, setSelectedId] = useState(foursome[0].id);
        const [recipientId, setRecipientId] = useState(foursome[0].id);
        const [holesPlayed, setHolesPlayed] = useState(5);
        const [nextId, setNextId] = useState(51390);
        const [log, setLog] = useState<IssuanceEvent[]>([]);
        const [credit, setCredit] = useState<Raincheck | null>(null);

        const selected = positions.find((p) => p.id === selectedId) ?? positions[0];
        const recipient = positions.find((p) => p.id === recipientId) ?? selected;

        const open = (id: string) => {
            setSelectedId(id);
            setRecipientId(id);
            setHolesPlayed(5);
            setStep("issue");
        };

        const issue = () => {
            const amount = raincheckValue(positionTotal(selected), selected.holes, holesPlayed);
            const id = String(nextId);
            setNextId((n) => n + 1);
            setPositions((prev) =>
                prev.map((p) => (p.id === selected.id ? { ...p, issued: { raincheckId: id, amount, at: "3:14 PM", to: recipient.name } } : p)),
            );
            setLog((prev) => [
                { at: "8/19/2026 3:14 PM", what: `${selected.name}'s round credited to ${recipient.name} — raincheck ${id} for ${usd(amount)}` },
                ...prev,
            ]);
            // The credit as the rest of the system will see it. Same reservation,
            // same round, same money — this is the object, not a copy of it.
            setCredit({
                id,
                customerId: "458500",
                customerName: recipient.name,
                reservation: selected.id,
                teeTime: "7/20/2026 7:00 PM",
                issued: "08/19/2026",
                expires: "08/19/2027",
                roundPrice: positionTotal(selected),
                totalHoles: selected.holes,
                holesPlayed,
                awarded: amount,
                spent: 0,
                balance: amount,
            });
            setStep("done");
        };

        const bar =
            step === "issue" ? (
                <>
                    <ActionButton icon={<ArrowBackIosNewIcon />} onClick={() => setStep("booking")}>
                        Back
                    </ActionButton>
                    <ActionButton icon={<BoltIcon />} tone="primary" grow={1.6} onClick={issue}>
                        Issue Raincheck
                    </ActionButton>
                </>
            ) : (
                <ActionButton icon={<ArrowBackIosNewIcon />} onClick={() => setStep("booking")}>
                    Back to the tee time
                </ActionButton>
            );

        // Step one is the shipping detail screen itself, not a redrawing of it.
        // The entry point is the thing Weston asked to leave alone, so showing a
        // near-miss of it here would undercut the whole comparison.
        if (step === "booking") {
            return (
                <TeeTimeDetailScreen
                    detail={{
                        title: foursomeHeading,
                        players: positions.map((p) => ({
                            name: p.name,
                            amount: usd(positionTotal(p)),
                            flags: p.issued ? (["bolt"] as const).slice() : undefined,
                            meta: `${p.holes} holes   ${p.greenFee.name} : ${usd(p.greenFee.price)}   ${p.cartFee.name} : ${usd(
                                p.cartFee.price,
                            )}   ID:${p.id}${p.issued ? `   Raincheck ${p.issued.raincheckId} : ${usd(p.issued.amount)} to ${p.issued.to}` : ""}`,
                            actions: p.issued
                                ? (["History", "Edit", "Cart Signout", "Print Starter", "Print Receipt", "Cart Key"] as PlayerAction[])
                                : (["Raincheck", "History", "Edit", "Cart Signout", "Print Starter", "Print Receipt", "Cart Key"] as PlayerAction[]),
                        })),
                    }}
                    onAction={(action, player) => {
                        if (action !== "Raincheck") return;
                        const hit = positions.find((p) => p.name === player.name);
                        if (hit) open(hit.id);
                    }}
                />
            );
        }

        return (
            <AppShell title="Raincheck" active="teesheet" accountLabel="" showLogOut={false} actionBar={bar}>
                {step === "issue" && (
                    <ReservationRaincheck
                        heading={foursomeHeading}
                        positions={positions}
                        selectedId={selected.id}
                        onSelect={(id) => {
                            setSelectedId(id);
                            setRecipientId(id);
                        }}
                        recipientId={recipient.id}
                        onRecipient={setRecipientId}
                        holesPlayed={holesPlayed}
                        onHolesPlayed={setHolesPlayed}
                        log={log}
                    />
                )}
                {step === "done" && credit && <LandedStep credit={credit} onAgain={() => setStep("booking")} />}
            </AppShell>
        );
    },
};
