import { useState } from "react";
import {
  ChevronDownIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/solid";
import { nodeGroups } from "../nodes/nodeGroups";

export default function Sidebar() {
  const [search, setSearch] = useState("");
  const [openSections, setOpenSections] = useState(
    nodeGroups.map((_, index) => index) // Başlangıçta tüm gruplar açık
  );

  const toggleSection = (index) => {
    setOpenSections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <aside className="w-64 h-screen overflow-y-auto bg-gray-100 dark:bg-gray-800 border-r border-gray-300 dark:border-gray-700 p-4 text-sm text-gray-900 dark:text-gray-100 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent dark:scrollbar-thumb-gray-600">
      {/* Başlık */}
      <h4 className="font-semibold mb-4 text-base">🎛️ Node Ekle</h4>

      {/* Arama Kutusu */}
      <div className="mb-4 relative">
        <input
          type="text"
          placeholder="Ara bileşen..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 pl-9 rounded-md bg-white dark:bg-gray-700 text-sm text-black dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none"
        />
        <MagnifyingGlassIcon className="w-4 h-4 absolute left-2.5 top-2.5 text-gray-500 dark:text-gray-300" />
      </div>

      {/* Grup Listeleme */}
      <div className="flex flex-col gap-4">
        {nodeGroups.map((group, index) => {
          const isOpen = openSections.includes(index);

          // Arama filtresi
          const filteredNodes = Object.entries(group.nodes).filter(
            ([_, meta]) =>
              meta.label.toLowerCase().includes(search.toLowerCase())
          );

          if (!filteredNodes.length) return null;

          return (
            <div key={index}>
              {/* Grup başlığı */}
              <button
                onClick={() => toggleSection(index)}
                className="flex items-center justify-between w-full px-1 py-1 mb-1 font-medium text-left text-gray-700 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
              >
                <span className="flex items-center gap-2">
                  {group.icon}
                  {group.title}
                </span>
                <ChevronDownIcon
                  className={`w-4 h-4 transform transition-transform ${
                    isOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {/* Grup içindeki node'lar */}
              {isOpen && (
                <div className="flex flex-col gap-2">
                  {filteredNodes.map(([type, meta]) => (
                    <div
                      key={type}
                      title={meta.description}
                      className="px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 cursor-move select-none transition"
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("application/reactflow", type);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                    >
                      {meta.label}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}
