import { lazy, Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";

// Route-level code splitting — each page loads only when navigated to
const Home = lazy(() => import("./pages/Home"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const OrgShowcase = lazy(() => import("./pages/OrgShowcase"));
const Sandbox = lazy(() => import("./pages/Sandbox"));
const TemplateMarketplace = lazy(() => import("./pages/TemplateMarketplace"));
const CommunityHub = lazy(() => import("./pages/CommunityHub"));
const CommunityHubIndex = lazy(() => import("./pages/CommunityHubIndex"));
const Servers = lazy(() => import("./pages/Servers"));
const Users = lazy(() => import("./pages/Users"));
const SecurityLanding = lazy(() => import("./pages/SecurityLanding"));

// AG pages use direct imports (lazy loading not working for /ag route tree)
import AGDashboard from "./pages/AGDashboard";
import AGPrivacy from "./pages/AGPrivacy";
import AGTerms from "./pages/AGTerms";
import AGLicense from "./pages/AGLicense";
import AGFeatures from "./pages/AGFeatures";

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
          <Route path="/C/💬" element={<CommunityHub />} />
          <Route path="/C/:username/:project" element={<CommunityHub />} />
          <Route path="/C/:username" element={<CommunityHub />} />
          <Route path="/C" element={<CommunityHubIndex />} />
          <Route path="/S" element={<Servers />} />
          <Route path="/U" element={<Users />} />
          <Route path="/F" element={<SecurityLanding />} />
          {/* Trailing-slash redirects for /ag/ routes */}
          <Route path="/ag/" element={<Navigate to="/ag" replace />} />
          <Route path="/ag/privacy/" element={<Navigate to="/ag/privacy" replace />} />
          <Route path="/ag/terms/" element={<Navigate to="/ag/terms" replace />} />
          <Route path="/ag/license/" element={<Navigate to="/ag/license" replace />} />
          <Route path="/ag/features/" element={<Navigate to="/ag/features" replace />} />

          <Route path="/ag" element={<AGDashboard />} />
          <Route path="/ag/privacy" element={<AGPrivacy />} />
          <Route path="/ag/terms" element={<AGTerms />} />
          <Route path="/ag/license" element={<AGLicense />} />
          <Route path="/ag/features" element={<AGFeatures />} />
          <Route path="*" element={<SecurityLanding />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
