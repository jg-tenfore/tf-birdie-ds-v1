import { useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { appColors } from "@/theme/app-replica-tokens";
import { formatMoney, type TransactionOrder } from "../refund-data";
import type { RefundCommit } from "./refund-commit";
import { emptyLedger, type RefundLedger } from "./refund-ledger";
import {
    ItemSelectRow,
    ModalFooter,
    ReasonPicker,
    RefundComplete,
    RefundModal,
    RefundTotals,
    SectionLabel,
    SelectAllRow,
    ShortfallNote,
    TenderSplit,
} from "./refund-modal-parts";
import { useRefundDraft, type RefundDraftSeed } from "./use-refund-draft";

/**
 * **Issue refund — the chosen design, Oct 8.**
 *
 * Option A with Weston's notes applied: no ITEMS / AMOUNT tabs, one total
 * rather than three, no Cancel beside the X, BACK on the confirmation — and,
 * new, an order that can be refunded more than once.
 *
 * The shape is unchanged and is the reason it won: **everything that decides
 * the money is on one surface.** Items left, destination and reason right, the
 * running total in the footer, and a confirmation that adds no new decisions.
 *
 * What a second refund changes, all of it visible rather than enforced in the
 * background:
 *
 * - lines already refunded hold their place, greyed, chipped and unselectable;
 * - a line partly refunded says so and its stepper is capped at the remainder;
 * - a tender that has given back everything it took is greyed with *"already
 *   refunded in full"*, so the only live destination is the one with money left
 *   — Weston's cash-then-gift-card case;
 * - with nothing left at all, the modal says so and offers no way on.
 */
export const RefundModalScreen = ({
    order,
    reversalOrderId,
    ledger = emptyLedger,
    onClose,
    onCommitted,
    seed,
    openAt = "compose",
}: {
    order: TransactionOrder;
    reversalOrderId: string;
    /** What earlier refunds already took off this order. */
    ledger?: RefundLedger;
    onClose?: () => void;
    /** Fires the moment the refund commits, carrying what was refunded. */
    onCommitted?: (commit: RefundCommit) => void;
    /** Stories open the modal in the state they are about; the rest is live. */
    seed?: RefundDraftSeed;
    openAt?: "compose" | "confirm" | "done";
}) => {
    const draft = useRefundDraft(order, seed, ledger);
    const [stage, setStage] = useState<"compose" | "confirm" | "done">(openAt);

    if (stage === "done") {
        return (
            <RefundModal title="Refund complete" onClose={onClose}>
                <RefundComplete
                    total={draft.breakdown.total}
                    allocations={draft.allocations}
                    reversalOrderId={reversalOrderId}
                    onDone={onClose}
                />
            </RefundModal>
        );
    }

    if (stage === "confirm") {
        const selected = draft.lines.filter((line) => line.quantity > 0);

        return (
            <RefundModal
                title="Confirm refund"
                caption={`Order #${order.orderId}`}
                onClose={onClose}
                width={1000}
                padBody={false}
                footer={
                    <ModalFooter
                        total={draft.breakdown.total}
                        hint="This creates a reversal order"
                        primaryLabel={`Refund ${formatMoney(draft.breakdown.total)}`}
                        committing
                        onPrimary={() => {
                            onCommitted?.({
                                total: draft.breakdown.total,
                                allocations: draft.allocations,
                                lines: selected,
                            });
                            setStage("done");
                        }}
                        onBack={() => setStage("compose")}
                    />
                }
            >
                {/* Same two columns as the compose pane, so confirming is a
                    reading of the screen just left rather than a new layout to
                    parse under time pressure. */}
                <Box sx={{ height: "100%", display: "flex", minHeight: 0 }}>
                    <Box sx={{ flex: 1, minWidth: 0, overflowY: "auto", px: 2, py: 2 }}>
                        <SectionLabel>Going back</SectionLabel>
                        {selected.map((line) => (
                            <Box
                                key={line.name}
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    minHeight: 44,
                                    alignItems: "center",
                                    px: 1.25,
                                    borderBottom: "1px solid",
                                    borderColor: appColors.divider,
                                }}
                            >
                                <Typography sx={{ fontSize: 15, color: appColors.textPrimary }}>
                                    {line.name}
                                    {line.refundableQuantity > 1 && (
                                        <Typography component="span" sx={{ fontSize: 13, color: appColors.textSecondary }}>
                                            {"  "}
                                            {line.quantity} of {line.refundableQuantity}
                                        </Typography>
                                    )}
                                </Typography>
                                <Typography sx={{ fontSize: 15, color: appColors.textPrimary }}>
                                    {formatMoney((line.linePrice / line.soldQuantity) * line.quantity)}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    <Box
                        sx={{
                            width: 380,
                            flexShrink: 0,
                            minHeight: 0,
                            display: "flex",
                            flexDirection: "column",
                            borderLeft: "1px solid",
                            borderColor: appColors.divider,
                        }}
                    >
                        <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", py: 2 }}>
                            <SectionLabel>Going to</SectionLabel>
                            {draft.allocations.map((allocation) => (
                                <Box
                                    key={allocation.method}
                                    sx={{
                                        display: "flex",
                                        justifyContent: "space-between",
                                        minHeight: 44,
                                        alignItems: "center",
                                        px: 1.25,
                                        borderBottom: "1px solid",
                                        borderColor: appColors.divider,
                                    }}
                                >
                                    <Typography sx={{ fontSize: 15, color: appColors.textPrimary }}>{allocation.method}</Typography>
                                    <Typography sx={{ fontSize: 15, color: appColors.textPrimary }}>
                                        {formatMoney(allocation.amount)}
                                    </Typography>
                                </Box>
                            ))}

                            <Box sx={{ mt: 2 }}>
                                <SectionLabel>Reason</SectionLabel>
                                <Typography sx={{ px: 1.25, py: 1, fontSize: 15, color: appColors.textPrimary }}>
                                    {draft.reason}
                                    {draft.reason === "Other" && draft.note ? ` — ${draft.note}` : ""}
                                </Typography>
                            </Box>
                        </Box>

                        {/*
                         * The breakdown lives here and nowhere else. On an order
                         * carrying tax these are three different numbers, and
                         * this is the screen where they are read rather than
                         * watched changing.
                         */}
                        <Box
                            sx={{
                                flexShrink: 0,
                                px: 2,
                                py: 2,
                                bgcolor: appColors.canvas,
                                borderTop: "1px solid",
                                borderColor: appColors.divider,
                            }}
                        >
                            <RefundTotals breakdown={draft.breakdown} dense />
                        </Box>
                    </Box>
                </Box>
            </RefundModal>
        );
    }

    return (
        <RefundModal
            title="Issue refund"
            caption={`Order #${order.orderId} · ${formatMoney(order.total)}`}
            onClose={onClose}
            width={1000}
            padBody={false}
            footer={
                <ModalFooter
                    total={draft.breakdown.total}
                    hint={draft.blockerShort ?? "Ready to review"}
                    primaryLabel="Review refund"
                    primaryDisabled={!draft.isComplete}
                    onPrimary={() => setStage("confirm")}
                />
            }
        >
            <Box sx={{ height: "100%", display: "flex", minHeight: 0 }}>
                {/* The basket, starting at the top of the pane now that the
                    tabs are gone. */}
                <Box sx={{ flex: 1, minWidth: 0, overflowY: "auto", px: 2, py: 2 }}>
                    <SelectAllRow
                        checked={draft.allSelected}
                        indeterminate={!draft.allSelected && draft.someSelected}
                        onToggle={draft.toggleAll}
                    />
                    {draft.lines.map((line) => (
                        <ItemSelectRow
                            key={line.name}
                            line={line}
                            amount={(line.linePrice / line.soldQuantity) * line.quantity}
                            onToggle={() => draft.toggleLine(line.name)}
                            onQuantityChange={(next) => draft.setLineQuantity(line.name, next)}
                        />
                    ))}

                    {draft.nothingLeft && (
                        <Typography sx={{ px: 1.25, py: 2, fontSize: 15, color: appColors.textSecondary }}>
                            Every line on this order has been refunded. There is nothing left to return.
                        </Typography>
                    )}
                </Box>

                <Box
                    sx={{
                        width: 380,
                        flexShrink: 0,
                        minHeight: 0,
                        display: "flex",
                        flexDirection: "column",
                        borderLeft: "1px solid",
                        borderColor: appColors.divider,
                        bgcolor: appColors.surface,
                    }}
                >
                    <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", py: 2, display: "flex", flexDirection: "column", gap: 2.5 }}>
                        <Box>
                            <TenderSplit
                                payments={order.payments}
                                selected={draft.selectedTenders}
                                allocations={draft.allocations}
                                ledger={ledger}
                                onToggle={draft.toggleTender}
                            />
                            {draft.shortfall && draft.breakdown.total > 0 && <ShortfallNote message={draft.shortfall} />}
                        </Box>

                        <ReasonPicker value={draft.reason} note={draft.note} onChange={draft.setReason} onNoteChange={draft.setNote} />
                    </Box>
                </Box>
            </Box>
        </RefundModal>
    );
};

export default RefundModalScreen;
