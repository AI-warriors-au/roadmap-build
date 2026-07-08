# 404 Not Found Mockup Spec

Covers **EP-000 App Shell & Navigation**, `FR-SHELL-007`: visiting an unknown route shows a 404 page with a link back to the dashboard. Rendered inside the shared app shell so the top nav stays available.

Requirements traced: `FR-SHELL-001`, `FR-SHELL-002/003`, `FR-SHELL-007`.

---

## App shell — Top Navigation (EP-000)

Same shared shell as every page (see `roadmap-catalog.md` for full anatomy):
- 56px sticky nav, `background.default`, bottom `border.default`
- Logo lockup → dashboard, **Dashboard** and **Browse Roadmaps** links
- No nav item is active on a 404 (unknown route → no highlighted section)
- User avatar menu on the right

---

## 404 content area

### Layout
- Background: `background.default` (`#FFFFFF`)
- Centred column, min-height fills the viewport below the nav
- Max-width: 480px, text-align centre, vertical padding `spacing.24` (96px)

### Glyph
- Large "404" — `typeScale.display-2xl` scale (60px / 800 / `letterSpacing.tighter`), colour `brand-violet-600`
- Decorative broken-map / compass icon above it (48px, `icon-2xl`), `text.tertiary`, `aria-hidden`

### Copy
- Heading: "This path doesn't exist" — `typeScale.h1` (30px / 700), `text.primary`
- Body: "The page you're looking for may have moved or never existed. Let's get you back on track." — `typeScale.body-lg` (16px / 1.625lh), `text.secondary`, max-width 380px

### Actions
- Primary: **"Back to dashboard"** (`FR-SHELL-007`) — filled `action.primary`, pill (`Button lg`), leads to the dashboard
- Secondary: "Browse roadmaps" — `action.secondary` outline pill
- Buttons sit in a centred row, gap `spacing.3` (12px), wrap on mobile

---

## Responsive breakpoints

| Breakpoint | Content | Nav |
|------------|---------|-----|
| Desktop / tablet (≥600px) | Centred column, buttons in a row | Full |
| Mobile (<600px) | Same column, buttons stack full-width | Hamburger (`FR-SHELL-006`) |

---

## Interactive states shown in mockup

- Click **nav items** → active underline moves (shell stays usable from a 404)
- Click the **avatar** → user menu dropdown opens
- "Back to dashboard" is the primary recovery path per `FR-SHELL-007`
