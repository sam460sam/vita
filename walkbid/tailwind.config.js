/** @type {import('tailwindcss').Config} */
// WalkBid "Asphalt & Stakes" design system (redesign Part A).
// Premium, calm, layered green-black. One accent (signal green) for "do this /
// positive"; amber for "at risk"; red for "wrong". Tokens are the only source
// of color — components must never hardcode hex. Mirror in :root (index.css).
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // ---- Surfaces (layered, for depth) ----
        bg: '#0A100D', // app background — asphalt black, faint green undertone
        surface: '#111A15', // cards
        'surface-2': '#18241D', // raised cards, sheets, inputs
        hairline: '#233029', // 1px borders / dividers

        // ---- Brand greens ----
        brand: '#1C6E47', // deep field green — header base, brand fills
        'brand-ink': '#0E3A26', // header gradient top, pressed brand
        accent: '#2FBE7A', // SIGNAL GREEN — primary, active tab, links, positive
        'accent-press': '#26A268',
        'on-accent': '#06140D', // near-black text ON green buttons

        // ---- Semantic ----
        paid: '#2FBE7A', // = accent (paid / signed / go)
        attention: '#E6A23C', // survey amber — at risk, unsigned, starter price
        danger: '#DC5A4B', // muted brick red — overdue, disputed, destructive

        // ---- Text ----
        ink: '#F2F5F1', // warm white — primary text (--text)
        muted: '#9AA79E', // sage gray — secondary (--text-muted)
        faint: '#5E6D64', // captions, disabled (--text-faint)

        // ---- Legacy (removed in the Step C cleanup; kept so the migration
        // builds at every step) ----
        asphalt: '#0E1013',
        graphite: '#16191E',
        steel: '#262B33',
        chalk: '#F2F3F5',
        dust: '#8A9099',
        safety: '#FF6A00',
        signal: '#FFC400',
        go: '#22C55E',
        risk: '#EF4444',
      },
      borderRadius: {
        // Softer = more premium (up from the old 10px square look).
        DEFAULT: '12px',
        card: '16px',
        btn: '12px',
        input: '12px',
        sheet: '20px',
      },
      fontFamily: {
        display: ['Archivo', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', '"Roboto Mono"', 'Menlo', 'monospace'],
      },
      fontSize: {
        // Real scale with weight/size separation so money leads (A4).
        display: ['28px', { lineHeight: '1.05', letterSpacing: '-0.02em', fontWeight: '800' }],
        h2: ['19px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'money-hero': ['30px', { lineHeight: '1.0', letterSpacing: '-0.01em', fontWeight: '800' }],
        'money-lg': ['22px', { lineHeight: '1.05', letterSpacing: '-0.01em', fontWeight: '800' }],
        eyebrow: ['12px', { lineHeight: '1', letterSpacing: '0.08em', fontWeight: '600' }],
        meta: ['13px', { lineHeight: '1.4', fontWeight: '400' }],
        hash: ['12px', { lineHeight: '1.5', fontWeight: '400' }],
        // Back-compat (MoneyText still references `money` until Step B).
        money: ['28px', { lineHeight: '1.05', fontWeight: '800', letterSpacing: '-0.02em' }],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        touch: '48px',
      },
      boxShadow: {
        // Inset top-highlight + soft drop = the "lifted" card cue.
        card: 'inset 0 1px 0 rgba(255,255,255,0.03), 0 8px 24px -12px rgba(0,0,0,0.6)',
        raise: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 12px 32px -14px rgba(0,0,0,0.7)',
        bar: '0 -8px 28px -8px rgba(0,0,0,0.6)',
        fab: '0 10px 24px -8px rgba(47,190,122,0.45), 0 4px 10px rgba(0,0,0,0.4)',
      },
      backgroundImage: {
        'header-fade': 'linear-gradient(180deg, #0E3A26 0%, #0A100D 78%)',
      },
    },
  },
  plugins: [],
};
