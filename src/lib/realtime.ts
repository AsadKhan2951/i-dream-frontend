import { io, Socket } from "socket.io-client";
import { getApiBaseUrl } from "@/lib/apiBase";

let socket: Socket | null = null;

export function getRealtimeSocket() {
  if (socket) return socket;

  const apiBaseUrl = getApiBaseUrl();
  const socketUrl = apiBaseUrl || window.location.origin;

  socket = io(socketUrl, {
    withCredentials: true,
    transports: ["websocket", "polling"],
  });

  return socket;
}
