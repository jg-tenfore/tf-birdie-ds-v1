import { useState } from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CheckIcon from "@mui/icons-material/Check";
import GridViewIcon from "@mui/icons-material/GridView";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { useNavigate } from "react-router-dom";

import { MobileActionArea, MobileBottomNav, MobilePrimary, MobileSecondary, MobileSecondaryRow } from "@/components/mobile/mobile-shell";
import { MobileRow, MobileSearch } from "@/components/mobile/mobile-parts";
import { appColors } from "@/theme/app-replica-tokens";
import { assetUrl } from "@/utils/asset-url";
import { combos, comboLines, type Combo } from "../../screens/combos";
import { money, useActions, useStore } from "../../store";
import { LiveMobileOrder, MobileShell } from "../mobile-shell";

/**
 * Combos, on a phone.
 *
 * A combo is a saved bundle: tapping one rings up **every component line at
 * once** rather than adding a single item at the combo price, and each
 * component lands prefixed `[c]` so staff can see it came from a bundle. That
 * is the terminal's `ring()` verbatim — the same loop, the same `addItem`, the
 * same prefix — because the whole value of the phone build is that a sale rung
 * up here is the same object as one rung up on the counter.
 *
 * ## What changes from the terminal
 *
 * **The 4-column tile grid becomes a list.** `repeat(4, 1fr)` at 402px is 100px
 * a tile, and each tile is a 56px mark beside a two-line name. The list keeps
 * the mark at 44dp and gives the price its own scannable column.
 *
 * **The order panel becomes a destination**, as it does on every selling screen
 * here — *Combos* and *Order* in the bottom nav, with the item count riding on
 * the Order tab.
 *
 * **The component count moves onto the row.** The terminal shows only the name
 * and the bundle price, and you find out how many lines it rings when it rings
 * them. There is room on a 64dp row for `3 lines · $17.52`, and knowing before
 * you tap matters more on a device you are holding in one hand.
 *
 * ## The bad data is kept
 *
 * `$0.00` bundles, `test1`, two `Sandhill Test` rows and a `$100,000` typo. Those
 * are what the screen looks like in production, and tidying them would hide the
 * fact that combo maintenance is where this data goes wrong.
 */

/** The mark every combo shows in place of a product photo. */
const COMBO_MARK = assetUrl("logos/tf-square-black.svg");

const navFor = (count: number) => [
    { key: "combos", label: "Combos", icon: <GridViewIcon sx={{ fontSize: 20 }} /> },
    { key: "order", label: count > 0 ? `Order · ${count}` : "Order", icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} /> },
];

export const MobileCombosScreen = () => {
    const { lines, total } = useStore();
    const { addItem, holdTicket, toast } = useActions();
    const navigate = useNavigate();

    const [tab, setTab] = useState<"combos" | "order">("combos");
    const [query, setQuery] = useState("");

    const count = lines.reduce((s, l) => s + l.qty, 0);
    const q = query.trim().toLowerCase();
    const rows = q ? combos.filter((c) => c.name.toLowerCase().includes(q)) : combos;

    const ring = (combo: Combo) => {
        for (const line of comboLines(combo)) {
            for (let n = 0; n < line.qty; n += 1) {
                // `[c]` marks a component of a bundle on the order.
                addItem(
                    { id: `${combo.id}-${line.name}`, name: `[c] ${line.name}`, price: line.price / line.qty, image: line.image },
                    "Pro Shop",
                );
            }
        }
        toast(`${combo.name} rung up`);
    };

    return (
        <MobileShell
            title="Combos"
            active="proshop"
            leading="back"
            showOverflow={false}
            actions={
                lines.length > 0 ? (
                    <MobileActionArea>
                        <MobileSecondaryRow>
                            <MobileSecondary onClick={() => holdTicket()}>Hold</MobileSecondary>
                            <MobileSecondary onClick={() => navigate("/proshop")}>Add items</MobileSecondary>
                        </MobileSecondaryRow>
                        <MobilePrimary icon={<CheckIcon sx={{ fontSize: 20 }} />} onClick={() => navigate("/pay")}>
                            Pay {money(total)}
                        </MobilePrimary>
                    </MobileActionArea>
                ) : undefined
            }
            bottomNav={<MobileBottomNav items={navFor(count)} active={tab} onChange={(k) => setTab(k as "combos" | "order")} />}
        >
            {tab === "order" ? (
                <LiveMobileOrder />
            ) : (
                <>
                    <MobileSearch placeholder="Search combos" value={query} onChange={setQuery} />

                    {rows.length === 0 ? (
                        <Typography sx={{ px: 1.5, py: 3, fontSize: 15, color: appColors.textSecondary }}>
                            No combo matches &ldquo;{query.trim()}&rdquo;.
                        </Typography>
                    ) : (
                        rows.map((combo) => {
                            const parts = comboLines(combo);
                            return (
                                <MobileRow
                                    key={combo.id}
                                    title={combo.name}
                                    subtitle={`${parts.length} ${parts.length === 1 ? "line" : "lines"}`}
                                    price={combo.price}
                                    image={COMBO_MARK}
                                    onClick={() => ring(combo)}
                                />
                            );
                        })
                    )}

                    <Box sx={{ height: 8 }} />
                </>
            )}
        </MobileShell>
    );
};
