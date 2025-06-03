// core/registry.js
import { v4 as uuidv4 } from "uuid";

const registry = {
  groups: [],
  controllers: {},
  middlewares: {},
  validations: {},
  config: {},
  autoloadedFiles: [],
  errors: [],
};

const groupStack = [];

// 📍 Yeni grup başladığında
function registerGroupStart({
  id,
  basePath,
  description = "",
  params = [],
  expectedQuery = [],
  middlewares = [],
  validations = [],
}) {
  const newGroup = {
    id: id || uuidv4(),
    basePath,
    description,
    params,
    expectedQuery,
    middlewares,
    validations,
    routes: [],
    children: [],
  };

  if (groupStack.length === 0) {
    registry.groups.push(newGroup);
  } else {
    const parent = groupStack[groupStack.length - 1];
    parent.children.push(newGroup);
  }

  groupStack.push(newGroup);
}

// ✅ Grup tamamlandığında stack'ten çıkar
function registerGroupEnd() {
  groupStack.pop();
}

// ➕ Yeni route tanımlandığında
function registerRoute({
  id = uuidv4(),
  method,
  path,
  fullPath,
  controllers = [],
  controllerIds = [],
  middlewares = [],
  validations = [],
}) {
  const current = groupStack[groupStack.length - 1];
  if (current) {
    current.routes.push({
      id,
      method,
      path,
      fullPath,
      controllers,
      controllerIds,
      middlewares,
      validations,
    });

    controllers.forEach((ctrl) => registerControllerUsage(ctrl, fullPath));
    middlewares.forEach((mw) => registerMiddlewareUsage(mw, fullPath));
    validations.forEach((val) => registerValidationUsage(val, fullPath));
  }
}

// 🎮 Controller tanımı
function registerController(name, middlewareNames = [], meta = {}) {
  if (!registry.controllers[name]) {
    registry.controllers[name] = {
      id: uuidv4(),
      middlewares: middlewareNames || [],
      routesUsedIn: [],
      description: meta.description || "",
      expectedParams: meta.expectedParams || [],
      expectedQuery: meta.expectedQuery || [],
    };
  }
}

// 📌 Controller bir route’ta kullanıldığında
function registerControllerUsage(name, fullPath) {
  if (!registry.controllers[name]) return;
  if (!registry.controllers[name].routesUsedIn.includes(fullPath)) {
    registry.controllers[name].routesUsedIn.push(fullPath);
  }
}

// 🧱 Middleware tanımı
function registerMiddleware(name, isGlobal = false, meta = {}) {
  if (!registry.middlewares[name]) {
    registry.middlewares[name] = {
      id: uuidv4(),
      usedIn: [],
      isGlobal,
      expectedQuery: meta.expectedQuery || [],
      expectedParams: meta.expectedParams || [],
      description: meta.description || "",
    };
  }
}

// 🧩 Middleware kullanımı
function registerMiddlewareUsage(name, fullPath) {
  if (!registry.middlewares[name]) return;
  if (!registry.middlewares[name].usedIn.includes(fullPath)) {
    registry.middlewares[name].usedIn.push(fullPath);
  }
}

// ✅ Validation tanımı
function registerValidation(name, isGlobal = false, meta = {}) {
  if (!registry.validations[name]) {
    registry.validations[name] = {
      id: uuidv4(),
      usedIn: [],
      isGlobal,
      expectedQuery: meta.expectedQuery || [],
      expectedParams: meta.expectedParams || [],
      description: meta.description || "",
    };
  }
}

// ✅ Validation kullanımı
function registerValidationUsage(name, fullPath) {
  if (!registry.validations[name]) return;
  if (!registry.validations[name].usedIn.includes(fullPath)) {
    registry.validations[name].usedIn.push(fullPath);
  }
}

// 📁 Autoload edilen dosya kaydı
function registerAutoloadedFile(fileMeta) {
  registry.autoloadedFiles.push({
    ...fileMeta,
    id: uuidv4(),
  });
}

// ⚙ Yapılandırma kaydı
function registerConfig(configObj) {
  registry.config = { ...configObj };
}

// ❌ Hata kaydı
function registerError(errorObj) {
  registry.errors.push({
    ...errorObj,
    id: uuidv4(),
    timestamp: new Date().toISOString(),
  });
}

// 🧠 Kayıtları döndür
function getRegistry() {
  return registry;
}

export {
  registerGroupStart,
  registerGroupEnd,
  registerRoute,
  registerController,
  registerControllerUsage,
  registerMiddleware,
  registerMiddlewareUsage,
  registerValidation,
  registerValidationUsage,
  registerAutoloadedFile,
  registerConfig,
  registerError,
  getRegistry,
};
