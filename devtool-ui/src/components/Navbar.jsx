import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <div>
        <h3 className="text-lg font-semibold">DevTool Grafik</h3>
        <small className="text-sm opacity-80">Tema: {theme}</small>
      </div>
      <button
        onClick={toggleTheme}
        className="text-sm border px-3 py-1 rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
      >
        {theme === "dark" ? "🌞 Açık Tema" : "🌙 Karanlık Tema"}
      </button>
    </div>
  );
}
