import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import CategoryIcon from "@mui/icons-material/Category";
import PersonIcon from "@mui/icons-material/Person";
import ReplayIcon from "@mui/icons-material/Replay";
import SaveAltIcon from "@mui/icons-material/SaveAlt";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

import { ActionButton } from "@/components/app-chrome/app-shell";
import type { OrderLineItem } from "@/components/app-chrome/order-panel";
import { golfBalls, mens } from "@/data/store-catalog";
import { appColors } from "@/theme/app-replica-tokens";
import { storeImage } from "@/utils/asset-url";

/**
 * Parts shared by the Pro Shop Order stories.
 *
 * Screen context: this is the app's default selling screen. The left panel is
 * the order in progress; the right is a six-across grid of merchandise
 * categories. The bottom bar mixes navigation (TEE SHEET), order operations
 * (RESET, POP, ANONYMOUS, COMBOS) and the tender button in one row, so PAY sits
 * next to RESET with nothing separating them.
 */

export const orderLines: OrderLineItem[] = [
    {
        id: "balls",
        name: "Pro V1 — dozen",
        qty: 1,
        price: "$54.99",
        meta: ["SKU 100482", "6 left"],
        image: storeImage(golfBalls[0]?.path ?? ""),
    },
    {
        id: "polo",
        name: "Bennet Polo — M",
        qty: 1,
        price: "$74.00",
        meta: ["SKU 220913", "2 left"],
        image: storeImage(mens[0]?.path ?? ""),
    },
    { id: "range", name: "Range Balls — Large", qty: 2, price: "$18.00", meta: ["SKU 900110", "24 left"] },
];

/** Subtotal / tax / total block pinned under the line list. */
export const OrderTotals = () => (
    <Box sx={{ borderTop: "1px solid", borderColor: appColors.divider, px: 2, py: 1.5 }}>
        {[
            ["Subtotal", "$146.99"],
            ["Tax", "$8.82"],
        ].map(([label, amount]) => (
            <Stack key={label} direction="row" sx={{ justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{label}</Typography>
                <Typography sx={{ fontSize: 14, color: appColors.textSecondary }}>{amount}</Typography>
            </Stack>
        ))}
        <Stack direction="row" sx={{ justifyContent: "space-between", mt: 1 }}>
            <Typography sx={{ fontSize: 18, fontWeight: 500 }}>Total</Typography>
            <Typography sx={{ fontSize: 18, fontWeight: 500 }}>$155.81</Typography>
        </Stack>
    </Box>
);

/**
 * The bottom bar. PAY is grey until the order has a line on it, which is the
 * only affordance telling staff the order is still empty.
 */
export const ProShopActions = ({ payLabel = "Pay $0.00", payEnabled = false }: { payLabel?: string; payEnabled?: boolean }) => (
    <>
        <ActionButton icon={<CalendarMonthIcon />}>Tee Sheet</ActionButton>
        <ActionButton icon={<ReplayIcon />}>Reset</ActionButton>
        <ActionButton icon={<SaveAltIcon />}>Pop</ActionButton>
        <ActionButton icon={<PersonIcon />}>Anonymous</ActionButton>
        <ActionButton icon={<CategoryIcon />}>Combos</ActionButton>
        <ActionButton icon={<ShoppingCartIcon />} tone={payEnabled ? "primary" : "disabled"}>
            {payLabel}
        </ActionButton>
    </>
);
