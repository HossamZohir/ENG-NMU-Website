/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'nmu-red': '#8B141E',
        'nmu-red2': '#C8293A',
        'nmu-red3': '#f5e6e7',
        'nmu-dark': '#1F2937',
      },
      fontFamily: {
        en: ['"Plus Jakarta Sans"', 'sans-serif'],
        ar: ['"Cairo"', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '16px',
      },
    },
  },
  plugins: [],
}
