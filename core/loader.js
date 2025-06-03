import fs from "fs";
import path from "path";
import { pathToFileURL } from "url";
import { v4 as uuidv4 } from "uuid";
import { registerAutoloadedFile } from "./registry.js";

/**
 * 📁 Belirtilen klasördeki tüm .js dosyalarını dinamik olarak içe aktarır
 * ve her fonksiyonu registry'ye kaydeder
 *
 * @param {string} dir - Göreceli klasör yolu (örn: "./controllers")
 */
async function loadFolder(dir = "./controllers") {
  const absPath = path.resolve(dir);
  const folderType = path.basename(absPath); // örnek: controllers, middlewares, validations

  if (!fs.existsSync(absPath)) return;

  const files = fs.readdirSync(absPath);

  for (const file of files) {
    if (!file.toLowerCase().endsWith(".js")) continue;

    const fullPath = path.join(absPath, file);
    const fileURL = pathToFileURL(fullPath).href;

    try {
      const module = await import(fileURL);
      const entries = Object.entries(module);

      for (const [exportName, fn] of entries) {
        if (typeof fn !== "function") continue;

        const isMiddleware = !!fn.middlewareName;
        const isValidation = !!fn.validationName;
        const isController = !!fn.controllerName;

        const type = isMiddleware
          ? "middleware"
          : isValidation
          ? "validation"
          : isController
          ? "controller"
          : folderType;

        const meta = {
          id: uuidv4(), // 🎯 Benzersiz ID eklendi
          type,
          filename: file,
          fullPath,
          exportName,
          name:
            fn.middlewareName ||
            fn.validationName ||
            fn.controllerName ||
            exportName,
          expectedQuery: fn.expectedQuery || [],
          expectedParams: fn.expectedParams || [],
          description: fn.description || "",
        };

        registerAutoloadedFile(meta);
      }

      // 🔁 Default export desteği
      if (typeof module.default === "function") {
        const fn = module.default;

        const isMiddleware = !!fn.middlewareName;
        const isValidation = !!fn.validationName;
        const isController = !!fn.controllerName;

        const type = isMiddleware
          ? "middleware"
          : isValidation
          ? "validation"
          : isController
          ? "controller"
          : folderType;

        const meta = {
          id: uuidv4(),
          type,
          filename: file,
          fullPath,
          exportName: "default",
          name:
            fn.middlewareName ||
            fn.validationName ||
            fn.controllerName ||
            "default",
          expectedQuery: fn.expectedQuery || [],
          expectedParams: fn.expectedParams || [],
          description: fn.description || "",
        };

        registerAutoloadedFile(meta);
      }
    } catch (err) {
      console.error(`❌ Hata (Autoload: ${folderType}) → ${file}`, err.message);
    }
  }
}

// 📦 Kategoriye göre özel yükleyiciler
export async function loadControllers() {
  await loadFolder("./controllers");
}
export async function loadMiddlewares() {
  await loadFolder("./middlewares");
}
export async function loadValidations() {
  await loadFolder("./validations");
}
export async function loadRoutes() {
  await loadFolder("./routes");
}

// 🚀 Tüm desteklenen klasörleri yükle
export async function autoLoadAll() {
  await loadControllers();
  await loadMiddlewares();
  await loadValidations();
  await loadRoutes();
}
