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
        // Primary Colors - Soft Indigo (Calm & Professional)
        primary: {
          50: '#F0F1FF',
          100: '#E0E3FF',
          200: '#C7CCFF',
          300: '#9AA0FF',
          400: '#7A82FF',
          500: '#5A60F8',
          600: '#4A4FE8',
          700: '#3B3FC5',
          800: '#2D319E',
          900: '#1F2275',
        },
        // Secondary Colors - Rosy Pink (Warm & Friendly)
        secondary: {
          50: '#FFF0F5',
          100: '#FFE0EB',
          200: '#FFC7DC',
          300: '#FF99C8',
          400: '#FF80AB',
          500: '#FF4D8F',
          600: '#E6437E',
          700: '#CC3A6D',
          800: '#B3315C',
          900: '#99284B',
        },
        // Accent Colors - Sky Blue (Refreshing & Clear)
        accent: {
          50: '#E1F5FE',
          100: '#B3E5FC',
          200: '#81D4FA',
          300: '#4FC3F7',
          400: '#29B6F6',
          500: '#03A9F4',
          600: '#039BE5',
          700: '#0288D1',
          800: '#0277BD',
          900: '#01579B',
        },
        // Success - Soft Green
        success: {
          light: '#81C784',
          DEFAULT: '#4CAF50',
          dark: '#388E3C',
        },
        // Warning - Warm Orange
        warning: {
          light: '#FFB74D',
          DEFAULT: '#FFA726',
          dark: '#F57C00',
        },
        // Danger - Soft Red
        danger: {
          light: '#EF5350',
          DEFAULT: '#E53935',
          dark: '#C62828',
        },
        // Neutral Colors with Warm Tones
        warm: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#EEEEEE',
          300: '#E0E0E0',
          400: '#BDBDBD',
          500: '#9E9E9E',
          600: '#757575',
          700: '#616161',
          800: '#424242',
          900: '#212121',
        },
        // Background & Surface
        background: {
          light: '#FDFDFE',
          dark: '#121212',
        },
        surface: {
          light: '#FFFFFFCC',
          dark: '#1E1E1ECC',
        },
        // Text Colors
        text: {
          primary: {
            light: '#1C1C28',
            dark: '#F2F3F5',
          },
          secondary: {
            light: '#52525B',
            dark: '#CFCFD5',
          },
        },
      },
      backgroundImage: {
        'gradient-calm': 'linear-gradient(135deg, #A18CD1 0%, #FBC2EB 100%)',
        'gradient-fresh': 'linear-gradient(135deg, #89F7FE 0%, #66A6FF 100%)',
        'gradient-warm': 'linear-gradient(135deg, #FFE5D9 0%, #FFC5D9 100%)',
        'gradient-primary': 'linear-gradient(135deg, #5A60F8 0%, #9AA0FF 100%)',
        'gradient-secondary': 'linear-gradient(135deg, #FF80AB 0%, #FF99C8 100%)',
        'gradient-hero-light': 'linear-gradient(135deg, #F0F1FF 0%, #FFF0F5 50%, #E1F5FE 100%)',
        'gradient-hero-dark': 'linear-gradient(135deg, #1F2275 0%, #99284B 50%, #01579B 100%)',
      },
      fontFamily: {
        sans: ['Manrope', 'Poppins', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      letterSpacing: {
        tightest: '-.075em',
        tighter: '-.05em',
        tight: '-.025em',
        normal: '0',
        wide: '.025em',
        wider: '.05em',
        widest: '.1em',
      },
    },
  },
  plugins: [],
}

