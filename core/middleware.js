import { v4 as uuidv4 } from "uuid";
import { registerMiddleware, registerMiddlewareUsage } from "./registry.js";

// 📦 Tanımlı middleware fonksiyonları (id → { name, fn })
const middlewares = {};

// 🌐 Global olarak tanımlı middleware ID'leri
const globalMiddlewareIds = [];

/**
 * ✅ Middleware oluşturur
 * @param {string} name - Middleware adı
 * @param {Function} fn - Express uyumlu middleware fonksiyonu
 * @param {boolean} [isGlobal=false] - Uygulama genelinde aktif mi?
 * @param {Object} [meta={}] - Ekstra bilgiler: { description?, expectedQuery?, expectedParams?, controllerName? }
 */
function create(name, fn, isGlobal = false, meta = {}) {
  if (typeof name !== "string" || typeof fn !== "function") {
    throw new Error(
      "Middleware oluşturmak için geçerli bir isim ve fonksiyon gerekir."
    );
  }

  const id = uuidv4();

  // Metadata fonksiyona gömülür
  fn.middlewareName = name;
  fn.middlewareId = id;
  fn.description = meta.description || "";
  fn.expectedQuery = meta.expectedQuery || [];
  fn.expectedParams = meta.expectedParams || [];
  fn.controllerName = meta.controllerName || null;

  middlewares[id] = { name, fn };

  if (isGlobal) {
    globalMiddlewareIds.push(id);
  }

  // 📚 Registry'ye bildir
  registerMiddleware(name, isGlobal, {
    description: fn.description,
    expectedQuery: fn.expectedQuery,
    expectedParams: fn.expectedParams,
  });
}

/**
 * ✅ Middleware çağırır
 * @param {string|string[]} names - Tek bir middleware ismi veya dizi
 * @returns {Function|Function[]} - Express uyumlu middleware fonksiyon(lar)ı
 */
function use(names) {
  const byName = (name) => {
    const found = Object.values(middlewares).find((m) => m.name === name);
    if (!found) {
      const mevcutlar =
        Object.values(middlewares)
          .map((m) => m.name)
          .join(", ") || "Hiç yok";
      throw new Error(
        `Middleware "${name}" tanımlı değil. Mevcut olanlar: ${mevcutlar}`
      );
    }
    registerMiddlewareUsage(found.name, "<used dynamically>");
    return found.fn;
  };

  if (typeof names === "string") return byName(names);
  if (Array.isArray(names)) return names.map(byName);

  throw new Error("middleware.use yalnızca string veya string[] alabilir.");
}

/**
 * 📋 Tüm tanımlı middleware'leri döner (id → { name, fn })
 */
function getAll() {
  return { ...middlewares };
}

/**
 * 🌐 Sadece global middleware fonksiyonlarını döner
 */
function getAllGlobal() {
  return globalMiddlewareIds.map((id) => middlewares[id].fn);
}

export { create, use, getAll, getAllGlobal };
