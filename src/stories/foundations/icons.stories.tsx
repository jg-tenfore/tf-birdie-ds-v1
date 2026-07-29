import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import type { SvgIconComponent } from "@mui/icons-material";
import AddShoppingCartOutlinedIcon from "@mui/icons-material/AddShoppingCartOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import GolfCourseOutlinedIcon from "@mui/icons-material/GolfCourseOutlined";
import LocalBarOutlinedIcon from "@mui/icons-material/LocalBarOutlined";
import PeopleOutlineOutlinedIcon from "@mui/icons-material/PeopleOutlineOutlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import WifiOffOutlinedIcon from "@mui/icons-material/WifiOffOutlined";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { DocPage, DocSection, Grid, Token } from "../shared/doc-shell";

/**
 * Icons come from @mui/icons-material — the Material Symbols set, which is the
 * same iconography Android ships. Using it means the POS looks native on the
 * device instead of looking like a web app someone put on a tablet.
 */
const meta = {
    title: "Foundations/Icons",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const coreIcons: { Icon: SvgIconComponent; name: string; use: string }[] = [
    { Icon: PointOfSaleOutlinedIcon, name: "PointOfSale", use: "Register" },
    { Icon: ReceiptLongOutlinedIcon, name: "ReceiptLong", use: "Tickets" },
    { Icon: CreditCardOutlinedIcon, name: "CreditCard", use: "Payments" },
    { Icon: GolfCourseOutlinedIcon, name: "GolfCourse", use: "Tee sheet" },
    { Icon: LocalBarOutlinedIcon, name: "LocalBar", use: "F & B" },
    { Icon: ShoppingBagOutlinedIcon, name: "ShoppingBag", use: "Pro shop" },
    { Icon: PeopleOutlineOutlinedIcon, name: "PeopleOutline", use: "Customers" },
    { Icon: SettingsOutlinedIcon, name: "Settings", use: "Settings" },
    { Icon: AddShoppingCartOutlinedIcon, name: "AddShoppingCart", use: "Add to order" },
    { Icon: DeleteOutlineOutlinedIcon, name: "DeleteOutline", use: "Remove line" },
    { Icon: PrintOutlinedIcon, name: "Print", use: "Print receipt" },
    { Icon: WifiOffOutlinedIcon, name: "WifiOff", use: "Offline state" },
];

const sizes = [
    { px: 20, name: "small", use: "Inline with body text, dense table rows" },
    { px: 24, name: "medium (default)", use: "Buttons, list items, app bar" },
    { px: 32, name: "large", use: "Nav rail, empty states" },
    { px: 40, name: "xlarge", use: "Tender keys, product tiles" },
];

export const Library: Story = {
    render: () => (
        <DocPage
            title="Icons"
            intro="Material Symbols via @mui/icons-material — the same set Android ships, so the POS reads as native on the device."
        >
            <DocSection
                title="Sizes"
                note="24px is the default and the size the 48dp touch floor is built around. Below 20px an icon is decorative, not functional — never make a 16px icon the only label for an action."
            >
                <Stack spacing={2}>
                    {sizes.map(({ px, name, use }) => (
                        <Stack key={px} direction="row" spacing={3} sx={{ alignItems: "center" }}>
                            <Box sx={{ width: 180 }}>
                                <Token>fontSize: {px}px — {name}</Token>
                            </Box>
                            <PointOfSaleOutlinedIcon sx={{ fontSize: px }} />
                            <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                {use}
                            </Typography>
                        </Stack>
                    ))}
                </Stack>
            </DocSection>

            <DocSection
                title="Core set"
                note="Outlined is the house style — filled variants are reserved for the selected state in the nav rail, so fill carries meaning rather than decoration."
            >
                <Grid min={160}>
                    {coreIcons.map(({ Icon, name, use }) => (
                        <Stack key={name} spacing={1} sx={{ alignItems: "center", p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "background.paper" }}>
                            <Icon sx={{ fontSize: 32 }} />
                            <Typography variant="caption" sx={{ fontWeight: 600, textAlign: "center" }}>
                                {use}
                            </Typography>
                            <Token>{name}</Token>
                        </Stack>
                    ))}
                </Grid>
            </DocSection>

            <DocSection
                title="Labeling"
                note="An icon alone is ambiguous under time pressure. In the nav rail and on any destructive action, pair the icon with a text label — the 88px rail is sized to fit both."
            >
                <Stack direction="row" spacing={3}>
                    <Stack spacing={1} sx={{ alignItems: "center", width: 88, py: 1.5, borderRadius: 2, bgcolor: "action.selected" }}>
                        <PointOfSaleOutlinedIcon />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                            Register
                        </Typography>
                    </Stack>
                    <Typography variant="body2" sx={{ color: "text.secondary", alignSelf: "center", maxWidth: 420 }}>
                        Icon + label in an 88px rail. This is why the rail is 88px and not 64px.
                    </Typography>
                </Stack>
            </DocSection>
        </DocPage>
    ),
};
