// core/registry.js

const registry = {
  groups: [], // Route grupları (iç içe destekli)
  controllers: {}, // Controller bilgileri ve kullanım yerleri
  middlewares: {}, // Middleware bilgileri ve kullanım yerleri
  validations: {}, // ✅ Validation bilgileri ve kullanım yerleri
  config: {}, // Uygulama yapılandırması
  autoloadedFiles: [], // Yüklenen dosya listesi
  errors: [], // Yakalanan hatalar
};

const groupStack = [];

// 📍 Yeni grup başladığında
function registerGroupStart({
  basePath,
  params = [],
  middlewares = [],
  validations = [],
}) {
  const newGroup = {
    basePath,
    params,
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
  method,
  path,
  fullPath,
  controllers = [],
  middlewares = [],
  validations = [],
}) {
  const current = groupStack[groupStack.length - 1];
  if (current) {
    current.routes.push({
      method,
      path,
      fullPath,
      controllers,
      middlewares,
      validations,
    });

    controllers.forEach((ctrl) => registerControllerUsage(ctrl, fullPath));
    middlewares.forEach((mw) => registerMiddlewareUsage(mw, fullPath));
    validations.forEach((val) => registerValidationUsage(val, fullPath));
  }
}

// 🎮 Controller tanımı
function registerController(name, middlewares = []) {
  registry.controllers[name] = registry.controllers[name] || {
    middlewares,
    routesUsedIn: [],
  };
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
  registry.middlewares[name] = registry.middlewares[name] || {
    usedIn: [],
    isGlobal,
    expectedQuery: meta.expectedQuery || [],
    expectedParams: meta.expectedParams || [],
    description: meta.description || "",
  };
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
  registry.validations[name] = registry.validations[name] || {
    usedIn: [],
    isGlobal,
    expectedQuery: meta.expectedQuery || [],
    expectedParams: meta.expectedParams || [],
    description: meta.description || "",
  };
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
  registry.autoloadedFiles.push(fileMeta);
}

// ⚙ Yapılandırma kaydı
function registerConfig(configObj) {
  registry.config = { ...configObj };
}

// ❌ Hata kaydı
function registerError(errorObj) {
  registry.errors.push(errorObj);
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
