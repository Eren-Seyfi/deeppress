import { walkGroups, addRemaining } from "./walker.js";
import { createAddNodeFn } from "./nodeBuilder.js";
import { getYFactory } from "./utils.js";

export function generateGraphFromRegistry(registry) {
  const nodes = [];
  const edges = [];
  const addedNodes = new Set();

  const addNode = createAddNodeFn(nodes, addedNodes);
  const getY = getYFactory();

  walkGroups(registry, addNode, getY, nodes, edges, addedNodes);
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
