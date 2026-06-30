# Learnmap Design System

A comprehensive design language for Learnmap — structured learning paths built by the community.

## Structure

```
design/
├── brand/
│   ├── logo-guidelines.md     # Logo, icon, and lockup usage rules
│   └── icon-system.md         # Brand icon principles and usage
├── tokens/
│   ├── colors.json            # Full colour palette (brand violet + accent teal + neutral)
│   ├── typography.json        # Type scale, font weights, line heights
│   ├── spacing.json           # Spacing scale (4px base)
│   ├── border-radius.json     # Corner radius tokens
│   └── shadows.json           # Elevation / shadow system
├── semantic/
│   ├── light.json             # Semantic colour tokens — light mode
│   └── dark.json              # Semantic colour tokens — dark mode
└── components/
    └── README.md              # Core component principles
```

## Brand at a glance

| Token | Value | Usage |
|-------|-------|-------|
| `brand-violet-600` | `#7C3AED` | Primary brand colour, buttons, links |
| `brand-teal-400` | `#2DD4BF` | Secondary accent, highlights |
| `neutral-900` | `#171717` | Body text |
| `--font-sans` | `Geist Variable` | All UI text |
| `--radius` | `10px` | Base corner radius |

## Design principles

1. **Clarity over decoration** — every element earns its place.
2. **Community-first** — warm, approachable tone; never corporate.
3. **Accessible by default** — all colour combinations meet WCAG AA.
4. **Consistent rhythm** — 4px spacing base, 8-column grid.
