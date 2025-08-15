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
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            color: theme('colors.text'),
            a: {
              color: theme('colors.primary'),
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            },
            strong: {
              color: theme('colors.text'),
            },
            h1: {
              color: theme('colors.text'),
              fontFamily: theme('fontFamily.serif').join(', '),
              fontWeight: '600',
            },
            h2: {
              color: theme('colors.primary'),
              fontFamily: theme('fontFamily.serif').join(', '),
              fontWeight: '600',
            },
            h3: {
              color: theme('colors.text'),
              fontFamily: theme('fontFamily.serif').join(', '),
              fontWeight: '600',
            },
            h4: {
              color: theme('colors.text'),
              fontFamily: theme('fontFamily.serif').join(', '),
              fontWeight: '600',
            },
            blockquote: {
              color: theme('colors.text'),
              borderLeftColor: theme('colors.primary'),
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
