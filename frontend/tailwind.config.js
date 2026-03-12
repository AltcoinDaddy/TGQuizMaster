/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "primary": "#0df259",
        "background-light": "#f5f8f6",
        "background-dark": "#102216",
        "accent-gold": "#FFD700",
        "accent-purple": "#A855F7",
      },
      fontFamily: {
        "display": ["Plus Jakarta Sans", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "1rem",
        "lg": "2rem",
        "xl": "3rem",
        "full": "9999px"
      },
      backdropBlur: {
        "xs": "2px",
      }
    },
  },
  plugins: [],
}
