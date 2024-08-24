/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "rgb(var(--accent) / <alpha-value>)",
        error: "rgb(var(--error) / <alpha-value>)",
        background: "rgb(var(--bg-color) / <alpha-value>)",
        foreground: "rgb(var(--fg-color) / <alpha-value>)",
        blackStroke: "rgb(var(--black-stroke) / <alpha-value>)",
        whiteStroke: "rgb(var(--white-stroke) / <alpha-value>)",
      },
    },
  },
  darkMode: "selector",
  plugins: [],
};
