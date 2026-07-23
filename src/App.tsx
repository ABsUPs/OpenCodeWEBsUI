import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import UserProfile from "./pages/UserProfile";
import OrgShowcase from "./pages/OrgShowcase";
import Sandbox from "./pages/Sandbox";
import TemplateMarketplace from "./pages/TemplateMarketplace";
import CommunityHub from "./pages/CommunityHub";
import SecurityLanding from "./pages/SecurityLanding";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/u/:username" element={<UserProfile />} />
        <Route path="/o/:org/:company" element={<OrgShowcase />} />
        <Route path="/s/:org/:project" element={<Sandbox />} />
        <Route path="/T" element={<TemplateMarketplace />} />
        <Route path="/C" element={<CommunityHub />} />
        <Route path="/F" element={<SecurityLanding />} />
        <Route path="*" element={<SecurityLanding />} />
      </Route>
    </Routes>
  );
}
