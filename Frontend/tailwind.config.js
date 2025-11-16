/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'baby-pink': {
          light: '#F8C8DC',
          DEFAULT: '#F8C8DC',
          hover: '#F4A9C4',
          dark: '#F4A9C4',
        },
        'rose-pink': '#F4A9C4',
        'pastel-pink': '#FFE5F1',
        'soft-pink': '#FFF0F8',
        'gemini-blue': '#4285F4',
        'gemini-purple': '#9C27B0',
        'button-primary': '#C084FC',
        'button-primary-hover': '#A855F7',
        threat: {
          low: '#10b981',
          medium: '#f59e0b',
          high: '#f97316',
          critical: '#ef4444',
          unknown: '#6b7280',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'slide-up-fade-in': {
          '0%': {
            transform: 'translateY(30px)',
            opacity: '0',
          },
          '100%': {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
        'fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
      },
      animation: {
        'slide-up-fade-in': 'slide-up-fade-in 0.4s ease-out',
        'fade-in': 'fade-in 0.3s ease-out',
      },
    },
  },
  plugins: [],
}

