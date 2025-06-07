import { memo } from "react";
import { Handle, Position } from "@xyflow/react";

function RouteNode({ data, isConnectable = true, selected }) {
  const method = data?.method?.toUpperCase?.() || "";
  const path = data?.fullPath || data?.path || data?.label || "/";
  const displayLabel = method ? `${method} ${path}` : path;

  return (
    <div
      className={`
        relative px-4 py-3 rounded-xl border-2 shadow-md text-center
        bg-white dark:bg-gray-900
        border-blue-600 dark:border-blue-400
        text-black dark:text-white
        ${selected ? "ring-2 ring-blue-600/80 dark:ring-blue-400/60" : ""}
        min-w-[160px] max-w-[320px]
      `}
    >
      {/* Giriş Noktası */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 bg-blue-600 dark:bg-blue-400 border border-white rounded-full"
        isConnectable={isConnectable}
      />

      {/* Başlık */}
      <div className="font-semibold text-sm text-blue-700 dark:text-blue-300">
        🔹 Route
      </div>

      {/* Path + Method */}
      <div className="text-xs mt-1 opacity-80 break-words whitespace-pre-wrap">
        {displayLabel}
      </div>

      {/* Çıkış Noktası */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 bg-blue-600 dark:bg-blue-400 border border-white rounded-full"
        isConnectable={isConnectable}
      />
    </div>
  );
}

export default memo(RouteNode);
