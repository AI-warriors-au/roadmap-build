# Core Components

Learnmap's component library is built on **shadcn/ui** with Tailwind CSS v4, customised to match the brand token system defined in this design system.

---

## Component inventory

### Actions
| Component | Description | Token usage |
|-----------|-------------|-------------|
| `Button` | Primary, secondary, ghost, destructive variants | `action.*` tokens |
| `IconButton` | Square button with icon only | Same as Button |
| `Link` | Inline hyperlink | `text.link`, `text.linkHover` |

### Forms
| Component | Description |
|-----------|-------------|
| `Input` | Text input with label + helper text |
| `Textarea` | Multi-line input |
| `Select` | Single-select dropdown |
| `Checkbox` | Boolean toggle with label |
| `Toggle` | Switch for on/off settings |
| `SearchBar` | Rounded hero search — `radius.4xl` |

### Display
| Component | Description |
|-----------|-------------|
| `Card` | Rounded elevated container — default `radius.lg`, `shadow.sm` |
| `RoadmapCard` | Extended card with topic count, CTA button, category colour strip |
| `CategoryPill` | Topic filter pill — `radius.full` |
| `Badge` | Inline count / status badge — `radius.xs` |
| `Avatar` | Circular user image — `radius.full` |
| `StatBlock` | Metric + label pair (used in hero stats row) |

### Navigation
| Component | Description |
|-----------|-------------|
| `Navbar` | Top navigation bar — `height: 48px`, `shadow.sticky` on scroll |
| `NavLink` | Nav item with active state |
| `Tabs` | Horizontal tab bar |
| `Breadcrumb` | Path navigation |

### Feedback
| Component | Description |
|-----------|-------------|
| `Alert` | Callout with semantic tone (success / warning / destructive / info) |
| `Toast` | Ephemeral notification — slides in from bottom-right |
| `Spinner` | Loading indicator |
| `Skeleton` | Placeholder loader for content areas |
| `EmptyState` | Zero-data screen with icon + message + CTA |

### Overlays
| Component | Description |
|-----------|-------------|
| `Modal` | Centred dialog — `radius.2xl`, `shadow.lg` |
| `Sheet` | Slide-in panel from edge |
| `Popover` | Anchored floating content — `radius.xl`, `shadow.md` |
| `Tooltip` | Hover hint — `radius.sm` |

---

## Component sizing

### Button
| Size | Height | Padding-x | Font size | Radius |
|------|--------|-----------|-----------|--------|
| `xs` | 28px | 10px | 12px | `radius.full` |
| `sm` | 32px | 12px | 12px | `radius.full` |
| `md` | 36px | 16px | 14px | `radius.full` |
| `lg` | 44px | 20px | 16px | `radius.full` |
| `xl` | 52px | 24px | 18px | `radius.full` |

### Input
| Size | Height | Padding-x | Font size | Radius |
|------|--------|-----------|-----------|--------|
| `sm` | 32px | 10px | 12px | `radius.sm` |
| `md` | 40px | 12px | 14px | `radius.md` |
| `lg` | 48px | 16px | 16px | `radius.md` |

### Card
| Variant | Padding | Radius | Shadow |
|---------|---------|--------|--------|
| Default | `spacing.4` (16px) | `radius.lg` | `shadow.sm` |
| Large | `spacing.6` (24px) | `radius.xl` | `shadow.sm` |
| Featured | `spacing.8` (32px) | `radius.2xl` | `shadow.md` |

---

## States

Every interactive component supports these states:
- **Default** — resting appearance
- **Hover** — subtle background shift, cursor `pointer`
- **Focus** — `ring.focus-brand` for primary / `ring.focus-default` for neutral
- **Active** — slightly darker than hover
- **Disabled** — `opacity: 0.4`, cursor `not-allowed`
- **Loading** — spinner replaces label; button width locked to prevent layout shift

---

## Accessibility

- All interactive elements have `role`, `aria-label`, or visible label.
- Focus rings meet WCAG 2.4.11 (visible, 2px minimum offset).
- Colour is never the sole conveyor of meaning — icons or text accompany colour cues.
- Touch targets are at minimum 44×44px (`spacing.11`).
