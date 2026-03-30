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
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        primary: 'var(--color-primary)',
        accent: 'var(--color-accent)',
        textmain: 'var(--color-textmain)', 
        textmuted: 'var(--color-textmuted)',
        border: 'var(--color-border)'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px var(--color-primary), 0 0 20px var(--color-primary)' },
          '100%': { boxShadow: '0 0 20px var(--color-accent), 0 0 30px var(--color-accent)' },
        }
      }
    },
  },
  plugins: [],
}
