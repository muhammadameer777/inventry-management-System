/** @type {import('tailwindcss').Config} */
import colors from 'tailwindcss/colors';

delete colors.lightBlue;
delete colors.warmGray;
delete colors.trueGray;
delete colors.coolGray;
delete colors.blueGray;

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    colors: {
      ...colors,
      blue: {
        50: '#fffbeb',
        100: '#fef3c7',
        200: '#fde68a',
        300: '#fcd34d',
        400: '#fbbf24',
        500: '#f59e0b',
        600: '#d97706',
        700: '#b45309',
        800: '#92400e',
        900: '#78350f',
        950: '#451a03',
      },
    },
    extend: {
      colors: {
        campus: {
          50: '#f0f5ff',
          100: '#e0ecff',
          200: '#c7dcff',
          300: '#9ec4ff',
          400: '#6ea0fe',
          500: '#4378f7', // Restrained elegant accent
          600: '#2c59ec',
          700: '#2043d8',
          800: '#1e38af',
          900: '#1d328a',
          950: '#142055',
        },
        dark: {
          bg: '#0c0d12',
          surface: '#13151b',
          elevated: '#1a1d26',
          border: 'rgba(255, 255, 255, 0.08)',
          muted: '#94a3b8',
        },
        light: {
          bg: '#f8f9fc',
          surface: '#ffffff',
          elevated: '#ffffff',
          border: 'rgba(0, 0, 0, 0.07)',
          muted: '#64748b',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      boxShadow: {
        'glass-sm': '0 2px 10px 0 rgba(0, 0, 0, 0.04)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        'glass-lg': '0 16px 48px -8px rgba(0, 0, 0, 0.16)',
        'dark-glass': '0 10px 30px -5px rgba(0, 0, 0, 0.5)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
      }
    },
  },
  plugins: [],
}
