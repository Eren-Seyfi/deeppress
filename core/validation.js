import { v4 as uuidv4 } from "uuid";
import { registerValidation, registerValidationUsage } from "./registry.js";

// 📦 Tüm validation fonksiyonları burada tutulur (id → { name, fn })
const validations = {};

// 🌐 Global olarak aktif validasyon ID'leri
const globalValidationIds = [];

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

  const id = uuidv4();

  // Etiketle
  fn.validationName = name;
  fn.validationId = id;
  fn.expectedQuery = meta.expectedQuery || [];
  fn.expectedParams = meta.expectedParams || [];
  fn.description = meta.description || "";

  validations[id] = { name, fn };

  if (isGlobal) {
    globalValidationIds.push(id);
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
  const byName = (name) => {
    const found = Object.values(validations).find((v) => v.name === name);
    if (!found) {
      const mevcutlar =
        Object.values(validations)
          .map((v) => v.name)
          .join(", ") || "Hiç yok";
      throw new Error(
        `Validation "${name}" tanımlı değil. Mevcutlar: ${mevcutlar}`
      );
    }

    registerValidationUsage(found.name, "<used dynamically>");
    return found.fn;
  };

  if (typeof names === "string") return byName(names);
  if (Array.isArray(names)) return names.map(byName);

  throw new Error("validation.use yalnızca string veya string[] alabilir.");
}

/**
 * 📋 Tüm validasyonları döner (id → { name, fn })
 */
function getAll() {
  return { ...validations };
}

/**
 * 🌐 Global validasyonları döner (yalnızca fonksiyonlar)
 */
function getAllGlobal() {
  return globalValidationIds.map((id) => validations[id].fn);
}

export { create, use, getAll, getAllGlobal };
