// src/graph/nodeBuilder.js

export function createAddNodeFn(nodes, addedNodes, theme) {
  return (id, data, type, x, y, parentId = null) => {
    if (addedNodes.has(id)) return;

    const node = {
      id,
      type,
      position: { x, y },
      data,
    };

    // Eğer bu node bir alt node ise, parent bilgilerini ekle
    if (parentId) {
      node.parentId = parentId;
      node.extent = "parent"; // 👈 Alt node'lar ebeveynin sınırlarını aşamaz
    }

    nodes.push(node);
    addedNodes.add(id);
  };
}
