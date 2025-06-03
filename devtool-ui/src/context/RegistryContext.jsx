import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { DEVTOOL_SOCKET_URL } from "../config";
import { SOCKET_EVENTS } from "../socket-events";

export const RegistryContext = createContext(); // ← BU SATIR EKSİKTİ ✅

const socket = io(DEVTOOL_SOCKET_URL);

export function RegistryProvider({ children }) {
  const [registry, setRegistry] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    socket.on(SOCKET_EVENTS.CONNECT, () => {
      setConnected(true);
      socket.emit(SOCKET_EVENTS.GET_REGISTRY);
    });

    socket.on(SOCKET_EVENTS.REGISTRY, (data) => {
      setRegistry(data);
    });

    return () => {
      socket.off(SOCKET_EVENTS.CONNECT);
      socket.off(SOCKET_EVENTS.REGISTRY);
    };
  }, []);

  return (
    <RegistryContext.Provider value={{ registry, connected, socket }}>
      {children}
    </RegistryContext.Provider>
  );
}

export function useRegistry() {
  return useContext(RegistryContext);
}
