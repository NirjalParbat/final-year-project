/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#EEF4FF',
          100: '#DDEAFF',
          200: '#B3D0FF',
          300: '#80B1F5',
          400: '#4D8FE0',
          500: '#2B6EBF',
          600: '#0F4C81',
          700: '#0A3D68',
          800: '#072E4F',
          900: '#041E35',
        },
        secondary: {
          50:  '#ECFAFF',
          100: '#C8EEFA',
          200: '#93D8F2',
          300: '#5EC3EA',
          400: '#3FA7D6',
          500: '#2A8BB8',
          600: '#1A6E95',
          700: '#105272',
          800: '#083850',
          900: '#042030',
        },
        accent: {
          50:  '#FFF4F0',
          100: '#FFE3D9',
          200: '#FFC5B0',
          300: '#FFA080',
          400: '#FF7A59',
          500: '#F55A35',
          600: '#D93D1B',
          700: '#B02D10',
          800: '#851F09',
          900: '#581304',
        },
        brand: {
          bg:      '#F7F9FC',
          surface: '#FFFFFF',
          text:    '#1F2933',
          muted:   '#6B7280',
          border:  '#E5E7EB',
        },
      },
      fontFamily: {
        display: ['Poppins', 'system-ui', 'sans-serif'],
        body:    ['Inter', 'system-ui', 'sans-serif'],
      },
      fontWeight: {
        'heading-normal': '600',
        'heading-bold':   '700',
        'body':           '400',
        'body-medium':    '500',
        'btn':            '500',
      },
      boxShadow: {
        'card':  '0 1px 3px 0 rgba(0,0,0,.06), 0 1px 2px -1px rgba(0,0,0,.06)',
        'card-hover': '0 10px 30px -5px rgba(15,76,129,.15)',
        'navbar': '0 1px 0 0 #E5E7EB',
      },
      animation: {
        'fade-in':  'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(20px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
}
