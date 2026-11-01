import { useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { appColors } from "@/theme/app-replica-tokens";
import {
    bayCustomers,
    feeFor,
    fmtDuration,
    seedBlocks,
    seedReservations,
    type RepeatFreq,
} from "@/components/concepts/bay-sheet/103026/bay-data";
import {
    BaySheet,
    BlockChip,
    ChipMarks,
    ReservationChip,
    SheetLegend,
    StatusPill,
} from "@/components/concepts/bay-sheet/103026/bay-sheet-parts";
import {
    BayPicker,
    ConfirmationToggle,
    ConflictWarning,
    CustomerPicker,
    DangerActions,
    FieldRow,
    FieldShell,
    FeePanel,
    InlineActionCard,
    LimitWarning,
    NoteField,
    RepeatPicker,
    SectionTitle,
    SelectField,
    Stepper,
    StepperField,
    TextInputField,
} from "@/components/concepts/bay-sheet/103026/bay-form-parts";
import { DialogFrame, FooterButton } from "@/components/concepts/bay-sheet/103026/bay-dialogs";

/**
 * **Every part the bay sheet is built from, one story each.**
 *
 * The list in the sidebar is the parts list. Reading down it is the whole
 * surface area of the feature: six things that draw the day, twelve that ask a
 * question inside a dialog, and the dialog frame itself.
 *
 * Everything here is live, and everything here is the same code the
 * **Screens**, **End to end** and prototype V2 run — there is no second copy.
 *
 * | # | Component | File | What it is |
 * | --- | --- | --- | --- |
 * | 1 | `BaySheet` | `bay-sheet-parts.tsx` | The grid: bays across, the day down |
 * | 2 | `ReservationChip` | `bay-sheet-parts.tsx` | One booking, reading its own height |
 * | 3 | `BlockChip` | `bay-sheet-parts.tsx` | Time that belongs to nobody |
 * | 4 | `ChipMarks` | `bay-sheet-parts.tsx` | Checked in, paid, tab, repeat, note |
 * | 5 | `StatusPill` | `bay-sheet-parts.tsx` | The same states, in words |
 * | 6 | `SheetLegend` | `bay-sheet-parts.tsx` | What teaches the marks |
 * | 7 | `FieldShell` | `bay-form-parts.tsx` | The bordered box every question sits in |
 * | 8 | `SelectField` | `bay-form-parts.tsx` | A dropdown in that box |
 * | 9 | `BayPicker` | `bay-form-parts.tsx` | `SelectField` over the eight bays |
 * | 10 | `Stepper` | `bay-form-parts.tsx` | Minutes and people, full width |
 * | 11 | `TextInputField` | `bay-form-parts.tsx` | One line of text |
 * | 12 | `NoteField` | `bay-form-parts.tsx` | Six rows of it |
 * | 13 | `CustomerPicker` | `bay-form-parts.tsx` | Search, then the chosen person |
 * | 14 | `RepeatPicker` | `bay-form-parts.tsx` | Five cadences across the width |
 * | 15 | `FeePanel` | `bay-form-parts.tsx` | The money, derived not typed |
 * | 16 | `ConfirmationToggle` | `bay-form-parts.tsx` | Requirement 12's one switch |
 * | 17 | `InlineActionCard` | `bay-form-parts.tsx` | A side errand — open a tab |
 * | 18 | `DangerActions` | `bay-form-parts.tsx` | The irreversible ones, in the body |
 * | 19 | `ConflictWarning` | `bay-form-parts.tsx` | Red. No way past it |
 * | 20 | `LimitWarning` | `bay-form-parts.tsx` | Amber, with a switch |
 * | 21 | `SectionTitle` | `bay-form-parts.tsx` | A heading and its explanation |
 * | 22 | `DialogFrame` | `bay-dialogs.tsx` | Header, scrolling body, two-key footer |
 */
const meta = {
    title: "Bay Sheet Oct 30/Components",
    parameters: { layout: "padded", replica: true },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const Frame = ({ children, width = 560 }: { children: React.ReactNode; width?: number }) => (
    <Box sx={{ bgcolor: appColors.canvas, p: 3 }}>
        <Box sx={{ maxWidth: width }}>{children}</Box>
    </Box>
);

const Caption = ({ children }: { children: React.ReactNode }) => (
    <Typography sx={{ fontSize: 13, letterSpacing: "0.08em", color: appColors.textSecondary, mb: 1, mt: 3, "&:first-of-type": { mt: 0 } }}>
        {children}
    </Typography>
);

/* ------------------------------------------------------- 1–6: the sheet */

/**
 * **1 · `BaySheet`** — bays across the top, the day down the side.
 *
 * Requirement 1 asks for as many bays as possible without scrolling, so the
 * bays are the axis that never scrolls and time is the one that does. Blank
 * time is a target; so is every chip.
 */
export const Sheet: Story = {
    name: "BaySheet",
    render: () => (
        <Box sx={{ height: 520, display: "flex", flexDirection: "column" }}>
            <BaySheet reservations={seedReservations} blocks={seedBlocks} zoom="compact" />
        </Box>
    ),
};

/**
 * **2 · `ReservationChip`**, at every height the sheet draws it.
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
    name: "ReservationChip",
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

/**
 * **3 · `BlockChip`.** Hatched, labelled, owned by nobody — which is what
 * tells it apart from a reservation at a glance, before you read either.
 */
export const Blocks: Story = {
    name: "BlockChip",
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
 * **4 · `ChipMarks`.** Five facts in about 70 pixels.
 *
 * Checked in, paid, an open tab, a repeat and a note. They are marks rather
 * than words because a 149px column has room for a name or for five labels,
 * and the name is the one staff scan for.
 */
export const Marks: Story = {
    name: "ChipMarks",
    render: () => (
        <Frame width={460}>
            {[
                { label: "CHECKED IN AND PAID", r: seedReservations[0] },
                { label: "AN OPEN TAB", r: seedReservations[2] },
                { label: "REPEATING, WITH A NOTE", r: seedReservations[6] },
            ].map(({ label, r }) => (
                <Box key={label} sx={{ mb: 2 }}>
                    <Typography sx={{ fontSize: 13, letterSpacing: "0.08em", color: appColors.textSecondary, mb: 0.5 }}>{label}</Typography>
                    <Box sx={{ display: "flex", gap: 1, bgcolor: appColors.surface, p: 1.5, borderRadius: 1 }}>
                        <ChipMarks reservation={r} size={18} />
                    </Box>
                </Box>
            ))}
        </Frame>
    ),
};

/**
 * **5 · `StatusPill`.** The same four states the chip draws as marks, said in
 * words — because the details dialog has the room and no reason to make you
 * decode anything.
 */
export const Pills: Story = {
    name: "StatusPill",
    render: () => (
        <Frame width={560}>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                {(["booked", "checkedIn", "cancelled", "noShow"] as const).map((status) => (
                    <StatusPill key={status} reservation={{ ...seedReservations[0], status }} />
                ))}
            </Box>
        </Frame>
    ),
};

/**
 * **6 · `SheetLegend`.** The marks, taught once, above the sheet.
 *
 * A legend is an admission that the chips are compressed. It is the right
 * trade at eight bays across a fourteen-hour day — but it is a trade, and
 * worth revisiting if the bay count ever drops.
 */
export const Legend: Story = {
    name: "SheetLegend",
    render: () => (
        <Frame width={880}>
            <SheetLegend />
        </Frame>
    ),
};

/* ------------------------------------------------- 7–12: the field shell */

/**
 * **7 · `FieldShell`** — the box every question in every dialog sits in.
 *
 * Label inside at the top, answer underneath, an optional mark on the right.
 * This is the layout from the reference Justin sent on Nov 1, and it replaced
 * MD2 filled fields throughout the three dialogs.
 *
 * `FieldRow` pairs two of them on a line, which is the only arrangement the
 * dialogs use besides full width.
 */
export const Shell: Story = {
    name: "FieldShell",
    render: () => (
        <Frame width={620}>
            <Caption>FULL WIDTH, WITH A HINT UNDER IT</Caption>
            <FieldShell label="Subscription ends" hint="A hint explains the field without crowding the answer.">
                <Typography sx={{ fontSize: 18, color: appColors.textPrimary }}>Never</Typography>
            </FieldShell>

            <Caption>TWO ACROSS</Caption>
            <FieldRow>
                <FieldShell label="Billing date">
                    <Typography sx={{ fontSize: 18, color: appColors.textPrimary }}>1st of every month</Typography>
                </FieldShell>
                <FieldShell label="Partial cycle billing">
                    <Typography sx={{ fontSize: 18, color: appColors.textPrimary }}>Charge full price</Typography>
                </FieldShell>
            </FieldRow>

            <Caption>THE ERROR TONE</Caption>
            <FieldShell label="Why" tone="error" hint="A block cannot be saved without a reason.">
                <Typography sx={{ fontSize: 18, color: appColors.textSecondary }}>Maintenance, league night, lesson…</Typography>
            </FieldShell>
        </Frame>
    ),
};

/** **8 · `SelectField`** — a dropdown inside the shell, chevron on the right. */
export const Dropdown: Story = {
    name: "SelectField",
    render: function DropdownStory() {
        const [value, setValue] = useState("monthly");

        return (
            <Frame width={620}>
                <SelectField
                    label="Frequency"
                    value={value}
                    onChange={setValue}
                    options={[
                        { value: "weekly", label: "Weekly" },
                        { value: "monthly", label: "Monthly" },
                        { value: "quarterly", label: "Quarterly" },
                        { value: "annual", label: "Annually" },
                    ]}
                />
            </Frame>
        );
    },
};

/**
 * **9 · `BayPicker`** — requirement 22, *"staff can move the reservation to a
 * different bay."*
 *
 * It was eight chips: a row and a half of targets that read as a toolbar. One
 * line that says which bay you are in is smaller and more honest, since the
 * sheet behind the dialog is already showing you the alternatives.
 */
export const Bays: Story = {
    name: "BayPicker",
    render: function BaysStory() {
        const [bayId, setBayId] = useState("teal");

        return (
            <Frame width={620}>
                <BayPicker value={bayId} onChange={setBayId} />
            </Frame>
        );
    },
};

/**
 * **10 · `Stepper`** — one control for both minutes and people, differing
 * only in its step.
 *
 * Full width is how the dialogs use it: the keys go to the ends of the row and
 * the value sits in the middle, which is reachable with either thumb on a
 * tablet held in two hands.
 */
export const Steppers: Story = {
    name: "Stepper",
    render: function SteppersStory() {
        const [duration, setDuration] = useState(90);
        const [party, setParty] = useState(2);

        return (
            <Frame width={620}>
                <Caption>IN A FIELD SHELL, FULL WIDTH — HOW THE DIALOGS USE IT</Caption>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <StepperField
                        label="How long"
                        value={duration}
                        onChange={setDuration}
                        step={30}
                        min={30}
                        max={300}
                        format={fmtDuration}
                        ariaLabel="minutes"
                    />
                    <StepperField label="Party size" value={party} onChange={setParty} min={1} max={12} ariaLabel="players" />
                </Box>

                <Caption>BARE, AT ITS NATURAL WIDTH</Caption>
                <Stepper value={party} onChange={setParty} min={1} max={12} label="players" />
            </Frame>
        );
    },
};

/** **11 · `TextInputField`** — one line. The block's reason is the only one. */
export const TextInput: Story = {
    name: "TextInputField",
    render: function TextInputStory() {
        const [value, setValue] = useState("League night setup");

        return (
            <Frame width={620}>
                <TextInputField label="Why" value={value} onChange={setValue} placeholder="Maintenance, league night, lesson…" />
            </Frame>
        );
    },
};

/**
 * **12 · `NoteField`** — six rows, not two.
 *
 * Requirement 4 puts notes on the sheet itself, so what staff type here is
 * read by everyone all day. *"Birthday — needs the big screen and two extra
 * chairs"* does not fit in two rows, and a field that hides what you wrote
 * invites the shorter, less useful note.
 */
export const Note: Story = {
    name: "NoteField",
    render: function NoteStory() {
        const [value, setValue] = useState("Birthday — needs the big screen and two extra chairs");

        return (
            <Frame width={620}>
                <NoteField value={value} onChange={setValue} />
            </Frame>
        );
    },
};

/* --------------------------------------------- 13–18: the rest of the form */

/**
 * **13 · `CustomerPicker`** — requirement 6.
 *
 * Search `justin` for a punch card, `maya` for a guest with none, `avery` for
 * someone with a single punch left. Weston's open question — *"can staff
 * create a new customer from the booking flow, or book a walk-in without a
 * profile?"* — is unanswered, so neither door is wired.
 */
export const Customer: Story = {
    name: "CustomerPicker",
    render: function CustomerStory() {
        const [customer, setCustomer] = useState<(typeof bayCustomers)[number] | undefined>(bayCustomers[1]);

        return (
            <Frame width={620}>
                <Caption>CHOSEN</Caption>
                <CustomerPicker customer={customer} onPick={setCustomer} onClear={() => setCustomer(undefined)} />

                <Caption>SEARCHING — TYPE A NAME</Caption>
                <CustomerPicker onPick={setCustomer} />
            </Frame>
        );
    },
};

/**
 * **14 · `RepeatPicker`** — requirement 13's four cadences and the *does not
 * repeat* that is the default, flexed across the full width so the five read
 * as one control rather than a drift of chips.
 *
 * Blocks use the same component, because requirement 33 says the rules match
 * and a control that looked different would imply they do not.
 */
export const Repeat: Story = {
    name: "RepeatPicker",
    render: function RepeatStory() {
        const [repeat, setRepeat] = useState<RepeatFreq>("weekly");

        return (
            <Frame width={700}>
                <RepeatPicker
                    value={repeat}
                    onChange={setRepeat}
                    hint="How far ahead a series runs is still to be decided — see the overview."
                />
            </Frame>
        );
    },
};

/**
 * **15 · `FeePanel`** — requirements 7, 8 and 23.
 *
 * The fee is never typed: change who, when, how long or which bay and it
 * recalculates. The punch card sits under it because it does not change the
 * fee, it covers it.
 *
 * Pick **Avery** and push the duration past an hour: she has one punch and the
 * booking needs two, which is exactly Weston's open question — *"what happens
 * if a punch card only covers part of the fee?"* The panel states the
 * shortfall rather than hiding it.
 */
export const Fee: Story = {
    name: "FeePanel",
    render: function FeeStory() {
        const [duration, setDuration] = useState(120);
        const [customer, setCustomer] = useState<(typeof bayCustomers)[number] | undefined>(bayCustomers[1]);
        const [usePunch, setUsePunch] = useState(true);

        return (
            <Frame width={660}>
                <Caption>WHO AND HOW LONG — THE TWO INPUTS THE FEE FOLLOWS</Caption>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 3 }}>
                    <CustomerPicker customer={customer} onPick={setCustomer} onClear={() => setCustomer(undefined)} />
                    <StepperField
                        label="How long"
                        value={duration}
                        onChange={setDuration}
                        step={30}
                        min={30}
                        max={300}
                        format={fmtDuration}
                        ariaLabel="minutes"
                    />
                </Box>

                <FeePanel
                    fee={feeFor(customer?.tier ?? "Guest", 10 * 60, duration)}
                    duration={duration}
                    customer={customer}
                    usePunch={usePunch}
                    onUsePunch={setUsePunch}
                />
            </Frame>
        );
    },
};

/** **16 · `ConfirmationToggle`** — requirement 12, and the one switch that is a decision rather than a warning. */
export const Confirmation: Story = {
    name: "ConfirmationToggle",
    render: function ConfirmationStory() {
        const [skip, setSkip] = useState(false);

        return (
            <Frame width={620}>
                <ConfirmationToggle skip={skip} onSkip={setSkip} />
            </Frame>
        );
    },
};

/**
 * **17 · `InlineActionCard`** — requirement 30's *open a tab*.
 *
 * A side errand rather than an answer to a question, so it is a card with its
 * own key instead of a field. The explanation is load-bearing: moving a fee to
 * a tab changes what the chip says about being paid, and Weston's open
 * question about that state is still open.
 */
export const Inline: Story = {
    name: "InlineActionCard",
    render: () => (
        <Frame width={660}>
            <InlineActionCard
                title="Open a tab"
                description="Moves the bay fee onto a tab so they can add food and drinks and settle at the end."
                actionLabel="OPEN TAB"
            />
        </Frame>
    ),
};

/**
 * **18 · `DangerActions`** — the irreversible ones, in the body of the dialog.
 *
 * They were four red keys in the footer beside SAVE, which made the most
 * destructive things on the screen the most prominent and left the footer
 * unreadable at a glance. Now each is its own outlined button and they flex to
 * fill the width together: available, not recommended.
 */
export const Danger: Story = {
    name: "DangerActions",
    render: () => (
        <Frame width={700}>
            <Caption>A REPEATING RESERVATION — ALL THREE</Caption>
            <DangerActions actions={[{ label: "MARK NO-SHOW" }, { label: "CANCEL THIS ONE" }, { label: "CLEAR SERIES" }]} />

            <Caption>A ONE-OFF — NO SERIES TO CLEAR</Caption>
            <DangerActions actions={[{ label: "MARK NO-SHOW" }, { label: "CANCEL BOOKING" }]} />

            <Caption>A BLOCK</Caption>
            <DangerActions actions={[{ label: "REMOVE THIS ONE" }, { label: "CLEAR SERIES" }]} />
        </Frame>
    ),
};

/* ------------------------------------------------ 19–22: guards and chrome */

/**
 * **19 · `ConflictWarning`** — requirement 10. Red, and there is no way past
 * it: the primary action reads TIME UNAVAILABLE and does nothing.
 *
 * Compare it with the next story. One rule is physics, the other is policy,
 * and a screen that drew them alike would teach staff to ignore both.
 */
export const Conflict: Story = {
    name: "ConflictWarning",
    render: () => (
        <Frame width={760}>
            <Caption>ANOTHER BOOKING HAS IT</Caption>
            <ConflictWarning conflict={{ kind: "reservation", with: seedReservations[3] }} />

            <Caption>A BLOCK HAS IT</Caption>
            <ConflictWarning conflict={{ kind: "block", with: seedBlocks[0] }} />
        </Frame>
    ),
};

/**
 * **20 · `LimitWarning`** — requirements 17 and 18. Amber, **with a switch in
 * it**, because the PRD says staff can override the daily limit and complete
 * the booking.
 *
 * It also states the rule that causes arguments at a counter: a no-show counts
 * toward the limit (29), a cancellation does not.
 */
export const Limit: Story = {
    name: "LimitWarning",
    render: function LimitStory() {
        const [override, setOverride] = useState(false);

        return (
            <Frame width={760}>
                <LimitWarning customer={bayCustomers[0]} count={2} override={override} onOverride={setOverride} />
            </Frame>
        );
    },
};

/** **21 · `SectionTitle`** — a heading and the sentence that explains the group under it. */
export const Headings: Story = {
    name: "SectionTitle",
    render: () => (
        <Frame width={620}>
            <SectionTitle hint="The fee, the punch card and the daily limit all follow from this.">Who it is for</SectionTitle>
            <SectionTitle>Repeat</SectionTitle>
            <SectionTitle hint="A no-show still counts toward the daily limit; a cancellation does not.">
                Remove this reservation
            </SectionTitle>
        </Frame>
    ),
};

/**
 * **22 · `DialogFrame`** — header, scrolling body, and a footer of exactly two
 * keys.
 *
 * The footer carried up to five before Nov 1, four of them red. Cancel and
 * save is the whole of it now; everything destructive lives in the body with
 * the thing it destroys.
 *
 * `tall` holds the dialog open to most of the viewport rather than letting it
 * shrink to its content, so the body does not jump as fields appear and
 * warnings come and go.
 */
export const Chrome: Story = {
    name: "DialogFrame",
    render: function ChromeStory() {
        const [open, setOpen] = useState(true);

        return (
            <Box sx={{ bgcolor: appColors.canvas, p: 3, minHeight: 200 }}>
                <FooterButton grow={0} onClick={() => setOpen(true)}>
                    OPEN THE FRAME
                </FooterButton>

                <DialogFrame
                    open={open}
                    onClose={() => setOpen(false)}
                    title="The frame"
                    subtitle="Teal Bay · 1:00 PM – 2:00 PM"
                    tall={false}
                    width={720}
                    footer={
                        <>
                            <FooterButton grow={0} onClick={() => setOpen(false)}>
                                CANCEL
                            </FooterButton>
                            <FooterButton tone="primary" grow={1} onClick={() => setOpen(false)}>
                                SAVE
                            </FooterButton>
                        </>
                    }
                >
                    <SectionTitle hint="Everything the dialogs ask sits in this column, one bordered field at a time.">
                        The body
                    </SectionTitle>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        <FieldShell label="A field">
                            <Typography sx={{ fontSize: 18, color: appColors.textPrimary }}>Its answer</Typography>
                        </FieldShell>
                        <FieldShell label="Another">
                            <Typography sx={{ fontSize: 18, color: appColors.textPrimary }}>And its answer</Typography>
                        </FieldShell>
                    </Box>
                </DialogFrame>
            </Box>
        );
    },
};
