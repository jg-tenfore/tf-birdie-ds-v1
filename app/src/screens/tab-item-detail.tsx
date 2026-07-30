import { useState } from "react";

import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import InputBase from "@mui/material/InputBase";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";

import { modifierGroups, modifierSurcharge } from "@/data/modifiers";
import { appColors } from "@/theme/app-replica-tokens";
import { money, type Line } from "../store";

/**
 * The item detail pane, from `references/072926/6-tabs/`.
 *
 * Where a line becomes a specific plate: quantity, a free-text note, and any
 * number of modifiers from ten groups behind a horizontally scrolling tab strip.
 *
 * The options look like radios and behave like checkboxes — TO GO, MEDIUM WELL and
 * NO BUN can all be on one burger. That mismatch is the device's and it is worth
 * keeping visible, because it is the reason staff tap an option twice expecting the
 * first to clear.
 *
 * `Total` at the top right is the whole line including modifiers and quantity, not
 * the unit price, so it moves when either changes.
 */
export const TabItemDetail = ({
    line,
    onQty,
    onNote,
    onModifiers,
}: {
    line: Line;
    onQty: (qty: number) => void;
    onNote: (note: string) => void;
    onModifiers: (names: string[]) => void;
}) => {
    const [group, setGroup] = useState(modifierGroups[1].name);
    const selected = line.modifiers ?? [];
    const active = modifierGroups.find((g) => g.name === group) ?? modifierGroups[0];

    const toggle = (name: string) =>
        onModifiers(selected.includes(name) ? selected.filter((n) => n !== name) : [...selected, name]);

    const lineTotal = line.qty * (line.unitPrice + modifierSurcharge(selected));

    return (
        <Box sx={{ bgcolor: appColors.canvas, minHeight: "100%" }}>
            <Stack direction="row" sx={{ alignItems: "flex-start", gap: 3, p: 2 }}>
                <Box
                    component="img"
                    src={line.image}
                    alt=""
                    sx={{ width: 118, height: 96, objectFit: "contain", bgcolor: "#fff", flexShrink: 0 }}
                />
                <Typography sx={{ flex: 1, fontSize: 34, mt: 1 }}>{line.name}</Typography>

                <Stack sx={{ alignItems: "flex-end", gap: 1.5 }}>
                    <Stack direction="row" sx={{ alignItems: "baseline", gap: 2 }}>
                        <Typography sx={{ fontSize: 26, color: appColors.textSecondary }}>Total</Typography>
                        <Typography data-line-total sx={{ fontSize: 30, color: appColors.green }}>
                            {money(lineTotal)}
                        </Typography>
                    </Stack>

                    <Stack
                        direction="row"
                        sx={{ alignItems: "center", border: `1px solid ${appColors.textPrimary}`, borderRadius: 0.5, minWidth: 220 }}
                    >
                        <ButtonBase
                            aria-label="Decrease quantity"
                            onClick={() => onQty(line.qty - 1)}
                            sx={{ flex: 1, py: 1.5, fontSize: 26, color: appColors.textSecondary }}
                        >
                            −
                        </ButtonBase>
                        <Typography sx={{ flex: 1, textAlign: "center", fontSize: 24 }}>{line.qty}</Typography>
                        <ButtonBase
                            aria-label="Increase quantity"
                            onClick={() => onQty(line.qty + 1)}
                            sx={{ flex: 1, py: 1.5, fontSize: 26, color: appColors.green }}
                        >
                            +
                        </ButtonBase>
                    </Stack>
                </Stack>
            </Stack>

            <Box sx={{ px: 2 }}>
                <Box sx={{ bgcolor: "#E3E3E3", px: 2, pt: 1, pb: 1.25, minHeight: 76 }}>
                    <Typography sx={{ fontSize: 15, color: appColors.textSecondary }}>Enter Additional Notes…</Typography>
                    <InputBase
                        value={line.note ?? ""}
                        onChange={(e) => onNote(e.target.value)}
                        multiline
                        sx={{ width: "100%", "& textarea": { fontSize: 21, p: 0 } }}
                    />
                </Box>
            </Box>

            {/*
             * The group strip scrolls horizontally and never wraps: with ten groups
             * the last few are off-screen, so a modifier nobody scrolls to is a
             * modifier nobody applies.
             */}
            <Stack
                direction="row"
                sx={{ gap: 3, px: 2, mt: 2, overflowX: "auto", borderBottom: `1px solid ${appColors.divider}` }}
            >
                {modifierGroups.map((g) => {
                    const isActive = g.name === group;
                    const count = g.options.filter((o) => selected.includes(o.name)).length;
                    return (
                        <ButtonBase
                            key={g.name}
                            onClick={() => setGroup(g.name)}
                            sx={{
                                flexShrink: 0,
                                pb: 1,
                                fontSize: 19,
                                whiteSpace: "nowrap",
                                color: isActive ? appColors.textPrimary : appColors.textSecondary,
                                borderBottom: isActive ? `3px solid ${appColors.textPrimary}` : "3px solid transparent",
                            }}
                        >
                            {g.name}
                            {/* Not in the reference: a count so a group with
                                selections is findable without opening all ten. */}
                            {count > 0 && (
                                <Box
                                    component="span"
                                    sx={{
                                        ml: 1,
                                        px: 0.75,
                                        bgcolor: appColors.green,
                                        color: "#fff",
                                        borderRadius: 999,
                                        fontSize: 13,
                                    }}
                                >
                                    {count}
                                </Box>
                            )}
                        </ButtonBase>
                    );
                })}
            </Stack>

            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 1.25, p: 2 }}>
                {active.options.map((option) => {
                    const on = selected.includes(option.name);
                    return (
                        <ButtonBase
                            key={option.name}
                            onClick={() => toggle(option.name)}
                            aria-pressed={on}
                            sx={{
                                justifyContent: "flex-start",
                                gap: 1.5,
                                px: 1.5,
                                minHeight: 52,
                                bgcolor: "#fff",
                                border: `1px solid ${on ? appColors.green : appColors.divider}`,
                                borderRadius: 0.5,
                            }}
                        >
                            {on ? (
                                <CheckCircleIcon sx={{ fontSize: 22, color: appColors.green }} />
                            ) : (
                                <RadioButtonUncheckedIcon sx={{ fontSize: 22, color: appColors.green }} />
                            )}
                            <Typography sx={{ flex: 1, fontSize: 14, textAlign: "center", letterSpacing: "0.02em" }}>
                                {option.name}
                            </Typography>
                            {option.price ? (
                                <Typography sx={{ fontSize: 13, color: appColors.textSecondary }}>+{money(option.price)}</Typography>
                            ) : null}
                        </ButtonBase>
                    );
                })}
            </Box>
        </Box>
    );
};
