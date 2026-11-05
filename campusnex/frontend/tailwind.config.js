/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        campus: {
          bg: '#101820',
          secondary: '#131F27',
          card: '#17232B',
          elevated: '#202F38',
          accent: '#B9F66B',
          'accent-subtle': '#92D9A1',
          text: '#F5F7F4',
          muted: '#9BA9AD',
          border: '#2C3B42',
        }
      },
      fontFamily: {
        sans: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-accent': '0 0 20px -3px rgba(185, 246, 107, 0.25)',
        'glow-drone': '0 0 20px -3px rgba(146, 217, 161, 0.3)',
      }
    },
  },
  plugins: [],
}

