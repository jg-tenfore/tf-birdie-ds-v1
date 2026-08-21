import { useState } from "react";

import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import BoltIcon from "@mui/icons-material/Bolt";
import type { Meta, StoryObj } from "@storybook/react-vite";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

import { ActionButton, AppShell } from "@/components/app-chrome/app-shell";
import {
    ReservationRaincheck,
    foursome,
    foursomeHeading,
    foursomeLog,
    positionTotal,
    type IssuanceEvent,
    type RaincheckPosition,
} from "@/components/concepts/rainchecks/reservation-raincheck";
import { raincheckValue } from "@/data/rainchecks";

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 });
import { appColors } from "@/theme/app-replica-tokens";

/**
 * **Concept — issue for this reservation.**
 *
 * Weston's rework of the issuance screen. The shipping version asks one question
 * and leaves three implicit; this asks all four: which round, how much, whose
 * account, and what has already happened.
 *
 * Three deliberate departures from the shipping screen, all of them arrangement
 * rather than new parts:
 *
 * - **The amount sits below the control that produces it.** On the shipping
 *   screen the result is above the radios, so the number moves when you touch
 *   something underneath it.
 * - **The recipient picker is labelled and separate.** *"Whose account should
 *   hold it?"* — the unlabelled chips were the single most confusing element in
 *   the walkthrough, and nobody in the conversation could state what they did.
 * - **A sentence states the outcome before you commit.** Weston asked for this
 *   nearly verbatim.
 *
 * Same number as the core step it replaces. Compare **Flows → Rainchecks →
 * 2 — Create raincheck** — one screen up, outside this folder — for the version
 * that ships.
 */
const meta = {
    title: "Flows/Rainchecks/Weston's ideas/2 — Create raincheck",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Frame = ({ children, onIssue, canIssue }: { children: React.ReactNode; onIssue?: () => void; canIssue?: boolean }) => (
    <AppShell
        title="Raincheck"
        active="teesheet"
        accountLabel=""
        showLogOut={false}
        actionBar={
            <>
                <ActionButton icon={<ArrowBackIosNewIcon />}>Back</ActionButton>
                <ActionButton icon={<BoltIcon />} tone={canIssue === false ? "disabled" : "primary"} grow={1.6} onClick={onIssue}>
                    Issue Raincheck
                </ActionButton>
            </>
        }
    >
        {children}
    </AppShell>
);

/**
 * The concept, wired.
 *
 * ISSUE RAINCHECK actually issues: the round greys out, a line lands in the
 * history, and selection moves to the next round still owed one. That is the
 * part the static screens cannot show — that this screen is somewhere you come
 * back to, several times, for the same reservation.
 *
 * State lives in the story. Nothing here touches the prototype.
 */
const Concept = ({ seed, startAt, startRecipient }: { seed: RaincheckPosition[]; startAt: string; startRecipient?: string }) => {
    const [positions, setPositions] = useState(seed);
    const [log, setLog] = useState<IssuanceEvent[]>(foursomeLog);
    const [selectedId, setSelectedId] = useState(startAt);
    const [recipientId, setRecipientId] = useState(startRecipient ?? startAt);
    const [holesPlayed, setHolesPlayed] = useState(5);
    const [nextId, setNextId] = useState(51381);
    const [flash, setFlash] = useState<string | null>(null);

    const selected = positions.find((p) => p.id === selectedId) ?? positions[0];
    const recipient = positions.find((p) => p.id === recipientId) ?? selected;
    const canIssue = !selected.issued;

    const issue = () => {
        if (!canIssue) return;
        const amount = raincheckValue(positionTotal(selected), selected.holes, holesPlayed);
        const id = String(nextId);
        const at = "2:41 PM";

        setPositions((prev) =>
            prev.map((p) => (p.id === selected.id ? { ...p, issued: { raincheckId: id, amount, at, to: recipient.name } } : p)),
        );
        setLog((prev) => [
            {
                at: `7/20/2026 ${at}`,
                what:
                    recipient.id === selected.id
                        ? `${selected.name} was issued raincheck ${id} for $${amount.toFixed(2)} — by John Admin`
                        : `${selected.name}'s round was credited to ${recipient.name} — raincheck ${id} for $${amount.toFixed(2)} — by John Admin`,
            },
            ...prev,
        ]);
        setNextId((n) => n + 1);
        setFlash(`Raincheck ${id} for $${amount.toFixed(2)} issued to ${recipient.name}.`);

        // Move on to whatever is still owed a credit, rather than leaving the
        // operator parked on a row that can no longer do anything.
        const next = positions.find((p) => p.id !== selected.id && !p.issued);
        if (next) {
            setSelectedId(next.id);
            setRecipientId(next.id);
            setHolesPlayed(5);
        }
    };

    const voidCredit = (positionId: string, reason: string) => {
        const target = positions.find((p) => p.id === positionId);
        if (!target?.issued) return;
        const { raincheckId, amount, to } = target.issued;

        // The credit is cancelled and the round comes back — that is the whole
        // point. Nothing is deleted: the ledger keeps it, and so does the log.
        setPositions((prev) => prev.map((p) => (p.id === positionId ? { ...p, issued: undefined } : p)));
        setLog((prev) => [
            { at: "7/20/2026 2:52 PM", what: `Raincheck ${raincheckId} (${usd(amount)} to ${to}) voided — ${reason} — by John Admin` },
            ...prev,
        ]);
        setSelectedId(positionId);
        setRecipientId(positionId);
        setFlash(`Raincheck ${raincheckId} voided. ${target.name}'s round can be rainchecked again.`);
    };

    return (
        <Frame onIssue={issue} canIssue={canIssue}>
            <Stack sx={{ height: "100%", minHeight: 0 }}>
                {flash && (
                    <Stack direction="row" sx={{ alignItems: "center", gap: 1, bgcolor: "#E7F3EA", px: 3, py: 1.25 }}>
                        <CheckCircleIcon sx={{ fontSize: 20, color: appColors.greenTee }} />
                        <Typography sx={{ fontSize: 16, color: appColors.greenTee }}>{flash}</Typography>
                    </Stack>
                )}
                <Box sx={{ flex: 1, minHeight: 0 }}>
                    <ReservationRaincheck
                        heading={foursomeHeading}
                        positions={positions}
                        selectedId={selected.id}
                        onSelect={(id) => {
                            setSelectedId(id);
                            // Recipient follows the round unless it has been
                            // changed — "it defaults to that player".
                            setRecipientId(id);
                            setFlash(null);
                        }}
                        recipientId={recipient.id}
                        onRecipient={setRecipientId}
                        holesPlayed={holesPlayed}
                        onHolesPlayed={setHolesPlayed}
                        onVoid={voidCredit}
                        log={log}
                    />
                </Box>
            </Stack>
        </Frame>
    );
};

/**
 * **Live.** A foursome, arrived at by tapping Raincheck on Weston Farnsworth.
 *
 * His round is selected and his account is the recipient, so the sentence reads
 * "…to Weston Farnsworth for their own round." Justin Girard's row is greyed —
 * already credited at 2:30 PM — and cannot be selected. The log underneath says
 * so again in full.
 *
 * Move the slider; switch rounds; then change the recipient and watch the
 * sentence change with it.
 *
 * Issue one, and the new row gains a **VOID** control — cancelling it releases
 * the round and writes a line into the history. Justin Girard's credit cannot be
 * voided: $72.22 of it has already been spent, so the row says so and the
 * control is dead. At that point it is a refund question, not a correction.
 */
export const Default: Story = {
    name: "Foursome, one already issued",
    render: () => <Concept seed={foursome} startAt="10314910" />,
};

/**
 * The case the feature exists for.
 *
 * > *"let's say you're my buddy and you're playing the course and you're never
 * > going to come back — you're visiting. And they're like, oh, just issue the
 * > raincheck to me, so that I have both of them."*
 *
 * Tom Watson's round is being refunded, but the credit goes on Weston
 * Farnsworth's account. Two things say so that the shipping screen does not: the
 * line under the picker, and the sentence.
 *
 * Note also that Tom's round is nine holes, so the radios stop at 8 and each
 * hole is worth a ninth — a detail the shipping screen shows but never explains.
 */
export const OnBehalf: Story = {
    name: "Issuing to somebody else's account",
    render: () => <Concept seed={foursome} startAt="10314913" startRecipient="10314910" />,
};

/**
 * A credit that can still be taken back.
 *
 * Oda Brennevin's round was rainchecked twenty minutes ago and none of it has
 * been spent, so the row carries a live **VOID**. Pressing it asks why — the
 * reason is required, because the correction worth counting is *issued to the
 * wrong player*, and a blank text field would lose it.
 *
 * Voiding releases the round: it becomes selectable again, gets picked up as the
 * next thing to issue, and the history keeps both the issue and the void.
 * Nothing is deleted. Compare Justin Girard's row, where the money has already
 * gone and the control is dead.
 */
export const Voidable: Story = {
    name: "Voiding a credit",
    render: () => (
        <Concept
            seed={foursome.map((p) =>
                p.id === "10314912" ? { ...p, issued: { raincheckId: "51379", amount: 39.78, at: "2:41 PM", to: "Oda Brennevin" } } : p,
            )}
            startAt="10314910"
        />
    ),
};

/**
 * A reservation where every round has already been credited.
 *
 * Nothing is selectable, the log holds four lines, and the screen's job is
 * simply to say so. The shipping screen has no way to represent this at all — it
 * would let you issue a second credit against a round that already has one.
 */
export const AllIssued: Story = {
    name: "Nothing left to issue",
    render: () => {
        const spent = foursome.map((p, i) => ({
            ...p,
            issued: p.issued ?? {
                raincheckId: String(51380 + i),
                amount: [72.22, 72.22, 39.78, 20.27][i],
                at: `2:3${i} PM`,
                to: p.name,
            },
        }));
        return (
            <Frame canIssue={false}>
                <ReservationRaincheck
                    heading={foursomeHeading}
                    positions={spent}
                    selectedId="10314910"
                    recipientId="10314910"
                    holesPlayed={5}
                    log={spent.map((p) => ({
                        at: `7/20/2026 ${p.issued!.at}`,
                        what: `${p.name} was issued raincheck ${p.issued!.raincheckId} for $${p.issued!.amount.toFixed(2)} — by John Admin`,
                    }))}
                />
            </Frame>
        );
    },
};

/**
 * A single-player reservation, for scale.
 *
 * The same screen with one row. Worth checking that the layout does not look
 * broken when the "which round" question has only one possible answer — most
 * bookings are one or two positions, not four.
 */
export const SinglePlayer: Story = {
    name: "One player",
    render: () => <Concept seed={[foursome[0]]} startAt="10314910" />,
};
