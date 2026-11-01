import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import IconButton from "@mui/material/IconButton";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import BackupIcon from "@mui/icons-material/Backup";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { useNavigate, useParams } from "react-router-dom";

import { ActionButton } from "@/components/app-chrome/app-shell";
import { InventoryCountDetail, accessoriesCountLines } from "@/components/screens/operations/inventory-count-detail";
import { InventoryCountListRow, inventoryCategories, inventoryCountRows } from "@/components/screens/operations/inventory-count-list";
import { appColors } from "@/theme/app-replica-tokens";
import { Shell } from "../pos-shell";

/**
 * Inventory, from `references/072926/16-inventory/`.
 *
 * Three screens on one route family:
 *
 *   `/inventory`            the saved counts, scoped by product category
 *   `/inventory/new`        name a new count and pick its category
 *   `/inventory/:title`     the count itself — expected against actual, per SKU
 *
 * The category button sits in the bottom bar and opens **upward** as a dark
 * full-bleed sheet rather than a popover, so it covers the list it is filtering.
 * Nothing about the list changes when the category changes on the device, since
 * the saved counts carry no category of their own — worth flagging as a real gap
 * rather than reproducing silently, so the picker here does filter.
 */

const CATEGORY_OF: Record<string, (typeof inventoryCategories)[number]> = {
    "78987": "Merchandise",
    test: "Food and Beverage",
    "Austin Test": "Merchandise",
    "Mid week": "Alcohol",
    yeetus: "Merchandise",
    dong: "Food and Beverage",
    ding: "Merchandise",
};

export const InventoryScreen = () => {
    const navigate = useNavigate();
    const [category, setCategory] = useState<string>(inventoryCategories[0]);
    const [menuOpen, setMenuOpen] = useState(false);

    const rows = inventoryCountRows.filter((r) => (CATEGORY_OF[r.title] ?? "Merchandise") === category);

    return (
        <Shell
            title="Inventory Counts"
            active="inventory"
            topBarRight={
                <Stack direction="row" sx={{ alignItems: "center" }}>
                    <IconButton aria-label="New count" onClick={() => navigate("/inventory/new")} sx={{ color: "#fff" }}>
                        <AddIcon sx={{ fontSize: 30 }} />
                    </IconButton>
                    <IconButton aria-label="More" sx={{ color: "#fff" }}>
                        <MoreVertIcon />
                    </IconButton>
                </Stack>
            }
            actionBar={
                <ActionButton grow={1} preserveCase onClick={() => setMenuOpen((o) => !o)}>
                    {category}
                </ActionButton>
            }
            overlay={
                menuOpen ? (
                    <ClickAwayListener onClickAway={() => setMenuOpen(false)}>
                        <Box
                            role="menu"
                            sx={{
                                position: "fixed",
                                left: 8,
                                right: 8,
                                bottom: 80,
                                zIndex: 1300,
                                bgcolor: appColors.slate,
                                boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
                                py: 2,
                            }}
                        >
                            {inventoryCategories.map((label) => (
                                <ButtonBase
                                    key={label}
                                    onClick={() => {
                                        setCategory(label);
                                        setMenuOpen(false);
                                    }}
                                    sx={{ display: "block", width: "100%", py: 2.25, fontSize: 15, color: "#fff" }}
                                >
                                    {label}
                                </ButtonBase>
                            ))}
                        </Box>
                    </ClickAwayListener>
                ) : undefined
            }
        >
            <Box sx={{ bgcolor: appColors.canvas, minHeight: "100%" }}>
                {rows.length === 0 ? (
                    <Typography sx={{ p: 3, fontSize: 17, color: appColors.textSecondary }}>No saved counts for {category}.</Typography>
                ) : (
                    rows.map((row, i) => (
                        <Box
                            key={`${row.title}-${i}`}
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate(`/inventory/${encodeURIComponent(row.title)}`)}
                            sx={{ cursor: "pointer" }}
                        >
                            <InventoryCountListRow row={row} />
                        </Box>
                    ))
                )}
            </Box>
        </Shell>
    );
};

export const InventoryNewCountScreen = () => {
    const navigate = useNavigate();
    const [category, setCategory] = useState<string>(inventoryCategories[0]);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [title, setTitle] = useState("");

    return (
        <Shell
            title="Inventory Count"
            active="inventory"
            topActions={["Refresh"]}
            showCart={false}
            showOverflow={false}
            actionBar={
                <>
                    <ActionButton icon={<ArrowBackIosNewIcon />} onClick={() => navigate("/inventory")}>
                        Back
                    </ActionButton>
                    <ActionButton icon={<BackupIcon />} tone="primary" grow={2} onClick={() => navigate("/inventory")}>
                        Save
                    </ActionButton>
                </>
            }
        >
            <Box sx={{ bgcolor: appColors.canvas, minHeight: "100%", px: 4, pt: 4 }}>
                <Typography sx={{ fontSize: 17 }}>Product Category</Typography>

                {/* The value is centred across the full width while its label is
                    left-aligned above it, which is why the two look unrelated. */}
                <Box sx={{ position: "relative", mt: 1 }}>
                    <ButtonBase onClick={() => setPickerOpen((o) => !o)} sx={{ width: "100%", justifyContent: "center", minHeight: 56 }}>
                        <Typography sx={{ fontSize: 28 }}>{category}</Typography>
                        <ArrowDropDownIcon sx={{ position: "absolute", right: 0, fontSize: 28, color: appColors.textSecondary }} />
                    </ButtonBase>

                    {pickerOpen && (
                        <ClickAwayListener onClickAway={() => setPickerOpen(false)}>
                            <Box sx={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 20, bgcolor: "#fff", boxShadow: 6 }}>
                                {inventoryCategories.map((c) => (
                                    <ButtonBase
                                        key={c}
                                        onClick={() => {
                                            setCategory(c);
                                            setPickerOpen(false);
                                        }}
                                        sx={{ display: "block", width: "100%", py: 2, fontSize: 18 }}
                                    >
                                        {c}
                                    </ButtonBase>
                                ))}
                            </Box>
                        </ClickAwayListener>
                    )}
                </Box>

                <Typography sx={{ fontSize: 17, mt: 2 }}>Count Title</Typography>
                <InputBase
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter Title for Count…"
                    sx={{
                        width: "100%",
                        borderBottom: `1px solid ${appColors.textSecondary}`,
                        "& input": { fontSize: 24, py: 1.5, "&::placeholder": { color: appColors.textSecondary, opacity: 1 } },
                    }}
                />
            </Box>
        </Shell>
    );
};

export const InventoryCountScreen = () => {
    const { title } = useParams();
    const navigate = useNavigate();
    const decoded = decodeURIComponent(title ?? "");

    return (
        <Shell
            // The app bar shows the count's internal id alongside its title.
            title={`3484 - ${decoded}`}
            active="inventory"
            topBarRight={
                <Stack direction="row" sx={{ alignItems: "center", gap: 1.5, pr: 1 }}>
                    <QrCodeScannerIcon sx={{ fontSize: 26, color: "#fff" }} />
                    <Typography sx={{ fontSize: 15, letterSpacing: "0.06em", color: "#fff" }}>REFRESH</Typography>
                </Stack>
            }
            actionBar={
                <>
                    <ActionButton icon={<ArrowBackIosNewIcon />} onClick={() => navigate("/inventory")}>
                        Back
                    </ActionButton>
                    <ActionButton icon={<BackupIcon />} tone="primary" grow={2} onClick={() => navigate("/inventory")}>
                        Save
                    </ActionButton>
                </>
            }
        >
            <InventoryCountDetail section="Accessories" lines={accessoriesCountLines} />
        </Shell>
    );
};
