/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7b39fc',
        accent: '#2b2344',
      },
      fontFamily: {
        manrope: ['Manrope', 'sans-serif'],
        cabin: ['Cabin', 'sans-serif'],
        serif: ['Instrument Serif', 'serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
