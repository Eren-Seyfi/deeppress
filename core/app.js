import express from "express";
import { get } from "./config.js";
import { getAllGlobal } from "./middleware.js";
import { getRouter } from "./router.js";
import { autoLoadAll } from "./loader.js";
import { registerError } from "./registry.js";

const app = express();

// 🚀 Başlatıcı
async function listen() {
  await autoLoadAll();

  // Ortam bilgileri
  const port = get("port") || 3000;
  const mode = get("mode") || "production";
  const devtool = get("devtool") || false;
  const isDev = ["dev", "development"].includes(mode);

  // Body parsers
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 🌐 Global Middleware'ler
  try {
    getAllGlobal().forEach((mw) => app.use(mw));
  } catch (err) {
    console.error("❌ Global middleware yüklenirken hata:", err);
  }

  // 🚦 Ana Router
  app.use(getRouter());

  // ❌ Hata yakalayıcı
  app.use((err, req, res, next) => {
    const status = err.status || 500;

    registerError({
      message: err.message,
      stack: err.stack,
      method: req.method,
      path: req.originalUrl,
      status,
      body: req.body,
      params: req.params,
      query: req.query,
      user: req.user || null,
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

  // Sunucuyu başlat
  const server = app.listen(port, () => {
    console.log(`🚀 Deeppress running at http://localhost:${port} [${mode}]`);
  });

  // DevTool aktifse Socket başlat
  if (devtool && isDev) {
    const { setupSocketServer } = await import("../devtool-api/socket.js");
    setupSocketServer(server);
    console.log("🧩 DevTool Socket Server aktif.");
  }

  return server;
}

export { app as App, listen };
