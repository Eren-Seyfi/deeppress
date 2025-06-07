/** @type {import('tailwindcss').Config} */
module.exports = {

  darkMode: "class", // 🌙 Karanlık tema desteği ("media" yerine "class")
  theme: {
    extend: {
      colors: {
        // 🎨 Özel arka plan renkleri
        background: {
          light: "#ffffff", // açık tema arka plan
          dark: "#000000", // koyu tema arka plan
        },
        sidebar: {
          light: "#f9f9f9",
          dark: "#111111",
        },
        panel: {
          light: "#f4f4f4",
          dark: "#1e1e1e",
        },
        border: {
          light: "#dddddd",
          dark: "#444444",
        },
        text: {
          light: "#111111",
          dark: "#eeeeee",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"], // 🔤 Modern font (isteğe bağlı)
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"), // opsiyonel ama faydalı (input/button için)
    require("tailwind-scrollbar"),
  ],
};
