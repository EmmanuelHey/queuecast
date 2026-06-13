/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: "#0B0714",
        panel: "#171022",
        "panel-soft": "#20172F",
        primary: "#8B5CF6",
        "primary-soft": "#A78BFA",
        glow: "#C084FC",
      },
    },
  },
  plugins: [],
};
