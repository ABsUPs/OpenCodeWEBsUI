/**
 * MultiplayerGlobe — Real-time 3D world globe with COBE WebGL rendering
 * and live peer-position markers synchronised via GlobeRelayDO.
 *
 * Responsive: fills its container width, uses ResizeObserver + DPR.
 * Live: shows "X connected" counter and self/peer markers on the globe.
 *
 * Architecture:
 *   COBE canvas    ← WebGL globe with markers
 *   Arc overlay    ← Bezier curves from self → peers
 *   useGlobeWebSocket ← Cloudflare DO relay for real-time peer positions
 *
 * References:
 *   https://github.com/shuding/cobe
 *   https://github.com/cloudflare/templates/tree/main/multiplayer-globe-template
 */
import { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";
import {
  useGlobeWebSocket,
  type ConnectionStatus,
} from "../hooks/useGlobeWebSocket";

/* ------------------------------------------------------------------ */
/*  Projection — lat/lng → screen coordinates                          */
/* ------------------------------------------------------------------ */

interface ScreenPoint {
  x: number;
  y: number;
  z: number;
}

/**
 * Orthographic projection matching COBE's internal rendering.
 * Returns null when the point is on the back face of the globe.
 */
function latLngToScreen(
  lat: number,
  lng: number,
  phi: number,
  theta: number,
  cx: number,
  cy: number,
  radius: number,
): ScreenPoint | null {
  const latR = lat * (Math.PI / 180);
  const lngR = lng * (Math.PI / 180);

  const x = Math.cos(latR) * Math.cos(lngR);
  const y = Math.sin(latR);
  const z = Math.cos(latR) * Math.sin(lngR);

  const cφ = Math.cos(phi);
  const sφ = Math.sin(phi);
  const x1 = x * cφ + z * sφ;
  const z1 = -x * sφ + z * cφ;

  const cθ = Math.cos(theta);
  const sθ = Math.sin(theta);
  const y2 = y * cθ - z1 * sθ;
  const z2 = y * sθ + z1 * cθ;

  if (z2 <= 0) return null;

  return { x: cx + x1 * radius, y: cy + y2 * radius, z: z2 };
}

/* ------------------------------------------------------------------ */
/*  Arc overlay — draw bezier curves between peers                     */
/* ------------------------------------------------------------------ */

function drawArcs(
  arcCanvas: HTMLCanvasElement,
  peers: ReadonlyArray<{ lat: number; lng: number }>,
  myLat: number,
  myLng: number,
  phi: number,
  theta: number,
): void {
  const ctx = arcCanvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, arcCanvas.width, arcCanvas.height);
  if (peers.length === 0) return;

  const cx = arcCanvas.width / 2;
  const cy = arcCanvas.height / 2;
  const radius = Math.min(arcCanvas.width, arcCanvas.height) * 0.38;

  const self = latLngToScreen(myLat, myLng, phi, theta, cx, cy, radius);
  if (!self) return;

  for (const peer of peers) {
    const pt = latLngToScreen(peer.lat, peer.lng, phi, theta, cx, cy, radius);
    if (!pt || pt.z <= 0) continue;

    const depth = (self.z + pt.z) / 2;
    const alpha = Math.max(0.08, Math.min(0.5, depth));

    const midX = (self.x + pt.x) / 2;
    const midY = (self.y + pt.y) / 2;
    const dx = pt.x - self.x;
    const dy = pt.y - self.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const arcH = Math.min(dist * 0.35, radius * 0.35);

    ctx.beginPath();
    ctx.moveTo(self.x, self.y);
    ctx.quadraticCurveTo(midX, midY - arcH, pt.x, pt.y);
    ctx.strokeStyle = `rgba(100, 200, 255, ${alpha.toFixed(3)})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }
}

/* ------------------------------------------------------------------ */
/*  Connection badge                                                   */
/* ------------------------------------------------------------------ */

const STATUS_LABEL: Record<ConnectionStatus, string> = {
  connecting: "Connecting…",
  connected: "Live",
  disconnected: "Offline",
  error: "Connection Error",
};

const STATUS_COLOR: Record<ConnectionStatus, string> = {
  connecting: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  connected: "bg-green-500/20 text-green-400 border-green-500/30",
  disconnected: "bg-white/5 text-white/30 border-white/10",
  error: "bg-red-500/20 text-red-400 border-red-500/30",
};

function ConnectionBadge({ status }: { status: ConnectionStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${STATUS_COLOR[status]}`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          status === "connected" ? "bg-green-400 animate-pulse" : "bg-current"
        }`}
      />
      {STATUS_LABEL[status]}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

const DRAG_SENSITIVITY = 0.005;
const FRICTION = 0.95;
const VELOCITY_THRESHOLD = 0.0001;

// Internal COBE resolution scalar — CSS container size × DPR × this
const RES_SCALE = 2;

interface MultiplayerGlobeProps {
  className?: string;
}

export default function MultiplayerGlobe({ className = "" }: MultiplayerGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const arcCanvasRef = useRef<HTMLCanvasElement>(null);
  const { peers, selfPosition, connectionStatus, peerCount } =
    useGlobeWebSocket();

  const [containerSize, setContainerSize] = useState({ w: 400, h: 400 });
  const [webglFailed, setWebglFailed] = useState(false);

  // Keep refs to latest data for the render-loop closure
  const peersRef = useRef(peers);
  peersRef.current = peers;
  const selfRef = useRef(selfPosition);
  selfRef.current = selfPosition;

  /* ---------------------------------------------------------------- */
  /*  Container ResizeObserver — responsive sizing                     */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        // Square globe: size = min(width, 700) keeping it responsive
        const size = Math.min(Math.max(width, 280), 700);
        setContainerSize({ w: size, h: size });
      }
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  /* ---------------------------------------------------------------- */
  /*  WebGL canvas — COBE globe                                       */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || webglFailed) return;

    const size = containerSize.w;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const internalSize = Math.round(size * dpr * RES_SCALE);

    canvas.width = internalSize;
    canvas.height = internalSize;

    let phi = 0;
    let theta = 0.3;
    let isDragging = false;
    let lastX = 0;
    let velocity = 0;

    const globe = createGlobe(canvas, {
      devicePixelRatio: 1, // we control resolution via canvas size
      width: internalSize,
      height: internalSize,
      phi: 0,
      theta,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.3, 0.3, 0.9],
      markerColor: [0.1, 0.8, 1.0],
      glowColor: [0.12, 0.12, 0.4],
      markers: [],
      scale: 1,
      onRender: (state) => {
        // Auto-rotate with inertia
        if (!isDragging) {
          phi += velocity;
          velocity *= FRICTION;
          if (Math.abs(velocity) < VELOCITY_THRESHOLD) velocity = 0;
        } else {
          // Gentle auto-rotation even while dragging stops if user holds
        }

        state.phi = phi;

        // Build markers: self marker is large, peer markers are small
        const markers: Array<{ location: [number, number]; size: number; color?: [number, number, number] }> = [];

        // Self marker (bright cyan, larger)
        const self = selfRef.current;
        if (self) {
          markers.push({
            location: [self.lat, self.lng],
            size: 0.08,
            color: [0.3, 1.0, 1.0],
          });
        }

        // Peer markers (standard markerColor)
        for (const peer of peersRef.current) {
          markers.push({
            location: [peer.lat, peer.lng],
            size: 0.04,
          });
        }

        state.markers = markers;

        // Draw arcs on overlay canvas
        const ac = arcCanvasRef.current;
        if (ac && self) {
          drawArcs(
            ac,
            peersRef.current,
            self.lat,
            self.lng,
            phi,
            theta,
          );
        }
      },
    });

    /* -------- Pointer drag -------- */

    const onDown = (e: PointerEvent) => {
      isDragging = true;
      lastX = e.clientX;
      velocity = 0;
      canvas.setPointerCapture(e.pointerId);
    };

    const onMove = (e: PointerEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - lastX;
      phi += dx * DRAG_SENSITIVITY;
      velocity = dx * DRAG_SENSITIVITY;
      lastX = e.clientX;
    };

    const onUp = () => {
      isDragging = false;
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", onUp);

    /* -------- WebGL context loss -------- */

    const onCtxLost = (e: Event) => {
      e.preventDefault();
      setWebglFailed(true);
    };
    canvas.addEventListener("webglcontextlost", onCtxLost);

    /* -------- Cleanup -------- */

    return () => {
      globe.destroy();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onUp);
      canvas.removeEventListener("webglcontextlost", onCtxLost);
    };
  }, [containerSize, webglFailed]);

  /* ---------------------------------------------------------------- */
  /*  Arc canvas — sync pixel size to container                        */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const ac = arcCanvasRef.current;
    if (!ac) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ac.width = containerSize.w * dpr;
    ac.height = containerSize.h * dpr;
    ac.style.width = `${containerSize.w}px`;
    ac.style.height = `${containerSize.h}px`;
  }, [containerSize]);

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div
      ref={containerRef}
      className={`relative mx-auto flex w-full max-w-[700px] flex-col items-center gap-3 ${className}`}
    >
      {/* COBE WebGL canvas — CSS fills container width */}
      <div className="relative w-full" style={{ aspectRatio: "1 / 1" }}>
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          style={{ contain: "layout paint size", display: webglFailed ? "none" : "block" }}
        />

        {/* Arc overlay — same size, positioned on top */}
        <canvas
          ref={arcCanvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
          style={{ contain: "layout paint size" }}
        />

        {/* Status badge */}
        <div className="absolute bottom-2 left-2 z-10">
          <ConnectionBadge status={connectionStatus} />
        </div>
      </div>

      {/* Live counter */}
      {connectionStatus === "connected" && (
        <span className="text-xs text-white/40 transition-opacity">
          {peerCount > 0
            ? `${peerCount} ${peerCount === 1 ? "person" : "people"} connected`
            : "No one else is here yet"}
        </span>
      )}
    </div>
  );
}
