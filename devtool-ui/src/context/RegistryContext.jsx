import { createContext, useContext, useEffect, useState } from "react";
import { fakeRegistry } from "../fake-backend/db";
import { io } from "socket.io-client";
import { SOCKET_EVENTS } from "../socket-events";

export const RegistryContext = createContext();

const appEnv = import.meta.env.VITE_APP_ENV;
const socketUrl = import.meta.env.VITE_DEVTOOL_SOCKET_URL;

export function RegistryProvider({ children }) {
  const [registry, setRegistry] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (appEnv === "production") {
      // Production ortamı: socket.io kullan
      const socket = io(socketUrl);

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
    } else {
      // Development ortamı: sahte veri kullan
      const timer = setTimeout(() => {
        setRegistry(fakeRegistry);
        setConnected(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <RegistryContext.Provider value={{ registry, connected }}>
      {children}
    </RegistryContext.Provider>
  );
}

export function useRegistry() {
  return useContext(RegistryContext);
}
