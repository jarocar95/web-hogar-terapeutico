/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,njk,js,md}"], // Archivos que va a escanear
  safelist: [
    'text-right',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#9C6666',           // Rojo terracota principal
        secondary: '#A1BFAE',         // Verde azulado suave
        text: '#4A3B3B',             // Marrón oscuro para texto
        background: '#FEFBF8',       // Fondo muy claro cálido
        light: '#F6EEEE',            // Fondo rosa pálido muy claro
        accent: '#E6A6A1',           // Acento rosa salmón
        'primary-darker': '#8B5A5A', // Versión oscura del primario

        // Variantes legibles: los colores de marca son tonos de SUPERFICIE.
        // Sobre fondos claros no llegan al 4,5:1 que exige WCAG AA para texto
        // (primary da 4,08 sobre light; secondary 1,74; accent 1,78), asi que
        // como color de texto se usan estos, que conservan el tono.
        'primary-text': '#85554F',   // 5,39 sobre light · 6,16 sobre blanco
        'secondary-text': '#4A6B5B', // 5,19 sobre light · 5,92 sobre blanco
        'accent-text': '#A85C51',    // 4,26 sobre light · 4,87 sobre blanco
        'text-muted': '#6E5B58',     // 5,57 sobre light · 6,36 sobre blanco
        'secondary-darker': '#8FA89B', // Versión oscura del secundario
        'footer-bg': '#4A3B3B',      // Fondo del footer
        'footer-text': '#FFFFFF',    // Texto del footer
        'footer-text-secondary': '#FEFBF8', // Texto secundario del footer

        // Grises para compatibilidad
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
        },
        white: '#ffffff',
        black: '#000000',
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
              fontWeight: '600',
            },
            h1: {
              color: theme('colors.text'),
              fontFamily: theme('fontFamily.sans').join(', '),
              fontWeight: '700',
              fontSize: '2.5rem',
              lineHeight: '1.2',
            },
            h2: {
              color: theme('colors.primary'),
              fontFamily: theme('fontFamily.serif').join(', '),
              fontWeight: '600',
              fontSize: '2rem',
              lineHeight: '1.3',
            },
            h3: {
              color: theme('colors.text'),
              fontFamily: theme('fontFamily.sans').join(', '),
              fontWeight: '600',
              fontSize: '1.5rem',
            },
            h4: {
              color: theme('colors.text'),
              fontFamily: theme('fontFamily.sans').join(', '),
              fontWeight: '600',
            },
            blockquote: {
              color: theme('colors.text'),
              borderLeftColor: theme('colors.primary'),
              fontStyle: 'italic',
            },
          },
        },
      }),
    },
  },
  plugins: [require('@tailwindcss/typography')],
}
