import { colorMap } from "./config.js";

export function getNodeStyle(type, label) {
  const charWidth = 8;
  const minWidth = 150;
  const maxWidth = 320;
  const width = Math.min(
    Math.max(label.length * charWidth, minWidth),
    maxWidth
  );

  return {
    border: `2px solid ${colorMap[type]}`,
    padding: 10,
    borderRadius: 6,
    fontWeight: "bold",
    backgroundColor: "#ffffff",
    width,
    minHeight: 60,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    whiteSpace: "normal",
    wordBreak: "break-word",
    fontSize: 14,
  };
}

export function getYFactory() {
  const currentY = {
    group: 0,
    route: 0,
    controller: 0,
    middleware: 0,
    validation: 0,
  };

  return (type) => {
    const y = currentY[type];
    currentY[type] += 250;
    return y;
  };
}
