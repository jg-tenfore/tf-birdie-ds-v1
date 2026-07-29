import Box from "@mui/material/Box";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Pagination from "@mui/material/Pagination";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { touchTarget } from "@/theme/tokens";

/**
 * Breadcrumbs, Link, and Pagination — the three small navigation pieces, grouped
 * because each carries the same warning: **their default targets are too small
 * for a finger.**
 *
 * A breadcrumb crumb is a ~20px line of text. A pagination page number is 32px.
 * A text link inside a paragraph has no target at all beyond its own glyphs.
 * All three need explicit sizing, and none should ever be the only route to
 * something important.
 */
const meta = {
    title: "Components/Navigation/Breadcrumbs, Link & Pagination",
    parameters: { layout: "padded" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const BreadcrumbTrail: Story = {
    name: "Breadcrumbs",
    render: () => (
        <Stack spacing={4} sx={{ p: 3 }}>
            <Stack spacing={1.5}>
                <Typography variant="h6">Default</Typography>
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
                    <Link underline="hover" color="inherit" href="#">
                        Settings
                    </Link>
                    <Link underline="hover" color="inherit" href="#">
                        Employees
                    </Link>
                    <Typography sx={{ color: "text.primary" }}>Dana Kim</Typography>
                </Breadcrumbs>
            </Stack>

            <Stack spacing={1.5}>
                <Typography variant="h6">Tablet-sized</Typography>
                <Breadcrumbs
                    separator={<NavigateNextIcon />}
                    sx={{ "& .MuiBreadcrumbs-li": { display: "flex", alignItems: "center" }, "& a": { minHeight: touchTarget.min, display: "flex", alignItems: "center", px: 1 } }}
                >
                    <Link underline="hover" color="inherit" href="#" variant="body1">
                        Settings
                    </Link>
                    <Link underline="hover" color="inherit" href="#" variant="body1">
                        Employees
                    </Link>
                    <Typography variant="body1" sx={{ color: "text.primary", fontWeight: 600, px: 1 }}>
                        Dana Kim
                    </Typography>
                </Breadcrumbs>
                <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 680 }}>
                    Each crumb gets a 48dp row height and horizontal padding. Untouched, breadcrumb links are
                    ~20px tall — unusable standing at a counter.
                </Typography>
            </Stack>
        </Stack>
    ),
};

export const Links: Story = {
    render: () => (
        <Stack spacing={3} sx={{ p: 3, maxWidth: 680 }}>
            <Stack direction="row" spacing={3} sx={{ flexWrap: "wrap", rowGap: 2 }}>
                <Link href="#" underline="hover">
                    Default link
                </Link>
                <Link href="#" underline="always">
                    Always underlined
                </Link>
                <Link href="#" underline="none">
                    No underline
                </Link>
                <Link href="#" color="error" underline="hover">
                    Destructive link
                </Link>
            </Stack>

            <Typography variant="body1">
                Inline links inside body copy — like <Link href="#">this one</Link> — are acceptable for
                reference material in Settings, but never for an action in a selling flow. Use a Button.
            </Typography>

            <Box sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "warning.main" }}>
                <Typography variant="body2">
                    Always keep the underline (<code>underline="hover"</code> resolves to underlined on touch
                    anyway). Color alone doesn't mark a link for a colorblind operator.
                </Typography>
            </Box>
        </Stack>
    ),
};

export const Paginations: Story = {
    name: "Pagination",
    render: () => (
        <Stack spacing={4} sx={{ p: 3 }}>
            <Stack spacing={1.5}>
                <Typography variant="h6">Default — 32px targets</Typography>
                <Pagination count={10} page={3} />
            </Stack>

            <Stack spacing={1.5}>
                <Typography variant="h6">Tablet-sized — 48dp</Typography>
                <Pagination
                    count={10}
                    page={3}
                    size="large"
                    sx={{ "& .MuiPaginationItem-root": { minWidth: touchTarget.min, height: touchTarget.min, fontSize: 16 } }}
                />
            </Stack>

            <Stack spacing={1.5}>
                <Typography variant="h6">With first/last</Typography>
                <Pagination
                    count={24}
                    page={12}
                    size="large"
                    showFirstButton
                    showLastButton
                    siblingCount={1}
                    sx={{ "& .MuiPaginationItem-root": { minWidth: touchTarget.min, height: touchTarget.min } }}
                />
            </Stack>

            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 680 }}>
                Pagination beats infinite scroll for back-office tables: an operator who leaves and comes back
                needs the same rows in the same place, and "page 3" is a position they can hold in their head.
            </Typography>
        </Stack>
    ),
};
