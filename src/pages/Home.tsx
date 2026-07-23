import { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";

const GLOBE_CONFIG = {
  devicePixelRatio: 2,
  width: 800,
  height: 800,
  phi: 0,
  theta: 0.3,
  dark: 1,
  diffuse: 1.2,
  mapSamples: 16000,
  mapBrightness: 6,
  baseColor: [0.3, 0.3, 0.9] as [number, number, number],
  markerColor: [0.1, 0.8, 1.0] as [number, number, number],
  glowColor: [0.12, 0.12, 0.4] as [number, number, number],
  markers: [
    { location: [37.7749, -122.4194] as [number, number], size: 0.06 },
    { location: [40.7128, -74.006] as [number, number], size: 0.06 },
    { location: [51.5074, -0.1278] as [number, number], size: 0.05 },
    { location: [35.6762, 139.6503] as [number, number], size: 0.08 },
    { location: [48.8566, 2.3522] as [number, number], size: 0.05 },
    { location: [-33.8688, 151.2093] as [number, number], size: 0.04 },
    { location: [55.7558, 37.6173] as [number, number], size: 0.05 },
    { location: [1.3521, 103.8198] as [number, number], size: 0.04 },
    { location: [19.4326, -99.1332] as [number, number], size: 0.04 },
    { location: [-22.9068, -43.1729] as [number, number], size: 0.05 },
    { location: [52.52, 13.405] as [number, number], size: 0.04 },
    { location: [39.9042, 116.4074] as [number, number], size: 0.06 },
  ],
};

const STATS = [
  { label: "Active Nodes", value: "2,847" },
  { label: "Sandbox Deployments", value: "12,543" },
  { label: "Templates Shared", value: "891" },
  { label: "Community Members", value: "5,200+" },
] as const;

function GlobeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let phi = 0;

    const globe = createGlobe(canvas, {
      ...GLOBE_CONFIG,
      onRender: (state) => {
        state.phi = phi;
        phi += 0.003;
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="h-[400px] w-[400px] md:h-[600px] md:w-[600px]"
      style={{ contain: "layout paint size" }}
    />
  );
}

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative overflow-hidden">
      {/* Hero section */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center px-6">
        {/* Ambient gradient */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-brand-600/10 blur-[120px]" />
        </div>

        <div
          className={`relative z-10 flex flex-col items-center gap-12 transition-all duration-1000 ${
            isLoaded ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
          }`}
        >
          <div className="text-center">
            <div className="mb-4">
              <span className="badge">v1.0.0-EA</span>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl lg:text-7xl">
              <span className="text-brand-400">OpenCode</span>
              <span className="text-white/80">ABsUI</span>
              <span className="text-white/40">/UX</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-white/50 md:text-xl">
              Enterprise-grade OpenCode ecosystem plugin and hybrid infrastructure
              manager. Bridging local dev environments with 24/7 serverless cloud runtime.
            </p>
          </div>

          <GlobeCanvas />

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {STATS.map((stat) => (
              <div key={stat.label} className="card-surface text-center">
                <div className="text-2xl font-bold text-brand-400">{stat.value}</div>
                <div className="mt-1 text-sm text-white/40">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
