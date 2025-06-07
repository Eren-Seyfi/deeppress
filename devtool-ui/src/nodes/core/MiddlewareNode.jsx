import { memo } from "react";
import { Handle, Position } from "@xyflow/react";

function MiddlewareNode({ data, isConnectable = true, selected }) {
  const label = data?.label || data?.name || "Middleware";

  return (
    <div
      className={`
        relative px-4 py-3 rounded-xl border-2 shadow-md text-center
        bg-white dark:bg-gray-900
        border-orange-600 dark:border-orange-400
        text-black dark:text-white
        ${selected ? "ring-2 ring-orange-600/80 dark:ring-orange-400/60" : ""}
        min-w-[160px] max-w-[320px]
      `}
    >
      {/* Giriş Noktası */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 bg-orange-600 dark:bg-orange-400 border border-white rounded-full"
        isConnectable={isConnectable}
      />

      {/* Başlık */}
      <div className="font-semibold text-sm text-orange-700 dark:text-orange-300">
        🧱 Middleware
      </div>

      {/* Label (dinamik) */}
      <div className="text-xs mt-1 opacity-80 break-words whitespace-pre-wrap">
        {label}
      </div>

      {/* Çıkış Noktası */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 bg-orange-600 dark:bg-orange-400 border border-white rounded-full"
        isConnectable={isConnectable}
      />
    </div>
  );
}

export default memo(MiddlewareNode);
