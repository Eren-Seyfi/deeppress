import { registerMiddleware, registerMiddlewareUsage } from "./registry.js";

// 📦 Tanımlı middleware fonksiyonları burada tutulur
const middlewares = {};

// 🌐 Global olarak tanımlı middleware fonksiyonları
const globalMiddlewares = [];

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

  if (middlewares[name]) {
    console.warn(`⚠ Middleware "${name}" zaten tanımlı. Üzerine yazılıyor.`);
  }

  // Metadata etiketleri fonksiyona eklenir
  fn.middlewareName = name;
  fn.description = meta.description || "";
  fn.expectedQuery = meta.expectedQuery || [];
  fn.expectedParams = meta.expectedParams || [];
  fn.controllerName = meta.controllerName || null;

  // Kayıt
  middlewares[name] = fn;

  // Global listeye ekle
  if (isGlobal && !globalMiddlewares.includes(fn)) {
    globalMiddlewares.push(fn);
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
  if (typeof names === "string") {
    const fn = middlewares[names];
    if (!fn) {
      const mevcutlar = Object.keys(middlewares).join(", ") || "Hiç yok";
      throw new Error(
        `Middleware "${names}" tanımlı değil. Mevcut olanlar: ${mevcutlar}`
      );
    }

    registerMiddlewareUsage(names, "<used dynamically>");
    return fn;
  }

  if (Array.isArray(names)) {
    return names.map((name) => {
      const fn = middlewares[name];
      if (!fn) {
        const mevcutlar = Object.keys(middlewares).join(", ") || "Hiç yok";
        throw new Error(
          `Middleware "${name}" tanımlı değil. Mevcut olanlar: ${mevcutlar}`
        );
      }

      registerMiddlewareUsage(name, "<used dynamically>");
      return fn;
    });
  }

  throw new Error("middleware.use yalnızca string veya string[] alabilir.");
}

/**
 * 📋 Tüm tanımlı middleware'leri döner
 * @returns {Object} middlewareName → fn
 */
function getAll() {
  return { ...middlewares };
}

/**
 * 🌐 Global middleware fonksiyonlarını döner
 * @returns {Function[]} Sadece global tanımlılar
 */
function getAllGlobal() {
  return [...globalMiddlewares];
}

export { create, use, getAll, getAllGlobal };
