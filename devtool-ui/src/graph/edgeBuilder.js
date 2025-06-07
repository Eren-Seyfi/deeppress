// src/graph/edgeBuilder.js


export function createEdge(source, target, label, type) {
  return {
    id: `${source}->${target}`,
    source,
    target,
    label,
   
  };
}
