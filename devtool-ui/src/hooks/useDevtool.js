import { useContext } from "react";
import { RegistryContext } from "../context/RegistryContext"; // ← artık hata vermez

export function useDevtool() {
  const { registry, connected, socket } = useContext(RegistryContext);
  const isReady = connected && !!registry;

  const emit = (event, data) => {
    if (!connected) return console.warn("❌ Socket bağlı değil!");
    socket.emit(event, data);
  };

  return { registry, connected, isReady, emit, socket };
}
