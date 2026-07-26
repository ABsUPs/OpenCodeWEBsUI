/**
 * MultiplayerGlobe — Real-time 3D world globe with COBE WebGL rendering
 * and live peer-position markers synchronised via WebSocket relay.
 *
 * Architecture:
 *   Canvas A (WebGL)  ← COBE renders globe + markers
 *   Canvas B (2D)     ← Overlay draws arcs between connected peers
 *   useGlobeWebSocket ← Fetches active peer positions from DO relay
 *
 * References:
 *   https://github.com/shuding/cobe
 *   https://github.com/cloudflare/templates/tree/main/multiplayer-globe-template
 */
import { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";
import { useGlobeWebSocket, type ConnectionStatus } from "../hooks/useGlobeWebSocket";

/* ------------------------------------------------------------------ */
/*  Projection — lat/lng → screen coordinates                         */
/* ------------------------------------------------------------------ */

interface ScreenPoint {
  x: number;
  y: number;
  z: number;
}

/**
 * Convert geographic coordinates to 2D screen position using an
 * orthographic globe projection matching COBE's rendering.
 *
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

  // Unit sphere cartesian
  const x = Math.cos(latR) * Math.cos(lngR);
  const y = Math.sin(latR);
  const z = Math.cos(latR) * Math.sin(lngR);

  // Rotate around Y (phi — longitude rotation)
  const cφ = Math.cos(phi);
  const sφ = Math.sin(phi);
  const x1 = x * cφ + z * sφ;
  const z1 = -x * sφ + z * cφ;

  // Rotate around X (theta — latitude tilt)
  const cθ = Math.cos(theta);
  const sθ = Math.sin(theta);
  const y2 = y * cθ - z1 * sθ;
  const z2 = y * sθ + z1 * cθ;

  if (z2 <= 0) return null; // back-face culling

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
/*  Static fallback — rendered when WebGL is unavailable               */
/* ------------------------------------------------------------------ */

function StaticGlobeFallback() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    const id = setInterval(() => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const r = Math.min(w, h) * 0.35;

      // Globe circle
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(100, 200, 255, 0.3)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Latitude lines
      for (let i = -2; i <= 2; i++) {
        const yOff = (i / 5) * r;
        const latR = Math.sqrt(r * r - yOff * yOff);
        ctx.beginPath();
        ctx.ellipse(cx, cy + yOff, latR, Math.abs(yOff) * 0.6, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(100, 200, 255, 0.12)";
        ctx.stroke();
      }

      // Pulsing dot
      const pulse = 0.5 + 0.5 * Math.sin(frame * 0.05);
      ctx.beginPath();
      ctx.arc(cx, cy, 4 + 2 * pulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 200, 255, ${(0.3 + 0.3 * pulse).toFixed(3)})`;
      ctx.fill();
    }, 50);

    return () => clearInterval(id);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-[400px] w-[400px] md:h-[600px] md:w-[600px]"
      style={{ contain: "layout paint size" }}
    />
  );
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

const COBE_SIZE = 800; // fixed internal resolution — CSS scales to container
const DRAG_SENSITIVITY = 0.005;
const FRICTION = 0.95;
const VELOCITY_THRESHOLD = 0.0001;

interface MultiplayerGlobeProps {
  className?: string;
}

export default function MultiplayerGlobe({ className = "" }: MultiplayerGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const arcCanvasRef = useRef<HTMLCanvasElement>(null);
  const { peers, connectionStatus } = useGlobeWebSocket();

  const [webglFailed, setWebglFailed] = useState(false);
  const [arcDim, setArcDim] = useState({ w: 600, h: 600 });

  // Keep a ref to the latest peer array so the render-loop closure
  // always has fresh data without re-creating the COBE instance.
  const peersRef = useRef(peers);
  peersRef.current = peers;
  const selfGeoRef = useRef({ lat: 40.7128, lng: -74.006 });

  // Resolve self geo via browser Geolocation API
  // Falls back to NYC (default) if unavailable or denied
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          selfGeoRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        },
        () => {
          // permission denied or unavailable — keep default
        },
        { timeout: 5000, enableHighAccuracy: false },
      );
    }
  }, []);

  /* ---------------------------------------------------------------- */
  /*  WebGL canvas — COBE globe                                       */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || webglFailed) return;

    // Set internal resolution
    canvas.width = COBE_SIZE;
    canvas.height = COBE_SIZE;

    let phi = 0;
    let theta = 0.3;
    let isDragging = false;
    let lastX = 0;
    let velocity = 0;

    const globe = createGlobe(canvas, {
      devicePixelRatio: 1, // we control resolution via canvas size
      width: COBE_SIZE,
      height: COBE_SIZE,
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
        if (!isDragging) {
          phi += velocity;
          velocity *= FRICTION;
          if (Math.abs(velocity) < VELOCITY_THRESHOLD) velocity = 0;
        }

        state.phi = phi;
        state.markers = peersRef.current.map((p) => ({
          location: [p.lat, p.lng] as [number, number],
          size: 0.05,
        }));

        // Draw arcs on overlay canvas
        const ac = arcCanvasRef.current;
        if (ac) {
          drawArcs(
            ac,
            peersRef.current,
            selfGeoRef.current.lat,
            selfGeoRef.current.lng,
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
  }, [webglFailed]);

  /* ---------------------------------------------------------------- */
  /*  Arc canvas — ResizeObserver for crisp overlay                   */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const dpr = Math.min(window.devicePixelRatio, 2);
        setArcDim({ w: Math.round(width * dpr), h: Math.round(height * dpr) });
      }
    });

    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Sync arc canvas internal pixels
  useEffect(() => {
    const ac = arcCanvasRef.current;
    if (ac) {
      ac.width = arcDim.w;
      ac.height = arcDim.h;
    }
  }, [arcDim]);

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  if (webglFailed) {
    return (
      <div className={`relative inline-flex flex-col items-center gap-3 ${className}`}>
        <StaticGlobeFallback />
        <span className="text-[11px] text-white/20">WebGL unavailable — showing fallback</span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative inline-flex flex-col items-center gap-3 ${className}`}
    >
      {/* COBE WebGL canvas */}
      <canvas
        ref={canvasRef}
        className="h-[400px] w-[400px] md:h-[600px] md:w-[600px]"
        style={{ contain: "layout paint size" }}
      />

      {/* Arc overlay — same size, positioned on top */}
      <canvas
        ref={arcCanvasRef}
        className="pointer-events-none absolute inset-0 h-[400px] w-[400px] md:h-[600px] md:w-[600px]"
        style={{ contain: "layout paint size" }}
      />

      {/* Status badge */}
      <div className="absolute bottom-2 left-2">
        <ConnectionBadge status={connectionStatus} />
      </div>

      {connectionStatus === "connected" && peers.length > 0 && (
        <span className="text-[11px] text-white/25">
          {peers.length} active peer{peers.length === 1 ? "" : "s"}
        </span>
      )}
    </div>
  );
}
