import { colorMap } from "./config.js";

export function createEdge(source, target, label, type) {
  return {
    id: `${source}->${target}`,
    source,
    target,
    label,
    style: { stroke: colorMap[type] || "#999" },
  };
}
