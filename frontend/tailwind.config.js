/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        surface: {
          DEFAULT: '#0f1117',
          card:    '#1a1d27',
          border:  '#2a2d3e',
          hover:   '#232636',
        },
      },
      boxShadow: {
        card: '0 4px 24px rgba(0,0,0,0.35)',
        glow: '0 0 32px rgba(99,102,241,0.25)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        'gradient-dark':  'linear-gradient(135deg, #1a1d27 0%, #0f1117 100%)',
      },
      animation: {
        'fade-in':   'fadeIn 0.3s ease-out',
        'slide-up':  'slideUp 0.3s ease-out',
        'pulse-slow':'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(12px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
