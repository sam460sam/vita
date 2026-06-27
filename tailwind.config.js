/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Surfaces
        app: 'var(--c-app)',
        section: 'var(--c-section)',
        card: 'var(--c-card)',
        // Text
        ink: 'var(--c-ink)',
        'ink-2': 'var(--c-ink-2)',
        'ink-3': 'var(--c-ink-3)',
        // Lines
        line: 'var(--c-line)',
        divider: 'var(--c-divider)',
        // Module accents
        activity: 'var(--c-activity)',
        habit: 'var(--c-habit)',
        project: 'var(--c-project)',
        journal: 'var(--c-journal)',
        finance: 'var(--c-finance)',
        note: 'var(--c-note)',
        // Module card tints (desaturated wash for card backgrounds)
        'activity-tint': 'var(--c-activity-tint)',
        'habit-tint': 'var(--c-habit-tint)',
        'project-tint': 'var(--c-project-tint)',
        'journal-tint': 'var(--c-journal-tint)',
        'finance-tint': 'var(--c-finance-tint)',
        'calendar-tint': 'var(--c-calendar-tint)',
        'note-tint': 'var(--c-note-tint)',
        // Module icon chips (slightly more saturated than the tint)
        'activity-chip': 'var(--c-activity-chip)',
        'habit-chip': 'var(--c-habit-chip)',
        'project-chip': 'var(--c-project-chip)',
        'journal-chip': 'var(--c-journal-chip)',
        'finance-chip': 'var(--c-finance-chip)',
        'calendar-chip': 'var(--c-calendar-chip)',
        'note-chip': 'var(--c-note-chip)',
        // States
        success: 'var(--c-success)',
        warning: 'var(--c-warning)',
        danger: 'var(--c-danger)',
        // Candy signature
        accent: 'var(--c-accent)',
        'on-accent': 'var(--c-on-accent)',
        streak: 'var(--c-streak)',
        check: 'var(--c-check)',
        // Primary action
        primary: 'var(--c-primary)',
        'on-primary': 'var(--c-on-primary)',
        'primary-border': 'var(--c-primary-border)',
        // Gamified: premium gold + virtual currency (Drops)
        gold: 'var(--c-gold)',
        'gold-2': 'var(--c-gold-2)',
        drops: 'var(--c-drops)',
      },
      borderRadius: {
        card: '28px',
        pill: '999px',
        btn: '16px',
      },
      boxShadow: {
        // Luxury matte: soft light top hairline + faint gold edge, deep ambient drop.
        card: 'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 0 0 1px rgba(194,160,90,0.10), 0 2px 4px rgba(0,0,0,0.40), 0 18px 40px rgba(0,0,0,0.55)',
        'card-hover': 'inset 0 1px 0 rgba(255,255,255,0.07), inset 0 0 0 1px rgba(194,160,90,0.14), 0 4px 8px rgba(0,0,0,0.45), 0 26px 56px rgba(0,0,0,0.62)',
        chip: 'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 0 0 1px rgba(194,160,90,0.09), 0 1px 2px rgba(0,0,0,0.35), 0 6px 16px rgba(0,0,0,0.42)',
        // Satin FAB: matte emerald body, thin antique-gold ring, soft ambient halo.
        fab: 'inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 1px rgba(184,134,11,0.40), 0 10px 30px rgba(0,0,0,0.55), 0 0 26px rgba(13,77,50,0.55)',
        nav: '0 -2px 12px rgba(0,0,0,0.50)',
        sheet: '0 -2px 10px rgba(0,0,0,0.45), 0 -12px 44px rgba(0,0,0,0.60)',
        // Satin glows: muted emerald bloom with a thin gold-lit outline (no neon).
        glow: 'inset 0 1px 0 rgba(255,255,255,0.10), 0 0 0 1px rgba(184,134,11,0.30), 0 8px 22px rgba(0,0,0,0.45)',
        'glow-strong': 'inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 1px rgba(184,134,11,0.42), 0 0 22px rgba(13,77,50,0.50), 0 10px 26px rgba(0,0,0,0.50)',
        'glow-gold': '0 0 0 1px rgba(184,134,11,0.45), 0 0 22px rgba(184,134,11,0.30)',
        'glow-water': '0 0 16px rgba(78,147,166,0.28)',
      },
      fontFamily: {
        sans: ['-apple-system', 'system-ui', 'SF Pro Text', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        serif: ['Fraunces', 'ui-serif', 'Iowan Old Style', 'Palatino Linotype', 'Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
      },
      fontVariantNumeric: {
        tabular: 'tabular-nums',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      transitionDuration: {
        150: '150ms',
        250: '250ms',
      },
    },
  },
  plugins: [],
};
