import type { Allocation, SelectedLine } from "./refund-modal-parts";

/**
 * What a committed refund carries back to whatever opened the modal.
 *
 * The journey needs it to write the reversal order honestly: refund the whole
 * basket and the record says $50.58; keep one Bubly Lime and it says $46.46.
 * A prototype whose ending is a fixture teaches the wrong number.
 */
export interface RefundCommit {
    total: number;
    allocations: Allocation[];
    /** Only the lines actually going back, at the quantities chosen. */
    lines: SelectedLine[];
}
