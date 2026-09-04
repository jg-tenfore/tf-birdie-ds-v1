import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";

import { accessoriesAndTraining, golfBalls, golfShoes, mens } from "@/data/store-catalog";
import { appColors } from "@/theme/app-replica-tokens";
import { posImage } from "@/data/pos-inventory";
import { storeImage } from "@/utils/asset-url";
import { CategoryTile, tileGridSx } from "./category-tile";

/**
 * The Pro Shop Order catalog: a "Scan Mode" switch on its own row, then a
 * six-across grid of category tiles.
 *
 * The category list and its order are taken verbatim from
 * `references/072926/1-proshop/`. Only five of the twenty-four categories have
 * matching photography in the store catalog; the rest fall back to generated
 * plates (see `category-tile.tsx`).
 */

const byTitle = (pool: { title: string; path: string }[], match: string) =>
    pool.find((product) => product.title.toLowerCase().includes(match.toLowerCase()))?.path;

const photo = (path?: string) => (path ? storeImage(path) : undefined);

/** Category name → catalog photo, where one genuinely fits. */
/**
 * A photograph for every tile the grid prints.
 *
 * This used to be six hand-picked entries — `golfBalls[0]`, `golfShoes[0]` and
 * so on — which left eighteen of the twenty-four tiles blank. `posImage()`
 * resolves a category label against the catalogue, so the imagery ingested from
 * `references/090426/` reaches the grid without anyone maintaining a lookup by
 * hand.
 *
 * The hand-picked entries stay as overrides for labels the catalogue has no
 * category for: the shipping grid prints things like `simulator`, `Punch Cards`
 * and `Memberships`, which are not physical stock and never will be
 * photographed.
 */
const overrides: Record<string, string | undefined> = {
    "Range Balls": photo(golfBalls[3]?.path),
    Gloves: photo(byTitle(accessoriesAndTraining, "Golf Glove")),
    Shirts: photo(mens[0]?.path),
    Shoes: photo(golfShoes[0]?.path),
};

const categoryPhoto = (label: string) => overrides[label] ?? posImage(label);

/** Reading order from the shipping grid, left to right, top to bottom. */
export const proShopCategories = [
    "Gift Card",
    "Clinics",
    "Golf Balls",
    "Accessories",
    "Hats",
    "Rental Clubs",
    "Shoes",
    "Gloves",
    "Clubs",
    "Range Balls",
    "Miscellaneous",
    "Beer",
    "Shirts",
    "Punch Cards",
    "Sandwiches",
    "Beverages",
    "Hamburgers",
    "Memberships",
    "Twix",
    "simulator",
    "tee",
    "appetizers",
    "Tito's",
    "19th Hole",
];

/**
 * Scan Mode routes barcode-scanner input straight to the order instead of the
 * tile grid. The switch is the only control on this row.
 */
export const ScanModeRow = ({ checked = false }: { checked?: boolean }) => (
    <Stack direction="row" spacing={1} sx={{ alignItems: "center", justifyContent: "flex-end", px: "16px", py: "8px" }}>
        <Typography sx={{ fontSize: 15, color: appColors.textPrimary }}>Scan Mode</Typography>
        {/* The app never overrode colorAccent, so the switch tracks the slate
            chrome rather than the brand green. */}
        <Switch
            checked={checked}
            readOnly
            slotProps={{ input: { "aria-label": "Scan Mode" } }}
            sx={{
                "& .MuiSwitch-switchBase.Mui-checked": { color: appColors.slate },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { bgcolor: appColors.slate },
            }}
        />
    </Stack>
);

export const ProShopCatalog = ({ scanMode = false }: { scanMode?: boolean }) => (
    <Box>
        <ScanModeRow checked={scanMode} />
        <Box sx={tileGridSx}>
            {proShopCategories.map((label) => (
                <CategoryTile key={label} label={label} image={categoryPhoto(label)} />
            ))}
        </Box>
    </Box>
);

export default ProShopCatalog;
