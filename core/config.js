import { registerConfig } from "./registry.js";

// 📦 Uygulama genel yapılandırmalarının tutulduğu nesne
const config = {};

/**
 * ✅ Config değerlerini toplu olarak ayarlamak için kullanılır
 * @param {object} values - Ayarlanacak config değerleri (key-value formatında)
 */
function set(values) {
  if (typeof values !== "object" || values === null || Array.isArray(values)) {
    throw new Error("Config.set(values) → values must be a plain object.");
  }

  Object.entries(values).forEach(([key, val]) => {
    config[key] = val;
  });

  // 🧠 DevTool & registry sistemine bildir
  registerConfig(getAll());
}

/**
 * ✅ Belirli bir config anahtarını döner
 * @param {string} key - İstenen config anahtarı
 * @returns {*} - Değer ya da undefined
 */
function get(key) {
  return config[key];
}

/**
 * 📋 Tüm config ayarlarını döner
 * @returns {object} - Tüm config nesnesinin kopyası
 */
function getAll() {
  return { ...config };
}

export { set, get, getAll };
