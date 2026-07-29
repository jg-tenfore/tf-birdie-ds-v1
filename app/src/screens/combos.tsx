import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { foodItems } from "@/data/food-catalog";
import { appColors } from "@/theme/app-replica-tokens";
import { assetUrl, storeImage } from "@/utils/asset-url";
import { LiveOrderPanel, Shell } from "../pos-shell";
import { money, useActions, useStore } from "../store";

/**
 * Combos, reached from the COMBOS button on the Pro Shop bottom bar.
 *
 * A combo is a saved bundle: tapping one rings up every component line at once
 * rather than adding a single item at the combo price. The order panel shows
 * those components individually, each prefixed `[c]` so staff can see they came
 * from a bundle and are not free to be re-priced on their own.
 *
 * The list is deliberately the operator's real one — test rows, $0.00 rows and
 * a $100,000 typo included. Those are what the screen actually looks like in
 * production, and tidying them up would hide the fact that combo maintenance is
 * where this data goes wrong.
 *
 * Layout notes: no category chips and no Scan Mode here, unlike the catalogue.
 * Every tile uses the Tenfore mark because combos carry no image of their own,
 * and long names wrap above the price rather than truncating.
 */

interface ComboLine {
    name: string;
    qty: number;
    /** Extended price for the line as the app shows it, not the unit price. */
    price: number;
    image?: string;
}

export interface Combo {
    id: string;
    name: string;
    price: number;
    lines: ComboLine[];
}

const food = (name: string) => {
    const item = foodItems.find((f) => f.name === name);
    return item ? storeImage(item.path) : undefined;
};

/** The mark every combo tile shows in place of a product photo. */
const COMBO_MARK = assetUrl("logos/tf-square-black.svg");

/**
 * The combos configured on the reference device, in its own order.
 *
 * Only the bundles whose contents are visible in the reference are broken out
 * into components; the rest ring up as a single `[c]` line at the combo price,
 * which is what an un-expanded bundle does.
 */
export const combos: Combo[] = [
    {
        id: "c-6pack",
        name: "6 Pack Combo",
        price: 17.52,
        lines: [
            { name: "Bud Light", qty: 3, price: 5.43, image: food("Bud Light") },
            { name: "Stone IPA", qty: 3, price: 5.43, image: food("Stone IPA") },
            { name: "Gratuity", qty: 1, price: 4.66 },
        ],
    },
    { id: "c-ballsbeers", name: "Balls and Beers", price: 21.96, lines: [] },
    { id: "c-gloveshirt", name: "Glove and Shirt Combo", price: 0, lines: [] },
    { id: "c-teeballs", name: "Tee Fee and Balls", price: 18.3, lines: [] },
    { id: "c-eventfb", name: "Event F&B", price: 41.85, lines: [] },
    { id: "c-sandhill", name: "Sandhill Test", price: 2074, lines: [] },
    { id: "c-sandhill2", name: "Sandhill Test #2", price: 2074, lines: [] },
    { id: "c-test1", name: "test1", price: 0, lines: [] },
    { id: "c-lesson", name: "Lesson Combo", price: 0, lines: [] },
    { id: "c-huge", name: "Huge Combo", price: 948, lines: [] },
    { id: "c-membership", name: "Membership Combo", price: 193.23, lines: [] },
    { id: "c-trackman", name: "Trackman", price: 0, lines: [] },
    { id: "c-shnotes", name: "SH test for Notes", price: 9, lines: [] },
    { id: "c-prov1", name: "Pro V1 Sale", price: 97.2, lines: [] },
    { id: "c-triaxiom", name: "Triaxiom Combo", price: 100000, lines: [] },
    { id: "c-friday", name: "Friday League Combo", price: 40, lines: [] },
];

/** Components a combo rings up, falling back to the bundle itself as one line. */
export const comboLines = (combo: Combo): ComboLine[] => (combo.lines.length ? combo.lines : [{ name: combo.name, qty: 1, price: combo.price }]);

const ComboTile = ({ combo, onAdd }: { combo: Combo; onAdd: () => void }) => (
    <ButtonBase
        onClick={onAdd}
        sx={{
            justifyContent: "flex-start",
            gap: 2,
            px: 2,
            py: 1.5,
            minHeight: 96,
            bgcolor: "#fff",
            // A single hairline under each tile, not a full card border — the
            // grid reads as rows of entries rather than as detached cards.
            borderBottom: "1px solid",
            borderColor: appColors.divider,
            transition: "background-color 100ms linear",
            "&:hover": { bgcolor: appColors.canvas },
        }}
    >
        <Box component="img" src={COMBO_MARK} alt="" sx={{ width: 56, height: 56, flexShrink: 0 }} />
        <Stack sx={{ alignItems: "flex-start", minWidth: 0 }}>
            <Typography sx={{ fontSize: 17, lineHeight: 1.3, textAlign: "left", color: appColors.textPrimary }}>{combo.name}</Typography>
            <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>{money(combo.price)}</Typography>
        </Stack>
    </ButtonBase>
);

export const CombosScreen = () => {
    const { total, lines } = useStore();
    const { addItem } = useActions();
    const navigate = useNavigate();
    const hasLines = lines.length > 0;

    const ring = (combo: Combo) => {
        for (const line of comboLines(combo)) {
            for (let n = 0; n < line.qty; n += 1) {
                // `[c]` marks a component of a bundle in the order panel.
                addItem({ id: `${combo.id}-${line.name}`, name: `[c] ${line.name}`, price: line.price / line.qty, image: line.image }, "Pro Shop");
            }
        }
    };

    return (
        <Shell
            title="Pro Shop Order"
            active="proshop"
            orderPanel={<LiveOrderPanel />}
            actionBar={
                <>
                    <ActionButton icon={<ArrowBackIosNewIcon />} onClick={() => navigate("/proshop")}>
                        Back
                    </ActionButton>
                    <ActionButton icon={<CalendarMonthIcon />} onClick={() => navigate("/teesheet")}>
                        Tee Sheet
                    </ActionButton>
                    <ActionButton icon={<ShoppingCartIcon />} tone={hasLines ? "primary" : "disabled"} onClick={() => hasLines && navigate("/pay")}>
                        {`Pay ${money(total)}`}
                    </ActionButton>
                </>
            }
        >
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", columnGap: 2, px: 2, py: 1 }}>
                {combos.map((combo) => (
                    <ComboTile key={combo.id} combo={combo} onAdd={() => ring(combo)} />
                ))}
            </Box>
        </Shell>
    );
};
