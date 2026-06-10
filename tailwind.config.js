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
        ore: 'var(--c-ore)',
        note: 'var(--c-note)',
        // Work-day type colors
        'wd-lavorativa': 'var(--c-wd-lavorativa)',
        'wd-festiva': 'var(--c-wd-festiva)',
        'wd-malattia': 'var(--c-wd-malattia)',
        'wd-infortunio': 'var(--c-wd-infortunio)',
        'wd-ferie': 'var(--c-wd-ferie)',
        'wd-permesso': 'var(--c-wd-permesso)',
        // States
        success: 'var(--c-success)',
        warning: 'var(--c-warning)',
        danger: 'var(--c-danger)',
        // Primary action
        primary: 'var(--c-primary)',
        'on-primary': 'var(--c-on-primary)',
        'primary-border': 'var(--c-primary-border)',
        // Soft accent for tags/chips — kept distinct from primary
        'accent-soft': 'var(--c-accent-soft-bg)',
        'accent-soft-ink': 'var(--c-accent-soft-ink)',
      },
      borderRadius: {
        card: '16px',
        btn: '12px',
      },
      boxShadow: {
        card: '0 1px 3px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08)',
        sheet: '0 -8px 40px rgba(0,0,0,0.12)',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
        display: ['Manrope', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
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
