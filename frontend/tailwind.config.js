/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ncpd: {
          primary: '#008C51',  // Kenya flag green
          secondary: '#006638', // Darker green
          accent: '#00A865',    // Lighter green
          success: '#008C51',  // Same as primary
          warning: '#FFB84D',  // Warm orange
          danger: '#922529',   // Kenya flag red
          dark: '#000000',      // Kenya flag black
          light: '#FFFFFF',     // Kenya flag white
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
