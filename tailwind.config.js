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
      },
      borderRadius: {
        card: '26px',
        pill: '999px',
        btn: '16px',
      },
      boxShadow: {
        card: '0 10px 30px rgba(83,52,20,0.07)',
        'card-hover': '0 16px 40px rgba(83,52,20,0.12)',
        chip: '0 4px 14px rgba(83,52,20,0.06)',
        fab: '0 12px 30px rgba(22,163,74,0.42)',
        nav: '0 8px 30px rgba(83,52,20,0.12)',
        sheet: '0 -8px 40px rgba(40,25,10,0.16)',
      },
      fontFamily: {
        sans: ['ui-rounded', 'SF Pro Rounded', 'Nunito', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
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
