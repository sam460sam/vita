# Vyta — Design System

Reference for Vyta's visual language. The source of truth is
`src/styles/index.css` (CSS variables) and `tailwind.config.js` (token names).
Every color has a **light** and a **dark** value.

---

## Surfaces

| Token | Tailwind | Light | Dark |
|-------|----------|-------|------|
| App background | `bg-app` | `#f8f1e6` | `#16130f` |
| Section | `bg-section` | `#f1e7d7` | `#100d0a` |
| Card | `bg-card` | `#fffdf8` | `#211c17` |

## Text (ink)

| Token | Tailwind | Light | Dark |
|-------|----------|-------|------|
| Primary | `text-ink` | `#2a2018` | `#f6f1e9` |
| Secondary | `text-ink-2` | `#7c7263` | `#a89e90` |
| Tertiary | `text-ink-3` | `#756d61` | `#aaa08e` |

## Lines

| Token | Tailwind | Light | Dark |
|-------|----------|-------|------|
| Line | `border-line` | `#ece1cf` | `#2c2620` |
| Divider | `divide-divider` | `#f4ecde` | `#211c17` |

---

## Brand & actions

| Token | Tailwind | Light | Dark |
|-------|----------|-------|------|
| Accent (signature green) | `bg-accent` | `#16a34a` | `#2dd45a` |
| On accent | `text-on-accent` | `#07260f` | `#ffffff` |
| Primary action | `bg-primary` | `#16a34a` | `#2dd45a` |
| On primary | `text-on-primary` | `#07260f` | `#ffffff` |
| Streak | `text-streak` | `#ff8a3d` | `#ff9d57` |
| Check | `text-check` | `#1fb877` | `#2bd398` |
| Pro / gold (paywall) | — | `#C9A227` | `#C9A227` |
| Glow | `--c-glow` | `rgba(34,197,94,0.16)` | `rgba(45,212,90,0.13)` |

## States

| Token | Tailwind | Light | Dark |
|-------|----------|-------|------|
| Success | `text-success` | `#1fb877` | `#2bd398` |
| Warning | `text-warning` | `#ff8a3d` | `#ff9d57` |
| Danger | `text-danger` | `#ef5350` | `#f87171` |

---

## Module accents

Each module has three tones: **accent** (icon/text), **tint** (desaturated card
background), **chip** (slightly more saturated icon chip).

| Module | Tone | Light | Dark |
|--------|------|-------|------|
| **Activity** | accent | `#ff6b4a` | `#ff8163` |
| | tint | `#ffe6db` | `#32211a` |
| | chip | `#ff8163` | `#ff8a6e` |
| **Habits** | accent | `#16b87a` | `#2bd398` |
| | tint | `#d8f2e4` | `#16271f` |
| | chip | `#2bd398` | `#44c794` |
| **Water** | accent | `#0ea5e9` | `#38bdf8` |
| | tint | `#d9f0fb` | `#15293a` |
| | chip | `#38bdf8` | `#4fc0ee` |
| **Finance** | accent | `#9b5de5` | `#b98cf5` |
| | tint | `#efe4fb` | `#281f34` |
| | chip | `#b386ec` | `#b98cf5` |
| **Journal** | accent | `#f59e0b` | `#fbbf24` |
| | tint | `#fdeccd` | `#2e2515` |
| | chip | `#f5b454` | `#fbbf24` |
| **Projects** | accent | `#5b6cf0` | `#8b93ff` |
| | tint | `#e4e7fd` | `#1e2034` |
| | chip | `#8590f4` | `#8b93ff` |
| **Notes** | accent | `#e0992f` | `#f5c265` |
| | tint | `#fdf2d4` | `#2d2715` |
| | chip | `#ecc35a` | `#f5c265` |
| **Personality** | accent | `#ec4899` | `#f472b6` |
| | tint | `#fcdcec` | `#321826` |
| | chip | `#f06fb0` | `#f472b6` |
| **Calendar** | tint | `#eceef7` | `#20222f` |
| | chip | `#9fa8c9` | `#9fa8c9` |

## Hero gradient (home)

| Token | Light | Dark |
|-------|-------|------|
| `--c-hero-1` | `#d8f5d4` | `#21401e` |
| `--c-hero-2` | `#c2eebd` | `#18331a` |

---

## Shape & elevation

**Border radius**
- Card: `26px` (`rounded-card`)
- Button: `16px` (`rounded-btn`)
- Pill: `999px` (`rounded-pill`)

**Shadows** (warm brown-tinted)
- `shadow-card`: `0 10px 30px rgba(83,52,20,0.07)`
- `shadow-card-hover`: `0 16px 40px rgba(83,52,20,0.12)`
- `shadow-chip`: `0 4px 14px rgba(83,52,20,0.06)`
- `shadow-fab`: `0 12px 30px rgba(22,163,74,0.42)` (green glow)
- `shadow-nav`: `0 8px 30px rgba(83,52,20,0.12)`
- `shadow-sheet`: `0 -8px 40px rgba(40,25,10,0.16)`

## Typography

- Family: `ui-rounded, SF Pro Rounded, Nunito, system-ui, -apple-system, Segoe UI, Roboto, sans-serif`
- Rounded, friendly "candy" feel
- Numbers use tabular figures (`.tnum` / `tabular-nums`)

## Layout

- Content column capped at `max-w-3xl` (≈768px), centered.
- Navigation: bottom tab bar below `md` (<768px), left sidebar from `md` up
  (so iPhone shows the tab bar, iPad shows the sidebar).
- Safe-area spacing tokens: `safe-top`, `safe-bottom`, `safe-left`, `safe-right`.

---

_Dark mode is class-based (`darkMode: 'class'`). To change a color, edit the
matching `--c-*` variable in `src/styles/index.css` — both the `:root` (light)
and the dark block._
