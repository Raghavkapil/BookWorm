/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#111215',
          800: '#18191c',
          700: '#222327',
          600: '#2b2c31',
          500: '#3a3b42',
        },
        accent: {
          blue: '#2563eb',
          hover: '#1d4ed8'
        }
      }
    },
  },
  plugins: [],
}
