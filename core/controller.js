// core/controller.js

import { registerController, registerControllerUsage } from "./registry.js";

// 📦 Controller'lar burada saklanır (ad → handler dizisi)
const controllers = {};

/**
 * ✅ Yeni bir controller tanımlar
 * @param {string} name - Controller adı (eşsiz olmalı)
 * @param {...function|function[]} handlers - Middleware/controller fonksiyonları (tekli veya dizili)
 * Desteklenen metadata: controllerName, expectedQuery, expectedParams, description
 */
function create(name, ...handlers) {
  if (!name || typeof name !== "string") {
    throw new Error("Controller name must be a valid string.");
  }

  // Handler dizisini düzleştir ve doğrula
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

  // Fonksiyonlara controllerName ve metadata etiketlerini ekle
  validHandlers.forEach((fn) => {
    fn.controllerName = name;
    fn.expectedQuery = fn.expectedQuery || [];
    fn.expectedParams = fn.expectedParams || [];
    fn.description = fn.description || "";
  });

  // 📦 Controller'ı kaydet
  controllers[name] = validHandlers;

  // 🧠 Registry'ye bildir
  const middlewareNames = validHandlers
    .map((fn) => fn.middlewareName || fn.validationName)
    .filter(Boolean);

  registerController(name, middlewareNames, {
    expectedQuery: validHandlers.flatMap((fn) => fn.expectedQuery || []),
    expectedParams: validHandlers.flatMap((fn) => fn.expectedParams || []),
    description: validHandlers.find((fn) => fn.description)?.description || "",
  });
}

/**
 * ✅ Controller'ı express uyumlu middleware fonksiyonlarına çevirir
 * @param {string} name - Daha önce tanımlanmış controller adı
 * @returns {function[]} Express uyumlu middleware stack
 */
function use(name) {
  const stack = controllers[name];

  if (!stack) {
    const available = Object.keys(controllers).join(", ") || "Yok";
    throw new Error(
      `Controller "${name}" bulunamadı.\nMevcut controller'lar: ${available}`
    );
  }

  // 🧠 Registry'ye kullanım kaydı yap
  registerControllerUsage(name, "<used dynamically>");

  return stack.map((fn) => {
    return function (req, res, next) {
      try {
        // Context object destekli fonksiyon mu?
        if (fn.length === 1) {
          return Promise.resolve(fn({ req, res, next })).catch(next);
        }

        // Klasik Express middleware fonksiyonu
        return Promise.resolve(fn(req, res, next)).catch(next);
      } catch (err) {
        next(err);
      }
    };
  });
}

/**
 * 📋 Tüm tanımlı controller'ları (name → handler[]) döndürür
 */
function getAll() {
  return { ...controllers };
}

export { create, use, getAll };
