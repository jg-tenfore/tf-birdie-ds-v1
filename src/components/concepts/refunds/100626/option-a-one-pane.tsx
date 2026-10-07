import { useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import { fontSize, neutral, radius } from "@/theme/tokens";
import { formatMoney, type TransactionOrder } from "../refund-data";
import {
    AmountPane,
    ItemSelectRow,
    ModalFooter,
    ReasonPicker,
    RefundComplete,
    RefundModal,
    RefundTotals,
    ScopeTabs,
    SectionLabel,
    SelectAllRow,
    ShortfallNote,
    TenderSplit,
} from "./refund-modal-parts";
import { useRefundDraft, type RefundDraftSeed } from "./use-refund-draft";

/**
 * **Option A — one pane, then confirm.**
 *
 * Everything the refund needs is on one surface: what goes back, where it goes,
 * why. Nothing is behind a Next, so the running total at the bottom left is true
 * the whole time and the tender split is visible while the basket is still being
 * chosen — the two facts the shipping screen withholds.
 *
 * The second surface is a **confirmation, not a step**: it adds no new
 * decisions, it restates the ones made, and it is the only place the red
 * committing button appears. That split matters — the current screen's reason
 * dialog looks like a confirmation and confirms nothing.
 *
 * The cost of this shape: at six lines plus two tenders the pane scrolls, and
 * the operator is reading a denser surface than Option B asks for. The benefit
 * is that a whole-order refund — the common case — is *select all → reason →
 * review → refund*, four taps, with the amount in view from the first one.
 */
export const OptionAOnePane = ({
    order,
    reversalOrderId,
    onClose,
    seed,
    openAt = "compose",
}: {
    order: TransactionOrder;
    reversalOrderId: string;
    onClose?: () => void;
    /** Stories open the modal in the state they are about; the rest is live. */
    seed?: RefundDraftSeed;
    openAt?: "compose" | "confirm" | "done";
}) => {
    const draft = useRefundDraft(order, seed);
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
                footer={
                    <ModalFooter
                        total={draft.breakdown.total}
                        hint="This creates a reversal order"
                        primaryLabel={`Refund ${formatMoney(draft.breakdown.total)}`}
                        committing
                        onPrimary={() => setStage("done")}
                        onCancel={() => setStage("compose")}
                    />
                }
            >
                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <Box>
                        <SectionLabel>Going back</SectionLabel>
                        {draft.scope === "amount" ? (
                            <Typography sx={{ fontSize: fontSize.body1 }}>
                                {formatMoney(draft.breakdown.total)} as an amount — no items returned to inventory
                            </Typography>
                        ) : (
                            selected.map((line) => (
                                <Box key={line.name} sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                                    <Typography sx={{ fontSize: fontSize.body1 }}>
                                        {line.name}
                                        {line.soldQuantity > 1 && (
                                            <Typography component="span" sx={{ fontSize: fontSize.body2, color: "text.secondary" }}>
                                                {"  "}
                                                {line.quantity} of {line.soldQuantity}
                                            </Typography>
                                        )}
                                    </Typography>
                                    <Typography sx={{ fontSize: fontSize.body1, fontVariantNumeric: "tabular-nums" }}>
                                        {formatMoney((line.linePrice / line.soldQuantity) * line.quantity)}
                                    </Typography>
                                </Box>
                            ))
                        )}
                    </Box>

                    <Box sx={{ p: 2, bgcolor: neutral[50], borderRadius: `${radius.md}px` }}>
                        <RefundTotals breakdown={draft.breakdown} dense />
                    </Box>

                    <Box>
                        <SectionLabel>Going to</SectionLabel>
                        {draft.allocations.map((allocation) => (
                            <Box key={allocation.method} sx={{ display: "flex", justifyContent: "space-between", py: 0.5 }}>
                                <Typography sx={{ fontSize: fontSize.body1 }}>{allocation.method}</Typography>
                                <Typography sx={{ fontSize: fontSize.body1, fontVariantNumeric: "tabular-nums" }}>
                                    {formatMoney(allocation.amount)}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    <Box>
                        <SectionLabel>Reason</SectionLabel>
                        <Typography sx={{ fontSize: fontSize.body1 }}>
                            {draft.reason}
                            {draft.reason === "Other" && draft.note ? ` — ${draft.note}` : ""}
                        </Typography>
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
                    onCancel={onClose}
                />
            }
        >
            {/*
             * Two columns, because the device is width-rich and height-poor: a
             * single stacked pane puts the tender split below the fold on a
             * six-line order, which is the one thing this redesign exists to
             * show. The basket scrolls; the money never does.
             */}
            <Box sx={{ height: "100%", display: "flex", minHeight: 0 }}>
                <Box sx={{ flex: 1, minWidth: 0, overflowY: "auto", px: 3, py: 2.5 }}>
                    <ScopeTabs value={draft.scope} onChange={draft.setScope} />

                    {draft.scope === "items" ? (
                        <Box>
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
                        </Box>
                    ) : (
                        <AmountPane value={draft.amountText} refundable={order.total} onChange={draft.setAmountText} />
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
                        borderColor: "divider",
                        bgcolor: neutral[25],
                    }}
                >
                    {/* Destination and reason scroll if they must; the totals
                        never do — a figure the operator has to scroll to find is
                        the failure this redesign started from. */}
                    <Box
                        sx={{ flex: 1, minHeight: 0, overflowY: "auto", px: 3, py: 2, display: "flex", flexDirection: "column", gap: 2.5 }}
                    >
                        <Box>
                            <TenderSplit
                                payments={order.payments}
                                selected={draft.selectedTenders}
                                allocations={draft.allocations}
                                onToggle={draft.toggleTender}
                            />
                            {draft.shortfall && draft.breakdown.total > 0 && <ShortfallNote message={draft.shortfall} />}
                        </Box>

                        <ReasonPicker value={draft.reason} note={draft.note} onChange={draft.setReason} onNoteChange={draft.setNote} />
                    </Box>

                    <Box sx={{ flexShrink: 0, px: 3, py: 2, borderTop: "1px solid", borderColor: "divider" }}>
                        <RefundTotals breakdown={draft.breakdown} dense />
                    </Box>
                </Box>
            </Box>
        </RefundModal>
    );
};

export default OptionAOnePane;
