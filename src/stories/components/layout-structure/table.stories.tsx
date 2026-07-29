import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Typography from "@mui/material/Typography";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { money, tickets } from "@/data/pos-data";
import { fontFamily, touchTarget } from "@/theme/tokens";

/**
 * Table — for back-office reading, not for selling.
 *
 * Landscape is where tables earn their keep: 1280px fits seven or eight columns
 * without horizontal scroll, which is the thing that makes tables miserable on a
 * phone. Rows run 72px so they're tappable, which caps a 664px canvas at about
 * eight visible rows — hence pagination rather than infinite scroll.
 *
 * Money columns are right-aligned and monospaced so decimal points line up. That
 * is not decoration: a misplaced digit is visible in a column and invisible in a
 * ragged one.
 */
const meta = {
    title: "Components/Layout & Structure/Table",
    component: Table,
    parameters: { layout: "padded" },
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
    render: () => (
        <Box sx={{ p: 3 }}>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Ticket</TableCell>
                            <TableCell>Guest</TableCell>
                            <TableCell>Source</TableCell>
                            <TableCell>Opened</TableCell>
                            <TableCell>Server</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Total</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tickets.map((ticket) => (
                            <TableRow key={ticket.id} hover sx={{ height: 72 }}>
                                <TableCell sx={{ fontFamily: fontFamily.mono, fontWeight: 600 }}>{ticket.number}</TableCell>
                                <TableCell>{ticket.guest}</TableCell>
                                <TableCell>{ticket.source}</TableCell>
                                <TableCell>{ticket.opened}</TableCell>
                                <TableCell>{ticket.server}</TableCell>
                                <TableCell>
                                    <Chip
                                        size="small"
                                        label={ticket.status}
                                        color={ticket.status === "paid" ? "success" : ticket.status === "open" ? "info" : "warning"}
                                        sx={{ textTransform: "capitalize" }}
                                    />
                                </TableCell>
                                <TableCell align="right" sx={{ fontFamily: fontFamily.mono, fontVariantNumeric: "tabular-nums" }}>
                                    {money(ticket.total)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    ),
};

export const Sortable: Story = {
    render: () => (
        <Box sx={{ p: 3 }}>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>
                                <TableSortLabel active direction="asc">
                                    Ticket
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel>Guest</TableSortLabel>
                            </TableCell>
                            <TableCell align="right">
                                <TableSortLabel>Total</TableSortLabel>
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tickets.slice(0, 6).map((ticket) => (
                            <TableRow key={ticket.id} hover sx={{ height: 72 }}>
                                <TableCell sx={{ fontFamily: fontFamily.mono }}>{ticket.number}</TableCell>
                                <TableCell>{ticket.guest}</TableCell>
                                <TableCell align="right" sx={{ fontFamily: fontFamily.mono, fontVariantNumeric: "tabular-nums" }}>
                                    {money(ticket.total)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 2, maxWidth: 720 }}>
                Sort headers are small targets by default. They're acceptable here because sorting is a
                back-office nicety — never put a required action in a header label.
            </Typography>
        </Box>
    ),
};

export const WithPagination: Story = {
    name: "With pagination",
    render: () => (
        <Box sx={{ p: 3 }}>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Ticket</TableCell>
                            <TableCell>Guest</TableCell>
                            <TableCell align="right">Total</TableCell>
                            <TableCell align="right">Action</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {tickets.slice(0, 8).map((ticket) => (
                            <TableRow key={ticket.id} hover sx={{ height: 72 }}>
                                <TableCell sx={{ fontFamily: fontFamily.mono }}>{ticket.number}</TableCell>
                                <TableCell>{ticket.guest}</TableCell>
                                <TableCell align="right" sx={{ fontFamily: fontFamily.mono, fontVariantNumeric: "tabular-nums" }}>
                                    {money(ticket.total)}
                                </TableCell>
                                <TableCell align="right">
                                    <Button variant="outlined" sx={{ minHeight: touchTarget.min }}>
                                        Open
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <TablePagination component="div" count={47} page={0} rowsPerPage={8} rowsPerPageOptions={[8, 16, 24]} onPageChange={() => {}} />
            </TableContainer>
            <Typography variant="body2" sx={{ color: "text.secondary", mt: 2, maxWidth: 720 }}>
                Eight rows is what fits the 664px canvas at 72px each. Pagination beats infinite scroll here —
                an operator returning to this screen needs the same rows in the same place.
            </Typography>
        </Box>
    ),
};

export const Dense: Story = {
    render: () => (
        <Stack spacing={2} sx={{ p: 3 }}>
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Item</TableCell>
                            <TableCell align="right">Qty</TableCell>
                            <TableCell align="right">Price</TableCell>
                            <TableCell align="right">Total</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {[
                            ["Green fee — 18", 4, 62, 248],
                            ["Cart — 18", 2, 22, 44],
                            ["Range bucket — L", 1, 14, 14],
                        ].map(([name, qty, price, total]) => (
                            <TableRow key={name as string}>
                                <TableCell>{name}</TableCell>
                                <TableCell align="right" sx={{ fontFamily: fontFamily.mono }}>
                                    {qty}
                                </TableCell>
                                <TableCell align="right" sx={{ fontFamily: fontFamily.mono }}>
                                    {money(price as number)}
                                </TableCell>
                                <TableCell align="right" sx={{ fontFamily: fontFamily.mono, fontVariantNumeric: "tabular-nums" }}>
                                    {money(total as number)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <Typography variant="body2" sx={{ color: "text.secondary", maxWidth: 720 }}>
                Dense tables are read-only summaries — a receipt preview, a report breakdown. The moment a row
                becomes tappable it goes back to 72px.
            </Typography>
        </Stack>
    ),
};
