/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,njk,js,md}"], // Archivos que va a escanear
  theme: {
    extend: {
      colors: {
        primary: '#9C6666',
        secondary: '#A1BFAE',
        text: '#4A3B3B',
        background: '#FEFBF8',
        light: '#F6EEEE',
        accent: '#E6A6A1',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}
