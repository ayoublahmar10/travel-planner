/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        coral: {
          50:  '#FDF0EC',
          100: '#FAD5C8',
          200: '#F5B0A0',
          300: '#EF8B77',
          400: '#E0674E',
          500: '#C4715A',
          600: '#A65A45',
          700: '#8A4536',
          800: '#6E3028',
          900: '#3D1A12',
        },
        gold: {
          50:  '#FDF8EC',
          100: '#FAE9C3',
          200: '#F5D499',
          300: '#EEBF6E',
          400: '#D9A44A',
          500: '#C9973F',
          600: '#A87A2E',
          700: '#875E1F',
          800: '#664413',
          900: '#482B0A',
        },
        cream:  '#FDF6EC',
        sand:   '#E8D5B0',
        forest: '#2D4A3E',
        blush:  '#F5D5CA',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #3D1A12 0%, #2D4A3E 50%, #1A2E28 100%)',
        'card-gradient': 'linear-gradient(135deg, #FDF6EC 0%, #FAE9C3 100%)',
      },
      boxShadow: {
        'warm':    '0 4px 24px rgba(196,113,90,0.12)',
        'warm-lg': '0 8px 40px rgba(196,113,90,0.18)',
        'gold':    '0 2px 12px rgba(201,151,63,0.2)',
      },
      animation: {
        'fade-in':   'fadeIn 0.5s ease forwards',
        'slide-up':  'slideUp 0.5s ease forwards',
        'float':     'float 4s ease-in-out infinite',
        'shimmer':   'shimmer 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%':     { transform: 'translateY(-6px)' },
        },
        shimmer: {
          '0%,100%': { opacity: '0.6' },
          '50%':     { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
