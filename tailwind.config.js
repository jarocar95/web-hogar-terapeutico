/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,njk,js,md}"], // Archivos que va a escanear
  safelist: [
    'text-right',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#9C6666',
        secondary: '#A1BFAE',
        text: '#4A3B3B',
        background: '#FEFBF8',
        light: '#F6EEEE',
        accent: '#E6A6A1',
        'primary-darker': '#8B5A5A',
        'footer-bg': '#6B5B5B',
        'footer-text': '#F9F1EF',
      },
      fontFamily: {
        sans: ['Public Sans', 'sans-serif'],
        serif: ['Frank Ruhl Libre', 'serif'],
      },
      typography: ({ theme }) => ({
        DEFAULT: {
          css: {
            color: theme('colors.text'),
            lineHeight: '1.75',
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
