import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PrintIcon from "@mui/icons-material/Print";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { appColors, appRadius } from "@/theme/app-replica-tokens";
import { Shell } from "../pos-shell";
import { money, useStore } from "../store";

/**
 * Order Lookup, from `references/072926/12-orderlookup/`.
 *
 * Two columns of criteria, not a results table. The left narrows by *where and
 * when* — course and date. The right narrows by *what* — order ID, payment ID, or
 * product. Nothing runs until SEARCH.
 *
 * The three right-hand fields are alternatives rather than filters that combine,
 * which the layout does not say anywhere: three identical boxes stacked in a
 * column read as AND, and they are OR.
 *
 * The reference only captures the empty pre-search state. Results are this
 * prototype's own addition — SEARCH swaps the criteria out for the session's
 * closed sales, since a lookup screen that cannot show you a sale is not much of
 * a prototype.
 */

const COURSES = ["The Dunes of Delgado PROD", "North Course", "South Course", "West Course"];

/** Label above, filled grey field below. Centre-aligned, as the app has it. */
const SearchField = ({ label, placeholder }: { label: string; placeholder: string }) => {
    const [value, setValue] = useState("");
    return (
        <Box>
            <Typography sx={{ fontSize: 15, color: appColors.textSecondary, textAlign: "center", mb: 1.5 }}>{label}</Typography>
            <InputBase
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={placeholder}
                sx={{
                    width: "100%",
                    bgcolor: appColors.fieldFill,
                    borderBottom: `1px solid ${appColors.textSecondary}`,
                    px: 2,
                    "& input": { fontSize: 20, py: 2, "&::placeholder": { color: appColors.textSecondary, opacity: 1 } },
                }}
            />
        </Box>
    );
};

export const OrderLookupScreen = () => {
    const { paidTickets } = useStore();
    const navigate = useNavigate();

    const [course, setCourse] = useState(COURSES[0]);
    const [coursesOpen, setCoursesOpen] = useState(false);
    const [searched, setSearched] = useState(false);

    return (
        <Shell
            title="Order Lookup"
            active="orderlookup"
            topBarRight={null}
            actionBar={
                <>
                    <ActionButton icon={<ArrowBackIosNewIcon />} onClick={() => (searched ? setSearched(false) : navigate(-1))}>
                        Back
                    </ActionButton>
                    <ActionButton icon={<PrintIcon />}>Print snapshot</ActionButton>
                    <ActionButton icon={<SearchIcon />} tone="primary" onClick={() => setSearched(true)}>
                        Search
                    </ActionButton>
                </>
            }
        >
            {searched ? (
                <Box sx={{ p: 3, bgcolor: "#fff", minHeight: "100%" }}>
                    <Typography sx={{ fontSize: 15, color: appColors.textSecondary, mb: 2 }}>
                        {course} · Wednesday, July 29 2026 · {paidTickets.length} {paidTickets.length === 1 ? "order" : "orders"}
                    </Typography>

                    {paidTickets.length === 0 ? (
                        <Typography sx={{ fontSize: 18, color: appColors.textSecondary }}>
                            No closed sales on this date. Complete one from the register.
                        </Typography>
                    ) : (
                        <Box sx={{ border: `1px solid ${appColors.divider}` }}>
                            {paidTickets.map((t) => (
                                <Stack
                                    key={t.id}
                                    direction="row"
                                    sx={{
                                        px: 2,
                                        py: 2,
                                        minHeight: 72,
                                        alignItems: "center",
                                        borderBottom: `1px solid ${appColors.divider}`,
                                    }}
                                >
                                    <Stack sx={{ flex: 1 }}>
                                        <Typography sx={{ fontSize: 17 }}>
                                            {t.number} · {t.customer ?? t.name}
                                        </Typography>
                                        <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>
                                            {t.tender} · {t.lines.length} items · {t.source}
                                        </Typography>
                                    </Stack>
                                    <Typography sx={{ fontSize: 17 }}>
                                        {money(t.lines.reduce((s, l) => s + l.qty * l.unitPrice, 0) * 1.06)}
                                    </Typography>
                                </Stack>
                            ))}
                        </Box>
                    )}
                </Box>
            ) : (
                <Stack direction="row" sx={{ height: "100%", minHeight: 0, bgcolor: "#fff", pt: 5 }}>
                    {/* Where and when. */}
                    <Stack sx={{ width: "50%", px: 6, alignItems: "center" }}>
                        <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>Golf Course</Typography>

                        <Box sx={{ position: "relative", mt: 4 }}>
                            <ButtonBase onClick={() => setCoursesOpen((o) => !o)} sx={{ gap: 2 }}>
                                <Typography sx={{ fontSize: 31 }}>{course}</Typography>
                                <ArrowDropDownIcon sx={{ fontSize: 28, color: appColors.textSecondary }} />
                            </ButtonBase>

                            {coursesOpen && (
                                <ClickAwayListener onClickAway={() => setCoursesOpen(false)}>
                                    <Box
                                        sx={{
                                            position: "absolute",
                                            top: "100%",
                                            left: 0,
                                            zIndex: 20,
                                            minWidth: "100%",
                                            bgcolor: "#fff",
                                            boxShadow: 6,
                                        }}
                                    >
                                        {COURSES.map((c) => (
                                            <ButtonBase
                                                key={c}
                                                onClick={() => {
                                                    setCourse(c);
                                                    setCoursesOpen(false);
                                                }}
                                                sx={{ display: "block", width: "100%", py: 2, px: 3, fontSize: 18, textAlign: "left" }}
                                            >
                                                {c}
                                            </ButtonBase>
                                        ))}
                                    </Box>
                                </ClickAwayListener>
                            )}
                        </Box>

                        <Typography sx={{ fontSize: 15, color: appColors.textSecondary, mt: 7 }}>Date</Typography>

                        <ButtonBase
                            sx={{
                                mt: 3,
                                width: 486,
                                minHeight: 74,
                                gap: 2,
                                bgcolor: appColors.slate,
                                color: "#fff",
                                borderRadius: `${appRadius.button}px`,
                                fontSize: 15,
                                letterSpacing: "0.09em",
                                boxShadow: 2,
                            }}
                        >
                            <CalendarMonthIcon sx={{ fontSize: 24 }} />
                            WEDNESDAY, JULY 29 2026
                        </ButtonBase>
                    </Stack>

                    {/* What. Three alternatives, not three filters. */}
                    <Stack sx={{ width: "50%", px: 6, gap: 4 }}>
                        <SearchField label="Search by Order ID" placeholder="Enter Order ID" />
                        <SearchField label="Search by Payment ID" placeholder="Enter Order Payment ID" />
                        <SearchField label="Search by Product" placeholder="Start typing product name or SKU…" />
                    </Stack>
                </Stack>
            )}
        </Shell>
    );
};
