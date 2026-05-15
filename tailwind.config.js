/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        marfil: '#faf6f1',
        tinta: '#1f2937',
        rosa: {
          50: '#fef2f4',
          100: '#fce4ea',
          200: '#f8c2cd',
          400: '#e87a92',
          500: '#d65477',
          600: '#bd3a5e',
          700: '#9c2a4a',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Playfair Display"', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
};
