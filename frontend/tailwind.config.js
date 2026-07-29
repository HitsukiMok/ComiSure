/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: 'var(--color-canvas)',
        surface: 'var(--color-surface)',
        elevated: 'var(--color-elevated)',
        ink: 'var(--color-text-primary)',
        graphite: 'var(--color-text-secondary)',
        fog: 'var(--color-text-muted)',
        border: 'var(--color-border)',
        action: 'var(--color-action)',
        'action-text': 'var(--color-action-text)',
        accent: 'var(--color-accent)',
        'accent-light': 'var(--color-accent-light)',
        // Status pastels
        'status-pending': 'var(--color-status-pending)',
        'status-funded': 'var(--color-status-funded)',
        'status-released': 'var(--color-status-released)',
        'status-refunded': 'var(--color-status-refunded)',
        'status-expired': 'var(--color-status-expired)',
        // Static pastels (for light-mode tiles)
        'lavender-wash': '#f1e6ff',
        'mint-wash': '#d3f6e3',
        'powder-blue': '#cce7ff',
        'solar': '#fff2be',
        'peach': '#ffd1b8',
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['Geist', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'hero': ['148px', { lineHeight: '1.05', letterSpacing: '-2.96px', fontWeight: '500' }],
        'display': ['72px', { lineHeight: '1.11', letterSpacing: '-1.44px', fontWeight: '500' }],
        'heading-lg': ['48px', { lineHeight: '1.17', letterSpacing: '-0.96px', fontWeight: '500' }],
        'heading': ['32px', { lineHeight: '1.25', letterSpacing: '-0.64px', fontWeight: '500' }],
        'heading-sm': ['24px', { lineHeight: '1.17', letterSpacing: '-0.48px', fontWeight: '500' }],
        'subheading': ['20px', { lineHeight: '1.4', letterSpacing: '-0.2px', fontWeight: '500' }],
      },
      borderRadius: {
        'card': '32px',
        'card-sm': '16px',
        'input': '16px',
        'btn': '32px',
        'pill': '9999px',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      maxWidth: {
        'page': '1200px',
      },
      boxShadow: {
        'button': 'rgba(10, 13, 18, 0.8) 0px 1px 2px 0px, rgb(10, 13, 18) 0px 0px 0px 1px',
        'lg': 'rgba(4, 69, 144, 0.08) 0px 14px 20px 4px',
      },
    },
  },
  plugins: [],
}
