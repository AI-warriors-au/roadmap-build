# Mockup Designer — Reference

Detailed templates and cheatsheets. Read this when writing the spec (Step 4) or building the HTML (Step 5).

## Token → value cheatsheet

Common values pulled from `design/tokens/` and `design/semantic/light.json`. Always confirm against the source files; these are the ones used most in mockups.

### Colour (semantic → raw)

| Semantic token | Raw | Hex | Use |
|----------------|-----|-----|-----|
| `background.default` | `neutral.0` | `#FFFFFF` | Page / app shell |
| `background.subtle` | `neutral.50` | `#FAFAFA` | Alt sections, panels |
| `background.brand` | `brand.violet.50` | `#F5F3FF` | Hero, onboarding |
| `text.primary` | `neutral.900` | `#171717` | Headings, body |
| `text.secondary` | `neutral.500` | `#737373` | Supporting copy |
| `text.tertiary` | `neutral.400` | `#A3A3A3` | Placeholder, disabled |
| `border.default` | `neutral.200` | `#E5E5E5` | Dividers, card borders |
| `action.primary.background` | `brand.violet.600` | `#7C3AED` | Primary buttons, active nav, links |
| `action.primary.backgroundHover` | `brand.violet.700` | `#6D28D9` | Primary hover |
| secondary accent | `brand.teal.400/500` | `#2DD4BF` / `#14B8A6` | Highlights, accent strips |

Status tones: `semantic.success/warning/destructive/info` — see `design/semantic/light.json`.

### Type scale (from `typography.json`)

| Name | Size | Weight | Notes |
|------|------|--------|-------|
| `display-xl` | 56px | 800 | Hero headline, tight tracking |
| `h1` | 30px | 700 | Section headings |
| `body-lg` | 16px | 400 | Lead paragraph, 1.6 lh |
| `base` | 14px | 400 | Default UI text |
| `sm` | 12–13px | 400 | Labels, sub-copy |
| `label-sm` | ~12px | 600 | Uppercase eyebrows, widest tracking |

Font: **Geist Variable** (`--font-sans`).

### Radius (from `border-radius.json`)

`sm` · `md` · `lg` (10px, base) · `xl` · `2xl` · `4xl` (search bar) · `full` (pills, avatars).

### Spacing

4px base. Common: `spacing.4` = 16px (grid gap), `spacing.6` = 24px (padding), `spacing.8` = 32px.

### Layout constants

- Content max-width: **1200px**, horizontal padding **24–32px**.
- Navbar height: **56px**, sticky, `z-index: 100`.
- Section vertical padding: **64px**.

## Spec section template

Mirror `design/mockups/home-page.md`. For each region:

```markdown
## {Region name}

### Layout
- {size / position facts, annotated with tokens — e.g. Background: `background.brand` (`brand-violet-50` = `#F5F3FF`)}

### {Sub-element}
- {property}: `{token}` ({resolved value})
- **Active/hover state**: {token-annotated changes}
```

End the spec with:

```markdown
## Responsive breakpoints

| Breakpoint | {grid A} | {grid B} | Nav |
|------------|----------|----------|-----|
| Desktop (≥1024px) | ... | ... | Full |
| Tablet (768–1023px) | ... | ... | Full |
| Mobile (<768px) | ... | ... | Hamburger |

## Interactive states shown

- {describe each toggle / active state the HTML demonstrates}
```

## HTML mockup skeleton

Self-contained, opens in any browser. Mirror `design/mockups/learnmap-home-page.html`.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Learnmap — {Screen} Mockup</title>
  <link rel="preconnect" href="https://fonts.bunny.net" />
  <link href="https://fonts.bunny.net/css?family=geist:400,500,600,700,800&display=swap" rel="stylesheet" />
  <style>
    :root {
      /* Mirror design tokens — no stray values */
      --primary:   #7C3AED;   /* action.primary.background */
      --primary-h: #6D28D9;   /* action.primary.backgroundHover */
      --teal:      #14B8A6;   /* brand.teal.500 */
      --hero-bg:   #F5F3FF;   /* background.brand */
      --white:     #FFFFFF;   /* background.default */
      --n50:  #FAFAFA;  --n100: #F5F5F5;  --n200: #E5E5E5;
      --n400: #A3A3A3;  --n500: #737373;  --n600: #525252;  --n900: #171717;
      --font: 'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font); background: var(--n200); color: var(--n900); }
    button { font-family: var(--font); cursor: pointer; }
    a { color: var(--primary); text-decoration: none; }
    a:hover { text-decoration: underline; }

    .hint-bar {
      background: var(--n900); color: var(--n400);
      font-size: 12px; text-align: center; padding: 6px 16px;
    }
    .hint-bar span { color: var(--n200); font-weight: 500; }
    .page { background: var(--white); min-height: 100vh; }
    /* ...component styles, mirroring the home-page mockup... */
  </style>
</head>
<body>
  <div class="hint-bar">Interactive mockup — <span>{describe the interactivity}</span></div>
  <div class="page">
    <!-- Shared app shell: sticky navbar + logo lockup -->
    <!-- Screen sections here -->
  </div>
  <script>
    // Simple state toggles only (active nav item, selected pill, tab switch)
  </script>
</body>
</html>
```

### HTML conventions

- **Shared app shell:** reuse the sticky navbar, logo lockup (24×24 lightning-bolt on violet rounded-rect + "Learnmap" wordmark), and auth actions from the home-page mockup so screens feel unified.
- **SVG icons:** inline, `stroke-width="1.5"`, `viewBox="0 0 24 24"`, following `design/brand/icon-system.md`. Tint via violet for brand categories, neutral otherwise.
- **Interactivity:** small inline `<script>` that toggles an `active` class — no frameworks.
- **Comments:** use section banner comments (`<!-- ── Section ── -->`) to keep the file navigable.

## PNG export (Step 6)

Render each HTML mockup to `design/mockups/image/{slug}.png` with the bundled script:

```bash
bash .cursor/skills/mockup-designer/scripts/export-png.sh \
  design/mockups/learnmap-{slug}.html \
  design/mockups/image/{slug}.png
```

- **What it does:** launches headless Chromium (Playwright) at **1280×900**, resolves the `file://` path, waits 1500ms for the Geist web font to settle, then writes a `--full-page` screenshot. It creates `design/mockups/image/` if missing.
- **Network:** the first run downloads Chromium, and the HTML fetches the font from `fonts.bunny.net` — so this needs network access. Grant it when running the command.
- **Width override:** pass a third arg to change viewport width, e.g. `... {slug}.png 390` for a mobile render.

### Manual fallback (no Playwright)

If Playwright can't run, use any locally installed Chrome/Chromium directly:

```bash
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --hide-scrollbars \
  --window-size=1280,2400 \
  --screenshot="design/mockups/image/{slug}.png" \
  "file://$(pwd)/design/mockups/learnmap-{slug}.html"
```

This captures the window rather than the true full page, so set `--window-size` height tall enough to fit the screen. Prefer the Playwright script when available — it handles full-page height automatically.
