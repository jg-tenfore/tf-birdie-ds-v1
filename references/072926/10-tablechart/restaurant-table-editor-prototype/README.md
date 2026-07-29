# Restaurant Table Editor Prototype

Single-file HTML prototype of a tablet-based restaurant floor plan editor + live operator view + order entry screen. Styled after the TenFore Birdie POS reference (Toast-inspired).

## Files
- `restaurant-table-editor.html` — the entire prototype. Vanilla HTML/CSS/JS, no build step, no external dependencies. All SVG icons and logos are inline.

## How to run
Open `restaurant-table-editor.html` in a modern browser (Chrome, Safari, Edge, Firefox). No server required — it runs entirely from the file.

## Modes
- **Editor** — place, move, resize, and configure tables, barriers, and labels. Undo/redo, per-room saved layouts.
- **Live** — operator floor view with pan/zoom, table states, upcoming reservations, server assignments, and turn-time progress rings.
- **Order Entry** — tap any table in live mode to open its check. Items are synthesized to match the party's tab, course, and guest count.

## Live view controls
- **Version dropdown** (bottom-left) — switch between Version A (Original: number only) and Version B (Toast-style state view with progress rings, reservation pills, server chips)
- **Moon toggle** (bottom-right, above zoom) — flip between light and dark canvas
- **Zoom pill** (bottom-right corner) — zoom in/out; click the percent readout to fit content

## State model
Layouts persist in-memory per session. Each table can hold status, party data, upcoming reservation, kitchen tickets, and course progress — all seeded in code, all consumed by both the tile renderer and the order screen synthesis.
