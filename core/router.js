import express from "express";
import {
  registerGroupStart,
  registerGroupEnd,
  registerRoute,
  registerControllerUsage,
  registerMiddlewareUsage,
} from "./registry.js";

const expressRouter = express.Router();
const routeGroups = [];
const pathStack = [];

function normalizePath(path) {
  return path.replace(/\/+/g, "/").replace(/\/$/, "") || "/";
}

function extractParamsFromPath(path) {
  const paramRegex = /:([a-zA-Z0-9_]+)/g;
  const params = {};
  let match;
  while ((match = paramRegex.exec(path))) {
    params[match[1]] = `:${match[1]}`;
  }
  return params;
}

function group(basePath, options, callback) {
  if (typeof basePath !== "string")
    throw new Error("group() ilk argüman string olmalı");

  if (typeof options !== "object" || typeof callback !== "function")
    throw new Error(
      "group() çağrısı: (path, options, callback) şeklinde olmalıdır"
    );

  const {
    description = "",
    expectedParams = [],
    expectedQuery = [],
    middlewares: rawMiddlewares = [],
    validations: rawValidations = [],
  } = options;

  const middlewares = Array.isArray(rawMiddlewares)
    ? rawMiddlewares
    : rawMiddlewares
    ? [rawMiddlewares]
    : [];

  const validations = Array.isArray(rawValidations)
    ? rawValidations
    : rawValidations
    ? [rawValidations]
    : [];

  pathStack.push(basePath);
  const fullBasePath = normalizePath(pathStack.join(""));
  const simulatedParams = extractParamsFromPath(fullBasePath);
  const simulatedQuery = Object.fromEntries(
    expectedQuery.map((q) => [q, `:${q}`])
  );

  const allHandlers = [...validations, ...middlewares];

  if (allHandlers.length > 0) {
    expressRouter.use(fullBasePath, ...allHandlers);
    allHandlers.forEach((fn) => {
      const name = fn.middlewareName || fn.validationName || "anonymous";
      registerMiddlewareUsage(name, fullBasePath);
    });
  }

  registerGroupStart({
    basePath: fullBasePath,
    description,
    params:
      expectedParams.length > 0 ? expectedParams : Object.keys(simulatedParams),
    expectedQuery,
    middlewares: middlewares.map((m) => m.middlewareName || "anonymous"),
    validations: validations.map((v) => v.validationName || "anonymous"),
  });

  const localRoutes = [];

  const defineRoute = (method) => {
    return (path, ...handlers) => {
      const fullPath = normalizePath(fullBasePath + path);
      expressRouter[method.toLowerCase()](fullPath, ...handlers);

      const controllerNames = [];
      const middlewareNames = [];

      handlers.forEach((fn) => {
        if (fn.controllerName) {
          controllerNames.push(fn.controllerName);
          registerControllerUsage(fn.controllerName, fullPath);
        } else if (fn.middlewareName || fn.validationName) {
          const name = fn.middlewareName || fn.validationName;
          middlewareNames.push(name);
          registerMiddlewareUsage(name, fullPath);
        } else {
          controllerNames.push("anonymous");
          middlewareNames.push("anonymous");
        }
      });

      localRoutes.push({ method: method.toUpperCase(), path: fullPath });

      registerRoute({
        method: method.toUpperCase(),
        path,
        fullPath,
        controllers: controllerNames,
        middlewares: middlewareNames,
      });
    };
  };

  const r = {
    use: (...handlers) => {
      expressRouter.use(fullBasePath, ...handlers);
      handlers.forEach((fn) => {
        const name = fn.middlewareName || fn.validationName || "anonymous";
        registerMiddlewareUsage(name, fullBasePath);
      });
    },
    get: defineRoute("GET"),
    post: defineRoute("POST"),
    put: defineRoute("PUT"),
    delete: defineRoute("DELETE"),
    patch: defineRoute("PATCH"),
    all: defineRoute("ALL"),
    group, // recursive
  };

  callback(r, simulatedParams, simulatedQuery);

  routeGroups.push({
    basePath: fullBasePath,
    routes: localRoutes,
  });

  pathStack.pop();
  registerGroupEnd();
}

function getAll() {
  return [...routeGroups];
}

function getRouter() {
  return expressRouter;
}

export { group, getAll, getRouter };
