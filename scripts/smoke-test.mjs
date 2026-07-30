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
    await page.waitForSelector("text=Credit Card Payment", { timeout: 5000 });
    await page.waitForSelector("text=Grand Total", { timeout: 5000 });
});

await step("checkout shows the ticket pane and the seven tender tabs", async () => {
    await page.waitForSelector("text=Total Owed", { timeout: 5000 });
    for (const t of ["CREDIT", "CASH", "GIFT CARD", "RAIN", "CHECK", "MEMBER", "ROOM"])
        await page.waitForSelector(`text=${t}`, { timeout: 3000 });
});

await step("tender tabs swap the body, typos and all", async () => {
    await page.getByText("GIFT CARD", { exact: true }).click();
    await page.waitForSelector("text=Enter UPC code or customer name", { timeout: 4000 });
    await page.getByText("MEMBER", { exact: true }).click();
    await page.waitForSelector("text=Csutomer Balance", { timeout: 4000 });
    await page.getByText("ROOM", { exact: true }).click();
    await page.waitForSelector("text=LOOK UP ROOM", { timeout: 4000 });
    await page.getByText("CREDIT", { exact: true }).click();
    await page.waitForSelector("text=NAY WITH CARD", { timeout: 4000 });
});

await step("quick-cash keys fill the cash amount", async () => {
    await page.getByText("CASH", { exact: true }).click();
    await page.waitForSelector("text=Charge amount", { timeout: 4000 });
    await page.getByRole("button", { name: "$20.00" }).click();
    await page.waitForSelector('input[value="$20.00"]', { timeout: 4000 });
});

await step("PAY closes the ticket", async () => {
    await page.getByRole("button", { name: "Pay", exact: true }).click();
    await page.waitForSelector("text=Approved", { timeout: 6000 });
});

await step("Order Lookup searches and finds the closed sale", async () => {
    await page.goto(`${BASE}#/orderlookup`, { waitUntil: "networkidle" });
    // The screen opens on criteria, not results — nothing runs until SEARCH.
    await page.waitForSelector("text=Search by Order ID", { timeout: 5000 });
    await page.getByRole("button", { name: "Search" }).click();
    await page.waitForSelector("text=/1 order$/", { timeout: 5000 });
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
    await page.goto(`${BASE}#/tabs`, { waitUntil: "networkidle" });
    const before = await page.evaluate(() => document.body.innerText.match(/\d{4} - /g)?.length ?? 0);
    await page.goto(`${BASE}#/proshop`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Pop", exact: true }).click();
    await page.goto(`${BASE}#/tabs`, { waitUntil: "networkidle" });
    // Asserting a count rather than a name: the checked-in golfer comes from the
    // generated sheet, so hard-coding one couples this test to the seed.
    await page.waitForFunction((n) => (document.body.innerText.match(/\d{4} - /g)?.length ?? 0) > n, before, { timeout: 6000 });
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

const openFirstBooking = async () => {
    await page.goto(`${BASE}#/teesheet`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    await page.locator("text=/^\\(\\d\\) /").first().click();
    await page.waitForTimeout(600);
};

await step("tee time detail prints the reservation's whole commercial line", async () => {
    await openFirstBooking();
    await page.waitForSelector("text=/ID:\\d{8}/", { timeout: 6000 });
    await page.waitForSelector("text=/holes/", { timeout: 3000 });
});

await step("History opens the reservation audit log", async () => {
    await page.getByRole("button", { name: /History/ }).first().click();
    await page.waitForSelector("text=/Reservation History \\d+/", { timeout: 5000 });
    await page.getByRole("button", { name: "OK" }).click();
    await page.waitForTimeout(300);
});

await step("notes dialogs save against the reservation and the time", async () => {
    await page.getByRole("button", { name: "CUSTOMER NOTES" }).first().click();
    await page.waitForSelector("text=Customer Notes", { timeout: 4000 });
    await page.locator("textarea").first().fill("Prefers the back nine");
    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForTimeout(400);

    await page.getByRole("button", { name: "Tee time notes" }).click();
    await page.waitForSelector("text=Tee Time Notes", { timeout: 4000 });
    await page.locator("textarea").first().fill("Shotgun start");
    await page.getByRole("button", { name: "Save" }).click();
    await page.waitForTimeout(400);
});

await step("Edit rewrites the reservation's fees", async () => {
    await page.getByRole("button", { name: /^Edit/ }).first().click();
    await page.waitForSelector("text=Transportation Fee Information", { timeout: 6000 });
    await page.getByRole("button", { name: "Dunes Rack Prime" }).click();
    await page.getByRole("button", { name: "Save", exact: true }).click();
    // The fee name the edit screen wrote is what the detail line now prints.
    await page.waitForSelector("text=/Dunes Rack Prime : \\$/", { timeout: 5000 });
});

await step("cart signout will not complete without a cart number and the waiver", async () => {
    await page.getByRole("button", { name: /Cart signout/ }).first().click();
    await page.waitForSelector("text=Sign Here", { timeout: 5000 });
    const btn = page.getByRole("button", { name: /Sign out cart/ });
    const locked = await btn.evaluate((el) => getComputedStyle(el).backgroundColor);
    await page.locator('input[placeholder="Cart Number"]').fill("42");
    await page.locator('input[type="checkbox"]').first().check();
    await page.waitForTimeout(250);
    if ((await btn.evaluate((el) => getComputedStyle(el).backgroundColor)) === locked) throw new Error("gate never opened");
    await btn.click();
    await page.waitForSelector("text=/ID:\\d{8}/", { timeout: 5000 });
});

await step("the gear menu runs the per-time operations", async () => {
    await page.goto(`${BASE}#/teesheet`, { waitUntil: "networkidle" });
    await page.waitForTimeout(600);

    const gears = page.getByRole("button", { name: /^Options for / });
    const timeRows = () => page.locator("text=/^\\d{1,2}:\\d{2} (AM|PM)$/").count();

    await gears.first().click();
    for (const item of ["Squeeze Before", "Squeeze After", "Clear Time", "Clone Before", "Clone After", "Move Player(s)"]) {
        if (!(await page.getByText(item, { exact: true }).count())) throw new Error(`${item} missing`);
    }

    // Squeezing inserts a time, so the row count is the assertion — the inserted
    // time itself depends on the gap to its neighbour.
    const before = await timeRows();
    await page.getByText("Squeeze After", { exact: true }).click();
    await page.waitForTimeout(500);
    if ((await timeRows()) !== before + 1) throw new Error("squeeze did not insert a time");

    // Move Player(s) is the only command with a second step.
    const count = await gears.count();
    for (let i = 0; i < count; i += 1) {
        await gears.nth(i).click();
        await page.waitForTimeout(150);
        if (await page.getByText("Move Player(s)", { exact: true }).count()) {
            await page.getByText("Move Player(s)", { exact: true }).click();
            break;
        }
    }
    await page.waitForSelector("text=/Move .* to…/", { timeout: 5000 });
    await page.locator("text=/^\\d+ open$/").first().click();
    await page.waitForSelector("text=/^(Moved \\d+ to |.* only has room)/", { timeout: 5000 });
});

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

await step("Table Chart's room sheet lists every configured room", async () => {
    await page.goto(`${BASE}#/tablechart`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "FLOOR PLAN" }).click();
    for (const r of ["smallroom", "bigroom", "Private Hall", "New Table Designer Room"])
        await page.waitForSelector(`text=${r}`, { timeout: 4000 });
});

await step("Customer Search finds a record and opens it", async () => {
    await page.goto(`${BASE}#/customersearch`, { waitUntil: "networkidle" });
    await page.fill('input[placeholder^="Search by customer name"]', "west");
    await page.waitForTimeout(400);
    await page.locator("text=/@(example\\.com|tenfore\\.golf)/").first().click();
    for (const s of ["Memberships", "Customer Types", "Gift Cards", "Tee Time History", "General Info"])
        await page.waitForSelector(`text=${s}`, { timeout: 5000 });
});

await step("tapping a table opens its check and DONE returns to the floor", async () => {
    await page.goto(`${BASE}#/tables`, { waitUntil: "networkidle" });
    await page.waitForSelector('[data-table="9"]', { timeout: 6000 });
    await page.locator('[data-table="9"]').first().click();
    await page.waitForSelector("text=/Table Detached \\d+ \\| Order ID/", { timeout: 6000 });
    await page.getByRole("button", { name: "Done" }).click();
    await page.waitForSelector('[data-table="9"]', { timeout: 5000 });
});

await step("the floor's FLOOR PLAN button opens the room sheet upward", async () => {
    await page.goto(`${BASE}#/tables`, { waitUntil: "networkidle" });
    await page.waitForSelector('[data-table="9"]', { timeout: 6000 });
    await page.getByRole("button", { name: "FLOOR PLAN" }).click();
    for (const r of ["smallroom", "bigroom", "Private Hall"]) await page.waitForSelector(`text=${r}`, { timeout: 4000 });

    const sheet = await page.locator('[role="menu"]').boundingBox();
    const button = await page.getByRole("button", { name: "FLOOR PLAN" }).boundingBox();
    // It has to sit above the bar and be centred on the button that opened it —
    // a centred full-height panel left a slab of dead space under the last room.
    if (sheet.y + sheet.height > button.y + 4) throw new Error("sheet overlaps the action bar");
    if (Math.abs(sheet.x + sheet.width / 2 - (button.x + button.width / 2)) > 60) throw new Error("sheet not anchored to the button");
});

await step("seat orientation flips between top/bottom and left/right", async () => {
    await page.goto(`${BASE}#/tablechart`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
    // The room is shared state, so make sure we are in the one with squares.
    await page.getByRole("button", { name: "FLOOR PLAN" }).click();
    await page.getByText("bigroom", { exact: true }).click();
    await page.waitForTimeout(500);

    await page.locator('[data-table="1"]').first().click();
    await page.waitForSelector('input[aria-label="Table name"]', { timeout: 5000 });

    // Two seats, because at four every edge gets one whichever axis is chosen and
    // the setting is genuinely invisible.
    const fewer = page.getByRole("button", { name: "Fewer seats" });
    await fewer.click();
    await fewer.click();
    await page.waitForTimeout(300);

    const spread = async (axis) =>
        page.locator('[data-table="1"] rect').evaluateAll((els, a) => {
            const marks = els.slice(0, -1).map((e) => Number(e.getAttribute(a)));
            return Math.max(...marks) - Math.min(...marks);
        }, axis);

    await page.getByRole("button", { name: "Seats top and bottom" }).click();
    await page.waitForTimeout(300);
    if (!((await spread("y")) > (await spread("x")))) throw new Error("horizontal did not seat top and bottom");

    await page.getByRole("button", { name: "Seats left and right" }).click();
    await page.waitForTimeout(300);
    if (!((await spread("x")) > (await spread("y")))) throw new Error("vertical did not seat left and right");
});

await step("Quick Order's rail carries steppers and totals", async () => {
    await page.goto(`${BASE}#/quickorder`, { waitUntil: "networkidle" });
    await page.getByText("Steaks", { exact: true }).first().click();
    await page.getByText("Filet Mignon 8 oz").first().click();
    for (const t of ["Subtotal", "Tax", "Total"]) await page.waitForSelector(`text=${t}`, { timeout: 5000 });
});

console.log(errors.length ? `\nRUNTIME ERRORS (${errors.length}):` : "\nNo runtime errors.");
errors.slice(0, 6).forEach((e) => console.log("  " + e.slice(0, 160)));
if (errors.length) process.exitCode = 1;

await browser.close();
