import { createEdge } from "./edgeBuilder.js";
import { X } from "./config.js";

// Etiket çeviri (Türkçe)
const labelMap = {
  calls: "çağırır",
  uses: "kullanır",
  validates: "doğrulama",
  contains: "içerir",
  "child group": "alt grup",
};

/**
 * Grupları ve içeriğini dolaşarak düğüm (node) ve kenar (edge) oluşturur.
 */
export function walkGroups(registry, addNode, getY, nodes, edges, addedNodes) {
  const walk = (groups = [], parentGroupId = null) => {
    for (const group of groups) {
      const groupId = `group:${group.basePath}`;
      const y = getY("group");

      // 🔀 Alt grupsa özel node tipi belirle
      const type = parentGroupId ? "subgroup" : "group";

      addNode(groupId, { basePath: group.basePath }, type, X.group, y);

      // ⛓ Alt grup bağı
      if (parentGroupId) {
        edges.push(
          createEdge(parentGroupId, groupId, labelMap["child group"], "group")
        );
      }

      // 🔧 Grup düzeyi middleware
      for (const mw of group.middlewares ?? []) {
        const id = `middleware:${mw}`;
        const y = getY("middleware");
        addNode(id, { name: mw }, "middleware", X.middleware, y);
        edges.push(createEdge(groupId, id, labelMap["uses"], "middleware"));
      }

      // ✅ Grup düzeyi validation
      for (const val of group.validations ?? []) {
        const id = `validation:${val}`;
        const y = getY("validation");
        addNode(id, { name: val }, "validation", X.validation, y);
        edges.push(
          createEdge(groupId, id, labelMap["validates"], "validation")
        );
      }

      // 🛣 Route işlemleri
      for (const route of group.routes ?? []) {
        const routeId = `route:${route.fullPath}`;
        const y = getY("route");

        addNode(
          routeId,
          { method: route.method, fullPath: route.fullPath },
          "route",
          X.route,
          y
        );

        edges.push(createEdge(groupId, routeId, labelMap["contains"], "route"));

        // 🧠 Controller bağlantısı
        for (const ctrl of route.controllers ?? []) {
          const name = typeof ctrl === "string" ? ctrl : ctrl.name;
          const id = `controller:${name}`;
          const y = getY("controller");
          const data = typeof ctrl === "object" ? ctrl : { name };

          addNode(id, data, "controller", X.controller, y);
          edges.push(createEdge(routeId, id, labelMap["calls"], "controller"));
        }

        // 🧱 Route middleware
        for (const mw of route.middlewares ?? []) {
          const id = `middleware:${mw}`;
          const y = getY("middleware");
          addNode(id, { name: mw }, "middleware", X.middleware, y);
          edges.push(createEdge(routeId, id, labelMap["uses"], "middleware"));
        }

        // ✅ Route validation
        for (const val of route.validations ?? []) {
          const id = `validation:${val}`;
          const y = getY("validation");
          addNode(id, { name: val }, "validation", X.validation, y);
          edges.push(
            createEdge(routeId, id, labelMap["validates"], "validation")
          );
        }
      }

      // 🔁 Alt gruplar varsa recursive
      if (Array.isArray(group.children) && group.children.length > 0) {
        walk(group.children, groupId);
      }
    }
  };

  walk(registry.groups);
}

/**
 * Geriye kalan bağımsız (group'a bağlı olmayan) middleware/controller/validation düğümlerini ekler.
 */
export function addRemaining(items, type, addNode, getY, nodes, addedNodes) {
  for (const key of Object.keys(items)) {
    const id = `${type}:${key}`;
    if (!addedNodes.has(id)) {
      const y = getY(type);
      const data = typeof items[key] === "object" ? items[key] : { name: key };
      addNode(id, data, type, X[type], y);
    }
  }
}
