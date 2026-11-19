/**
 * Drops a Storybook screen into the screen of a product render.
 *
 * The device renders are photographed at an angle, so this is not a paste: the
 * screen is a quad, not a rectangle. Two things are derived from the render
 * itself rather than typed in by hand, because hand-typed numbers are what made
 * the first pass wrong:
 *
 *   1. **The quad** — the four screen corners, found by fitting a line to each
 *      edge of the lit screen area and intersecting them. Corner-extreme
 *      detection lands *inside* the rounded corners and leaves a sliver of the
 *      stock wallpaper down one side.
 *
 *   2. **The mask** — the screen's exact silhouette, rounded corners and camera
 *      notch included, used as an alpha mask over the transformed screenshot.
 *      A rounded rectangle guessed by eye fills the corners the bezel should
 *      own and paints over the notch.
 *
 * Detection keys on the stock wallpaper being blue against a black bezel and a
 * white backdrop — true of the Quest handheld renders. A render with a
 * different wallpaper needs `isScreenPixel` below revisited.
 *
 * Usage:
 *
 *   node scripts/device-mockup.mjs \
 *     --story mobile-screens-4-baysheet--bay-sheet \
 *     --out references/111826/export/baysheet \
 *     references/111826/QuestHandheld.webp references/111826/QuestHandheld_Hand.webp
 *
 * Options:
 *   --story <id>     Storybook story id to capture (required)
 *   --out <dir>      output directory (required)
 *   --size <px>      output width, default 2000; 0 keeps each render's own size
 *   --rim <px>       feathered pixels across the glass/bezel blend, default 3
 *   --supersample <n> capture headroom over the destination size, default 1.5
 *   --bleed <px>     pixels the screenshot overhangs the screen edge, default 1
 *   --ring <px>      leftover-wallpaper ring cleared around a cut-out hole, default 3
 *   --plate <px>     black plate grown past the hole, behind the screenshot, default 8
 *   --screen-only    export just the screen layer, in place, on transparency
 *   --with-screen    write the mockup and the screen layer together
 *   --sb <url>       Storybook origin, default http://localhost:6025
 *   --suffix <text>  appended to each output file name, default the story's last segment
 */

import { mkdir, readFile } from "node:fs/promises";
import { basename, extname, join, resolve } from "node:path";

import { chromium } from "playwright";

const argv = process.argv.slice(2);
const flag = (name, fallback) => {
    const i = argv.indexOf(`--${name}`);
    return i === -1 ? fallback : argv[i + 1];
};
// Flags that take no value, so the argument after them is still a device path
// and not something to swallow.
const BARE_FLAGS = new Set(["--screen-only", "--with-screen"]);
const devices = argv.filter((a, i) => !a.startsWith("--") && !(i > 0 && argv[i - 1].startsWith("--") && !BARE_FLAGS.has(argv[i - 1])));

const STORY = flag("story");
const OUT_DIR = flag("out");
// Twice the renders' own 1000px. Pass --size 0 for their native size instead:
// nothing is resampled there and the mask edge needs no repair, but the screen
// is only ~155px across, so the UI inside it is small.
const SIZE = Number(flag("size", 2000));
const SB = flag("sb", "http://localhost:6025");
const SUFFIX = flag("suffix", STORY ? STORY.split("--").pop() : "screen");
const RIM = Number(flag("rim", 3));
const SOFT = Number(flag("rim-soft", 0));
const SUPERSAMPLE = Number(flag("supersample", 1.5));
const BLEED = Number(flag("bleed", 1));
const RING = Number(flag("ring", 3));
const PLATE = Number(flag("plate", 8));
// Export the screen layer on its own: same perspective and same silhouette,
// no device around it. For compositing the screen into something else.
const SCREEN_ONLY = argv.includes("--screen-only");
// Write both the full mockup and the screen layer from one capture, instead of
// running the whole pipeline twice for the same story.
const WITH_SCREEN = argv.includes("--with-screen");

if (!STORY || !OUT_DIR || devices.length === 0) {
    console.error("usage: device-mockup.mjs --story <id> --out <dir> [--size 2000] <device image...>");
    process.exit(1);
}

const mime = (p) => ({ ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" })[extname(p).toLowerCase()];
const dataUrl = async (p) => `data:${mime(p)};base64,${(await readFile(p)).toString("base64")}`;

/**
 * Tags the story's device frame and returns its size.
 *
 * Runs twice — once to size the capture, once in the page that is captured —
 * so it also leaves the marker attribute behind.
 */
const findFrame = () => {
    let best = null;
    for (const el of document.querySelectorAll("div")) {
        const r = el.getBoundingClientRect();
        if (r.width < 200 || r.height < 400) continue;
        const ratio = r.height / r.width;
        if (ratio < 1.5 || ratio > 2.4) continue;
        if (!best || r.height > best.h) best = { el, w: r.width, h: r.height };
    }
    if (!best) return null;
    best.el.setAttribute("data-mockup-target", "1");
    // The frame's own backdrop is the light app canvas, and the status and nav
    // bars only just cover it. Captured at a fractional scale, a sub-pixel
    // sliver of that light grey survives along the bottom edge, and once it is
    // mapped under the render's soft screen edge it reads as a pale dashed line
    // across the bottom of the device. Black is invisible there instead.
    best.el.style.backgroundColor = "#000";
    return { w: best.w, h: best.h };
};

const script = async () => {
    const browser = await chromium.launch();
    await mkdir(resolve(OUT_DIR), { recursive: true });

    // 1. Measure every render first. The screenshot has to be captured at the
    //    size it will end up occupying, and only the quads say what that is.
    const measured = [];
    for (const devicePath of devices) {
        const deviceUrl = await dataUrl(devicePath);
        const mpage = await browser.newPage({ viewport: { width: 10, height: 10 } });
        await mpage.goto("about:blank");
        const geo = await mpage.evaluate(
            async ({ url, rimPx, softPx, ringPx, platePx, sizeOpt }) => {
                const img = new Image();
                img.src = url;
                await img.decode();
                const W = img.naturalWidth,
                    H = img.naturalHeight;
                const c = document.createElement("canvas");
                c.width = W;
                c.height = H;
                const ctx = c.getContext("2d");
                ctx.drawImage(img, 0, 0);
                const { data } = ctx.getImageData(0, 0, W, H);

                // A render whose screen has already been cut out tells us the
                // silhouette exactly: the screen *is* the hole. Find it as the
                // largest fully transparent region that does not reach the image
                // border — the border-touching one is the backdrop around the
                // device. Anything still opaque inside it, the camera notch
                // above all, stays part of the device and needs no special case.
                const findCutout = () => {
                    const clear = new Uint8Array(W * H);
                    let any = 0;
                    for (let q = 0, v = 0; q < data.length; q += 4, v++)
                        if (data[q + 3] < 16) {
                            clear[v] = 1;
                            any++;
                        }
                    if (!any) return null;
                    const walked = new Uint8Array(W * H);
                    let winner = null;
                    for (let s0 = 0; s0 < W * H; s0++) {
                        if (!clear[s0] || walked[s0]) continue;
                        const st = [s0];
                        walked[s0] = 1;
                        const comp = [];
                        let touchesBorder = false;
                        while (st.length) {
                            const v = st.pop();
                            comp.push(v);
                            const x = v % W,
                                y = (v / W) | 0;
                            if (x === 0 || y === 0 || x === W - 1 || y === H - 1) touchesBorder = true;
                            for (const n of [x > 0 ? v - 1 : -1, x < W - 1 ? v + 1 : -1, y > 0 ? v - W : -1, y < H - 1 ? v + W : -1]) {
                                if (n >= 0 && clear[n] && !walked[n]) {
                                    walked[n] = 1;
                                    st.push(n);
                                }
                            }
                        }
                        if (touchesBorder) continue;
                        if (comp.length < W * H * 0.005) continue;
                        if (!winner || comp.length > winner.length) winner = comp;
                    }
                    if (!winner) return null;
                    const hole = new Uint8Array(W * H);
                    for (const v of winner) hole[v] = 1;
                    return hole;
                };
                const cutout = findCutout();

                let shape;
                let alpha = null;
                let deviceClean = null;
                let plateUrl = null;
                let holeMask = null;
                let minX = 1e9,
                    maxX = -1e9,
                    minY = 1e9,
                    maxY = -1e9;
                if (cutout) {
                    // Nothing to grow, smooth or feather: the edge is already
                    // exact, and the render's own alpha will do the blending.
                    shape = cutout;

                    // Erase whatever is left of the old screen around the hole.
                    //
                    // Cutting the screen out by hand leaves a ring of the
                    // original wallpaper in the anti-aliased boundary: pixels
                    // that are part wallpaper, part bezel, and so neither fully
                    // erased nor fully opaque. They are invisible against a
                    // white page but the screenshot now sits underneath them,
                    // and a semi-transparent blue ring over it reads as a teal
                    // hairline around the whole screen.
                    //
                    // Growing out from the hole and clearing anything that
                    // still leans blue removes it, and stops at the bezel,
                    // which is neutral and so never matches.
                    const cleaned = new Uint8ClampedArray(data);
                    let ring = cutout.slice();
                    for (let pass = 0; pass < ringPx; pass++) {
                        const next = ring.slice();
                        for (let y = 1; y < H - 1; y++) {
                            for (let x = 1; x < W - 1; x++) {
                                const v = y * W + x;
                                if (ring[v]) continue;
                                if (!(ring[v - 1] || ring[v + 1] || ring[v - W] || ring[v + W])) continue;
                                const i = v * 4;
                                // Only pixels the cut-out already bit into. A
                                // fully opaque pixel is device, however blue it
                                // reads — dark neutrals in a render lean blue,
                                // and clearing those punched holes in the bezel
                                // that the white page showed straight through.
                                // Hue alone, and no alpha condition: the
                                // remnant down the left edge is a pixel or two
                                // of wallpaper left fully opaque, so anything
                                // keyed on partial alpha walks straight past
                                // it. The bezel beside it is neutral — a blue
                                // lean of about two — so a firm threshold
                                // separates them, and the plate behind means
                                // over-reaching shows black rather than page.
                                if (cleaned[i + 2] - cleaned[i] > 12) {
                                    cleaned[i + 3] = 0;
                                    next[v] = 1;
                                }
                            }
                        }
                        ring = next;
                    }
                    // Soften the cut.
                    //
                    // A hole cut by hand has a hard edge: alpha goes 0 to 255
                    // in one pixel, so a boundary at any angle other than
                    // vertical comes out as a visible staircase. Setting each
                    // boundary pixel's alpha from how much of its 3x3
                    // neighbourhood is hole gives it the one pixel of
                    // anti-aliasing a render would have had. Only ever made
                    // more transparent, never less, so the bezel cannot creep
                    // inwards.
                    const holeFinal = cutout.slice();
                    for (let v = 0; v < W * H; v++) if (ring[v]) holeFinal[v] = 1;
                    for (let y = 1; y < H - 1; y++) {
                        for (let x = 1; x < W - 1; x++) {
                            const v = y * W + x;
                            let n = 0;
                            for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) n += holeFinal[v + dy * W + dx];
                            if (!n) continue;
                            const i = v * 4;
                            // Only where the cut is genuinely hard. Coverage
                            // from a 3x3 window has nine levels, which is
                            // coarse; imposing it on an edge that already has
                            // real anti-aliasing — the notch does — replaces
                            // smooth values with stepped ones and makes it look
                            // chewed. A pixel that is already partly
                            // transparent is left exactly as the render had it.
                            if (cleaned[i + 3] < 250) continue;
                            const lit = Math.round(255 * (1 - n / 9));
                            if (lit < 255) cleaned[i + 3] = lit;
                        }
                    }

                    // Widen the edge ramp before it is scaled up.
                    //
                    // The render carries one pixel of anti-aliasing at the
                    // screen edge. That is enough at its own size, but the
                    // export is twice that, so a one-pixel ramp arrives as a
                    // two-pixel step and a shallow-angled edge reads as a
                    // staircase. Averaging alpha across a small window just
                    // along the boundary spreads the ramp over about two source
                    // pixels, which survives the scale-up as a gradient instead.
                    //
                    // Restricted to a band around the boundary: a blur over the
                    // whole alpha channel would eat the device's own outline and
                    // smear the soft shadow under it.
                    const upscaling = sizeOpt > W * 1.01;
                    let dil = holeFinal.slice();
                    let ero = holeFinal.slice();
                    for (let pass = 0; pass < 2; pass++) {
                        const grown = dil.slice();
                        const shrunk = ero.slice();
                        for (let y = 1; y < H - 1; y++) {
                            for (let x = 1; x < W - 1; x++) {
                                const v = y * W + x;
                                if (!dil[v] && (dil[v - 1] || dil[v + 1] || dil[v - W] || dil[v + W])) grown[v] = 1;
                                if (ero[v] && !(ero[v - 1] && ero[v + 1] && ero[v - W] && ero[v + W])) shrunk[v] = 0;
                            }
                        }
                        dil = grown;
                        ero = shrunk;
                    }
                    const before = new Uint8ClampedArray(W * H);
                    for (let v = 0; v < W * H; v++) before[v] = cleaned[v * 4 + 3];
                    for (let y = 1; y < H - 1; y++) {
                        for (let x = 1; x < W - 1; x++) {
                            const v = y * W + x;
                            if (!upscaling || !dil[v] || ero[v]) continue;
                            const a =
                                before[v - W - 1] +
                                2 * before[v - W] +
                                before[v - W + 1] +
                                2 * before[v - 1] +
                                4 * before[v] +
                                2 * before[v + 1] +
                                before[v + W - 1] +
                                2 * before[v + W] +
                                before[v + W + 1];
                            cleaned[v * 4 + 3] = Math.round(a / 16);
                        }
                    }

                    // A black plate behind the screen, shaped from the hole
                    // itself and grown outwards.
                    //
                    // A hand cut-out does not stop neatly at the glass: here it
                    // has nicked the bottom bezel, leaving partly erased pixels
                    // a little outside the screen. Those let the white page
                    // through as a pale dashed line along the bottom edge. A
                    // plate that follows the hole covers them; a rectangle sized
                    // to the screen quad does not reach, which is why the line
                    // survived one. It stays well inside the device body, so it
                    // cannot show past the outer silhouette or darken the soft
                    // shadow beneath the device.
                    let plate = holeFinal.slice();
                    for (let pass = 0; pass < platePx; pass++) {
                        const next = plate.slice();
                        for (let y = 1; y < H - 1; y++) {
                            for (let x = 1; x < W - 1; x++) {
                                const v = y * W + x;
                                if (plate[v]) continue;
                                if (plate[v - 1] || plate[v + 1] || plate[v - W] || plate[v + W]) next[v] = 1;
                            }
                        }
                        plate = next;
                    }
                    const pc = document.createElement("canvas");
                    pc.width = W;
                    pc.height = H;
                    const pctx = pc.getContext("2d");
                    const pi = pctx.createImageData(W, H);
                    for (let v = 0; v < W * H; v++) {
                        if (!plate[v]) continue;
                        pi.data[v * 4 + 3] = 255;
                    }
                    pctx.putImageData(pi, 0, 0);
                    plateUrl = pc.toDataURL("image/png");

                    // The complement of the device's alpha is precisely where
                    // the screen shows through — rounded corners, notch and the
                    // softened edge included — so it doubles as the clip for a
                    // screen-only export.
                    const sc = document.createElement("canvas");
                    sc.width = W;
                    sc.height = H;
                    const sctx = sc.getContext("2d");
                    const si = sctx.createImageData(W, H);
                    for (let v = 0; v < W * H; v++) {
                        si.data[v * 4] = 255;
                        si.data[v * 4 + 1] = 255;
                        si.data[v * 4 + 2] = 255;
                        si.data[v * 4 + 3] = 255 - cleaned[v * 4 + 3];
                    }
                    sctx.putImageData(si, 0, 0);
                    holeMask = sc.toDataURL("image/png");

                    const dc = document.createElement("canvas");
                    dc.width = W;
                    dc.height = H;
                    const dctx = dc.getContext("2d");
                    const di = dctx.createImageData(W, H);
                    di.data.set(cleaned);
                    dctx.putImageData(di, 0, 0);
                    deviceClean = dc.toDataURL("image/png");
                } else {
                    // The lit screen: blue-leaning and bright, excluding the white backdrop.
                    const isScreenPixel = (r, g, b, a) => a > 200 && b - r > 10 && b > 110 && !(r > 235 && g > 235 && b > 235);

                    const mask = new Uint8Array(W * H);
                    for (let i = 0, px = 0; i < data.length; i += 4, px++) {
                        if (isScreenPixel(data[i], data[i + 1], data[i + 2], data[i + 3])) mask[px] = 1;
                    }

                    // Largest connected run of those pixels — the screen, not a blue
                    // accent on the device body.
                    const seen = new Uint8Array(W * H);
                    let best = null;
                    for (let s = 0; s < W * H; s++) {
                        if (!mask[s] || seen[s]) continue;
                        const stack = [s];
                        seen[s] = 1;
                        const comp = [];
                        while (stack.length) {
                            const v = stack.pop();
                            comp.push(v);
                            const x = v % W,
                                y = (v / W) | 0;
                            for (const n of [x > 0 ? v - 1 : -1, x < W - 1 ? v + 1 : -1, y > 0 ? v - W : -1, y < H - 1 ? v + W : -1]) {
                                if (n >= 0 && mask[n] && !seen[n]) {
                                    seen[n] = 1;
                                    stack.push(n);
                                }
                            }
                        }
                        if (!best || comp.length > best.length) best = comp;
                    }
                    if (!best) return null;

                    const screen = new Uint8Array(W * H);
                    for (const v of best) {
                        screen[v] = 1;
                        const x = v % W,
                            y = (v / W) | 0;
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }

                    // Fill interior holes — the wallpaper's white clock text punches
                    // holes that would otherwise show through the finished mockup. A
                    // flood from the bounding box edge reaches the outside and the
                    // notch (which opens onto the top edge) but not the clock, so the
                    // notch survives as a cutout, which is what we want.
                    const x0 = Math.max(0, minX - 2),
                        x1 = Math.min(W - 1, maxX + 2);
                    const y0 = Math.max(0, minY - 2),
                        y1 = Math.min(H - 1, maxY + 2);
                    const outside = new Uint8Array(W * H);
                    const stack = [];
                    for (let x = x0; x <= x1; x++) {
                        stack.push(y0 * W + x, y1 * W + x);
                    }
                    for (let y = y0; y <= y1; y++) {
                        stack.push(y * W + x0, y * W + x1);
                    }
                    for (const s of stack) if (!screen[s]) outside[s] = 1;
                    const work = stack.filter((s) => outside[s]);
                    while (work.length) {
                        const v = work.pop();
                        const x = v % W,
                            y = (v / W) | 0;
                        for (const n of [x > x0 ? v - 1 : -1, x < x1 ? v + 1 : -1, y > y0 ? v - W : -1, y < y1 ? v + W : -1]) {
                            if (n >= 0 && !screen[n] && !outside[n]) {
                                outside[n] = 1;
                                work.push(n);
                            }
                        }
                    }
                    const filled = new Uint8Array(W * H);
                    for (let y = y0; y <= y1; y++) {
                        for (let x = x0; x <= x1; x++) {
                            const v = y * W + x;
                            if (screen[v] || !outside[v]) filled[v] = 1;
                        }
                    }

                    // Creep the silhouette outwards across the anti-aliased rim.
                    //
                    // Where the glass meets the bezel the render blends wallpaper into
                    // black. Those blend pixels are too dark to pass the screen test,
                    // so they sit just outside the mask and show through the finished
                    // mockup as a blue hairline. Growing into them — but only while the
                    // pixel still leans blue, so the growth stops dead at the neutral
                    // bezel rather than spilling onto the device body — removes it.
                    //
                    // Eroding instead is the trap: outside the mask it is the render
                    // that shows, and right there the render *is* wallpaper, so pulling
                    // in exposes a brighter ring of exactly what you were hiding.
                    // Same hue test the screen uses, minus its brightness floor: that
                    // floor is exactly what the dark blend pixels fail. Keeping the hue
                    // test strict is what stops the growth at the bezel, which is
                    // near-neutral and so never passes it.
                    // The strict passes stop one pixel short: the very last blend is
                    // mostly bezel and its blue lean has decayed below the threshold,
                    // leaving a dark teal hairline. One relaxed pass picks it up. Only
                    // one, and only at the end — running the loose test for several
                    // passes walks straight across the bezel and squares off the
                    // rounded corners.
                    // ...and feather it, rather than growing a hard edge by N pixels.
                    //
                    // The render's screen edge is anti-aliased: the boundary pixels are
                    // part wallpaper, part bezel. A binary mask has to call each of them
                    // one or the other, and whichever way it calls them a hairline
                    // survives — wallpaper left showing on the outside, or screenshot
                    // spilling onto the bezel. Neither amount of growing or eroding
                    // fixes that, because the problem is the hard edge itself.
                    //
                    // So alpha tracks how much wallpaper each boundary pixel holds,
                    // measured by how blue it still leans. The screenshot then fades out
                    // across exactly the span the wallpaper faded out across, and the
                    // seam disappears instead of moving.
                    // Reach the true glass edge, then smooth it, then anti-alias it.
                    //
                    // Estimating per-pixel coverage from how blue a pixel is looked
                    // principled but is not: the wallpaper's own colour varies, so
                    // wherever it runs pale the estimate collapses and the mask edge
                    // wanders inwards. That is what made one edge come out wavy —
                    // the boundary was tracking the wallpaper's pattern instead of
                    // the glass. Coverage has to come from the silhouette's
                    // geometry, not from the colour inside it.
                    let bin = filled.slice();
                    for (let pass = 0; pass < rimPx + softPx; pass++) {
                        const next = bin.slice();
                        for (let y = 1; y < H - 1; y++) {
                            for (let x = 1; x < W - 1; x++) {
                                const v = y * W + x;
                                if (bin[v]) continue;
                                if (!(bin[v - 1] || bin[v + 1] || bin[v - W] || bin[v + W])) continue;
                                const i = v * 4;
                                const r = data[i],
                                    g = data[i + 1],
                                    b = data[i + 2],
                                    a = data[i + 3];
                                if (a <= 200 || (r > 235 && g > 235 && b > 235)) continue;
                                if (b - r > 10) next[v] = 1;
                            }
                        }
                        bin = next;
                    }

                    // Majority filter: a pixel joins the side most of its neighbours
                    // are on. Pale highlights meeting the edge, and the odd stray
                    // pixel of anti-aliasing, leave single-pixel bites out of the
                    // boundary; this fills them without touching the corner radius
                    // or the notch, both of which are far larger than the window.
                    for (let pass = 0; pass < 2; pass++) {
                        const next = bin.slice();
                        for (let y = 1; y < H - 1; y++) {
                            for (let x = 1; x < W - 1; x++) {
                                const v = y * W + x;
                                let n = 0;
                                for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) n += bin[v + dy * W + dx];
                                next[v] = n >= 5 ? 1 : 0;
                            }
                        }
                        bin = next;
                    }

                    // One pixel of anti-aliasing, as the mean of the 3x3 around each
                    // pixel: smooth where the edge runs diagonally, hard where it
                    // runs straight.
                    alpha = new Float32Array(W * H);
                    for (let y = 1; y < H - 1; y++) {
                        for (let x = 1; x < W - 1; x++) {
                            const v = y * W + x;
                            let n = 0;
                            for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) n += bin[v + dy * W + dx];
                            if (n) alpha[v] = n / 9;
                        }
                    }
                    shape = bin;
                }

                // The scans below walk this box, so it has to describe the grown shape.
                minX = 1e9;
                maxX = -1e9;
                minY = 1e9;
                maxY = -1e9;
                for (let y = 0; y < H; y++) {
                    for (let x = 0; x < W; x++) {
                        if (!shape[y * W + x]) continue;
                        if (x < minX) minX = x;
                        if (x > maxX) maxX = x;
                        if (y < minY) minY = y;
                        if (y > maxY) maxY = y;
                    }
                }

                // Edge lines from the final silhouette, trimmed well clear of the
                // rounded corners, then intersected for the true corners.
                //
                // Fitted *after* the rim growth below, not before: the mask is what
                // decides which pixels are visible, so the quad the screenshot is
                // mapped onto has to be the mask's own edge. Fitting the un-grown
                // shape instead leaves the mask a pixel or two proud of the
                // screenshot all down both sides, and that gap shows as wallpaper.
                const fit = (pts) => {
                    const n = pts.length;
                    let sx = 0,
                        sy = 0,
                        sxx = 0,
                        sxy = 0;
                    for (const [u, v] of pts) {
                        sx += u;
                        sy += v;
                        sxx += u * u;
                        sxy += u * v;
                    }
                    const m = (n * sxy - sx * sy) / (n * sxx - sx * sx);
                    return { m, b: (sy - m * sx) / n };
                };
                const hSpan = maxY - minY,
                    wSpan = maxX - minX;
                const leftPts = [],
                    rightPts = [],
                    topPts = [],
                    botPts = [];
                for (let y = Math.ceil(minY + hSpan * 0.18); y <= Math.floor(maxY - hSpan * 0.18); y++) {
                    let lo = -1,
                        hi = -1;
                    for (let x = minX; x <= maxX; x++)
                        if (shape[y * W + x]) {
                            if (lo < 0) lo = x;
                            hi = x;
                        }
                    if (lo >= 0) {
                        leftPts.push([y, lo]);
                        rightPts.push([y, hi]);
                    }
                }
                for (let x = Math.ceil(minX + wSpan * 0.2); x <= Math.floor(maxX - wSpan * 0.2); x++) {
                    const inNotch = Math.abs(x - (minX + maxX) / 2) < wSpan * 0.18;
                    let lo = -1,
                        hi = -1;
                    for (let y = minY; y <= maxY; y++)
                        if (shape[y * W + x]) {
                            if (lo < 0) lo = y;
                            hi = y;
                        }
                    if (lo >= 0) {
                        if (!inNotch) topPts.push([x, lo]);
                        botPts.push([x, hi]);
                    }
                }
                const L = fit(leftPts),
                    R = fit(rightPts),
                    T = fit(topPts),
                    B = fit(botPts);
                const corner = (V, Hh) => {
                    const x = (V.m * Hh.b + V.b) / (1 - V.m * Hh.m);
                    return [x, Hh.m * x + Hh.b];
                };

                // Mask PNG: opaque over the screen silhouette, clear elsewhere,
                // at the render's own resolution and left for the browser to
                // scale smoothly.
                //
                // Replicating each pixel into an NxN block to "keep it sharp"
                // is what made the edges look chewed: alpha is a continuous
                // coverage field, and quantising it into square blocks turns a
                // smooth diagonal into a staircase. Interpolating between
                // coverage values is the correct reconstruction, and costs
                // about a pixel of softness against a visibly ragged edge.
                let maskUrl = null;
                if (!cutout) {
                    const mc = document.createElement("canvas");
                    mc.width = W;
                    mc.height = H;
                    const mctx = mc.getContext("2d");
                    const out = mctx.createImageData(W, H);
                    for (let px = 0; px < W * H; px++) {
                        const a = alpha[px];
                        if (a <= 0) continue;
                        out.data[px * 4] = 255;
                        out.data[px * 4 + 1] = 255;
                        out.data[px * 4 + 2] = 255;
                        out.data[px * 4 + 3] = Math.round(Math.min(1, a) * 255);
                    }
                    mctx.putImageData(out, 0, 0);
                    maskUrl = mc.toDataURL("image/png");
                }

                return {
                    W,
                    H,
                    tl: corner(L, T),
                    tr: corner(R, T),
                    br: corner(R, B),
                    bl: corner(L, B),
                    mask: maskUrl,
                    device: deviceClean,
                    plate: plateUrl,
                    holeMask,
                };
            },
            { url: deviceUrl, rimPx: RIM, softPx: SOFT, ringPx: RING, platePx: PLATE, sizeOpt: SIZE },
        );
        await mpage.close();
        if (!geo) throw new Error(`no screen found in ${devicePath}`);
        measured.push({ devicePath, deviceUrl, geo });
    }

    // 2. Capture the story at the resolution it will actually occupy.
    //
    //    A fixed 3x capture was the other reason these came out soft. The screen
    //    is only ~150px of a 1000px render, so a 1206px-wide capture had to be
    //    squeezed by nearly 4x, and the browser resamples a perspective
    //    transform in one bilinear step — no mipmaps — which is what frayed the
    //    hairlines and type. Rendering close to the destination size means the
    //    text is drawn at its final size rather than reconstructed from a much
    //    larger bitmap, with SUPERSAMPLE of headroom so the downsample still
    //    has something to average.
    const probe = await browser.newPage({ viewport: { width: 700, height: 1100 } });
    await probe.goto(`${SB}/iframe.html?id=${STORY}&viewMode=story`, { waitUntil: "networkidle" });
    await probe.waitForTimeout(1200);
    const frame = await probe.evaluate(findFrame);
    await probe.close();
    if (!frame) throw new Error(`no device frame found in story ${STORY}`);

    const span = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
    let need = 0;
    for (const { geo } of measured) {
        const outScale = SIZE ? SIZE / geo.W : 1;
        const qw = Math.max(span(geo.tl, geo.tr), span(geo.bl, geo.br)) * outScale;
        const qh = Math.max(span(geo.tl, geo.bl), span(geo.tr, geo.br)) * outScale;
        need = Math.max(need, qw / frame.w, qh / frame.h);
    }
    const dpr = Math.min(3, Math.max(0.75, need * SUPERSAMPLE));

    const shotPage = await browser.newPage({ viewport: { width: 700, height: 1100 }, deviceScaleFactor: dpr });
    await shotPage.goto(`${SB}/iframe.html?id=${STORY}&viewMode=story`, { waitUntil: "networkidle" });
    await shotPage.waitForTimeout(1500);
    await shotPage.evaluate(findFrame);
    // Black out the page behind the frame before capturing.
    //
    // The capture scale is fractional, so the frame's edges land on partial
    // pixels and the outermost row is a blend of the frame and whatever is
    // behind it. Against Storybook's white page that blend came out light grey,
    // and once mapped under the render's soft screen edge it read as a pale
    // dashed line along the bottom of the device. Blending black into black
    // leaves nothing to see.
    await shotPage.evaluate(() => {
        document.documentElement.style.background = "#000";
        document.body.style.background = "#000";
    });
    await shotPage.waitForTimeout(150);
    const shot = await shotPage.locator('[data-mockup-target="1"]').screenshot();
    const screenUrl = `data:image/png;base64,${shot.toString("base64")}`;
    await shotPage.close();
    console.log(`captured ${STORY} at ${frame.w}x${frame.h} @ ${dpr.toFixed(2)}x`);

    // 3. Compose.
    for (const { devicePath, deviceUrl, geo } of measured) {
        // Push the quad out far enough that the screenshot covers the whole
        // feathered edge, including the part of the ramp that lies outside the
        // half-coverage contour the quad was fitted to. The mask trims the
        // overhang, so this only guarantees nothing of the render peeks through.
        //
        // By a fixed number of pixels along each edge, not by a percentage.
        // Scaling the quad 2% about its centre pushed the top edge up by ~4px
        // of render, which is ~16px of a 797px design — most of a 24px status
        // bar. The clock and the wifi and signal icons were being pushed up
        // behind the bezel and clipped. A couple of pixels along the normal
        // costs a fraction of that and is all the coverage actually needs.
        const quad = bleedQuad(geo, BLEED);

        const m = homography(frame.w, frame.h, quad);

        // A black pane a little larger than the screenshot, directly beneath it.
        //
        // A hand-cut hole is not perfectly regular — it overshoots the glass by
        // a pixel here and there — and anywhere the screenshot fails to reach,
        // the page behind it shows through as a white nick. Backing it with
        // black means those slivers read as switched-off screen instead, which
        // is invisible against the bezel. Cheaper and steadier than trying to
        // chase the exact outline of someone's eraser.
        const backing = homography(frame.w, frame.h, bleedQuad(geo, BLEED + 4));

        // The render is composed at its own pixel size and rasterised at the
        // ratio that reaches the requested output, so the device art is never
        // resampled twice and the screenshot downsamples from its 3x capture.
        const composePage = await browser.newPage({
            viewport: { width: geo.W, height: geo.H },
            deviceScaleFactor: SIZE ? SIZE / geo.W : 1,
        });
        await composePage.goto("about:blank");

        const variants = SCREEN_ONLY ? [true] : WITH_SCREEN ? [false, true] : [false];
        for (const asScreen of variants) {
            const out = await composePage.evaluate(
                async ({ deviceUrl, screenUrl, mask, m, backing, plate, screenOnly, W, H, fw, fh }) => {
                    document.body.style.margin = "0";
                    // Transparent, so the export keeps the render's own cut-out
                    // background instead of baking a white page into it.
                    document.body.style.background = "transparent";
                    document.documentElement.style.background = "transparent";
                    const backingPane = plate
                        ? `<img src="${plate}" style="position:absolute;left:0;top:0;width:${W}px;height:${H}px">`
                        : `<div style="position:absolute;left:0;top:0;
                     width:${fw}px;height:${fh}px;background:#000;transform-origin:0 0;
                     transform:matrix3d(${backing.join(",")})"></div>`;
                    const screenImg = `<img src="${screenUrl}" style="position:absolute;left:0;top:0;
                     width:${fw}px;height:${fh}px;transform-origin:0 0;
                     transform:matrix3d(${m.join(",")})">`;
                    const deviceImg = `<img src="${deviceUrl}" style="position:absolute;left:0;top:0;width:${W}px;height:${H}px">`;

                    // With the screen cut out of the render there is nothing to mask
                    // against: the screenshot goes underneath and shows through the
                    // hole, and the render's own alpha does the blending. That is
                    // why a cut-out render is worth the extra step in whatever tool
                    // made it — every edge artefact we have chased on this screen
                    // comes from inferring a silhouette that was thrown away, and
                    // here it simply is not thrown away. The notch and the rounded
                    // corners are opaque device, so they sit on top for free.
                    if (screenOnly) {
                        // The whole screenshot, unclipped: no notch cut out, no
                        // corners rounded. Only the perspective is kept, and the
                        // placement matches the full mockup, so this registers
                        // exactly over its device counterpart.
                        document.body.innerHTML = `
                    <div style="position:relative;width:${W}px;height:${H}px;overflow:hidden">
                        ${screenImg}
                    </div>`;
                        await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
                        return true;
                    }
                    document.body.innerHTML = mask
                        ? `
                    <div style="position:relative;width:${W}px;height:${H}px;overflow:hidden">
                        ${deviceImg}
                        <div style="position:absolute;left:0;top:0;width:${W}px;height:${H}px;
                                    -webkit-mask-image:url(${mask});mask-image:url(${mask});
                                    -webkit-mask-size:${W}px ${H}px;mask-size:${W}px ${H}px;
                                    -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat">
                            ${screenImg}
                        </div>
                    </div>`
                        : `
                    <div style="position:relative;width:${W}px;height:${H}px;overflow:hidden">
                        ${backingPane}
                        ${screenImg}
                        ${deviceImg}
                    </div>`;
                    await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
                    return true;
                },
                {
                    deviceUrl: geo.device ?? deviceUrl,
                    screenUrl,
                    mask: geo.mask,
                    m,
                    backing,
                    plate: geo.plate,
                    screenOnly: asScreen,
                    W: geo.W,
                    H: geo.H,
                    fw: frame.w,
                    fh: frame.h,
                },
            );
            if (!out) throw new Error("compose failed");
            await composePage.waitForTimeout(400);

            const slug = basename(devicePath, extname(devicePath))
                .replace(/([a-z0-9])([A-Z])/g, "$1-$2") // QuestHandheld -> Quest-Handheld
                .replace(/[^A-Za-z0-9]+/g, "-")
                .toLowerCase();
            const name = `${slug}-${SUFFIX}${asScreen ? "-screen" : ""}.png`;
            const target = join(resolve(OUT_DIR), name);
            await composePage.screenshot({ path: target, omitBackground: true });
            const outW = SIZE || geo.W;
            console.log(`wrote ${name} (${outW}x${Math.round((geo.H / geo.W) * outW)})`);
        }
        await composePage.close();
    }

    await browser.close();
};

/**
 * Offsets each of the quad's four edges outwards by `n` pixels and re-intersects
 * them, so every edge moves the same distance regardless of how long it is.
 *
 * Scaling about the centroid instead moves the long edges much further than the
 * short ones, which on a tall phone screen means the top and bottom overshoot
 * badly while the sides barely move.
 */
function bleedQuad(q, n) {
    const pts = [q.tl, q.tr, q.br, q.bl];
    const cx = pts.reduce((a, p) => a + p[0], 0) / 4;
    const cy = pts.reduce((a, p) => a + p[1], 0) / 4;
    const lines = [];
    for (let i = 0; i < 4; i++) {
        const a = pts[i];
        const b = pts[(i + 1) % 4];
        let dx = b[0] - a[0];
        let dy = b[1] - a[1];
        const len = Math.hypot(dx, dy);
        dx /= len;
        dy /= len;
        let nx = -dy;
        let ny = dx;
        const mx = (a[0] + b[0]) / 2;
        const my = (a[1] + b[1]) / 2;
        if ((mx - cx) * nx + (my - cy) * ny < 0) {
            nx = -nx;
            ny = -ny;
        }
        lines.push({ px: a[0] + nx * n, py: a[1] + ny * n, dx, dy });
    }
    const meet = (l1, l2) => {
        const det = l1.dx * -l2.dy - -l2.dx * l1.dy;
        const t = ((l2.px - l1.px) * -l2.dy - -l2.dx * (l2.py - l1.py)) / det;
        return [l1.px + l1.dx * t, l1.py + l1.dy * t];
    };
    return {
        tl: meet(lines[3], lines[0]),
        tr: meet(lines[0], lines[1]),
        br: meet(lines[1], lines[2]),
        bl: meet(lines[2], lines[3]),
    };
}

/** Homography mapping a w*h rectangle's corners onto four destination points. */
function homography(w, h, d) {
    const src = [
        [0, 0],
        [w, 0],
        [w, h],
        [0, h],
    ];
    const dst = [d.tl, d.tr, d.br, d.bl];
    const A = [],
        B = [];
    for (let i = 0; i < 4; i++) {
        const [x, y] = src[i];
        const [X, Y] = dst[i];
        A.push([x, y, 1, 0, 0, 0, -x * X, -y * X]);
        B.push(X);
        A.push([0, 0, 0, x, y, 1, -x * Y, -y * Y]);
        B.push(Y);
    }
    for (let i = 0; i < 8; i++) {
        let piv = i;
        for (let r = i + 1; r < 8; r++) if (Math.abs(A[r][i]) > Math.abs(A[piv][i])) piv = r;
        [A[i], A[piv]] = [A[piv], A[i]];
        [B[i], B[piv]] = [B[piv], B[i]];
        for (let r = 0; r < 8; r++) {
            if (r === i) continue;
            const f = A[r][i] / A[i][i];
            for (let c = i; c < 8; c++) A[r][c] -= f * A[i][c];
            B[r] -= f * B[i];
        }
    }
    const v = B.map((b, i) => b / A[i][i]);
    const [a, b2, c, d2, e, f, g2, h2] = v;
    return [a, d2, 0, g2, b2, e, 0, h2, 0, 0, 1, 0, c, f, 0, 1];
}

await script();
