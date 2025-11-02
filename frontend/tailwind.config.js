/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Poppins', 'Inter', 'Roboto', 'sans-serif'],
      },
      colors: {
        primary: '#2563EB',
        'primary-dark': '#1E3A8A',
        'gray-light': '#F3F4F6',
        'gray-dark': '#111827',
      },
    },
  },
  plugins: [],
}
