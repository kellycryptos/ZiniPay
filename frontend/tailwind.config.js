/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'near-purple': '#9747FF',
        'near-green': '#00EC97',
      },
    },
  },
  plugins: [],
};
