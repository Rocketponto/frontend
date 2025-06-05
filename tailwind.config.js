/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'rocket-red': {
          600: '#A10000',
          700: '#8B0000',
          800: '#760000',
        },
        'gray-rocket': {
          600: '#181818',
          700: '#161518'
        }
      }
    },
  },
  plugins: [],
}