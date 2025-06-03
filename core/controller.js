// core/controller.js
import { registerController, registerControllerUsage } from "./registry.js";

const controllers = {};

function create(name, ...handlers) {
  if (!name || typeof name !== "string") {
    throw new Error("Controller name must be a valid string.");
  }

  const flatHandlers = handlers.flat();
  const validHandlers = flatHandlers.filter((h) => typeof h === "function");

  if (validHandlers.length !== flatHandlers.length) {
    const invalids = flatHandlers.filter((h) => typeof h !== "function");
    throw new Error(
      `Controller "${name}" includes non-function handlers: ${invalids
        .map((x) => typeof x)
        .join(", ")}`
    );
  }

  if (validHandlers.length === 0) {
    throw new Error(`Controller "${name}" must contain at least one function.`);
  }

  if (controllers[name]) {
    console.warn(`⚠ Controller "${name}" already exists. Overwriting...`);
  }

  validHandlers.forEach((fn) => {
    fn.controllerName = name;
    fn.expectedQuery = fn.expectedQuery || [];
    fn.expectedParams = fn.expectedParams || [];
    fn.description = fn.description || "";
  });

  controllers[name] = validHandlers;

  const middlewareNames = validHandlers
    .map((fn) => fn.middlewareName || fn.validationName)
    .filter(Boolean);

  registerController(name, middlewareNames, {
    expectedQuery: validHandlers.flatMap((fn) => fn.expectedQuery || []),
    expectedParams: validHandlers.flatMap((fn) => fn.expectedParams || []),
    description: validHandlers.find((fn) => fn.description)?.description || "",
  });
}

function use(name) {
  const stack = controllers[name];

  if (!stack) {
    const available = Object.keys(controllers).join(", ") || "Yok";
    throw new Error(
      `Controller "${name}" bulunamadı.\nMevcut controller'lar: ${available}`
    );
  }

  registerControllerUsage(name, "<used dynamically>");

  return stack.map((originalFn) => {
    function wrappedFn(req, res, next) {
      try {
        if (originalFn.length === 1) {
          return Promise.resolve(originalFn({ req, res, next })).catch(next);
        }
        return Promise.resolve(originalFn(req, res, next)).catch(next);
      } catch (err) {
        next(err);
      }
    }

    wrappedFn.controllerName = originalFn.controllerName || name;
    wrappedFn.expectedQuery = originalFn.expectedQuery || [];
    wrappedFn.expectedParams = originalFn.expectedParams || [];
    wrappedFn.description = originalFn.description || "";

    return wrappedFn;
  });
}

function getAll() {
  return { ...controllers };
}

export { create, use, getAll };

// ✅ router.js (ilgili bölüm)
const defineRoute = (method) => {
  return (path, ...handlers) => {
    const fullPath = normalizePath(fullBasePath + path);
    expressRouter[method.toLowerCase()](fullPath, ...handlers);

    const controllerNames = [];
    const controllerIds = [];
    const middlewareNames = [];

    const allControllers = getControllers();

    handlers.forEach((fn) => {
      const name = getName(fn);

      const matchedEntry = Object.entries(allControllers).find(([key, arr]) =>
        arr.includes(fn)
      );

      if (matchedEntry) {
        const [ctrlName, fnList] = matchedEntry;
        controllerNames.push(ctrlName);
        controllerIds.push(fnList[0].controllerId || null);
        registerControllerUsage(ctrlName, fullPath);
      } else if (fn.middlewareName || fn.validationName) {
        middlewareNames.push(name);
        registerMiddlewareUsage(name, fullPath);
      } else {
        controllerNames.push(name);
      }
    });

    const routeId = uuidv4();

    localRoutes.push({
      id: routeId,
      method: method.toUpperCase(),
      path: fullPath,
    });

    registerRoute({
      id: routeId,
      method: method.toUpperCase(),
      path,
      fullPath,
      controllers: controllerNames,
      controllerIds,
      middlewares: middlewareNames,
    });
  };
};
