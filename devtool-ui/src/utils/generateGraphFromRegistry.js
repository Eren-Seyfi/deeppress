export function generateGraphFromRegistry(registry) {
  const nodes = [];
  const edges = [];
  const addedNodes = new Set();

  const colorMap = {
    group: "#6c757d",
    route: "#007bff",
    controller: "#d63384",
    middleware: "#fd7e14",
    validation: "#198754",
  };

  const edgeColorMap = {
    contains: "#007bff",
    uses: "#fd7e14",
    validates: "#198754",
    calls: "#d63384",
    "child group": "#6c757d",
  };

  const getNodeStyle = (type) => ({
    border: `2px solid ${colorMap[type]}`,
    padding: 10,
    borderRadius: 6,
    fontWeight: "bold",
    backgroundColor: "#ffffff",
  });

  const addNode = (id, label, type, x, y) => {
    if (addedNodes.has(id)) return;
    nodes.push({
      id,
      type: "default",
      position: { x, y },
      data: { label },
      style: getNodeStyle(type),
    });
    addedNodes.add(id);
  };

  const addEdge = (source, target, label) => {
    edges.push({
      id: `${source}->${target}`,
      source,
      target,
      label,
      style: { stroke: edgeColorMap[label] || "#000000" },
    });
  };

  let y = 0;
  const X = {
    group: 0,
    route: 300,
    controller: 600,
    middleware: 900,
    validation: 1200,
  };

  const walkGroups = (groups, parentGroupId = null) => {
    groups.forEach((group) => {
      const groupId = `group:${group.basePath}`;
      addNode(groupId, `📁 Group: ${group.basePath}`, "group", X.group, y);

      if (parentGroupId) {
        addEdge(parentGroupId, groupId, "child group");
      }

      // Middleware
      group.middlewares.forEach((mw) => {
        const mwId = `middleware:${mw}`;
        addNode(mwId, `🧱 Middleware: ${mw}`, "middleware", X.middleware, y);
        addEdge(groupId, mwId, "uses");
      });

      // Validation
      group.validations.forEach((val) => {
        const valId = `validation:${val}`;
        addNode(valId, `✅ Validation: ${val}`, "validation", X.validation, y);
        addEdge(groupId, valId, "validates");
      });

      // Route'lar
      group.routes.forEach((route) => {
        const routeId = `route:${route.fullPath}`;
        addNode(
          routeId,
          `🔹 ${route.method} ${route.fullPath}`,
          "route",
          X.route,
          y
        );
        addEdge(groupId, routeId, "contains");

        // Controller
        route.controllers.forEach((ctrl) => {
          const ctrlName = typeof ctrl === "string" ? ctrl : ctrl.name;
          const ctrlId = `controller:${ctrlName}`;
          addNode(
            ctrlId,
            `🧠 Controller: ${ctrlName}`,
            "controller",
            X.controller,
            y
          );
          addEdge(routeId, ctrlId, "calls");
        });

        // Middleware
        route.middlewares.forEach((mw) => {
          const mwId = `middleware:${mw}`;
          addNode(mwId, `🧱 Middleware: ${mw}`, "middleware", X.middleware, y);
          addEdge(routeId, mwId, "uses");
        });

        // Validation
        route.validations.forEach((val) => {
          const valId = `validation:${val}`;
          addNode(
            valId,
            `✅ Validation: ${val}`,
            "validation",
            X.validation,
            y
          );
          addEdge(routeId, valId, "validates");
        });

        y += 150;
      });

      // Alt grupları işle
      if (group.children?.length) {
        walkGroups(group.children, groupId);
      }
    });
  };

  walkGroups(registry.groups);

  // Eksik kalan bileşenleri ekle
  const addRemaining = (items, type) => {
    Object.keys(items).forEach((key) => {
      const id = `${type}:${key}`;
      if (!addedNodes.has(id)) {
        const emoji =
          type === "controller" ? "🧠" : type === "middleware" ? "🧱" : "✅";
        addNode(id, `${emoji} ${type}: ${key}`, type, X[type], y);
        y += 150;
      }
    });
  };

  addRemaining(registry.controllers, "controller");
  addRemaining(registry.middlewares, "middleware");
  addRemaining(registry.validations, "validation");

  return { nodes, edges };
}
