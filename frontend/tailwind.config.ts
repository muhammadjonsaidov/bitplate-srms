import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        biteplate: {
          50:  '#fdf8f0',
          100: '#faefd9',
          200: '#f4d9a8',
          500: '#c47c2b',
          600: '#a86522',
          700: '#8b501a',
          800: '#6e3d14',
          900: '#5c3410',
        }
      }
    },
  },
  plugins: [],
} satisfies Config
