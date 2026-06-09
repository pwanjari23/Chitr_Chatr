/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Custom WhatsApp/Discord blended sleek color palette
        brand: {
          50: '#f5f7fb',
          100: '#ebeff7',
          200: '#d0daf0',
          300: '#a5badf',
          400: '#7193ca',
          500: '#4d70b3',
          600: '#3c5797',
          700: '#32467b',
          800: '#2b3a65',
          900: '#273254',
          950: '#1b213b',
        },
      },
    },
  },
  plugins: [],
}
