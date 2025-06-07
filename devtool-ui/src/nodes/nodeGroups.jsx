// node/nodeGroups.jsx
import {
  CubeIcon,
  BeakerIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/solid";

import core from "./core/index";
import structure from "./structure/index";
import test from "./test/index.jsx";

export const nodeGroups = [
  {
    title: "Temel Bileşenler",
    icon: <CubeIcon className="w-4 h-4 mr-2" />,
    nodes: { ...core },
  },
  {
    title: "Yapısal Bileşenler",
    icon: <WrenchScrewdriverIcon className="w-4 h-4 mr-2" />,
    nodes: { ...structure },
  },
  {
    title: "Test Bileşenleri",
    icon: <BeakerIcon className="w-4 h-4 mr-2" />,
    nodes: { ...test },
  },
];
