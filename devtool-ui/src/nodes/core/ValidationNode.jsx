import { memo } from "react";
import { Handle, Position } from "@xyflow/react";

function ValidationNode({ data, isConnectable = true, selected }) {
  const label = data?.name || data?.label || "validations";
  return (
    <div
      className={`
        relative px-4 py-3 rounded-xl border-2 shadow-md text-center
        bg-white dark:bg-gray-900
        border-green-600 dark:border-green-400
        text-black dark:text-white
        ${selected ? "ring-2 ring-green-600/80 dark:ring-green-400/60" : ""}
        min-w-[160px] max-w-[320px]
      `}
    >
      {/* Giriş Noktası */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 bg-green-600 dark:bg-green-400 border border-white rounded-full"
        isConnectable={isConnectable}
      />

      {/* Başlık */}
      <div className="font-semibold text-sm text-green-700 dark:text-green-300">
        ✅ Validation
      </div>

      {/* Etiket */}
      <div className="text-xs mt-1 opacity-80 break-words whitespace-pre-wrap">
        {label || "Tanımsız"}
      </div>

      {/* Çıkış Noktası */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 bg-green-600 dark:bg-green-400 border border-white rounded-full"
        isConnectable={isConnectable}
      />
    </div>
  );
}

export default memo(ValidationNode);
