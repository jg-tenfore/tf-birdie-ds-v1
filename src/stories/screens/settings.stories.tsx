import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import type { SvgIconComponent } from "@mui/icons-material";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import PointOfSaleOutlinedIcon from "@mui/icons-material/PointOfSaleOutlined";
import PrintOutlinedIcon from "@mui/icons-material/PrintOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import WifiOutlinedIcon from "@mui/icons-material/WifiOutlined";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { PosShell } from "@/components/app-chrome/pos-shell";
import { fontFamily, layout } from "@/theme/tokens";

/**
 * Settings — a two-pane master/detail, which is the landscape pattern that
 * replaces a phone's drill-down-and-back.
 *
 * The nav list stays visible while the detail changes, so an operator changing
 * three things doesn't navigate six times. On a tablet there is no reason to
 * ever hide the list.
 */
const meta = {
    title: "App Screens/Settings",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const sections: { key: string; label: string; Icon: SvgIconComponent; hint: string }[] = [
    { key: "terminal", label: "Terminal", Icon: PointOfSaleOutlinedIcon, hint: "SGM-02 · Register 2" },
    { key: "hardware", label: "Hardware", Icon: PrintOutlinedIcon, hint: "Printer, reader, drawer" },
    { key: "employees", label: "Employees", Icon: BadgeOutlinedIcon, hint: "4 on today" },
    { key: "receipts", label: "Receipts", Icon: ReceiptLongOutlinedIcon, hint: "Print & email" },
    { key: "club", label: "Club profile", Icon: StorefrontOutlinedIcon, hint: "Sagamore Golf Club" },
    { key: "network", label: "Network & sync", Icon: WifiOutlinedIcon, hint: "Online" },
    { key: "advanced", label: "Advanced", Icon: TuneOutlinedIcon, hint: "Diagnostics, logs" },
];

const SettingRow = ({ label, hint, control }: { label: string; hint?: string; control: React.ReactNode }) => (
    <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between", p: 2.5, minHeight: 72 }}>
        <Stack spacing={0.25} sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {label}
            </Typography>
            {hint && (
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    {hint}
                </Typography>
            )}
        </Stack>
        <Box sx={{ flexShrink: 0 }}>{control}</Box>
    </Stack>
);

export const Default: Story = {
    render: () => (
        <PosShell active="settings">
            <Box sx={{ display: "flex", height: "100%", minHeight: 0 }}>
                {/* Master pane — fixed, always visible. */}
                <Box sx={{ width: 300, flexShrink: 0, borderRight: "1px solid", borderColor: "divider", overflowY: "auto", py: 1 }}>
                    <List>
                        {sections.map((section, i) => (
                            <ListItemButton key={section.key} selected={i === 1} sx={{ mx: 1, mb: 0.5 }}>
                                <ListItemIcon>
                                    <section.Icon />
                                </ListItemIcon>
                                <ListItemText primary={section.label} secondary={section.hint} />
                            </ListItemButton>
                        ))}
                    </List>
                </Box>

                {/* Detail pane. */}
                <Box sx={{ flex: 1, minWidth: 0, overflowY: "auto", p: 3 }}>
                    <Stack spacing={3} sx={{ maxWidth: 720 }}>
                        <Stack spacing={0.25}>
                            <Typography variant="h3">Hardware</Typography>
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Peripherals paired to terminal SGM-02.
                            </Typography>
                        </Stack>

                        <Card>
                            <Stack divider={<Divider />}>
                                <SettingRow
                                    label="Receipt printer"
                                    hint="Star TSP143 · USB"
                                    control={<Chip label="Connected" color="success" size="small" />}
                                />
                                <SettingRow
                                    label="Card reader"
                                    hint="SGM-02-R · Bluetooth · Battery 12%"
                                    control={<Chip label="Low battery" color="warning" size="small" />}
                                />
                                <SettingRow label="Cash drawer" hint="Opens on cash tender" control={<Switch defaultChecked />} />
                                <SettingRow label="Barcode scanner" hint="Symbol LS2208 · USB wedge" control={<Chip label="Connected" color="success" size="small" />} />
                                <SettingRow label="Customer display" hint="Not paired" control={<Button variant="outlined">Pair</Button>} />
                            </Stack>
                        </Card>

                        <Stack spacing={1}>
                            <Typography variant="h5">Printing</Typography>
                            <Card>
                                <Stack divider={<Divider />}>
                                    <SettingRow label="Auto-print on close" hint="Prints a customer copy when a ticket is paid" control={<Switch defaultChecked />} />
                                    <SettingRow label="Print merchant copy" hint="Second copy for signature over $50" control={<Switch />} />
                                    <SettingRow label="Print kitchen tickets" hint="Routes F & B items to the snack bar printer" control={<Switch defaultChecked />} />
                                </Stack>
                            </Card>
                        </Stack>

                        <Card sx={{ p: 2.5 }}>
                            <Stack spacing={1}>
                                <Typography variant="overline" sx={{ color: "text.secondary" }}>
                                    Layout reference
                                </Typography>
                                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                    Master pane 300px · nav rail {layout.navRailWidth}px · app bar {layout.appBarHeight}px. At 1280
                                    wide that leaves{" "}
                                    <Box component="span" sx={{ fontFamily: fontFamily.mono }}>
                                        {1280 - 300 - layout.navRailWidth}px
                                    </Box>{" "}
                                    for the detail pane — enough for a 720px form column with margin.
                                </Typography>
                            </Stack>
                        </Card>
                    </Stack>
                </Box>
            </Box>
        </PosShell>
    ),
};
