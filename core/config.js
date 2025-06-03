import { registerConfig } from "./registry.js";

// 📦 Varsayılan ayarlar
let config = {
  port: 3000,
  mode: "production",
  devtool: false,
};

/**
 * ✅ Config değerlerini toplu olarak ayarlamak için kullanılır
 * @param {object} values - Ayarlanacak config değerleri (key-value)
 */
function set(values) {
  if (typeof values !== "object" || values === null || Array.isArray(values)) {
    throw new Error("Config.set(values) → values must be a plain object.");
  }

  let hasChanged = false;

  for (const [key, val] of Object.entries(values)) {
    if (config[key] !== val) {
      config[key] = val;
      hasChanged = true;
    }
  }

  if (hasChanged) {
    registerConfig(getAll()); // 🔄 Sadece değişiklik varsa bildir
  }
}

/**
 * ✅ Belirli bir config anahtarını döner
 * @param {string} key - Anahtar ismi
 * @returns {*} - Değeri ya da undefined
 */
function get(key) {
  return config[key];
}

/**
 * 📋 Tüm config ayarlarını döner
 * @returns {object}
 */
function getAll() {
  return { ...config };
}

/**
 * ♻ Yapılandırmayı başa döndürür (isteğe bağlı)
 */
function reset() {
  config = {
    port: 3000,
    mode: "production",
    devtool: false,
  };

  registerConfig(getAll());
}

export { set, get, getAll, reset };
