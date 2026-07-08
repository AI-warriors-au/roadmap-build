# Learnmap Mockups

High-fidelity page mockups for the Learnmap product. Each mockup is available as:
- A **markdown spec** (this folder) describing layout, components used, and design decisions
- An **interactive canvas** (`.canvas.tsx`) that renders the live mockup in Cursor

## Mockups

| Page | Spec | HTML | Image |
|------|------|------|-------|
| Home Page | [home-page.md](./home-page.md) | [learnmap-home-page.html](./learnmap-home-page.html) | [home-page.png](./image/home-page.png) |
| Login (GitHub OAuth) | [login.md](./login.md) | [learnmap-login.html](./learnmap-login.html) | [login.png](./image/login.png) |
| Roadmap Catalog (EP-002 + EP-000 shell) | [roadmap-catalog.md](./roadmap-catalog.md) | [learnmap-roadmap-catalog.html](./learnmap-roadmap-catalog.html) | [roadmap-catalog.png](./image/roadmap-catalog.png) |
| 404 Not Found (EP-000) | [not-found.md](./not-found.md) | [learnmap-not-found.html](./learnmap-not-found.html) | [not-found.png](./image/not-found.png) |

Interactive `.canvas.tsx` versions live in `../canvases/`.

## Design tokens used

All mockups reference tokens from `../tokens/` and `../semantic/`. Hex values used in mockups trace directly to named tokens — no one-off colours.
