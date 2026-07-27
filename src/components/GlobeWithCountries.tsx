/**
 * GlobeWithCountries — 3D globe with country-colored polygons using
 * globe.gl (Three.js).  Replaces the COBE dot-map with per-country
 * polygon fills so you can easily distinguish nations.
 *
 * Features:
 *   • Country polygons with distinct colors
 *   • City markers + peer / self markers
 *   • Decorative flight arcs + peer connections (self→peer)
 *   • Auto-rotation + drag orbiting
 *   • Live peer counter
 *   • Responsive sizing (240–480 px)
 *
 * Data sources:
 *   Countries GeoJSON — Natural Earth 110m via unpkg CDN
 *   Globe texture     — blue-marble satellite imagery
 *
 * References:
 *   https://github.com/vasturiano/globe.gl
 *   https://github.com/vasturiano/three-globe
 */
import { useEffect, useRef, useState } from "react";
import Globe from "globe.gl";
import type { GlobeInstance } from "globe.gl";
import {
  useGlobeWebSocket,
  type ConnectionStatus,
} from "../hooks/useGlobeWebSocket";

/* ------------------------------------------------------------------ */
/*  Country colour palette                                             */
/*  Deterministic hash from country name → HSL for visual variety.     */
/* ------------------------------------------------------------------ */

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function countryColor(countryName: string): string {
  const h = hashStr(countryName);
  // Spread hue widely, keep saturation 50-70%, lightness 35-55% for dark bg
  const hue = h % 360;
  const sat = 50 + (h % 20);
  const lit = 35 + (h % 20);
  return `hsl(${hue}, ${sat}%, ${lit}%)`;
}

/* ------------------------------------------------------------------ */
/*  City data                                                          */
/* ------------------------------------------------------------------ */

interface CityDatum {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

const CITIES: CityDatum[] = [
  { id: "sf",      label: "San Francisco", lat: 37.78,  lng: -122.44 },
  { id: "nyc",     label: "New York",      lat: 40.71,  lng: -74.01  },
  { id: "london",  label: "London",        lat: 51.51,  lng: -0.13   },
  { id: "paris",   label: "Paris",         lat: 48.86,  lng: 2.35    },
  { id: "tokyo",   label: "Tokyo",         lat: 35.68,  lng: 139.65  },
  { id: "shanghai",label: "Shanghai",      lat: 31.23,  lng: 121.47  },
  { id: "delhi",   label: "Delhi",         lat: 28.61,  lng: 77.23   },
  { id: "sydney",  label: "Sydney",        lat: -33.87, lng: 151.21  },
  { id: "saopaulo",label: "São Paulo",    lat: -23.55, lng: -46.63  },
  { id: "moscow",  label: "Moscow",        lat: 55.76,  lng: 37.62   },
  { id: "dubai",   label: "Dubai",         lat: 25.20,  lng: 55.27   },
  { id: "capeown", label: "Cape Town",     lat: -33.92, lng: 18.42   },
  { id: "mexico",  label: "Mexico City",   lat: 19.43,  lng: -99.13  },
  { id: "singapore",label: "Singapore",    lat: 1.35,   lng: 103.82  },
  { id: "istanbul",label: "Istanbul",      lat: 41.01,  lng: 28.96   },
];

/** Decorative flight arcs between city pairs. */
const DECO_ARCS = [
  { startLat: 37.78,  startLng: -122.44, endLat: 35.68,  endLng: 139.65 },
  { startLat: 40.71,  startLng: -74.01,  endLat: 51.51,  endLng: -0.13  },
  { startLat: 51.51,  startLng: -0.13,   endLat: 48.86,  endLng: 2.35   },
  { startLat: 35.68,  startLng: 139.65,  endLat: -33.87, endLng: 151.21 },
  { startLat: 28.61,  startLng: 77.23,   endLat: 31.23,  endLng: 121.47 },
  { startLat: 25.20,  startLng: 55.27,   endLat: 1.35,   endLng: 103.82 },
  { startLat: -23.55, startLng: -46.63,  endLat: 40.71,  endLng: -74.01 },
  { startLat: 19.43,  startLng: -99.13,  endLat: 55.76,  endLng: 37.62  },
  { startLat: 41.01,  startLng: 28.96,   endLat: 25.20,  endLng: 55.27  },
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

const GLOBE_IMG =
  "https://unpkg.com/three-globe@2.45.2/example/img/earth-blue-marble.jpg";
const COUNTRIES_GEOJSON =
  "https://unpkg.com/three-globe@2.45.2/example/datasets/ne_110m_land.json";

interface GlobeWithCountriesProps {
  className?: string;
}

export default function GlobeWithCountries({ className = "" }: GlobeWithCountriesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<GlobeInstance | null>(null);
  const rafRef = useRef<number>(0);
  const { peers, selfPosition, connectionStatus, peerCount } =
    useGlobeWebSocket();

  const [containerSize, setContainerSize] = useState({ w: 400, h: 400 });
  const [countries, setCountries] = useState<any[]>([]);
  const [webglFailed, setWebglFailed] = useState(false);

  const peersRef = useRef(peers);
  peersRef.current = peers;
  const selfRef = useRef(selfPosition);
  selfRef.current = selfPosition;

  /* ---------------------------------------------------------------- */
  /*  Fetch country GeoJSON                                            */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    fetch(COUNTRIES_GEOJSON)
      .then((r) => r.json())
      .then((geojson) => {
        if (geojson.features) {
          setCountries(geojson.features);
        }
      })
      .catch(() => {
        // Silently fall back — globe renders without polygons
      });
  }, []);

  /* ---------------------------------------------------------------- */
  /*  ResizeObserver                                                   */
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
  /*  Create / update globe on size change                             */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const el = containerRef.current;
    if (!el || webglFailed || countries.length === 0) return;

    // Destroy previous instance
    if (globeRef.current) {
      globeRef.current._destructor();
      globeRef.current = null;
    }

    const size = containerSize.w;

    const globe = (Globe as any)()
      .width(size)
      .height(size)
      .backgroundColor("rgba(0,0,0,0)")
      .globeImageUrl(GLOBE_IMG)
      .globeMaterial({
        specular: 0.05,
        shininess: 5,
      })
      // Country polygons
      .polygonsData(countries)
      .polygonCapColor((feat: any) => countryColor(feat?.properties?.name ?? ""))
      .polygonSideColor(() => "rgba(0,0,0,0)")
      .polygonStrokeColor(() => "rgba(255,255,255,0.15)")
      .polygonAltitude(0.01)
      // City points
      .pointsData(CITIES)
      .pointColor(() => "rgba(100, 200, 255, 0.9)")
      .pointAltitude(0.04)
      .pointRadius(0.35)
      // Labels
      .labelsData(CITIES)
      .labelLat((d: any) => d.lat)
      .labelLng((d: any) => d.lng)
      .labelText((d: any) => d.label)
      .labelColor(() => "rgba(255,255,255,0.8)")
      .labelDotRadius(0.25)
      .labelSize(1.2)
      .labelResolution(6)
      // Arcs (decorative)
      .arcsData(DECO_ARCS)
      .arcColor(() => ["rgba(100, 180, 255, 0.3)", "rgba(100, 180, 255, 0.05)"])
      .arcStroke(0.4)
      .arcDashLength(0.4)
      .arcDashGap(0.2)
      .arcDashAnimateTime(3000)
      .arcAltitudeAuto(true);

    globe(el);

    globeRef.current = globe;

    // Auto-rotation
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.5;

    // Prevent default drag (orbit controls handle this)
    globe.controls().enableZoom = false;

    // Monitor WebGL context loss
    const renderer = globe.renderer();
    const onCtxLost = (e: Event) => { e.preventDefault(); setWebglFailed(true); };
    renderer.domElement.addEventListener("webglcontextlost", onCtxLost);

    return () => {
      cancelAnimationFrame(rafRef.current);
      renderer.domElement.removeEventListener("webglcontextlost", onCtxLost);
      if (globeRef.current) {
        globeRef.current._destructor();
        globeRef.current = null;
      }
    };
  }, [containerSize, countries, webglFailed]);

  /* ---------------------------------------------------------------- */
  /*  Update markers + arcs dynamically (peers / self move)            */
  /* ---------------------------------------------------------------- */

  useEffect(() => {
    const g = globeRef.current;
    if (!g) return;

    // Build point data: cities + self + peers
    const points = [...CITIES];

    const self = selfRef.current;
    if (self) {
      points.push({
        id: "_self",
        label: "You",
        lat: self.lat,
        lng: self.lng,
      } as CityDatum);
    }

    for (const peer of peersRef.current) {
      points.push({
        id: `peer_${peer.lat}_${peer.lng}`,
        label: "",
        lat: peer.lat,
        lng: peer.lng,
      });
    }

    g.pointsData(points)
      .pointColor((d: any) =>
        d.id === "_self" ? "rgba(80, 255, 255, 1)" : "rgba(100, 200, 255, 0.9)",
      )
      .pointAltitude((d: any) => (d.id === "_self" ? 0.06 : 0.04))
      .pointRadius((d: any) => (d.id === "_self" ? 0.55 : 0.35));

    // Build arcs: decorative + self→peer
    const arcs = [...DECO_ARCS];
    if (self) {
      for (const peer of peersRef.current) {
        arcs.push({
          startLat: self.lat,
          startLng: self.lng,
          endLat: peer.lat,
          endLng: peer.lng,
        });
      }
    }

    g.arcsData(arcs)
      .arcColor(
        (d: any) =>
          d.startLat === self?.lat && d.startLng === self?.lng
            ? ["rgba(80, 255, 255, 0.6)", "rgba(80, 255, 255, 0.05)"]
            : ["rgba(100, 180, 255, 0.3)", "rgba(100, 180, 255, 0.05)"],
      );
  }, [peers, selfPosition]);

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
          className="pointer-events-none absolute left-1/2 top-1/2 z-0 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-30"
          style={{
            width: "90%",
            height: "90%",
            background:
              "radial-gradient(circle at center, rgba(100,140,255,0.1) 0%, rgba(60,80,200,0.04) 40%, transparent 70%)",
            filter: "blur(25px)",
          }}
        />

        {/* Globe container */}
        <div
          className={`relative z-[1] h-full w-full ${webglFailed ? "hidden" : "block"}`}
          style={{ contain: "layout paint size" }}
        />

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
