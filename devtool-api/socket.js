import { Server } from "socket.io";
import { getRegistry } from "../core/registry.js";
import { get } from "../core/config.js";
import { SOCKET_EVENTS } from "./events.js";

let io;

export function setupSocketServer(server) {
  const mode = get("mode");
  const devtoolEnabled = get("devtool");

  if (!devtoolEnabled || !["dev", "development"].includes(mode)) {
    console.warn(
      "⛔ DevTool socket.io dev mod + devtool aktif değilken başlatılamaz."
    );
    return;
  }

  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
    },
  });

  io.on(SOCKET_EVENTS.CONNECT, (socket) => {
    console.log("🟢 DevTool UI bağlandı:", socket.id);

    // 🔁 Tek seferde tüm registry verisini gönder
    socket.on(SOCKET_EVENTS.GET_REGISTRY, () => {
      const fullData = getRegistry(); // { groups, controllers, middlewares, validations }
      socket.emit(SOCKET_EVENTS.REGISTRY, fullData);
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, () => {
      console.log("🔴 DevTool bağlantısı koptu:", socket.id);
    });
  });
}

export function getIO() {
  if (!io) throw new Error("❌ Socket.io başlatılmamış.");
  return io;
}
