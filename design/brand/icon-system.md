# Brand Icon System

## Icon library

Learnmap uses **Lucide Icons** as the primary icon set. Lucide provides a consistent stroke-based style that matches the product's clean, open aesthetic.

### Icon token: `icon-default`
- **Size**: 16 px (inline), 20 px (standalone), 24 px (feature callouts)
- **Stroke width**: 1.5 px
- **Color**: inherits from text colour token

---

## Size scale

| Token | Size | Use case |
|-------|------|----------|
| `icon-xs` | 12 px | Badge indicators, dense tables |
| `icon-sm` | 16 px | Inline with body text, buttons |
| `icon-md` | 20 px | Navigation items, list items |
| `icon-lg` | 24 px | Page headings, feature rows |
| `icon-xl` | 32 px | Hero features, empty states |
| `icon-2xl` | 48 px | Illustration accents |

---

## Colour usage

Icons inherit the text colour of their parent container by default. Use explicit colour tokens only when conveying semantic meaning:

| Semantic role | Token | Hex |
|---------------|-------|-----|
| Default / neutral | `text-secondary` | `#525252` |
| Brand accent | `brand-violet-600` | `#7C3AED` |
| Success | `semantic-success` | `#16A34A` |
| Warning | `semantic-warning` | `#D97706` |
| Destructive | `semantic-destructive` | `#DC2626` |
| Info | `semantic-info` | `#2563EB` |

---

## Category icons

Each roadmap category has a dedicated icon and a tinted pill background:

| Category | Lucide icon | Background |
|----------|-------------|------------|
| Frontend Development | `Code2` | `brand-violet-50` (#F5F3FF) |
| Backend Development | `Server` | `neutral-100` (#F5F5F5) |
| DevOps & Cloud | `GitBranch` | `neutral-100` (#F5F5F5) |
| AI / ML Engineering | `Sparkles` | `brand-violet-50` (#F5F3FF) |
| Mobile Development | `Smartphone` | `neutral-100` (#F5F5F5) |
| Data Science | `BarChart3` | `neutral-100` (#F5F5F5) |

---

## Usage rules

- Always use icons at their defined size — do not scale icons freely between sizes.
- Icons must never be used as standalone interactive elements without a text label or `aria-label`.
- Do not apply rotation, flip, or colour effects outside the semantic palette.
- Decorative icons (purely visual) must have `aria-hidden="true"`.
