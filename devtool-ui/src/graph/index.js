import { walkGroups, addRemaining } from "./walker.js";
import { createAddNodeFn } from "./nodeBuilder.js";
import { getYFactory } from "./utils.js";

export function generateGraphFromRegistry(registry, theme = "light") {
  // ✅ Güvenlik kontrolü
  if (!registry || !registry.groups) {
    return { nodes: [], edges: [] };
  }

  const nodes = [];
  const edges = [];
  const addedNodes = new Set();

  // ⬇️ Yeni yapı: addNode artık parentId destekliyor
  const addNode = createAddNodeFn(nodes, addedNodes, theme);
  const getY = getYFactory();

  // 🧠 Grup ağacı (hiyerarşik olarak) işleniyor
  walkGroups(registry, addNode, getY, nodes, edges, addedNodes);

  // 🧩 Geriye kalan bağımsız node’lar
  addRemaining(
    registry.controllers,
    "controller",
    addNode,
    getY,
    nodes,
    addedNodes
  );
  addRemaining(
    registry.middlewares,
    "middleware",
    addNode,
    getY,
    nodes,
    addedNodes
  );
  addRemaining(
    registry.validations,
    "validation",
    addNode,
    getY,
    nodes,
    addedNodes
  );

  return { nodes, edges };
}
