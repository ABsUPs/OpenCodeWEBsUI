import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

// Route-level code splitting — each page loads only when navigated to
const Home = lazy(() => import("./pages/Home"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const OrgShowcase = lazy(() => import("./pages/OrgShowcase"));
const Sandbox = lazy(() => import("./pages/Sandbox"));
const TemplateMarketplace = lazy(() => import("./pages/TemplateMarketplace"));
const CommunityHub = lazy(() => import("./pages/CommunityHub"));
const Servers = lazy(() => import("./pages/Servers"));
const SecurityLanding = lazy(() => import("./pages/SecurityLanding"));

// Minimal loading state — just a subtle pulse so layout stays stable
function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-400 border-t-transparent" />
        <span className="text-sm text-white/30">Loading…</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/u/:username" element={<UserProfile />} />
          <Route path="/o/:org/:company" element={<OrgShowcase />} />
          <Route path="/s/:org/:project" element={<Sandbox />} />
          <Route path="/T" element={<TemplateMarketplace />} />
          <Route path="/C" element={<CommunityHub />} />
          <Route path="/S" element={<Servers />} />
          <Route path="/F" element={<SecurityLanding />} />
          <Route path="*" element={<SecurityLanding />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
