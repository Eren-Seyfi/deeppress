import express from "express";
import { get } from "./config.js";
import { getAllGlobal } from "./middleware.js";
import { getRouter } from "./router.js";
import { autoLoadAll } from "./loader.js";
import { registerError } from "./registry.js";

// 🔧 Express uygulaması
const app = express();

// ✅ Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🌐 Global middleware'leri uygula
getAllGlobal().forEach((mw) => app.use(mw));

// 🚦 Tanımlanan tüm router'ları uygula
app.use(getRouter());

// ❌ Global hata yakalayıcı
app.use((err, req, res, next) => {
  const mode = get("mode");
  const isDev = ["dev", "development"].includes(mode);
  const status = err.status || 500;

  registerError({
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.originalUrl,
    status,
  });

  if (isDev) {
    console.error("🔥 HATA:", err.stack || err.message);
  }

  res.status(status).json({
    status: "error",
    message: isDev
      ? err.message
      : "Bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
    ...(isDev && { stack: err.stack }),
  });
});

/**
 * 🚀 Uygulama başlatıcısı
 * - Autoload işlemlerini başlatır
 * - Belirlenen port üzerinden dinlemeye başlar
 */
async function listen() {
  await autoLoadAll(); // 📦 ./controllers, ./middlewares, ./validations, ./routes yüklenir

  const port = get("port") || 3000;
  const mode = get("mode") || "production";

  app.listen(port, () => {
    console.log(`🚀 Deeppress running at http://localhost:${port} [${mode}]`);
  });
}

export { app as App, listen };
