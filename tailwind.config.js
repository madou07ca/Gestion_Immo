/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        night: {
          900: '#0a0e1a',
          800: '#0f1629',
          700: '#151d35',
          600: '#1a2542',
          500: '#243555',
        },
        gold: {
          50: '#fdf8e8',
          100: '#f9ecc4',
          200: '#f3d98e',
          300: '#ecc554',
          400: '#e5b02d',
          500: '#c9971f',
          600: '#a87619',
          700: '#875618',
          800: '#704619',
          900: '#5f3c18',
        },
      },
      fontFamily: {
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
