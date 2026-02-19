/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gold': {
          DEFAULT: '#D4AF37',
          light: '#F8E08E',
          dark: '#996515',
        },
        'mystic': {
          DEFAULT: '#0B0D17',
          light: '#1A1D2E',
          dark: '#05060A',
        }
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(to right, #996515, #D4AF37, #F8E08E, #D4AF37, #996515)',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
        'mystic-gradient': 'radial-gradient(circle at center, #1A1D2E 0%, #0B0D17 100%)',
      },
      boxShadow: {
        'gold': '0 0 15px rgba(212, 175, 55, 0.3)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
