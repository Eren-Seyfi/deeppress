import { memo } from "react";
import { Handle, Position } from "@xyflow/react";

function SubGroupNode({ data, isConnectable = true, selected }) {
  const label = data?.label || "Alt Grup";

  return (
    <div
      className={`min-w-[160px] max-w-[320px] px-4 py-3 rounded-xl border-2 shadow
        bg-white dark:bg-gray-950
        border-indigo-500 dark:border-indigo-400
        text-black dark:text-white
        ${selected ? "ring-2 ring-indigo-500/80 dark:ring-indigo-400/60" : ""}
      `}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 border border-white rounded-full"
        isConnectable={isConnectable}
      />
      <div className="font-semibold text-indigo-600 dark:text-indigo-300 text-sm">
        📂 Alt Grup
      </div>
      <div className="text-xs mt-1 opacity-80 break-words whitespace-pre-wrap">
        {label}
      </div>
      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 bg-indigo-500 dark:bg-indigo-400 border border-white rounded-full"
        isConnectable={isConnectable}
      />
    </div>
  );
}

export default memo(SubGroupNode);
