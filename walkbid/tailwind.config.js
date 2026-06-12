/** @type {import('tailwindcss').Config} */
// WalkBid "Premium Jobsite" design system (build spec §4).
// Dark-first, industrial, glanceable in sunlight, operable with gloves.
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        asphalt: '#0E1013', // app background
        graphite: '#16191E', // cards / surfaces
        steel: '#262B33', // borders, dividers
        chalk: '#F2F3F5', // primary text
        dust: '#8A9099', // secondary text
        safety: '#FF6A00', // primary actions, brand accent
        signal: '#FFC400', // warnings / EXTRA WORK / change orders (money at risk)
        go: '#22C55E', // paid / signed
        risk: '#EF4444', // overdue / disputed
      },
      borderRadius: {
        // Square, solid, confident — single 10px radius.
        DEFAULT: '10px',
        card: '10px',
        btn: '10px',
      },
      fontFamily: {
        // Archivo (display) + Inter (body); system fallbacks keep us offline &
        // privacy-clean if the self-hosted faces are unavailable.
        display: ['Archivo', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        // Money is always the biggest thing on a card.
        money: ['28px', { lineHeight: '1.05', fontWeight: '800', letterSpacing: '-0.02em' }],
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
        touch: '48px', // minimum touch target
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.4)',
        bar: '0 -4px 24px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
};
