import Box from "@mui/material/Box";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import ImageListItemBar from "@mui/material/ImageListItemBar";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { money } from "@/data/pos-data";
import { brand, fontFamily, neutral } from "@/theme/tokens";

/**
 * Image List — the pro shop grid when merchandise has photography.
 *
 * The POS caveat: photos are slower to scan than text for a repeat operator, who
 * knows the catalog and is looking for a name. So imagery belongs on
 * *merchandise* (apparel, where the color matters) and not on green fees or
 * range buckets. The text tile in Layout & Structure → Card is the default.
 */
const meta = {
    title: "Components/Media & Visuals/Image List",
    component: ImageList,
    parameters: { layout: "padded" },
    // Stories render their own instance; satisfies ImageList's required
    // `children` so the Docs tab still builds a props table from `component`.
    args: { children: <></> },
} satisfies Meta<typeof ImageList>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Placeholder tiles rather than remote photos — this Storybook has no product
 * photography yet, and an inline SVG keeps the story working offline and in CI.
 */
const swatch = (fill: string, label: string) =>
    `data:image/svg+xml;utf8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="400" height="400" fill="${fill}"/><text x="200" y="215" font-family="Roboto,sans-serif" font-size="34" fill="rgba(255,255,255,.85)" text-anchor="middle">${label}</text></svg>`,
    )}`;

const merchandise = [
    { name: "Sagamore polo", price: 78, fill: brand[600], short: "Polo" },
    { name: "Sagamore cap", price: 32, fill: neutral[700], short: "Cap" },
    { name: "Quarter-zip", price: 96, fill: brand[800], short: "Zip" },
    { name: "Rain shell", price: 145, fill: neutral[800], short: "Shell" },
    { name: "Glove", price: 24, fill: brand[500], short: "Glove" },
    { name: "Towel", price: 18, fill: neutral[600], short: "Towel" },
];

export const Standard: Story = {
    render: () => (
        <Box sx={{ p: 3 }}>
            <ImageList cols={4} gap={16} sx={{ maxWidth: 900, m: 0 }}>
                {merchandise.map((item) => (
                    <ImageListItem key={item.name} sx={{ borderRadius: 2, overflow: "hidden" }}>
                        <img src={swatch(item.fill, item.short)} alt={item.name} loading="lazy" />
                        <ImageListItemBar
                            title={item.name}
                            subtitle={
                                <Box component="span" sx={{ fontFamily: fontFamily.mono }}>
                                    {money(item.price)}
                                </Box>
                            }
                        />
                    </ImageListItem>
                ))}
            </ImageList>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 2, maxWidth: 720 }}>
                Four columns at 1280px gives ~200px tiles — big enough that the whole tile is a comfortable target and the garment is
                actually identifiable.
            </Typography>
        </Box>
    ),
};

export const Quilted: Story = {
    render: () => (
        <Box sx={{ p: 3 }}>
            <ImageList variant="quilted" cols={4} rowHeight={140} gap={12} sx={{ maxWidth: 760, m: 0 }}>
                {merchandise.map((item, i) => (
                    <ImageListItem
                        key={item.name}
                        cols={i === 0 ? 2 : 1}
                        rows={i === 0 ? 2 : 1}
                        sx={{ borderRadius: 2, overflow: "hidden" }}
                    >
                        <img src={swatch(item.fill, item.short)} alt={item.name} loading="lazy" />
                        <ImageListItemBar title={item.name} />
                    </ImageListItem>
                ))}
            </ImageList>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 2, maxWidth: 720 }}>
                Quilted layouts read as editorial. Fine for a featured-merchandise shelf; wrong for a working catalog, where inconsistent
                tile sizes break the scan pattern.
            </Typography>
        </Box>
    ),
};

export const Masonry: Story = {
    name: "Woven & masonry",
    render: () => (
        <Stack spacing={2} sx={{ p: 3, maxWidth: 720 }}>
            <Typography variant="h6">Other variants</Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                <code>variant="woven"</code> and <code>variant="masonry"</code> both produce ragged rows. Neither is used in Birdie: a
                ragged grid means the price sits in a different place on every tile, and the operator's eye has to re-find it each time. The
                standard variant keeps price anchored bottom-left across the whole grid.
            </Typography>
        </Stack>
    ),
};
