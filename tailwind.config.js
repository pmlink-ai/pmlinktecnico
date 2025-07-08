/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fffbf0',
          100: '#fff4db',
          200: '#ffeab7',
          300: '#ffd882',
          400: '#ffc44d',
          500: '#ffa500', // Color principal #FFA500
          600: '#e68900',
          700: '#cc7700',
          800: '#b36600',
          900: '#995500',
        },
      },
    },
  },
  plugins: [],
}
