// core/devtool.server.js
import { App } from "./app.js";
import { setupSocketServer } from "../devtool-api/socket.js";
import { get } from "./config.js";
import { autoLoadAll } from "./loader.js";

export async function startDevtoolServer() {
  const mode = get("mode") || "production";

  if (!["dev", "development"].includes(mode)) {
    console.warn("⛔ DevTool dev mod dışında başlatılmadı.");
    return;
  }

  await autoLoadAll();

  const port = get("port") || 3000;

  const server = App.listen(port, () => {
    console.log(
      `🚀 Deeppress + DevTool çalışıyor: http://localhost:${port} [${mode}]`
    );
  });

  setupSocketServer(server);
}
