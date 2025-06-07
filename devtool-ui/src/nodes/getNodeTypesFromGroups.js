import { nodeGroups } from "./nodeGroups.jsx";

/**
 * ReactFlow'un nodeTypes formatı için:
 * {
 *   controller: ControllerNode,
 *   middleware: MiddlewareNode,
 *   ...
 * }
 */
export function getNodeTypesFromGroups() {
  const nodeTypes = {};

  nodeGroups.forEach((group) => {
    Object.entries(group.nodes).forEach(([type, config]) => {
      nodeTypes[type] = config.component;
    });
  });

  return nodeTypes;
}
