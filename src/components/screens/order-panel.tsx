import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import PersonAddAltOutlinedIcon from "@mui/icons-material/PersonAddAltOutlined";
import RemoveIcon from "@mui/icons-material/Remove";
import type { OrderLine } from "@/data/pos-data";
import { TAX_RATE, lineTotal, money, orderSubtotal } from "@/data/pos-data";
import { fontFamily, touchTarget } from "@/theme/tokens";

/**
 * The order panel — the one region that persists across every selling screen.
 *
 * Design decisions worth carrying to Expo:
 *  - Only the line list scrolls. The header (who this is) and the totals (what
 *    they owe) are pinned, because those are the two facts the operator reads
 *    aloud to the guest and neither may ever be scrolled out of view.
 *  - Quantity uses explicit −/+ buttons at 48dp rather than a stepper input. A
 *    numeric field means summoning the keyboard to change a 2 to a 3.
 *  - The total is 34px monospace. It is read upside-down across a counter.
 */

export interface OrderPanelProps {
    lines: OrderLine[];
    ticketNumber?: string;
    guest?: string;
    guests?: number;
    /** Shown when a member is attached — drives the account-charge option. */
    memberTier?: string;
    onQtyChange?: (id: string, delta: number) => void;
    emptyHint?: string;
}

const Row = ({ label, value, isStrong }: { label: string; value: string; isStrong?: boolean }) => (
    <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "baseline" }}>
        <Typography variant={isStrong ? "subtitle1" : "body2"} sx={{ color: isStrong ? "text.primary" : "text.secondary", fontWeight: isStrong ? 700 : 400 }}>
            {label}
        </Typography>
        <Typography
            variant={isStrong ? "h4" : "body2"}
            sx={{ fontFamily: fontFamily.mono, fontVariantNumeric: "tabular-nums" }}
        >
            {value}
        </Typography>
    </Stack>
);

export const OrderPanel = ({
    lines,
    ticketNumber = "#4127",
    guest = "Jordan Ellis",
    guests = 4,
    memberTier,
    onQtyChange,
    emptyHint = "Tap an item to start a ticket.",
}: OrderPanelProps) => {
    const subtotal = orderSubtotal(lines);
    const tax = subtotal * TAX_RATE;

    return (
        <>
            <Box sx={{ p: 2.5, pb: 1.5 }}>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Stack spacing={0.25}>
                        <Typography variant="h6">Ticket {ticketNumber}</Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            {guest} · {guests} {guests === 1 ? "guest" : "guests"}
                            {memberTier ? ` · ${memberTier}` : ""}
                        </Typography>
                    </Stack>
                    <IconButton aria-label="Attach member">
                        <PersonAddAltOutlinedIcon />
                    </IconButton>
                </Stack>
            </Box>

            <Divider />

            <Box sx={{ flex: 1, overflowY: "auto", px: 2.5, py: 1.5, minHeight: 0 }}>
                {lines.length === 0 ? (
                    <Stack sx={{ height: "100%", alignItems: "center", justifyContent: "center", textAlign: "center", px: 2 }}>
                        <Typography variant="body1" sx={{ color: "text.secondary" }}>
                            {emptyHint}
                        </Typography>
                    </Stack>
                ) : (
                    <Stack spacing={2}>
                        {lines.map((line) => (
                            <Stack key={line.id} spacing={1}>
                                <Stack direction="row" spacing={1} sx={{ alignItems: "flex-start" }}>
                                    <Stack sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            {line.name}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                            {money(line.unitPrice)} each{line.note ? ` · ${line.note}` : ""}
                                        </Typography>
                                    </Stack>
                                    <Typography variant="body1" sx={{ fontFamily: fontFamily.mono, fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>
                                        {money(lineTotal(line))}
                                    </Typography>
                                </Stack>

                                <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
                                    <IconButton aria-label={`Decrease ${line.name}`} onClick={() => onQtyChange?.(line.id, -1)} sx={{ border: "1px solid", borderColor: "divider" }}>
                                        <RemoveIcon />
                                    </IconButton>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ minWidth: 40, textAlign: "center", fontFamily: fontFamily.mono, fontWeight: 600 }}
                                    >
                                        {line.qty}
                                    </Typography>
                                    <IconButton aria-label={`Increase ${line.name}`} onClick={() => onQtyChange?.(line.id, 1)} sx={{ border: "1px solid", borderColor: "divider" }}>
                                        <AddIcon />
                                    </IconButton>
                                </Stack>
                            </Stack>
                        ))}
                    </Stack>
                )}
            </Box>

            <Divider />

            <Stack spacing={1} sx={{ p: 2.5 }}>
                <Row label="Subtotal" value={money(subtotal)} />
                <Row label={`Tax (${(TAX_RATE * 100).toFixed(0)}%)`} value={money(tax)} />
                <Box sx={{ pt: 0.5 }}>
                    <Row label="Total" value={money(subtotal + tax)} isStrong />
                </Box>
            </Stack>
        </>
    );
};

/** The standard three-action bar shared by the selling screens. */
export const SellActionBar = ({ total, isDisabled }: { total: number; isDisabled?: boolean }) => (
    <>
        <Button variant="outlined" size="large" disabled={isDisabled}>
            Hold ticket
        </Button>
        <Button variant="outlined" size="large" color="error" disabled={isDisabled}>
            Void
        </Button>
        <Box sx={{ flex: 1 }} />
        <Button size="large" disabled={isDisabled} sx={{ minHeight: touchTarget.large, minWidth: 280, fontSize: 20 }}>
            Charge {money(total)}
        </Button>
    </>
);
