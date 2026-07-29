import { useState } from "react";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import type { CatalogCategory, CatalogItem } from "@/data/pos-data";
import { catalog, money } from "@/data/pos-data";
import { fontFamily } from "@/theme/tokens";

/**
 * The sellable-item grid.
 *
 * Tiles are a minimum of 180×108 — comfortably past the `large` touch tier,
 * because the whole tile is the target and it is hit without looking. Price sits
 * bottom-left on every tile so the eye lands in the same place across the grid,
 * and the qualifier (Member, Twilight, Under 17) is top-right where it can't be
 * mistaken for part of the item name.
 */

export const ProductTile = ({ item, onSelect }: { item: CatalogItem; onSelect?: (item: CatalogItem) => void }) => (
    <Card>
        <CardActionArea onClick={() => onSelect?.(item)} sx={{ minHeight: 108, p: 2, alignItems: "stretch" }}>
            <Stack sx={{ height: "100%", width: "100%", justifyContent: "space-between" }}>
                <Stack direction="row" spacing={1} sx={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                        {item.name}
                    </Typography>
                    {item.note && (
                        <Typography
                            variant="caption"
                            sx={{
                                flexShrink: 0,
                                px: 1,
                                py: 0.25,
                                borderRadius: 999,
                                bgcolor: "primary.main",
                                color: "primary.contrastText",
                                fontWeight: 600,
                            }}
                        >
                            {item.note}
                        </Typography>
                    )}
                </Stack>
                <Typography variant="h6" sx={{ fontFamily: fontFamily.mono, fontVariantNumeric: "tabular-nums", mt: 1.5 }}>
                    {money(item.price)}
                </Typography>
            </Stack>
        </CardActionArea>
    </Card>
);

export interface ProductGridProps {
    /** Restrict to one category and hide the tab bar — used by F&B and Pro shop. */
    category?: CatalogCategory;
    categories?: CatalogCategory[];
    onSelect?: (item: CatalogItem) => void;
    /** Tile column width; smaller for F&B where the item count is higher. */
    minTile?: number;
}

export const ProductGrid = ({ category, categories, onSelect, minTile = 180 }: ProductGridProps) => {
    const tabs = categories ?? [];
    const [tab, setTab] = useState(0);
    const active = category ?? tabs[tab];
    const items = catalog.filter((item) => item.category === active);

    return (
        <Box sx={{ p: 3 }}>
            {tabs.length > 0 && (
                <Tabs value={tab} onChange={(_, next) => setTab(next)} sx={{ mb: 2.5 }}>
                    {tabs.map((name) => (
                        <Tab key={name} label={name} />
                    ))}
                </Tabs>
            )}

            <Box sx={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${minTile}px, 1fr))`, gap: 2 }}>
                {items.map((item) => (
                    <ProductTile key={item.id} item={item} onSelect={onSelect} />
                ))}
            </Box>
        </Box>
    );
};
