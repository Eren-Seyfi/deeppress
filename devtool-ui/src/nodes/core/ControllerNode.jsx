import { memo } from "react";
import { Handle, Position } from "@xyflow/react";

function ControllerNode({ data, isConnectable = true, selected }) {
  const label = data?.name || data?.label || "Controller";

  return (
    <div
      className={`
        relative px-4 py-3 rounded-xl border-2 shadow-md text-center 
        bg-white dark:bg-gray-900
        border-pink-500 dark:border-pink-400
        text-black dark:text-white
        ${selected ? "ring-2 ring-pink-500/80 dark:ring-pink-400/60" : ""}
        min-w-[160px] max-w-[320px]
      `}
    >
      {/* Giriş Noktası */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        isConnectable={isConnectable}
        className="w-2 h-2 bg-pink-500 dark:bg-pink-400 border border-white rounded-full"
      />

      {/* Başlık */}
      <div className="font-semibold text-pink-600 dark:text-pink-300 text-sm">
        🧠 Controller
      </div>

      {/* İsim / Etiket */}
      <div className="text-xs mt-1 opacity-80 break-words whitespace-pre-wrap">
        {label}
      </div>

      {/* Çıkış Noktası */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        isConnectable={isConnectable}
        className="w-2 h-2 bg-pink-500 dark:bg-pink-400 border border-white rounded-full"
      />
    </div>
  );
}

export default memo(ControllerNode);
