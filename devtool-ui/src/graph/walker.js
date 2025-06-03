import { createEdge } from "./edgeBuilder.js";
import { X } from "./config.js";

export function walkGroups(registry, addNode, getY, nodes, edges, addedNodes) {
  const walk = (groups, parentGroupId = null) => {
    for (const group of groups) {
      const groupId = `group:${group.basePath}`;
      const y = getY("group");

      addNode(groupId, `📁 Group: ${group.basePath}`, "group", X.group, y);

      if (parentGroupId) {
        edges.push(createEdge(parentGroupId, groupId, "child group", "group"));
      }

      group.middlewares.forEach((mw) => {
        const id = `middleware:${mw}`;
        const y = getY("middleware");
        addNode(id, `🧱 Middleware: ${mw}`, "middleware", X.middleware, y);
        edges.push(createEdge(groupId, id, "uses", "middleware"));
      });

      group.validations.forEach((val) => {
        const id = `validation:${val}`;
        const y = getY("validation");
        addNode(id, `✅ Validation: ${val}`, "validation", X.validation, y);
        edges.push(createEdge(groupId, id, "validates", "validation"));
      });

      group.routes.forEach((route) => {
        const routeId = `route:${route.fullPath}`;
        const y = getY("route");
        addNode(
          routeId,
          `🔹 ${route.method} ${route.fullPath}`,
          "route",
          X.route,
          y
        );
        edges.push(createEdge(groupId, routeId, "contains", "route"));

        route.controllers.forEach((ctrl) => {
          const name = typeof ctrl === "string" ? ctrl : ctrl.name;
          const id = `controller:${name}`;
          const y = getY("controller");
          addNode(id, `🧠 Controller: ${name}`, "controller", X.controller, y);
          edges.push(createEdge(routeId, id, "calls", "controller"));
        });

        route.middlewares.forEach((mw) => {
          const id = `middleware:${mw}`;
          const y = getY("middleware");
          addNode(id, `🧱 Middleware: ${mw}`, "middleware", X.middleware, y);
          edges.push(createEdge(routeId, id, "uses", "middleware"));
        });

        route.validations.forEach((val) => {
          const id = `validation:${val}`;
          const y = getY("validation");
          addNode(id, `✅ Validation: ${val}`, "validation", X.validation, y);
          edges.push(createEdge(routeId, id, "validates", "validation"));
        });
      });

      if (group.children?.length) walk(group.children, groupId);
    }
  };

  walk(registry.groups);
}

export function addRemaining(items, type, addNode, getY, nodes, addedNodes) {
  const X = {
    controller: 700,
    middleware: 1050,
    validation: 1400,
  };

  for (const key of Object.keys(items)) {
    const id = `${type}:${key}`;
    if (!addedNodes.has(id)) {
      const emoji =
        type === "controller" ? "🧠" : type === "middleware" ? "🧱" : "✅";
      const y = getY(type);
      addNode(id, `${emoji} ${type}: ${key}`, type, X[type], y);
    }
  }
}
