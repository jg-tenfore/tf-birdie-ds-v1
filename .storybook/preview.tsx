import { useEffect } from "react";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider, useColorScheme } from "@mui/material/styles";
import type { Preview } from "@storybook/react-vite";

import { appReplicaTheme } from "../src/theme/app-replica-theme";
import { birdieTheme } from "../src/theme/birdie-theme";
import { devices } from "../src/theme/tokens";

// Roboto is the Android system face — loading the real weights keeps the
// Storybook's metrics honest against the device.
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@fontsource/roboto-mono/400.css";
import "@fontsource/roboto-mono/500.css";

/**
 * Every reference device is landscape. There is no portrait entry on purpose:
 * Birdie POS is a fixed-orientation app, and offering a portrait viewport here
 * would invite layouts that can never ship.
 */
const viewportOptions = Object.fromEntries(
    Object.entries(devices).map(([key, device]) => [
        key,
        { name: device.name, styles: { width: `${device.width}px`, height: `${device.height}px` }, type: "tablet" as const },
    ]),
);

/** Bridges the Storybook toolbar's theme global to MUI's color-scheme state. */
const ColorSchemeSync = ({ mode }: { mode: "light" | "dark" }) => {
    const { setMode } = useColorScheme();

    useEffect(() => {
        setMode(mode);
    }, [mode, setMode]);

    return null;
};

const preview: Preview = {
    parameters: {
        // Fullscreen is the right default for a POS system: nearly every story is
        // a panel, a rail, or a whole screen that needs the real device canvas.
        layout: "fullscreen",

        viewport: { options: viewportOptions },

        options: {
            /**
             * Only **title segments** belong in `order` — folders and component
             * names. Story names do nothing here.
             *
             * `storySort` ignores story names unless `includeNames: true`, and
             * turning that on is not an option: with `method: "alphabetical"`
             * it would alphabetise the stories of the 40 components that have
             * no array of their own, breaking deliberate sequences like Forgot
             * password's Request → Check email → Set new password → Password
             * reset.
             *
             * **Story order within a component comes from export order in the
             * file.** To reorder stories, move the exports. Arrays of story
             * names here are inert and only mislead the next person, so they
             * were removed rather than left as documentation of an intent the
             * sidebar does not honour.
             */
            storySort: {
                method: "alphabetical",
                order: [
                    "Introduction",
                    "Foundations",
                    [
                        "Overview",
                        "Colors",
                        "Typography",
                        "Spacing & Layout",
                        "Radius & Elevation",
                        "Touch Targets",
                        "Icons",
                        "Logos",
                        // How the prototype and this system stay one thing. Last
                        // because it is architecture rather than a token.
                        "Prototype Seam",
                    ],
                    "Components",
                    ["Actions", "Forms", "Feedback & Status", "Layout & Structure", "Media & Visuals", "Navigation"],
                    // The shipping app's flyout drawer.
                    "App Chrome",
                    ["Navigation Drawer"],
                    // Entries are the reference folder names from
                    // references/072926 verbatim, so every screen traces 1:1 back
                    // to its screenshots. `0-sidebarnav` is the exception — it
                    // lives in App Chrome above.
                    //
                    // This explicit list is load-bearing: alphabetically
                    // "10-tablechart" sorts before "2-teesheet", so without it the
                    // sidebar order would be wrong.
                    // Screens with 4+ states are split one file per state. Those
                    // need an explicit inner order too — with a story per file,
                    // sequence would otherwise fall back to alphabetical and the
                    // narrative order of each flow would be lost.
                    "App Screens",
                    [
                        "1-proshop",
                        ["Empty order", "Scan Mode on", "Items in order", "Overflow menu"],
                        "2-teesheet",
                        [
                            "List view",
                            "List view — tee time menu",
                            "List view — course picker",
                            "Grid view",
                            "Multi view — three courses",
                            "Back 9 view — front and back",
                            "Tee time detail — foursome",
                            "Tee time detail — paid pair",
                            "Tee time detail — open time",
                            "Dialog — reservation history",
                            "Dialog — customer notes",
                            "Dialog — group notes",
                            "Dialog — tee time notes",
                            "Edit reservation — fees",
                            "Cart sign out",
                            "Create raincheck",
                        ],
                        "3-coursheet",
                        "4-baysheet",
                        "5-quickorder",
                        [
                            "Empty order",
                            "Category products",
                            "Line item menu",
                            "Item modifiers — cheeses",
                            "Item modifiers — toppings",
                            "Order notes dialog",
                            "Screen overflow menu",
                        ],
                        "6-tabs",
                        ["Tab listing", "Tab detail", "Tab detail — line menu", "Tab detail — combos", "Tab detail — open food"],
                        "7-tables",
                        "8-reservations",
                        "9-ordersTips",
                        "10-tablechart",
                        ["Detached tables", "Room picker", "Empty room", "Create table", "Layout saved"],
                        "11-customerSearch",
                        [
                            "Empty search",
                            "Search results",
                            "Customer record",
                            "Customer record — sections expanded",
                            "Customer profile",
                            // Nested one level deeper: these are the stories
                            // inside that title, not siblings of it.
                            ["Default", "Sections collapsed", "On the sheet today"],
                        ],
                        "12-orderlookup",
                        "13-timeclock",
                        "14-giftcards",
                        "15-events",
                        "16-inventory",
                        "17-shift",
                        // Unnumbered because the reference folder is. Ordered by
                        // the tab strip left to right, so the sidebar reads the
                        // way the screen does.
                        "checkoutScreens",
                    ],
                    // A second axis through the same components. App Screens is
                    // organised by screen, mirroring the reference folders; this
                    // is organised by journey, because the failures that matter
                    // in a flow live in the joins between screens rather than
                    // inside any one of them.
                    "Flows",
                    [
                        "Rainchecks",
                        [
                            "Overview",
                            "1 — Booking with a raincheck",
                            "2 — Create raincheck",
                            "3 — The credit on the record",
                            "4 — Redeem at the register",
                            "5 — Order complete",
                            // Proposals, after the five steps that describe what
                            // ships — so the folder reads as "here is the flow,
                            // and here is what we would change about it".
                            //
                            // There used to be a "Weston's ideas" folder holding
                            // all four Aug 12–13 concepts. Its step 2 was
                            // superseded by Aug 20 and is retired; steps 3 and 4
                            // were untouched by Aug 20 and live on below, under a
                            // name that says where they apply rather than when
                            // they were drawn.
                            //
                            // Aug 20 is dated rather than numbered because it is
                            // not a step in the flow — it is a second pass over
                            // the issuance screen, from the note about issuing a
                            // whole foursome at once.
                            "Aug 20",
                            [
                                "Overview",
                                // A before B, and the two option folders carry
                                // the same story names wherever they show the
                                // same situation, so the comparison is a
                                // sideways move rather than a hunt.
                                "Option A — Row per player",
                                "Option B — One stop for the group",
                                // Last, and holding both options, because it is
                                // the trip rather than the screen — and running
                                // A then B back to back is the comparison the
                                // whole folder exists to make.
                                "End to end",
                            ],
                            // Steps 3 and 4, which Aug 20 does not touch.
                            "Record & register",
                        ],
                    ],
                    // "∕" is U+2215 (division slash), not "/" — a real slash would
                    // split this into two nested folders in the sidebar.
                    // "PIN Sign In" is the shipping app's real screen (replica
                    // theme, via the `replica` parameter); the rest are
                    // design-system proposals.
                    "Sign in ∕ Sign up",
                    ["PIN Sign In", "Log in", "Sign up", "Forgot password", "Verification"],
                    "*",
                ],
            },
        },

        controls: {
            matchers: { color: /(background|color)$/i, date: /Date$/i },
        },

        a11y: {
            // 'todo' surfaces violations in the test UI without failing CI yet.
            test: "todo",
        },
    },

    globalTypes: {
        theme: {
            description: "Color scheme",
            toolbar: {
                title: "Theme",
                icon: "contrast",
                items: [
                    { value: "light", title: "Light", icon: "sun" },
                    { value: "dark", title: "Dark", icon: "moon" },
                ],
                dynamicTitle: true,
            },
        },
    },

    initialGlobals: {
        theme: "light",
        // The 10" landscape tablet is the primary device — stories open on it.
        viewport: { value: "tablet10", isRotated: false },
    },

    decorators: [
        (Story, context) => {
            const mode = (context.globals.theme as "light" | "dark") ?? "light";

            // As-is replicas of the shipping app render on the replica theme
            // (MD2, ALL-CAPS, 4px radii); everything else is the Birdie design
            // system on `birdieTheme`. See CLAUDE.md.
            //
            // `App Screens/*` opts in by default, but the flag is a parameter so
            // a replica can live outside that folder — the shipping app's nav
            // drawer and PIN screen sit under `App Chrome` beside the
            // design-system POS Shell, and must not inherit its theme.
            const isReplica = (context.parameters.replica as boolean | undefined) ?? context.title.startsWith("App Screens");

            if (isReplica) {
                return (
                    <ThemeProvider theme={appReplicaTheme}>
                        <CssBaseline />
                        <Story />
                    </ThemeProvider>
                );
            }

            return (
                <ThemeProvider theme={birdieTheme} defaultMode={mode}>
                    <ColorSchemeSync mode={mode} />
                    <CssBaseline />
                    <Story />
                </ThemeProvider>
            );
        },
    ],
};

export default preview;
