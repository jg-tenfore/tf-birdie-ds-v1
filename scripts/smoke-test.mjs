import { chromium } from "playwright";

const BASE = process.env.SMOKE_URL ?? "http://localhost:8098/tf-birdie-ds-v1/prototype/";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

const step = async (label, fn) => {
    try {
        await fn();
        console.log(`  PASS  ${label}`);
    } catch (e) {
        console.log(`  FAIL  ${label} — ${e.message.split("\n")[0]}`);
        process.exitCode = 1;
    }
};

await page.goto(BASE, { waitUntil: "networkidle" });

await step("sign-in screen renders", async () => {
    await page.waitForSelector('input[aria-label="Enter your PIN"]', { timeout: 8000 });
});

await step("PIN sign-in routes to the register", async () => {
    await page.fill('input[aria-label="Enter your PIN"]', "1234");
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForSelector("text=Pro Shop Order", { timeout: 8000 });
});

await step("empty cart shows the antler empty state", async () => {
    await page.waitForSelector("text=No items in order.", { timeout: 5000 });
});

await step("tapping a tile adds a line and a total", async () => {
    await page.getByRole("button", { name: /Green Fees/i }).click();
    await page.getByText("Green fee — 18", { exact: true }).first().click();
    await page.waitForSelector("text=Ticket #", { timeout: 5000 });
    const pay = await page
        .getByRole("button", { name: /Pay \$/ })
        .first()
        .textContent();
    if (!/Pay \$6[0-9]\./.test(pay)) throw new Error(`unexpected pay button: ${pay}`);
});

await step("quantity increases update the total", async () => {
    await page
        .getByRole("button", { name: /^Increase/ })
        .first()
        .click();
    const pay = await page
        .getByRole("button", { name: /Pay \$/ })
        .first()
        .textContent();
    if (!/Pay \$1[0-9][0-9]\./.test(pay)) throw new Error(`total did not double: ${pay}`);
});

await step("PAY routes to tender with the real amount", async () => {
    await page
        .getByRole("button", { name: /Pay \$/ })
        .first()
        .click();
    await page.waitForSelector("text=Amount due", { timeout: 5000 });
    await page.waitForSelector("text=How is this being paid?", { timeout: 5000 });
});

await step("cash tender computes change", async () => {
    await page.getByRole("button", { name: "Cash", exact: true }).click();
    await page.waitForSelector("text=Quick cash", { timeout: 5000 });
    await page.getByRole("button", { name: /^\$\d/ }).first().click();
    await page.waitForSelector("text=Change due", { timeout: 5000 });
});

await step("tender completes the sale", async () => {
    await page.getByRole("button", { name: /Tender \$/ }).click();
    await page.waitForSelector("text=Approved", { timeout: 5000 });
});

await step("completed sale appears in Order Lookup", async () => {
    await page.goto(`${BASE}#/orderlookup`, { waitUntil: "networkidle" });
    await page.waitForSelector("text=Cash", { timeout: 5000 });
});

await step("drawer navigates to the tee sheet", async () => {
    await page.goto(`${BASE}#/proshop`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /open navigation/i }).click();
    await page.getByRole("button", { name: "Tee Sheet", exact: true }).click();
    // The sheet opens on its seeded day, not today — the date bar is orange for exactly that reason.
    await page.waitForSelector("text=TUESDAY, MAY 12 2026", { timeout: 5000 });
});

await step("tee sheet renders four positions per time", async () => {
    await page.waitForSelector("text=/^\\(4\\) Oda Brennevin/", { timeout: 8000 });
    for (const l of ["Total", "Booked", "Paid", "No Shows", "Available"]) await page.waitForSelector(`text=${l}`, { timeout: 4000 });
});

await step("tee-sheet check-in creates a ticket in the register", async () => {
    await page.locator("text=/^\\(4\\) Oda Brennevin/").first().click();
    await page.waitForSelector('input[placeholder^="Search by customer name"]', { timeout: 6000 });
    await page.getByRole("button", { name: /Add all to cart/i }).click();
    await page.waitForSelector("text=/Oda Brennevin — 18 holes/", { timeout: 6000 });
});

await step("held ticket appears on the tabs list", async () => {
    await page.goto(`${BASE}#/proshop`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Pop", exact: true }).click();
    await page.goto(`${BASE}#/tabs`, { waitUntil: "networkidle" });
    await page.waitForSelector("text=/Oda Brennevin/", { timeout: 6000 });
});

await step("court sheet renders six resource columns", async () => {
    await page.goto(`${BASE}#/coursheet`, { waitUntil: "networkidle" });
    for (const c of ["Tennis Court 1", "Swimming Pool #1"]) await page.waitForSelector(`text=${c}`, { timeout: 5000 });
});

await step("bay sheet renders the time-axis calendar", async () => {
    await page.goto(`${BASE}#/baysheet`, { waitUntil: "networkidle" });
    await page.waitForSelector("text=ZOOM OUT", { timeout: 5000 });
    await page.waitForSelector("text=/\\(2\\) Sutton, K\\./", { timeout: 5000 });
});

await step("quick order drills a category into a product list", async () => {
    await page.goto(`${BASE}#/quickorder`, { waitUntil: "networkidle" });
    await page.getByText("Steaks", { exact: true }).first().click();
    await page.waitForSelector("text=Tomahawk Ribeye 45 oz", { timeout: 5000 });
});

const bg = (locator) => locator.evaluate((el) => getComputedStyle(el).backgroundColor);
const rgb = (c) => c.match(/\d+/g).map(Number);
const dateBar = () => page.getByRole("button", { name: /2026$/ }).first();

await step("tee sheet date bar is orange away from today", async () => {
    await page.goto(`${BASE}#/teesheet`, { waitUntil: "networkidle" });
    await page.waitForSelector("text=TUESDAY, MAY 12 2026", { timeout: 5000 });
    const [r, g, b] = rgb(await bg(dateBar()));
    if (!(r > 200 && g > 130 && g < 190 && b < 110)) throw new Error(`not orange: ${r},${g},${b}`);
});

await step("GO TO TODAY jumps to today, turns the bar slate and greys itself out", async () => {
    await page.getByRole("button", { name: "GO TO TODAY" }).click();
    await page.waitForSelector("text=WEDNESDAY, JULY 29 2026", { timeout: 5000 });
    const [r] = rgb(await bg(dateBar()));
    if (r > 150) throw new Error("date bar still orange on today");
    const [tr, tg, tb] = rgb(await bg(page.getByRole("button", { name: "GO TO TODAY" })));
    if (!(Math.abs(tr - tg) < 8 && Math.abs(tg - tb) < 8 && tr > 130)) throw new Error("GO TO TODAY not disabled");
});

await step("date arrows move a day at a time", async () => {
    await page.getByRole("button", { name: "Next day" }).click();
    await page.waitForSelector("text=THURSDAY, JULY 30 2026", { timeout: 5000 });
    await page.getByRole("button", { name: "Previous day" }).click();
    await page.waitForSelector("text=WEDNESDAY, JULY 29 2026", { timeout: 5000 });
});

await step("the date picker opens on the sheet's own month and drives the sheet", async () => {
    await dateBar().click();
    await page.waitForSelector("text=Selected date", { timeout: 5000 });
    await page.waitForSelector("text=JULY 2026", { timeout: 3000 });
    const ok = page.getByRole("button", { name: "OK", exact: true });
    if (!(await ok.isDisabled())) throw new Error("OK is live before a day is chosen");
    await page.getByRole("button", { name: "18", exact: true }).first().click();
    await ok.click();
    await page.waitForSelector("text=SATURDAY, JULY 18 2026", { timeout: 5000 });
});

await step("COMBOS rings a bundle up as its component lines", async () => {
    await page.goto(`${BASE}#/proshop`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Combos" }).click();
    await page.waitForSelector("text=6 Pack Combo", { timeout: 5000 });
    await page.getByText("6 Pack Combo").click();
    for (const l of ["[c] Bud Light", "[c] Stone IPA", "[c] Gratuity"]) {
        await page.waitForSelector(`text=${l.replace("[", "\\[")}`, { timeout: 4000 }).catch(async () => {
            if (!(await page.getByText(l, { exact: true }).count())) throw new Error(`${l} missing`);
        });
    }
});

await step("the 19th Hole menu carries real dishes, prices and descriptions", async () => {
    await page.goto(`${BASE}#/quickorder`, { waitUntil: "networkidle" });
    await page.getByText("Chops & Seafood", { exact: true }).first().click();
    await page.waitForSelector("text=Chilean Sea Bass", { timeout: 5000 });
    await page.waitForSelector("text=Miso-glazed bass over creamed spinach.", { timeout: 3000 });
    await page.waitForTimeout(900);
    const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && !i.naturalWidth).length);
    if (broken) throw new Error(`${broken} dish photos failed to load`);
});

console.log(errors.length ? `\nRUNTIME ERRORS (${errors.length}):` : "\nNo runtime errors.");
errors.slice(0, 6).forEach((e) => console.log("  " + e.slice(0, 160)));
if (errors.length) process.exitCode = 1;

await browser.close();
