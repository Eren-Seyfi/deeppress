import { registerValidation, registerValidationUsage } from "./registry.js";

// 📦 Tüm validation fonksiyonları burada tutulur
const validations = {};

// 🌐 Global olarak aktif validasyonlar
const globalValidations = [];

/**
 * ✅ Yeni bir validasyon tanımlar
 * @param {string} name - Validation adı
 * @param {Function} fn - Express uyumlu validasyon fonksiyonu
 * @param {boolean} [isGlobal=false] - Global olarak aktif mi?
 * @param {Object} [meta={}] - Ek bilgi: { expectedQuery?, expectedParams?, description? }
 */
function create(name, fn, isGlobal = false, meta = {}) {
  if (typeof name !== "string" || typeof fn !== "function") {
    throw new Error(
      "Validation oluşturmak için geçerli bir isim ve fonksiyon gerekir."
    );
  }

  if (validations[name]) {
    console.warn(`⚠ Validation "${name}" zaten tanımlı. Üzerine yazılıyor.`);
  }

  // Etiketle
  fn.validationName = name;
  fn.expectedQuery = meta.expectedQuery || [];
  fn.expectedParams = meta.expectedParams || [];
  fn.description = meta.description || "";

  validations[name] = fn;

  if (isGlobal) {
    globalValidations.push(fn);
  }

  // 🧠 DevTool için kayıt
  registerValidation(name, isGlobal, {
    expectedQuery: fn.expectedQuery,
    expectedParams: fn.expectedParams,
    description: fn.description,
  });
}

/**
 * ✅ Validasyon çağırır
 * @param {string|string[]} names - Tek bir validasyon ismi veya dizi
 * @returns {Function|Function[]} - Express uyumlu fonksiyonlar
 */
function use(names) {
  if (typeof names === "string") {
    const fn = validations[names];
    if (!fn) {
      const mevcutlar = Object.keys(validations).join(", ") || "Hiç yok";
      throw new Error(
        `Validation "${names}" tanımlı değil. Mevcutlar: ${mevcutlar}`
      );
    }

    registerValidationUsage(names, "<used dynamically>");
    return fn;
  }

  if (Array.isArray(names)) {
    return names.map((name) => {
      const fn = validations[name];
      if (!fn) {
        const mevcutlar = Object.keys(validations).join(", ") || "Hiç yok";
        throw new Error(
          `Validation "${name}" tanımlı değil. Mevcutlar: ${mevcutlar}`
        );
      }

      registerValidationUsage(name, "<used dynamically>");
      return fn;
    });
  }

  throw new Error("validation.use yalnızca string veya string[] alabilir.");
}

/**
 * 📋 Tüm validasyonları döner
 */
function getAll() {
  return { ...validations };
}

/**
 * 🌐 Global validasyonları döner
 */
function getAllGlobal() {
  return [...globalValidations];
}

export { create, use, getAll, getAllGlobal };
