/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Fondo cálido tipo papel
        crema: {
          50: '#fefcf7',
          100: '#fdf8ed',
          200: '#faf2db',
          300: '#f3e8c4',
          400: '#e8d5a3',
          500: '#d4b87a',
        },
        // Berry profundo (primario)
        baya: {
          50: '#fdf5f4',
          100: '#fbe8e6',
          200: '#f5cac6',
          300: '#eaa097',
          400: '#d97062',
          500: '#bd4d3f',
          600: '#a23827',
          700: '#7a2a3e', // principal
          800: '#5f1e2b',
          900: '#3d1018',
        },
        // Salvia (secundario)
        salvia: {
          50: '#f4f7f3',
          100: '#e6ede4',
          200: '#cad8c5',
          300: '#a6bfa0',
          400: '#7da077',
          500: '#5b7f57',
          600: '#476443',
          700: '#3a4f37',
          800: '#2e3f2c',
        },
        // Hilo dorado (acento)
        hilo: {
          400: '#cfa45c',
          500: '#b78a4a',
          600: '#946c34',
        },
        // Tinta cálida (texto)
        tinta: {
          900: '#2a2520',
          800: '#3d342c',
          700: '#574a3f',
          600: '#7a6c5f',
          500: '#9e8f80',
          400: '#bcb1a5',
          300: '#d8d0c4',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'paper-grid':
          "linear-gradient(to right, rgba(122,42,62,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(122,42,62,0.04) 1px, transparent 1px)",
        'paper-grid-sm':
          "linear-gradient(to right, rgba(122,42,62,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(122,42,62,0.025) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid-cm': '20px 20px',
        'grid-mm': '4px 4px',
      },
      boxShadow: {
        'paper': '0 1px 2px rgba(122,42,62,0.04), 0 8px 24px -8px rgba(122,42,62,0.12)',
        'paper-lg': '0 2px 4px rgba(122,42,62,0.06), 0 24px 48px -16px rgba(122,42,62,0.18)',
        'stitch': '0 0 0 1px rgba(122,42,62,0.08), 0 4px 16px -8px rgba(122,42,62,0.16)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: 0, transform: 'translateY(8px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
        'stitch': {
          '0%': { strokeDashoffset: 100 },
          '100%': { strokeDashoffset: 0 },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        'stitch': 'stitch 2s ease-out both',
      },
    },
  },
  plugins: [],
};
