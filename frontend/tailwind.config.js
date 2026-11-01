/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          900: '#0a1a12',
          800: '#0f281e',
          700: '#1b4332',
          600: '#2d6a4f',
          500: '#40916c',
          400: '#52b788',
        },
        charcoal: {
          950: '#0d100e',
          900: '#121614',
          800: '#1a1f1c',
          700: '#252c28',
          600: '#343d38',
        },
        ivory: {
          100: '#fdfbf7',
          200: '#f4f1ea',
          300: '#e9e4d8',
          400: '#dcd5c5',
        },
        amber: {
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        danger: {
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}

