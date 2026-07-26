/**
 * useGlobeWebSocket — Real-time peer position sync for the multiplayer globe.
 *
 * Connects to the Cloudflare DO WebSocket relay at `/api/globe-ws`,
 * resolves the user's approximate geo-location via IP on mount,
 * and broadcasts position updates whenever the user interacts with the globe.
 */
import { useEffect, useRef, useState, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface PeerPosition {
  id: string;
  lat: number;
  lng: number;
}

export type ConnectionStatus =
  | "connecting"
  | "connected"
  | "disconnected"
  | "error";

interface UseGlobeWebSocketReturn {
  /** Active remote peers (does NOT include self) */
  peers: PeerPosition[];
  connectionStatus: ConnectionStatus;
  /** Number of active peers (excluding self) */
  peerCount: number;
}

/* ------------------------------------------------------------------ */
/*  Hook                                                               */
/* ------------------------------------------------------------------ */

export function useGlobeWebSocket(): UseGlobeWebSocketReturn {
  const [peers, setPeers] = useState<PeerPosition[]>([]);
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>("disconnected");

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>();
  const mountedRef = useRef(true);
  const selfIdRef = useRef<string | null>(null);
  const geoRef = useRef({ lat: 40.7128, lng: -74.006 }); // default: NYC

  // Resolve approximate geo-position via browser Geolocation API
  // Falls back to NYC (default) if unavailable or denied
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          geoRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        },
        () => {
          // permission denied or unavailable — keep default
        },
        { timeout: 5000, enableHighAccuracy: false },
      );
    }
  }, []);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const url = `${protocol}//${host}/api/globe-ws`;

    setConnectionStatus("connecting");
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) {
        ws.close();
        return;
      }
      setConnectionStatus("connected");
      ws.send(
        JSON.stringify({
          type: "JOIN",
          lat: geoRef.current.lat,
          lng: geoRef.current.lng,
        }),
      );
    };

    ws.onmessage = (event: MessageEvent) => {
      if (!mountedRef.current) return;
      try {
        const data = JSON.parse(event.data as string);

        if (data.type === "PEERS_UPDATE") {
          const incoming: PeerPosition[] = data.peers ?? [];
          // Filter out self by storing our session ID on first PEERS_UPDATE
          if (incoming.length > 0 && !selfIdRef.current) {
            // Heuristic: the peer with our exact geo is us
            const maybeSelf = incoming.find(
              (p) =>
                Math.abs(p.lat - geoRef.current.lat) < 0.1 &&
                Math.abs(p.lng - geoRef.current.lng) < 0.1,
            );
            if (maybeSelf) selfIdRef.current = maybeSelf.id;
          }
          setPeers(incoming.filter((p) => p.id !== selfIdRef.current));
        }
      } catch {
        // ignore malformed frames
      }
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setConnectionStatus("disconnected");
      wsRef.current = null;
      reconnectRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      if (!mountedRef.current) return;
      setConnectionStatus("error");
    };
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    connect();

    return () => {
      mountedRef.current = false;
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // suppress reconnect
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect]);

  return {
    peers,
    connectionStatus,
    peerCount: peers.length,
  };
}
