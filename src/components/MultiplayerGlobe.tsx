/**
 * MultiplayerGlobe — Real-time 3D world globe with COBE v2 WebGL rendering
 * and live peer-position markers synchronised via GlobeRelayDO.
 *
 * Visually matches the COBE v2 demo (https://cobe.vercel.app):
 *   • Continuous auto-rotation (0.005 rad/frame)
 *   • Built-in WebGL arcs + marker elevation
 *   • CSS Anchor Positioning labels for city names
 *   • Dark-mode palette tuned for our site background
 *
 * References:
 *   https://cobe.vercel.app
 *   https://github.com/shuding/cobe
 */
import { useEffect, useRef, useState } from "react";
import createGlobe, { type Marker, type Arc } from "cobe";
import {
  useGlobeWebSocket,
  type ConnectionStatus,
} from "../hooks/useGlobeWebSocket";

/* ------------------------------------------------------------------ */
/*  City data: label + location for markers + CSS anchor labels        */
/* ------------------------------------------------------------------ */

interface City {
  id: string;
  label: string;
  location: [number, number];
}

const CITIES: City[] = [
  { id: "sf",      label: "San Francisco", location: [37.78, -122.44] },
  { id: "nyc",     label: "New York",      location: [40.71, -74.01]  },
  { id: "london",  label: "London",        location: [51.51, -0.13]   },
  { id: "paris",   label: "Paris",         location: [48.86, 2.35]    },
  { id: "tokyo",   label: "Tokyo",         location: [35.68, 139.65]  },
  { id: "shanghai",label: "Shanghai",      location: [31.23, 121.47]  },
  { id: "delhi",   label: "Delhi",         location: [28.61, 77.23]   },
  { id: "sydney",  label: "Sydney",        location: [-33.87, 151.21] },
  { id: "saopaulo",label: "São Paulo",    location: [-23.55, -46.63]  },
  { id: "moscow",  label: "Moscow",        location: [55.76, 37.62]   },
  { id: "dubai",   label: "Dubai",         location: [25.20, 55.27]   },
  { id: "capeown", label: "Cape Town",     location: [-33.92, 18.42]  },
  { id: "mexico",  label: "Mexico City",   location: [19.43, -99.13]  },
  { id: "singapore",label: "Singapore",    location: [1.35, 103.82]   },
  { id: "istanbul",label: "Istanbul",      location: [41.01, 28.96]   },
];

/** Decorative flight arcs between select city pairs. */
const DECO_ARCS: Arc[] = [
  { from: [37.78, -122.44], to: [35.68, 139.65] }, // SF → Tokyo
  { from: [40.71, -74.01],  to: [51.51, -0.13] },  // NYC → London
  { from: [51.51, -0.13],   to: [48.86, 2.35] },   // London → Paris
  { from: [35.68, 139.65],  to: [-33.87, 151.21] },// Tokyo → Sydney
  { from: [28.61, 77.23],   to: [31.23, 121.47] }, // Delhi → Shanghai
  { from: [25.20, 55.27],   to: [1.35, 103.82] },  // Dubai → Singapore
  { from: [-23.55, -46.63], to: [40.71, -74.01] }, // São Paulo → NYC
  { from: [19.43, -99.13],  to: [55.76, 37.62] },  // Mexico City → Moscow
  { from: [41.01, 28.96],   to: [25.20, 55.27] },  // Istanbul → Dubai
];

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

const AUTO_ROTATE_SPEED = 0.005;   // matches cobe.vercel.app
const DRAG_SENSITIVITY = 0.005;
const FRICTION = 0.95;
const VELOCITY_THRESHOLD = 0.0001;
const RES_SCALE = 2;

interface MultiplayerGlobeProps {
  className?: string;
}

export default function MultiplayerGlobe({ className = "" }: MultiplayerGlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const labelsRef = useRef<HTMLDivElement>(null);
  const { peers, selfPosition, connectionStatus, peerCount } =
    useGlobeWebSocket();

  const [containerSize, setContainerSize] = useState({ w: 400, h: 400 });
  const [webglFailed, setWebglFailed] = useState(false);

  const peersRef = useRef(peers);
  peersRef.current = peers;
  const selfRef = useRef(selfPosition);
  selfRef.current = selfPosition;

  /* ---------------------------------------------------------------- */
  /*  Container ResizeObserver                                         */
  /* ---------------------------------------------------------------- */

  const MAX_GLOBE = 480;
  const MIN_GLOBE = 240;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        const size = Math.round(Math.min(Math.max(width, MIN_GLOBE), MAX_GLOBE));
        setContainerSize({ w: size, h: size });
      }
    });
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  /* ---------------------------------------------------------------- */
  /*  WebGL canvas — COBE v2 globe                                    */
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
      devicePixelRatio: 1,
      width: internalSize,
      height: internalSize,
      phi: 0,
      theta,
      dark: 1,
      diffuse: 0.9,
      mapSamples: 16000,
      mapBrightness: 5,
      baseColor: [0.2, 0.2, 0.8],
      markerColor: [0.1, 0.8, 1.0],
      glowColor: [0.18, 0.18, 0.55],
      scale: 1,
      arcColor: [0.2, 0.6, 1.0],
      arcWidth: 0.5,
      arcHeight: 0.3,
      markerElevation: 0.02,
      // Seed with one dummy marker so the WebGL buffer is bound from frame 0.
      markers: [{ location: [0, 0], size: 0.001 }],
      arcs: [{ from: [0, 0], to: [0, 0] }],
    });

    /* -------- Animation loop -------- */

    function animate() {
      // Rotation with inertia + constant auto-spin
      if (!isDragging) {
        phi += velocity + AUTO_ROTATE_SPEED;
        velocity *= FRICTION;
        if (Math.abs(velocity) < VELOCITY_THRESHOLD) velocity = 0;
      }

      // Build markers (with ids for CSS anchoring)
      const markers: Marker[] = [];

      for (const city of CITIES) {
        markers.push({ location: city.location, size: 0.025, id: city.id });
      }

      // Self marker
      const self = selfRef.current;
      if (self) {
        markers.push({ location: [self.lat, self.lng], size: 0.065, color: [0.3, 1.0, 1.0] });
      }

      // Peer markers
      for (const peer of peersRef.current) {
        markers.push({ location: [peer.lat, peer.lng], size: 0.04 });
      }

      // Arcs: decorative + self→peer
      const arcs: Arc[] = [...DECO_ARCS];
      if (self) {
        for (const peer of peersRef.current) {
          arcs.push({ from: [self.lat, self.lng], to: [peer.lat, peer.lng], color: [0.3, 0.8, 1.0] });
        }
      }

      globe.update({ phi, markers, arcs });
      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);

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
    const onUp = () => { isDragging = false; };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", onUp);

    const onCtxLost = (e: Event) => { e.preventDefault(); setWebglFailed(true); };
    canvas.addEventListener("webglcontextlost", onCtxLost);

    return () => {
      cancelAnimationFrame(rafRef.current);
      globe.destroy();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onUp);
      canvas.removeEventListener("webglcontextlost", onCtxLost);
    };
  }, [containerSize, webglFailed]);

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  return (
    <div
      ref={containerRef}
      className={`relative mx-auto flex w-full max-w-[480px] flex-col items-center gap-2 ${className}`}
    >
      <div className="relative w-full" style={{ aspectRatio: "1 / 1" }}>
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40"
          style={{
            width: "85%",
            height: "85%",
            background:
              "radial-gradient(circle at center, rgba(100,140,255,0.15) 0%, rgba(60,80,200,0.06) 40%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />

        {/* COBE WebGL canvas */}
        <canvas
          ref={canvasRef}
          className="relative z-[1] h-full w-full"
          style={{ contain: "layout paint size", display: webglFailed ? "none" : "block" }}
        />

        {/* CSS Anchor Positioning labels for city names */}
        {/* COBE v2 creates --cobe-{id} anchor + --cobe-visible-{id} variable per marker */}
        <div
          ref={labelsRef}
          className="pointer-events-none absolute inset-0 z-[3] h-full w-full"
          style={{ contain: "layout style" }}
        >
          {CITIES.map((city) => (
            <span
              key={city.id}
              className="city-label"
              style={{
                positionAnchor: `--cobe-${city.id}` as unknown as string,
                opacity: `var(--cobe-visible-${city.id}, 0)` as unknown as number,
                filter: `blur(calc((1 - var(--cobe-visible-${city.id}, 0)) * 6px))` as unknown as string,
              }}
            >
              {city.label}
            </span>
          ))}
        </div>

        {/* Status badge */}
        <div className="absolute bottom-2 left-2 z-10">
          <ConnectionBadge status={connectionStatus} />
        </div>
      </div>

      {/* Live counter */}
      {connectionStatus === "connected" && (
        <span className="text-[11px] tracking-wider text-white/35 transition-opacity">
          {peerCount > 0
            ? `${peerCount} ${peerCount === 1 ? "person" : "people"} connected`
            : "No one else is here yet"}
        </span>
      )}
    </div>
  );
}
