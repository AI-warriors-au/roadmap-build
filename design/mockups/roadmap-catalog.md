# Roadmap Catalog Mockup Spec

Covers **EP-002 Roadmap Catalog** rendered inside the shared **EP-000 App Shell**. Authenticated users browse, search, filter, and enrol in roadmaps.

Requirements traced: `FR-SHELL-001..004`, `FR-CAT-001..008`.

---

## App shell — Top Navigation (EP-000)

### Layout
- Fixed height: **56px** (`spacing.12` = 48px nav + border)
- Background: `background.default` (`#FFFFFF`)
- Bottom border: `border.default` (`#E5E5E5`)
- Sticky: `position: sticky; top: 0; z-index: 100`, `elevation.sticky` (`shadow.xs`) on scroll
- Content centred at max-width **1200px**, horizontal padding **32px** (`spacing.8`)

### Left region — Logo lockup → dashboard (`FR-SHELL-002`)
- 24×24px lightning-bolt SVG on `brand-violet-600` rounded-rect (`radius.sm`)
- Wordmark "Learnmap", `fontSize.md` (16px), `fontWeight.bold` (700), `text.primary`
- Whole lockup links to the dashboard

### Centre region — Nav links (`FR-SHELL-002/003`)
- Items: **Dashboard**, **Browse Roadmaps**
- Font: `typeScale.body` (14px / 400); inactive colour `text.secondary` (`neutral-500`)
- **Active state** (`FR-SHELL-003`): current section = "Browse Roadmaps" → `fontWeight.semibold` (600), colour `brand-violet-600`, 2px bottom underline in `brand-violet-600`
- Hover: colour `text.primary`

### Right region — User avatar menu (`FR-SHELL-004`)
- Trigger: 32×32px circular avatar (`radius.full`) with initials on `brand-violet-100`, plus a chevron
- Dropdown (`elevation.floating` = `shadow.md`, `surface.elevated`, `radius.md`, 200px wide):
  - Display name "Sam Rivers" + email — `fontSize.base` / `fontSize.sm` `text.secondary`
  - Divider (`border.subtle`)
  - **Profile & Settings** link (gear icon)
  - **Sign out** (log-out icon), `semantic.destructive.text` on hover

---

## Catalog header

### Layout
- Background: `background.default`
- Padding: `40px 32px 24px` (`spacing.10` / `spacing.8` / `spacing.6`)
- Max-width: 1200px, centred

### Content
- Eyebrow: "LIBRARY" — `typeScale.label-sm` (11px / 600), `brand-violet-600`, `letterSpacing.widest`, uppercase
- Heading: "Browse Roadmaps" — `typeScale.h1` (30px / 700), `text.primary`
- Sub-line: "Pick a path and start learning — {n} roadmaps and counting." — `typeScale.body` `text.secondary`

---

## Search + filter toolbar (`FR-CAT-003/004`)

### Layout
- Sticky sub-bar under the catalog header, background `background.default`, bottom border `border.default`
- Padding: `16px 32px`, max-width 1200px

### Search input (`FR-CAT-003`)
- Left-aligned, max-width 420px
- Leading search icon (Lucide `Search`, 16px, `text.tertiary`)
- Input: `radius.md` (8px), `border.default`, `background.default`, placeholder `text.tertiary`
- Height 40px (Input `md`), `fontSize.base`
- Note: results **debounce at 300ms** (`NFR-CAT-002`) — annotated in hint bar

### Tag filter pills (`FR-CAT-004` — multi-select, OR logic)
- Single wrapping row to the right of / below search
- Tags: All · Frontend · Backend · DevOps · React · Python · Data · Mobile
- **Multiple** pills can be active simultaneously (OR match)
- Active pill: `brand-violet-600` background, white text, no border, `fontWeight.semibold`
- Inactive pill: `background.default`, `text.secondary`, `border.default`
- Font: `fontSize.sm` (13px), `radius.full`
- Trailing "Clear" text button appears when ≥1 tag active

---

## Roadmap card grid (`FR-CAT-005/006/007`)

### Section layout
- Background: `background.subtle` (`neutral-50` = `#FAFAFA`)
- Padding: `28px 32px 64px`
- 3-column grid on desktop, gap `spacing.4` (16px)

### Card anatomy (`FR-CAT-005`)
- Background: `surface.card` (`#FFFFFF`), border `border.default`, `radius.lg` (10px), `shadow.sm`
- Padding: `20px` (`spacing.5`)
- 4px category accent strip along the top using the primary tag colour
- **Title** — `fontSize.md` (16px) / `fontWeight.semibold` / `text.primary`
- **Tags** (`FR-CAT-002`) — small pills, `fontSize.xs` (11px), `radius.xs`, `surface.inset` bg + `text.secondary`; brand tags tinted `brand-violet-50` + `brand-violet-600`
- **Description** — `typeScale.body-sm` (12px / 1.5lh) / `text.secondary`, 2-line clamp
- **Footer row** — "{n} topics" label (`fontSize.sm` / `text.tertiary`) + primary action button

### Enrolment states (`FR-CAT-006/007`)
- **Not enrolled** — footer button "Enrol" (filled `action.primary`, pill, `Button md`)
- **Enrolled / in progress** (`FR-CAT-006`) — top-left **"In progress"** badge (`semantic.info.surface` bg, `semantic.info.text`, `radius.full`, `fontSize.xs`); footer shows a subtle progress bar + "Continue" secondary button and an "Unenrol" ghost button
- Enrolling (`FR-CAT-007`) adds the roadmap to the dashboard — shown via toast note in the hint bar

### Sample cards
| Title | Tags | Topics | State |
|-------|------|--------|-------|
| Frontend Developer | frontend, react | 102 | In progress (34%) |
| Backend Engineer | backend, python | 89 | Enrol |
| DevOps & Cloud | devops | 74 | Enrol |
| React | frontend, react | 58 | In progress (61%) |
| Python | backend, python, data | 66 | Enrol |
| Data Science | data, python | 71 | Enrol |

---

## Unenrol confirmation (`FR-CAT-008`)

- Triggered by "Unenrol" on an enrolled card
- Centred **modal** over `background.overlay` (`rgba(0,0,0,0.4)`), `elevation.overlay` (`shadow.lg`)
- Surface: `surface.card`, `radius.2xl` (18px, modal default), padding `24px`, max-width 420px
- Title "Unenrol from this roadmap?" — `typeScale.h3`
- Body warns that progress is **soft-deleted and restored on re-enrol** — `typeScale.body-sm`, `text.secondary`
- Actions: "Cancel" (secondary) + "Unenrol" (`action.destructive` filled)

---

## Responsive breakpoints

| Breakpoint | Card grid | Toolbar | Nav |
|------------|-----------|---------|-----|
| Desktop (≥900px) | 3 col | search + pills inline | Full |
| Tablet (600–899px) | 2 col | search over pills | Full |
| Mobile (<600px) | 1 col | stacked | Hamburger (`FR-SHELL-006`) |

---

## Interactive states shown in mockup

- Click **avatar** → user menu dropdown opens (name, Profile & Settings, Sign out)
- Click **nav item** → active underline moves (Dashboard ↔ Browse Roadmaps)
- Click **tag pills** → toggle multiple on/off (OR filter); "Clear" resets
- Click **Unenrol** → confirmation modal opens; Cancel / backdrop closes it
