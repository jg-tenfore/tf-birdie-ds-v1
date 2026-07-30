import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import type { StorybookConfig } from "@storybook/react-vite";
import remarkGfm from "remark-gfm";

const here = dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
    stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],

    addons: [
        {
            name: "@storybook/addon-docs",
            // MDX has no table support without GFM, so the Introduction page's two
            // tables were rendering as raw pipe-delimited text.
            options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } },
        },
        "@storybook/addon-a11y",
        "@storybook/addon-themes",
    ],

    framework: "@storybook/react-vite",

    // Served at stable URLs in both dev and the static build, so stories and the
    // Pages landing page reference one path. Resolve with `assetUrl()` /
    // `storeImage()` — never hard-code, since production sits under a subpath.
    staticDirs: [
        { from: "../logos", to: "/logos" },
        // Real product photography for the Pro Shop and Quick Order tiles.
        { from: "../store/images", to: "/store-images" },
    ],

    viteFinal: async (viteConfig, { configType }) => {
        viteConfig.resolve = {
            ...viteConfig.resolve,
            alias: { ...viteConfig.resolve?.alias, "@": resolve(here, "../src") },
        };

        // On GitHub Pages the Storybook lives under a repo subpath, beneath a
        // landing page at the root. Dev stays at "/".
        if (configType === "PRODUCTION") {
            viteConfig.base = "/tf-birdie-ds-v1/storybook/";
        }

        return viteConfig;
    },
};

export default config;
