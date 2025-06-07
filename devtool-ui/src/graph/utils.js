// src/graph/utils.js

// 🎨 Her node tipi için varsayılan renk
const colorMap = {
  controller: "#d63384",
  middleware: "#fd7e14",
  validation: "#198754",
  route: "#007bff",
  group: "#6c757d",
  subgroup: "#6f42c1",
};

/**
 * Temaya ve node tipine göre stil oluşturur.
 */
export function getNodeStyle(type, label, theme = "light") {
  const isDark = theme === "dark";
  const baseColor = colorMap[type] || "#999";

  return {
    border: `2px solid ${baseColor}`,
    color: isDark ? "#fff" : "#000",
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "transparent",
  };
}

/**
 * Belirli bir node tipi için ana renk döndürür
 */
export function getNodeBaseColor(type) {
  return colorMap[type] || "#999";
}

/**
 * Her node tipi için dikey pozisyonu sırayla artırarak verir.
 */
export function getYFactory() {
  const currentY = {
    group: 0,
    route: 0,
    controller: 0,
    middleware: 0,
    validation: 0,
  };

  return (type) => {
    const y = currentY[type] || 0;
    currentY[type] = (currentY[type] || 0) + 250;
    return y;
  };
}
