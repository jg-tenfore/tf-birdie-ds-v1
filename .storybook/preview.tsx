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
            storySort: {
                method: "alphabetical",
                order: [
                    "Introduction",
                    "Foundations",
                    ["Overview", "Colors", "Typography", "Spacing & Layout", "Radius & Elevation", "Touch Targets", "Icons", "Logos"],
                    "Components",
                    ["Actions", "Forms", "Feedback & Status", "Layout & Structure", "Charts & Data", "Media & Visuals", "Navigation"],
                    "App Chrome",
                    // Mirrors the shipping app's own flyout grouping so the
                    // sidebar teaches the real information architecture.
                    "App Screens",
                    [
                        "Pro Shop",
                        ["Pro Shop Order", "Tee Sheet", "Court Sheet", "Bay Sheet"],
                        "Restaurant",
                        ["Quick Order", "Tabs", "Tables", "Reservations", "Orders & Tips", "Table Chart"],
                        "Operations",
                        ["Customer Search", "Order Lookup", "Time Clock", "Gift Cards", "Events", "Inventory", "Shift"],
                    ],
                    // "∕" is U+2215 (division slash), not "/" — a real slash would
                    // split this into two nested folders in the sidebar.
                    "Sign in ∕ Sign up",
                    ["Log in", "PIN Unlock", "Sign up", "Forgot password", "Verification"],
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

            // `App Screens/*` are an as-is replica of the shipping app, so they
            // render on the replica theme (MD2, ALL-CAPS, 4px radii). Everything
            // else — Foundations, Components, App Chrome — is the Birdie design
            // system and stays on `birdieTheme`. See CLAUDE.md.
            const isReplica = context.title.startsWith("App Screens");

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
