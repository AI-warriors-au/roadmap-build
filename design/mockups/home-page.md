# Home Page Mockup Spec

## Purpose

The Learnmap home page serves as the primary discovery surface — search, browse categories, and surface popular roadmaps.

---

## App shell — Top Navigation

### Layout
- Fixed height: **56px** (`spacing.12` = 48px + 8px border)
- Background: `background.default` (`#FFFFFF`)
- Bottom border: `border.default` (`#E5E5E5`)
- Sticky: `position: sticky; top: 0; z-index: 100`
- Content centred at max-width **1200px** with **24px** horizontal padding

The home page is the **public / logged-out landing**, so it uses the shared shell chrome (same logo lockup and nav-link styling as `roadmap-catalog.md` and `not-found.md`) but shows **Log in / Sign up** actions on the right instead of the authenticated avatar menu.

### Left region — Logo lockup → dashboard (`FR-SHELL-002`)
- Icon: 24×24px lightning-bolt SVG on `brand-violet-600` rounded-rect
- Wordmark: "Learnmap", `fontSize.md` (16px), `fontWeight.bold` (700), `neutral-900`
- Whole lockup links to the dashboard

### Centre region — Nav links (`FR-SHELL-002/003`)
- Items: **Dashboard**, **Browse Roadmaps** (Browse Roadmaps active on this page)
- Font: `fontSize.base` (14px), `fontWeight.regular` (400)
- Inactive colour: `text.secondary` (`neutral-500`)
- **Active state**: `fontWeight.semibold` (600), colour `brand-violet-600`, 2px underline in `brand-violet-600`
- Hover state: colour `text.primary`
- Padding per item: `0 14px`

### Right region — Auth actions (logged-out)
- **Log in**: ghost button, `text.secondary`, `fontSize.base`, `radius.full`; hover → `text.primary` on `neutral-100`
- **Sign up**: filled pill button, `action.primary.background` (`brand-violet-600`), white text, `radius.full`, `padding: 8px 20px`; hover → `action.primary.backgroundHover` (`brand-violet-700`)
- On authenticated pages this region is replaced by the user avatar menu (`FR-SHELL-004`) — see `roadmap-catalog.md`

---

## Hero section

### Layout
- Background: `background.brand` (`brand-violet-50` = `#F5F3FF`)
- Padding: `80px 24px 64px` (desktop)
- Content centred, max-width **680px**

### Beta badge
- Pill with icon + text: "Now in public beta — join the community"
- Background: `surface.card` (`#FFFFFF`)
- Border: `border.default`, `radius.full`
- Font: `fontSize.sm` (12px), `text.secondary`

### Headline
- Line 1 "Warriors": `typeScale.display-xl` — 56px / 800 / tight tracking / `text.primary`
- Line 2 "are the best!": same scale, colour `brand-violet-600`
- Note: deliberate two-line split with brand colour on line 2

### Subtitle
- `typeScale.body-lg` (16px / 400 / 1.6lh)
- Colour: `text.secondary` (`neutral-500`)
- Max-width: 480px, centred

### Search bar
- Max-width: 520px, centred
- Input: left half, `radius.4xl` left corners, `border.default`, `background.default`, placeholder `text.tertiary`
- Button: "Search", right half, `radius.4xl` right corners, background `neutral-900`, white text, `fontWeight.semibold`
- Full pill shape when composed together

### Category filter pills
- Single row, centred, wraps on mobile
- Active pill: `brand-violet-600` background, white text, no border
- Inactive pill: `background.default`, `text.secondary`, `border.default`
- Font: `fontSize.sm` (13px), `radius.full`
- Items: All · Frontend · Backend · DevOps · AI / ML · Mobile · Data Science · +7 more

---

## Stats bar

- Background: `background.default` (`#FFFFFF`)
- Bottom border: `border.default`
- Four equal columns, separated by `border.default` vertical rules
- Each stat: value `fontSize.4xl` (28–30px) / `fontWeight.bold` + label `fontSize.sm` / `text.secondary`
- Value colour: `brand-violet-600` for numeric stats, `text.primary` for "Free"

| Value | Label |
|-------|-------|
| 80+ | Roadmaps |
| 50k+ | Learners |
| 200+ | Contributors |
| Free | Always & forever |

---

## Browse by Topic — "Pick your path"

### Section layout
- Background: `background.default`
- Padding: `64px 24px`
- Max-width: 1200px, centred

### Section header
- Eyebrow: "BROWSE BY TOPIC" — `typeScale.label-sm`, `brand-violet-600`, `letterSpacing.widest`, uppercase
- Heading: "Pick your path" — `typeScale.h1` (30px), `fontWeight.bold`, `text.primary`
- Trailing link: "All categories →" — `fontSize.base`, `brand-violet-600`, aligned right

### Category card grid
- 3-column grid on desktop, 2-column tablet, 1-column mobile
- Gap: `spacing.4` (16px)

**Card anatomy (each):**
- Background: `surface.card` (`#FFFFFF`)
- Border: `border.default`, `radius.lg` (10px)
- Padding: `20px 24px`
- Icon container: 40×40px, `radius.md`, tinted background
  - Brand categories (Frontend, AI/ML): `brand-violet-50` bg + `brand-violet-600` icon
  - Neutral categories: `neutral-100` bg + `neutral-600` icon
- Title: `fontSize.base` / `fontWeight.semibold` / `text.primary`
- Sub-label: `fontSize.sm` / `text.secondary` — "{n} roadmaps · topic list"

**Six categories:**

| Category | Icon | Tint |
|----------|------|------|
| Frontend Development | Code brackets | Violet |
| Backend Development | Server stack | Neutral |
| DevOps & Cloud | Git branch | Neutral |
| AI / ML Engineering | Sparkle star | Violet |
| Mobile Development | Smartphone | Neutral |
| Data Science | Bar chart | Neutral |

---

## Community Favourites — "Popular roadmaps"

### Section layout
- Background: `background.subtle` (`neutral-50` = `#FAFAFA`)
- Padding: `64px 24px`
- Max-width: 1200px

### Section header
- Eyebrow: "COMMUNITY FAVOURITES" — same style as above
- Heading: "Popular roadmaps" — same style
- Trailing link: "Browse all 80+ →"

### Roadmap card grid
- 3-column grid, gap `spacing.4` (16px)

**Featured card (brand colour):**
- Background: `brand-violet-600`
- Text: white, muted white for sub-copy
- Button: white pill with `brand-violet-600` text

**Standard card:**
- Background: `surface.card`
- Border: `border.default`, `radius.lg`
- 4px colour top strip using category accent

**Card anatomy:**
- Title: `fontSize.base` / `fontWeight.semibold`
- Description: `fontSize.sm` / `text.secondary` / 1.5 line-height
- Footer row: "{n} topics" label + "Start →" pill button

---

## Responsive breakpoints

| Breakpoint | Category grid | Roadmap grid | Nav |
|------------|--------------|--------------|-----|
| Desktop (≥1024px) | 3 col | 3 col | Full |
| Tablet (768–1023px) | 2 col | 2 col | Full |
| Mobile (<768px) | 1 col | 1 col | Hamburger |

---

## Interactive states shown

- Click a nav item (Dashboard ↔ Browse Roadmaps) → active underline + bold weight moves to it
- **Log in** / **Sign up** buttons top-right (public landing; avatar menu appears on authenticated pages)
- Click any filter pill → active (filled violet) state moves to that pill
