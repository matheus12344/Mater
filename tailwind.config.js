module.exports = {
  content: [
    "./App.tsx",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#2A2AC9',
        secondary: '#5757F7',
      },
    },
  },
  plugins: [
    require("tailwindcss-react-native/plugin"),
  ],
};
