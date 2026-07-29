import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import SearchIcon from "@mui/icons-material/Search";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { PosShell } from "@/components/app-chrome/pos-shell";
import type { MemberTier } from "@/data/pos-data";
import { members, money } from "@/data/pos-data";
import { fontFamily, touchTarget } from "@/theme/tokens";

/**
 * Members — lookup and account detail.
 *
 * The operator's question is almost always "is this the right person, and can
 * they charge it?" So the table leads with a 40px avatar for face-matching and
 * ends with available credit, which is the number that decides whether the
 * next tap succeeds.
 */
const meta = {
    title: "App Screens/Customers",
    parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const tierColor: Record<MemberTier, "primary" | "success" | "info" | "default"> = {
    Founders: "primary",
    Eagle: "success",
    Birdie: "info",
    Par: "default",
    Public: "default",
};

export const Directory: Story = {
    render: () => (
        <PosShell active="customers">
            <Box sx={{ p: 3 }}>
                <Stack direction="row" spacing={2} sx={{ alignItems: "center", justifyContent: "space-between", mb: 2.5, flexWrap: "wrap", rowGap: 2 }}>
                    <Stack spacing={0.25}>
                        <Typography variant="h3">Members</Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                            428 active · 8 shown
                        </Typography>
                    </Stack>
                    <Stack direction="row" spacing={2}>
                        <TextField
                            placeholder="Name, member #, or phone"
                            sx={{ width: 380 }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <Button size="large">Add member</Button>
                    </Stack>
                </Stack>

                <Card>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Member</TableCell>
                                <TableCell>Number</TableCell>
                                <TableCell>Tier</TableCell>
                                <TableCell>Last visit</TableCell>
                                <TableCell align="right">Balance</TableCell>
                                <TableCell align="right">Available credit</TableCell>
                                <TableCell />
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {members.map((member) => (
                                <TableRow key={member.id} hover sx={{ height: 72 }}>
                                    <TableCell>
                                        <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                                            <Avatar sx={{ width: 40, height: 40, bgcolor: "grey.300", color: "grey.800", fontSize: 15, fontWeight: 600 }}>
                                                {member.initials}
                                            </Avatar>
                                            <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                {member.name}
                                            </Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ fontFamily: fontFamily.mono }}>{member.number}</TableCell>
                                    <TableCell>
                                        <Chip size="small" label={member.tier} color={tierColor[member.tier]} />
                                    </TableCell>
                                    <TableCell>{member.lastVisit}</TableCell>
                                    <TableCell align="right" sx={{ fontFamily: fontFamily.mono, fontVariantNumeric: "tabular-nums" }}>
                                        {money(member.balance)}
                                    </TableCell>
                                    <TableCell
                                        align="right"
                                        sx={{
                                            fontFamily: fontFamily.mono,
                                            fontVariantNumeric: "tabular-nums",
                                            color: member.credit < 50 ? "error.main" : "text.primary",
                                            fontWeight: member.credit < 50 ? 700 : 400,
                                        }}
                                    >
                                        {money(member.credit)}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Button variant="outlined" sx={{ minHeight: touchTarget.min }}>
                                            Attach
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>

                <Typography variant="body2" sx={{ color: "text.secondary", mt: 2, maxWidth: 720 }}>
                    Available credit turns red under $50 — the threshold where a charge is likely to bounce and
                    the operator should ask for another tender before trying.
                </Typography>
            </Box>
        </PosShell>
    ),
};

export const MemberDetail: Story = {
    name: "Member detail",
    render: () => {
        const member = members[2];

        return (
            <PosShell
                active="customers"
                actionBar={
                    <>
                        <Button variant="outlined" size="large">
                            Edit member
                        </Button>
                        <Button variant="outlined" size="large">
                            Statement
                        </Button>
                        <Box sx={{ flex: 1 }} />
                        <Button size="large" sx={{ minHeight: 64, minWidth: 260, fontSize: 20 }}>
                            Attach to ticket
                        </Button>
                    </>
                }
            >
                <Box sx={{ p: 3, maxWidth: 980 }}>
                    <Stack spacing={3}>
                        <Stack direction="row" spacing={3} sx={{ alignItems: "center" }}>
                            <Avatar sx={{ width: 96, height: 96, bgcolor: "primary.main", fontSize: 34, fontWeight: 600 }}>{member.initials}</Avatar>
                            <Stack spacing={0.5}>
                                <Typography variant="h2">{member.name}</Typography>
                                <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                                    <Chip label={member.tier} color={tierColor[member.tier]} />
                                    <Typography variant="body1" sx={{ color: "text.secondary", fontFamily: fontFamily.mono }}>
                                        {member.number}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Stack>

                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
                            {[
                                { label: "Current balance", value: money(member.balance) },
                                { label: "Available credit", value: money(member.credit) },
                                { label: "Rounds this season", value: "34" },
                            ].map((stat) => (
                                <Card key={stat.label} sx={{ p: 2.5 }}>
                                    <Stack spacing={0.5}>
                                        <Typography variant="overline" sx={{ color: "text.secondary" }}>
                                            {stat.label}
                                        </Typography>
                                        <Typography variant="h3" sx={{ fontFamily: fontFamily.mono, fontVariantNumeric: "tabular-nums" }}>
                                            {stat.value}
                                        </Typography>
                                    </Stack>
                                </Card>
                            ))}
                        </Box>

                        <Card>
                            <Box sx={{ p: 2.5, pb: 1.5 }}>
                                <Typography variant="h5">Recent activity</Typography>
                            </Box>
                            <Divider />
                            <Stack divider={<Divider />}>
                                {[
                                    { date: "Jul 28", detail: "Green fee — 18 + cart · Ticket #4130", amount: 412.0 },
                                    { date: "Jul 22", detail: "Pro shop — Pro V1 dozen ×2 · Ticket #4021", amount: 109.98 },
                                    { date: "Jul 19", detail: "F & B — beverage cart · Ticket #3988", amount: 34.5 },
                                    { date: "Jul 15", detail: "Green fee — 18 · Ticket #3902", amount: 68.0 },
                                ].map((row) => (
                                    <Stack key={row.detail} direction="row" spacing={2} sx={{ alignItems: "center", p: 2.5, minHeight: 72 }}>
                                        <Typography variant="body2" sx={{ color: "text.secondary", minWidth: 72, fontFamily: fontFamily.mono }}>
                                            {row.date}
                                        </Typography>
                                        <Typography variant="body1" sx={{ flex: 1 }}>
                                            {row.detail}
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontFamily: fontFamily.mono, fontVariantNumeric: "tabular-nums", fontWeight: 500 }}>
                                            {money(row.amount)}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Card>
                    </Stack>
                </Box>
            </PosShell>
        );
    },
};
