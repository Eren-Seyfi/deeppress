import {
  ReactFlow,
  useNodesState,
  useEdgesState,
  addEdge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import { useCallback, useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import { useDevtool } from "../hooks/useDevtool";
import { generateGraphFromRegistry } from "../graph";
import { useTheme } from "../context/ThemeContext";
import { getNodeStyle } from "../graph/utils";
import { getNodeTypesFromGroups } from "../nodes/getNodeTypesFromGroups";

let id = 1000;
const getId = () => `custom-node-${id++}`;

export default function GraphView() {
  const { theme } = useTheme();
  const { registry, isReady } = useDevtool();
  const nodeTypes = getNodeTypesFromGroups();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // Veritabanından verileri yükle
  useEffect(() => {
    if (!registry || !registry.groups) return;
    const { nodes: newNodes, edges: newEdges } = generateGraphFromRegistry(
      registry,
      theme
    );
    setNodes(newNodes);
    setEdges(newEdges);
  }, [registry]);

  // Tema değiştiğinde tüm stilleri güncelle
  useEffect(() => {
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        style: getNodeStyle(node.type, node.data.label, theme),
      }))
    );
  }, [theme]);

  // Bağlantı kurulduğunda edge ekle + seçimi güncelle
  const onConnect = useCallback(
    (params) => {
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: false,
            style: {
              stroke: "#f97316",
              strokeWidth: 2.5,
              strokeDasharray: "0",
            },
          },
          eds
        )
      );
      setSelectedNodeId(params.source); // bağlantı sonrası güncelle
    },
    [setEdges]
  );

  // Dışarıdan bırakılan node'ları ekle
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const type = event.dataTransfer.getData("application/reactflow");
      if (!type || !nodeTypes[type]) return;

      const bounds = event.target.getBoundingClientRect();
      const position = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      };

      const label = prompt(`Yeni ${type} için isim girin:`) || "Yeni";
      const newNode = {
        id: getId(),
        type,
        position,
        data: { label },
        style: getNodeStyle(type, label, theme),
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [theme, setNodes, nodeTypes]
  );

  // Bir node'a tıklandığında sadece ID'yi ayarla
  const onNodeClick = useCallback((_, clickedNode) => {
    setSelectedNodeId(clickedNode.id);
  }, []);

  // Tıklanan node’a bağlı tüm node ve edge’leri vurgula
  useEffect(() => {
    if (!selectedNodeId) return;

    const connectedNodeIds = new Set([selectedNodeId]);

    const updatedEdges = edges.map((edge) => {
      const isConnected =
        edge.source === selectedNodeId || edge.target === selectedNodeId;

      if (isConnected) {
        connectedNodeIds.add(edge.source);
        connectedNodeIds.add(edge.target);
      }

      return {
        ...edge,
        style: {
          stroke: isConnected ? "#f97316" : "#bbb",
          strokeWidth: isConnected ? 2.5 : 1.2,
        },
      };
    });

    const updatedNodes = nodes.map((node) => {
      const isSelected = node.id === selectedNodeId;
      const isConnected = connectedNodeIds.has(node.id);

      return {
        ...node,
        style: {
          ...node.style,
          border: isSelected
            ? "3px solid #f97316"
            : isConnected
            ? "2px dashed #f97316"
            : "1px solid #ccc",
          backgroundColor: "transparent",
        },
      };
    });

    setEdges(updatedEdges);
    setNodes(updatedNodes);
  }, [selectedNodeId]);

  // Arka plana tıklanırsa seçim temizlenir
  const clearSelection = useCallback(() => {
    setSelectedNodeId(null);
    setNodes((prev) =>
      prev.map((node) => ({
        ...node,
        style: {
          ...node.style,
          border: "1px solid #ccc",
          backgroundColor: "#ffffff",
        },
      }))
    );
    setEdges((prev) =>
      prev.map((edge) => ({
        ...edge,
        style: {
          stroke: "#bbb",
          strokeWidth: 1.2,
        },
      }))
    );
  }, []);

  if (!isReady || !registry)
    return <div className="p-6 text-center">⏳ Yükleniyor...</div>;

  return (
    <div className="flex w-full h-screen bg-white dark:bg-gray-900 text-black dark:text-white">
      <Sidebar />
      <div className="flex flex-col flex-grow">
        <Navbar />
        <div className="flex-grow" onDrop={onDrop} onDragOver={onDragOver}>
          <ReactFlow
            colorMode={theme}
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            onNodeClick={onNodeClick}
            onPaneClick={clearSelection}
            onConnect={onConnect}
            fitView
            style={{ backgroundColor: "transparent" }}
          />
        </div>
      </div>
    </div>
  );
}
