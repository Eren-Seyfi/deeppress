// nodes/core/index.js
import ControllerNode from "./ControllerNode";
import MiddlewareNode from "./MiddlewareNode";
import ValidationNode from "./ValidationNode";
import RouteNode from "./RouteNode";

export default {
  controller: {
    label: "🧠 Controller",
    category: "Logic",
    description: "İş mantığını yöneten node",
    component: ControllerNode,
  },
  middleware: {
    label: "🛡️ Middleware",
    category: "Security",
    description: "İstek kontrol middleware’i",
    component: MiddlewareNode,
  },
  validation: {
    label: "✔️ Validation",
    category: "Validation",
    description: "Doğrulama işlemi yapan node",
    component: ValidationNode,
  },
  route: {
    label: "🛣️ Route",
    category: "Routing",
    description: "API rotasını temsil eder",
    component: RouteNode,
  },
};
