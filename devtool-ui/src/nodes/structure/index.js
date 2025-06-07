// nodes/structure/index.js

import GroupNode from "./GroupNode";
import SubGroupNode from "./SubGroupNode";

export default {
  group: {
    label: "📁 Group",
    category: "Structure",
    description: "Grup node’u",
    component: GroupNode,
  },
  subgroup: {
    label: "📂 Alt Grup",
    category: "Structure",
    description: "Alt grup node’u",
    component: SubGroupNode,
  },
};
