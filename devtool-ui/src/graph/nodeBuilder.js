import { getNodeStyle } from "./utils.js";

export function createAddNodeFn(nodes, addedNodes) {
  return (id, label, type, x, y) => {
    if (addedNodes.has(id)) return;
    nodes.push({
      id,
      type: "default",
      position: { x, y },
      data: { label },
      style: getNodeStyle(type, label),
    });
    addedNodes.add(id);
  };
}
