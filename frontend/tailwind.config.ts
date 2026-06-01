import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
      colors: {
        brand: {
          50:  '#fdf5ef',
          100: '#fae8d4',
          200: '#f4cda8',
          300: '#edab72',
          400: '#e5823a',
          500: '#df6620',
          600: '#d04d16',
          700: '#ac3914',
          800: '#8a2f18',
          900: '#702917',
          950: '#3c120a',
        },
        surface: {
          50:  '#fafaf9',
          100: '#f5f4f1',
          200: '#e8e6e1',
          300: '#d6d3cc',
          400: '#b8b4ab',
          500: '#a09b90',
          600: '#8a847a',
          700: '#736e65',
          800: '#615d56',
          900: '#504d48',
          950: '#2b2926',
        },
        sidebar: {
          DEFAULT: '#1c1b18',
          light: '#2b2926',
          lighter: '#3a3835',
        }
      },
      borderRadius: {
        'xl': '0.875rem',
        '2xl': '1rem',
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.03)',
        'card-hover': '0 4px 12px 0 rgba(0,0,0,0.06), 0 2px 4px -2px rgba(0,0,0,0.04)',
        'elevated': '0 8px 24px -4px rgba(0,0,0,0.08)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.35s ease-out',
        'slide-in': 'slideIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideIn: {
          '0%': { opacity: '0', transform: 'translateX(-6px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config
