/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        opensans: ['Open Sans', 'sans-serif'],
      },
      colors: {
        olive: {
          50: '#f9faf5',
          100: '#f1f4e5',
          200: '#e1e9c9',
          300: '#cad9a3',
          400: '#adc072',
          500: '#8fa84b',
          600: '#768c3b',
          700: '#5c6e30',
          800: '#4a5829',
          900: '#404a25',
        },
        gold: {
          50: '#fefdf8',
          100: '#fefbeb',
          200: '#fdf5d3',
          300: '#fceeb0',
          400: '#f9dd71',
          500: '#f5c935',
          600: '#e1b32e',
          700: '#bc9126',
          800: '#987423',
          900: '#7c5f1f',
        },
        azure: {
          50: '#f4f9fd',
          100: '#e9f3fa',
          200: '#c8e1f4',
          300: '#97c7ea',
          400: '#5fa7dd',
          500: '#3889cc',
          600: '#266baf',
          700: '#21578f',
          800: '#204a76',
          900: '#1e3f63',
        },
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        }
      },
    },
  },
  plugins: [],
}