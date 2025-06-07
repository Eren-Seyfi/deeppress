import { memo } from "react";
import { Handle, Position } from "@xyflow/react";

function GroupNode({ data, isConnectable = true, selected }) {
  const label = data?.basePath || data?.label || "/";
  const isChild = data?.isChild;

  return (
    <div
      className={`relative px-4 py-3 rounded-xl border-2 shadow-md text-center
        ${
          isChild
            ? "border-indigo-500 dark:border-indigo-400"
            : "border-gray-600 dark:border-gray-400"
        }
        bg-white dark:bg-gray-900
        text-black dark:text-white
        ${
          selected
            ? "ring-2 ring-offset-1 ring-blue-400 dark:ring-blue-300"
            : ""
        }
        min-w-[160px] max-w-[320px]
      `}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-2 h-2 bg-gray-500 dark:bg-gray-400 border border-white rounded-full"
        isConnectable={isConnectable}
      />

      <div
        className={`font-semibold text-sm ${
          isChild
            ? "text-indigo-600 dark:text-indigo-300"
            : "text-gray-700 dark:text-gray-200"
        }`}
      >
        📁 {isChild ? "Alt Grup" : "Grup"}
      </div>

      <div className="text-xs mt-1 opacity-80 break-words whitespace-pre-wrap">
        {label}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="w-2 h-2 bg-gray-500 dark:bg-gray-400 border border-white rounded-full"
        isConnectable={isConnectable}
      />
    </div>
  );
}

export default memo(GroupNode);
