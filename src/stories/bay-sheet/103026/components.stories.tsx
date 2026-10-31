import { useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { appColors } from "@/theme/app-replica-tokens";
import { bayCustomers, feeFor, seedBlocks, seedReservations, type RepeatFreq } from "@/components/concepts/bay-sheet/103026/bay-data";
import { BlockChip, ReservationChip, SheetLegend, StatusPill } from "@/components/concepts/bay-sheet/103026/bay-sheet-parts";
import {
    BayPicker,
    ConfirmationToggle,
    ConflictWarning,
    CustomerPicker,
    FeePanel,
    LimitWarning,
    RepeatPicker,
    Stepper,
} from "@/components/concepts/bay-sheet/103026/bay-form-parts";

/**
 * **The parts the bay sheet is built from**, on their own.
 *
 * Every one of them is live. The chips are shown at the heights the sheet
 * actually draws them, because their whole design is that they read their own
 * height and decide what to say.
 */
const meta = {
    title: "Bay Sheet Oct 30/Components",
    parameters: { layout: "padded", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Row = ({ label, children, width = 460 }: { label: string; children: React.ReactNode; width?: number }) => (
    <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: 13, letterSpacing: "0.08em", color: appColors.textSecondary, mb: 1 }}>{label}</Typography>
        <Box sx={{ maxWidth: width }}>{children}</Box>
    </Box>
);

/**
 * **The reservation chip, at every height the sheet draws it.**
 *
 * This is requirements 2, 3 and 4 in about 149px of column width — the player,
 * the duration, the party size, checked-in, paid, the open-tab indicator and
 * the note, all at once.
 *
 * The answer is that **only the name and the duration are words.** Everything
 * else is a mark. And the chip reads its own height:
 *
 * - **30 minutes** — one line. The name wins; the marks ride beside it.
 * - **60 minutes** — the duration and party size appear.
 * - **120 minutes** — the note becomes text instead of a glyph.
 *
 * The last two are the states that free their time (27): drawn as paper rather
 * than as a booking, struck through for a cancellation, and keeping their
 * status in words because that is the one thing a freed slot needs to say.
 */
export const Chips: Story = {
    name: "Reservation chip",
    render: () => {
        const base = seedReservations[0];
        const samples = [
            { label: "30 minutes — the name only", r: { ...base, duration: 30, note: undefined } },
            { label: "60 minutes — duration and party", r: { ...base, duration: 60 } },
            { label: "60 minutes — checked in, paid, repeating", r: { ...base, duration: 60, repeat: "weekly" as RepeatFreq } },
            { label: "60 minutes — an open tab", r: { ...seedReservations[2], duration: 60 } },
            { label: "120 minutes — the note as text", r: { ...seedReservations[1], duration: 120 } },
            { label: "Cancelled — time given back", r: seedReservations[5] },
            { label: "No-show — time given back", r: seedReservations[4] },
        ];

        return (
            <Box sx={{ bgcolor: appColors.canvas, p: 3 }}>
                <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                    {samples.map(({ label, r }) => (
                        <Box key={label}>
                            <Typography sx={{ fontSize: 13, color: appColors.textSecondary, mb: 0.75, width: 160 }}>{label}</Typography>
                            <Box sx={{ position: "relative", width: 160, height: r.duration * 1.6 + 8 }}>
                                <ReservationChip reservation={{ ...r, start: 8 * 60 }} ppm={1.6} />
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Box>
        );
    },
};

/** The legend that teaches the marks, and the pill the details modal uses. */
export const Marks: Story = {
    name: "Legend and status pill",
    render: () => (
        <Box>
            <Row label="THE LEGEND" width={760}>
                <SheetLegend />
            </Row>
            <Row label="STATUS PILLS">
                <Box sx={{ display: "flex", gap: 1.5 }}>
                    {(["booked", "checkedIn", "cancelled", "noShow"] as const).map((status) => (
                        <StatusPill key={status} reservation={{ ...seedReservations[0], status }} />
                    ))}
                </Box>
            </Row>
        </Box>
    ),
};

/**
 * **A block.** Hatched, labelled, owned by nobody — which is what tells it
 * apart from a reservation at a glance, before you read either.
 */
export const Blocks: Story = {
    name: "Block chip",
    render: () => (
        <Box sx={{ bgcolor: appColors.canvas, p: 3, display: "flex", gap: 3 }}>
            {seedBlocks.map((block) => (
                <Box key={block.id} sx={{ position: "relative", width: 160, height: block.duration * 1.6 + 8 }}>
                    <BlockChip block={{ ...block, start: 8 * 60 }} ppm={1.6} />
                </Box>
            ))}
        </Box>
    ),
};

/**
 * **The controls both dialogs share.**
 *
 * Booking and editing ask the same questions, so they ask them with the same
 * parts; the two screens differ only in what they do with the answers.
 *
 * All live — change the stepper and the fee panel follows.
 */
export const Controls: Story = {
    name: "Booking controls",
    render: function ControlsStory() {
        const [duration, setDuration] = useState(60);
        const [party, setParty] = useState(2);
        const [bayId, setBayId] = useState("green");
        const [repeat, setRepeat] = useState<RepeatFreq>("weekly");
        const [customer, setCustomer] = useState<(typeof bayCustomers)[number] | undefined>(bayCustomers[1]);
        const [usePunch, setUsePunch] = useState(true);
        const [skip, setSkip] = useState(false);

        return (
            <Box sx={{ bgcolor: appColors.canvas, p: 3 }}>
                <Row label="CUSTOMER — REQUIREMENT 6">
                    <CustomerPicker customer={customer} onPick={setCustomer} onClear={() => setCustomer(undefined)} />
                </Row>

                <Row label="DURATION AND PARTY">
                    <Box sx={{ display: "flex", gap: 4 }}>
                        <Stepper
                            value={duration}
                            onChange={setDuration}
                            step={30}
                            min={30}
                            max={300}
                            format={(v) => `${v / 60}h`}
                            label="minutes"
                        />
                        <Stepper value={party} onChange={setParty} min={1} max={12} label="players" />
                    </Box>
                </Row>

                <Row label="BAY — REQUIREMENT 22" width={760}>
                    <BayPicker value={bayId} onChange={setBayId} />
                </Row>

                <Row label="REPEAT — REQUIREMENT 13" width={760}>
                    <RepeatPicker value={repeat} onChange={setRepeat} />
                </Row>

                {/*
                 * Avery has a single punch and the booking needs more than one,
                 * which is the state Weston's open question is about.
                 */}
                <Row label="FEE — REQUIREMENTS 7, 8 AND 23" width={620}>
                    <FeePanel
                        fee={feeFor(customer?.tier ?? "Guest", 10 * 60, duration)}
                        duration={duration}
                        customer={customer}
                        usePunch={usePunch}
                        onUsePunch={setUsePunch}
                    />
                </Row>

                <Row label="CONFIRMATION — REQUIREMENT 12">
                    <ConfirmationToggle skip={skip} onSkip={setSkip} />
                </Row>
            </Box>
        );
    },
};

/**
 * **The two guards, side by side.**
 *
 * They look different on purpose. The overlap is **red with no way past it** —
 * it is physics, and requirement 10 says prevent it. The daily limit is
 * **amber with a switch in it** — it is policy, and requirement 18 says staff
 * can override it.
 *
 * A screen that drew them alike would teach staff to ignore both.
 */
export const Guards: Story = {
    name: "Conflict and limit warnings",
    render: function GuardsStory() {
        const [override, setOverride] = useState(false);

        return (
            <Box sx={{ bgcolor: appColors.canvas, p: 3 }}>
                <Row label="OVERLAP — REQUIREMENT 10. NO OVERRIDE." width={760}>
                    <ConflictWarning conflict={{ kind: "reservation", with: seedReservations[3] }} />
                </Row>
                <Row label="BLOCKED TIME — ALSO REQUIREMENT 10" width={760}>
                    <ConflictWarning conflict={{ kind: "block", with: seedBlocks[0] }} />
                </Row>
                <Row label="DAILY LIMIT — REQUIREMENTS 17 AND 18. OVERRIDABLE." width={760}>
                    <LimitWarning customer={bayCustomers[0]} count={2} override={override} onOverride={setOverride} />
                </Row>
            </Box>
        );
    },
};
