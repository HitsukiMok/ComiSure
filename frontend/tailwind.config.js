/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0a0b10', // Deep dark space theme
        surface: '#12141d',
        primary: '#6d28d9', // Vibrant purple
        accent: '#06b6d4',  // Cyan accent
        textmain: '#f3f4f6', 
        textmuted: '#9ca3af'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 10px #6d28d9, 0 0 20px #6d28d9' },
          '100%': { boxShadow: '0 0 20px #06b6d4, 0 0 30px #06b6d4' },
        }
      }
    },
  },
  plugins: [],
}
