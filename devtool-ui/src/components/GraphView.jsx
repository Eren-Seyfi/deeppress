import { ReactFlow, useNodesState, useEdgesState } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useDevtool } from "../hooks/useDevtool";
import { generateGraphFromRegistry } from "../graph";

export default function GraphView() {
  const { registry, isReady } = useDevtool();

  if (!isReady) return <div>⏳ Yükleniyor...</div>;

  const { nodes: initialNodes, edges: initialEdges } =
    generateGraphFromRegistry(registry);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div style={{ width: "100%", height: "90vh" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
      />
    </div>
  );
}
