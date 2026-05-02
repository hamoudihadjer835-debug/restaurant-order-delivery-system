/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary:   "#C8622A",
        "primary-dark": "#A04E20",
        "primary-light": "#E8855A",
        beige:     "#F5F0E8",
        "beige-dark": "#EDE6D6",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
