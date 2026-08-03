/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0a0b0d',
          900: '#101216',
          850: '#14161b',
          800: '#1a1d23',
          750: '#20242c',
          700: '#272b34',
          600: '#353a45',
          500: '#4a5160',
          400: '#6b7280',
          300: '#9ca3af',
          200: '#c7ccd6',
          100: '#e5e7eb',
        },
        steel: { 500: '#3b82f6', 600: '#2563eb' },
        flame: { 400: '#fb923c', 500: '#f97316', 600: '#ea580c' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['"Sora"', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.4), 0 8px 24px -12px rgba(0,0,0,0.6)',
        glow: '0 0 0 1px rgba(249,115,22,0.4), 0 8px 24px -8px rgba(249,115,22,0.35)',
      },
      keyframes: {
        'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
        'slide-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'scale-in': { from: { opacity: '0', transform: 'scale(0.96)' }, to: { opacity: '1', transform: 'scale(1)' } },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.25s ease-out',
        'scale-in': 'scale-in 0.18s ease-out',
      },
    },
  },
  plugins: [],
};
