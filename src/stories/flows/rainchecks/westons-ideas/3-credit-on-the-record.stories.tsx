import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "@/components/app-chrome/app-shell";
import { RaincheckDetail } from "@/components/concepts/rainchecks/raincheck-detail";
import { CustomerRecordPanel } from "@/components/screens/operations/customer-record";
import { AddCustomerAction, RecordActionBar } from "@/components/screens/operations/customer-search-chrome";
import { customers } from "@/data/crm";
import { rainchecks, type Raincheck } from "@/data/rainchecks";
import { bookingsForCustomer, may12Sheet, todaySheet } from "@/data/tee-sheet";

/**
 * **Concept — the customer profile, with credits you can open.**
 *
 * The record already lists rainchecks. It cannot answer the question a counter
 * is actually asked, which is almost always about *one* of them: where did this
 * come from, what has it paid for, why is it worth nothing — and when it was cut
 * wrong, can you take it back.
 *
 * So the rows open. Tapping one brings up the credit in full: the round behind
 * it, the money, every draw against it, and the void record if it has one.
 *
 * **Voiding belongs here as much as on the issue screen, and arguably more.**
 * The argument happens at the counter with the customer standing there — "that
 * was supposed to be on my account" — and the person who can fix it is looking
 * at this record. Sending them to find the reservation first is a detour through
 * a screen they do not need. The same rule holds: spend any of it and the void
 * is gone, because the money has left and it is a refund question.
 *
 * Void is two taps here rather than one. The record is a browsing screen and
 * this is the only thing on it that destroys value.
 *
 * Compare **2 — Create raincheck**, where voiding is reached from the
 * round instead of from the person.
 */
const meta = {
    title: "Flows/Rainchecks/Weston's ideas/3 — The credit on the record",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const SHEETS = { "2026-05-12": may12Sheet, "2026-07-29": todaySheet };
const weston = customers.find((c) => c.displayName === "Weston Senior")!;
const westonBooked = bookingsForCustomer(weston.id, SHEETS);
const seed = rainchecks.filter((r) => r.customerId === weston.id);

const Profile = ({ startCollapsed, readOnly }: { startCollapsed?: boolean; readOnly?: boolean }) => {
    const [credits, setCredits] = useState<Raincheck[]>(seed);
    const [openId, setOpenId] = useState<string | null>(null);

    const open = credits.find((c) => c.id === openId) ?? null;

    return (
        <AppShell title="Customer Search" active="customersearch" topBarRight={AddCustomerAction} actionBar={RecordActionBar}>
            <CustomerRecordPanel
                customer={weston}
                rainchecks={credits}
                booked={westonBooked}
                startCollapsed={startCollapsed}
                onSelectRaincheck={setOpenId}
            />
            <RaincheckDetail
                credit={open}
                onClose={() => setOpenId(null)}
                onVoid={
                    readOnly
                        ? undefined
                        : (id, reason) => {
                              // Nothing is removed. The credit stays in the
                              // ledger, stops counting as owed, and the round it
                              // came from is free again.
                              setCredits((prev) =>
                                  prev.map((c) =>
                                      c.id === id ? { ...c, voided: { at: "8/19/2026 3:14 PM", by: "John Admin", reason } } : c,
                                  ),
                              );
                              setOpenId(null);
                          }
                }
            />
        </AppShell>
    );
};

/**
 * **Live.** Open the Rain Checks section and tap any row.
 *
 * Five credits in five states. `41331` and `51381` are clean and can be voided.
 * `38204` has $54.00 spent against it, so the sheet explains why the void is
 * gone. `29115` is spent out and `51379` is already voided, showing who did it
 * and why.
 *
 * Void one and watch the section bar drop — a voided credit stops being money
 * the course owes.
 */
export const Default: Story = {
    name: "Credits you can open",
    render: () => <Profile />,
};

/**
 * The record as it should arrive, every section shut.
 *
 * `Rain Checks $190.88` answers the question without opening anything; the rows
 * are there when the answer needs to be about one credit rather than the total.
 */
export const Collapsed: Story = {
    name: "Collapsed",
    render: () => <Profile startCollapsed />,
};

/**
 * The same sheet without the void.
 *
 * Worth keeping as a comparison: if voiding turns out to need a manager, this is
 * what a counter operator sees — every fact about the credit, and no way to act
 * on it.
 */
export const ReadOnly: Story = {
    name: "Details only, no void",
    render: () => <Profile readOnly />,
};
