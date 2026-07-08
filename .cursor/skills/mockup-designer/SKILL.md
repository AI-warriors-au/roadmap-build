---
name: mockup-designer
description: Designs high-fidelity page mockups for the Learnmap app using the design system in design/ (tokens, semantic colours, components, brand) as the single source of truth, and generates them into design/mockups/. Use when the user asks to design, mock up, or prototype a screen, page, or UI; create a mockup; or when they mention wireframes, mockups, or mockup screens.
---

# Mockup Designer

Design high-fidelity, on-brand page mockups for **Learnmap**. The `design/` folder is the **single source of truth** — every colour, size, radius, and font traces to a named token. Never invent one-off values.

All mockup output is created in the **mockup folder** (`design/mockups/`) — never anywhere else.

**Deliverables per screen (all three required, all written under `design/mockups/`):**

1. A **markdown spec** at `design/mockups/{slug}.md` — layout, components, and design decisions, annotated with token names.
2. A **self-contained interactive HTML mockup** at `design/mockups/learnmap-{slug}.html` — the HTML output always lands in the mockup folder, opens in any browser, no build step.
3. A **PNG render** at `design/mockups/image/{slug}.png` — a full-page screenshot of the HTML, so the design exists as a shareable image.

Then update the mockups index table in `design/mockups/README.md`.

## Workflow

Copy this checklist and track progress:

```markdown
Mockup-designer progress:
- [ ] Step 1: Read the design system
- [ ] Step 2: Clarify the screen and its content
- [ ] Step 3: Map layout to tokens + components
- [ ] Step 4: Write the markdown spec
- [ ] Step 5: Build the HTML mockup
- [ ] Step 6: Export the PNG render
- [ ] Step 7: Update the mockups index
- [ ] Step 8: Verify against the checklist
```

### Step 1: Read the design system

Read these before designing anything — they are the guideline:

| File | What it gives you |
|------|-------------------|
| `design/README.md` | Brand at a glance, design principles |
| `design/tokens/colors.json` | Raw palette (brand violet, teal, neutral) |
| `design/tokens/typography.json` | Type scale, weights, line heights, tracking |
| `design/tokens/spacing.json` | 4px-base spacing scale |
| `design/tokens/border-radius.json` | Corner radius tokens |
| `design/tokens/shadows.json` | Elevation system |
| `design/semantic/light.json` | Semantic tokens — always prefer these over raw palette |
| `design/semantic/dark.json` | Dark-mode semantic tokens |
| `design/components/README.md` | Component inventory, sizing tables, states, a11y |
| `design/brand/*.md` | Logo lockup + icon usage rules |

Then read the **existing mockup** as your reference implementation:
- `design/mockups/home-page.md` (spec style)
- `design/mockups/learnmap-home-page.html` (HTML/CSS structure)

### Step 2: Clarify the screen and its content

Confirm before building (ask only what you can't reasonably infer):
- **Which screen** — name and primary purpose (e.g. "Roadmap detail", "Sign in", "Dashboard").
- **Key regions** — what sections it needs (nav, hero, lists, forms, footer).
- **Real-ish content** — use realistic Learnmap copy (roadmaps, topics, learners), never lorem ipsum.
- **States** — any interactive states worth showing (active tab, filled filter, empty state).

Pick a **kebab-case slug** for the screen (e.g. `roadmap-detail`, `sign-in`).

### Step 3: Map layout to tokens + components

Compose the screen from the existing **component inventory** (`Navbar`, `Card`, `RoadmapCard`, `CategoryPill`, `Button`, `Input`, etc.) at their documented sizes. For every visual decision, note the token it comes from. Reuse the shared app shell (top nav + logo lockup) so screens feel like one product.

### Step 4: Write the markdown spec

Mirror `design/mockups/home-page.md`. For each region, document layout, then annotate values with token names — e.g. `background.brand (brand-violet-50 = #F5F3FF)`, `typeScale.h1 (30px)`, `radius.lg (10px)`. Cover responsive breakpoints and any interactive states. See [reference.md](reference.md) for the section template and the full token→value cheatsheet.

### Step 5: Build the HTML mockup

Create the HTML output in the mockup folder at `design/mockups/learnmap-{slug}.html` — one self-contained file following the structure in [reference.md](reference.md):
- Geist font via `fonts.bunny.net`, CSS reset, `:root` CSS variables that mirror the tokens.
- A dark hint bar at the top explaining any interactivity.
- Semantic HTML; inline `<script>` for simple state toggles (active nav, selected pill).
- **Only token-derived values** in the CSS variables — no stray hex codes.

### Step 6: Export the PNG render

Render the HTML to a full-page PNG in the mockup folder at `design/mockups/image/{slug}.png` using the bundled script:

```bash
bash .cursor/skills/mockup-designer/scripts/export-png.sh \
  design/mockups/learnmap-{slug}.html \
  design/mockups/image/{slug}.png
```

- The script uses headless Chromium (via Playwright) at a **1280px** desktop width, waits for fonts to load, then captures a full-page screenshot. It creates `design/mockups/image/` if missing.
- The HTML pulls the Geist web font from `fonts.bunny.net`, so this step **needs network access** — grant it when running.
- After it completes, confirm the PNG exists and open it to sanity-check the render matches the HTML.

See [reference.md](reference.md) for script details and the manual fallback if Playwright is unavailable.

### Step 7: Update the mockups index

Add a row to the table in `design/mockups/README.md` for the new screen (Page · Spec · HTML · Image).

### Step 8: Verify against the checklist

Run the final checklist below before handing off.

## Rules

- **Tokens only.** Every hex, size, radius, and shadow must trace to a token in `design/tokens/` or `design/semantic/`. Prefer semantic tokens over raw palette.
- **Australian English** in all spec prose and UI copy (colour, favourites, organise); **American English** only inside code identifiers.
- **Reuse, don't reinvent.** Compose from the documented components and the shared app shell.
- **Accessible by default** — WCAG AA contrast, visible focus rings, 44×44px touch targets, colour never the sole signal.
- **Self-contained HTML** — must render correctly by opening the file directly, no bundler or network beyond the font CDN.
- **Always export a PNG** — every screen ships a `design/mockups/image/{slug}.png` render alongside its spec and HTML.
- Output goes in `design/mockups/` only (HTML + spec at the root, PNGs under `design/mockups/image/`). (Interactive `.canvas.tsx` versions live separately in `design/canvases/` — build one only if the user asks.)

## Final checklist

- [ ] Spec exists at `design/mockups/{slug}.md`, annotated with token names
- [ ] HTML exists at `design/mockups/learnmap-{slug}.html` and opens standalone
- [ ] PNG render exists at `design/mockups/image/{slug}.png` and matches the HTML
- [ ] All values trace to design tokens — no one-off colours or sizes
- [ ] Uses the shared app shell + documented components at their sizes
- [ ] Responsive behaviour and interactive states documented
- [ ] Australian English in prose/copy; accessible by default
- [ ] `design/mockups/README.md` index updated
