/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: '#101820',
        sidebar: '#141F29',
        card: '#1B2935',
        surface: '#22323F',
        border: '#30404C',
        accent: {
          DEFAULT: '#75D9C3',
          hover: '#5ec4ad',
          muted: 'rgba(117, 217, 195, 0.15)',
        },
        primaryText: '#F1F5F9',
        mutedText: '#A0AFBD',
        state: {
          success: '#45C49A',
          warning: '#E9B85D',
          error: '#F17C7C',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
