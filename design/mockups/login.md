# Login Mockup Spec

A focused sign-in screen where **GitHub is the only authentication method** (OAuth). Signing in also creates the account on first use, so this single page covers both log in and sign up.

Slug: `login`.

---

## Layout — centred auth screen

- Full-height page (`min-height: 100vh`)
- Background: `background.brand` (`brand-violet-50` = `#F5F3FF`) — soft branded wash
- A single **auth card** centred both axes
- The shared **top navigation bar** (with header links) sits above, so the page keeps the app-shell chrome

### Top navigation (shared shell)
- Height: **56px** (`spacing.12` + border), background `background.default`, bottom `border.default`
- Logo lockup: 24×24px lightning-bolt on `brand-violet-600` rounded-rect + "Learnmap" wordmark (`fontSize.md` / `fontWeight.bold`), links back to the marketing home
- Nav header links (`FR-SHELL-002`): **Dashboard**, **Browse Roadmaps** — `typeScale.body` (14px), inactive `text.secondary`, active state `brand-violet-600` + 2px underline
- Right region (logged-out): **Log in** (ghost, current page → `brand-violet-600`) + **Sign up** (filled `action.primary` pill) — matches the home-page public shell

---

## Auth card

### Container
- Background: `surface.card` (`#FFFFFF`)
- Border: `border.default`, `radius.2xl` (18px, modal/feature radius)
- Shadow: `shadow.md` (floating elevation)
- Padding: `40px` (`spacing.10`)
- Max-width: **420px**, centred; horizontal gutter `spacing.6` on mobile

### Brand mark
- 48×48px lightning-bolt on `brand-violet-600` rounded-rect (`radius.lg`), centred
- Margin-bottom `spacing.5` (20px)

### Heading + subtext
- Heading: "Welcome to Learnmap" — `typeScale.h2` (24px / 600 / tight tracking), `text.primary`, centred
- Subtext: "Sign in with GitHub to start building your learning path." — `typeScale.body-lg` (16px / 1.625lh), `text.secondary`, centred, margin-bottom `spacing.8` (32px)

### Primary action — Continue with GitHub
- Full-width button, height **48px** (`Button lg`), `radius.full`
- Background: `neutral-900` (`#171717`) — GitHub convention; hover → `#000`
- Content: GitHub mark (Lucide/brand mark, 20px, white) + label "Continue with GitHub"
- Label: `fontSize.md` (16px) / `fontWeight.semibold`, `text.onBrand` (white)
- Focus: `ring.focus-default` (2px neutral ring) — visible for keyboard users
- **Loading state** (on click): label → "Connecting to GitHub…" with a spinner; width locked to prevent layout shift

### Sole-method note
- Below the button, centred helper: "GitHub is the only sign-in method for now." — `typeScale.body-sm` (12px), `text.tertiary`
- Divider (`border.subtle`) with `spacing.6` vertical rhythm separating action from footer

### Account-creation note
- "New here? Signing in with GitHub creates your account automatically." — `typeScale.body-sm`, `text.secondary`, centred

### Legal footnote
- "By continuing you agree to our Terms and Privacy Policy." — `typeScale.body-sm` (12px), `text.tertiary`; "Terms" and "Privacy Policy" are `text.link` (`brand-violet-600`)

---

## Trust strip (below card)

- Small centred row: lock icon (16px, `text.tertiary`) + "Secure OAuth — we never see your GitHub password." — `fontSize.sm`, `text.tertiary`
- Margin-top `spacing.5` (20px)

---

## Responsive breakpoints

| Breakpoint | Card | Top bar |
|------------|------|---------|
| Desktop / tablet (≥480px) | 420px centred card | Logo left |
| Mobile (<480px) | Card fills width minus `spacing.6` gutters, padding tightens to `spacing.6` | Logo left |

---

## Interactive states shown in mockup

- Click **Continue with GitHub** → button enters the loading state ("Connecting to GitHub…" + spinner), simulating the OAuth redirect
- Click a nav header link (Dashboard ↔ Browse Roadmaps) → active underline moves to it
- Hover on the button → darkens to `#000`
- Terms / Privacy Policy render as brand-violet links
