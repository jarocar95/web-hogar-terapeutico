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

        // Escalas completas. Los tokens de arriba son los tonos historicos y se
        // mantienen para no romper el blog ni las paginas legales; estas escalas
        // son las que usa la home rediseniada. clay-500 ES primary y sage-300 ES
        // secondary: la marca no cambia, solo gana los peldanios que le faltaban
        // para construir jerarquia sin recurrir a grises de Tailwind.
        clay: {
          50:  '#FBF2F0',
          100: '#F4E3DF',
          200: '#E7C7C1',
          300: '#D5A49C',
          400: '#BC8078',
          500: '#9C6666',  // = primary
          600: '#85554F',  // = primary-text, 6,16 sobre blanco
          700: '#6B4340',
          800: '#4C2F2D',
        },
        sage: {
          50:  '#F1F6F2',
          100: '#DDE9E1',
          200: '#BCD3C4',
          300: '#A1BFAE',  // = secondary
          500: '#5E8570',
          700: '#38534A',  // 7,04 sobre sage-50
          800: '#263A32',
        },
        // Tinta: la escala de texto. ink-soft y ink-mute sustituyen a los
        // text-gray-* que se colaban en la pagina, y ambos pasan AA sobre
        // canvas y sobre blanco.
        ink: {
          DEFAULT: '#2B211F', // 14,8 sobre canvas
          soft:    '#5C4A47', // 7,42 sobre canvas
          mute:    '#7C6A66', // 4,86 sobre canvas
        },
        canvas: '#FDFAF6',
        gold: '#B8862B',

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

      // Escala de radios y sombras. Antes se mezclaban rounded-lg/xl/2xl y
      // shadow-md/lg/xl sin regla: cada componente usaba el escalon que se
      // tecleo ese dia. Estos son los unicos cuatro radios y las dos unicas
      // elevaciones que usa la home.
      borderRadius: {
        'sm2': '10px',
        'md2': '16px',
        'lg2': '24px',
        'xl2': '32px',
      },
      boxShadow: {
        'e1': '0 1px 2px rgba(43,33,31,.05), 0 4px 14px -6px rgba(43,33,31,.10)',
        'e2': '0 2px 4px rgba(43,33,31,.05), 0 18px 40px -18px rgba(43,33,31,.22)',
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
