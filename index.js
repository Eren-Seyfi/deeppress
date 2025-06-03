// index.js

import { App, listen } from "./core/app.js";
import * as config from "./core/config.js";
import * as middleware from "./core/middleware.js";
import * as controller from "./core/controller.js";
import * as router from "./core/router.js";
import * as registry from "./core/registry.js";
import * as validation from "./core/validation.js";
import { setupSocketServer } from "./devtool-api/socket.js";

// 🚦 Mod ve devtool kontrolü
const mode = config.get("mode") || "production";
const devtool = config.get("devtool") || false;

// Eğer bu dosya doğrudan çalıştırılıyorsa:
if (import.meta.url === `file://${process.argv[1]}`) {
  const server = await listen();

  if (devtool && ["dev", "development"].includes(mode)) {
    setupSocketServer(server);
    console.log("🧩 DevTool Socket Server aktif edildi.");
  }
}

// 📦 Framework olarak dışa aktarım
export {
  App,
  listen,
  config,
  middleware,
  controller,
  router,
  registry,
  validation,
};
