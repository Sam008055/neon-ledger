import { Toaster } from "@/components/ui/sonner";
import { VlyToolbar } from "../vly-toolbar-readonly.tsx";
import { InstrumentationProvider } from "@/instrumentation.tsx";
import AuthPage from "@/pages/Auth.tsx";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes, useLocation } from "react-router";
import "./index.css";
import Landing from "./pages/Landing.tsx";
import NotFound from "./pages/NotFound.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import DashboardOverview from "./pages/DashboardOverview.tsx";
import AccountsPage from "./pages/AccountsPage.tsx";
import AnalyticsPage from "./pages/AnalyticsPage.tsx";
import GoalsPage from "./pages/GoalsPage.tsx";
import AchievementsPage from "./pages/AchievementsPage.tsx";
import AIAssistantPage from "./pages/AIAssistantPage.tsx";
import "./types/global.d.ts";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);



function RouteSyncer() {
  const location = useLocation();
  useEffect(() => {
    window.parent.postMessage(
      { type: "iframe-route-change", path: location.pathname },
      "*",
    );
  }, [location.pathname]);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.data?.type === "navigate") {
        if (event.data.direction === "back") window.history.back();
        if (event.data.direction === "forward") window.history.forward();
      }
    }
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return null;
}


createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <VlyToolbar />
    <InstrumentationProvider>
      <ConvexAuthProvider client={convex}>
        <BrowserRouter>
          <RouteSyncer />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<DashboardOverview />} />
              <Route path="accounts" element={<AccountsPage />} />
              <Route path="analytics" element={<div className="container mx-auto px-4 py-8"><h1 className="text-2xl font-bold">Analytics - Coming Soon</h1></div>} />
              <Route path="goals" element={<div className="container mx-auto px-4 py-8"><h1 className="text-2xl font-bold">Goals - Coming Soon</h1></div>} />
              <Route path="achievements" element={<div className="container mx-auto px-4 py-8"><h1 className="text-2xl font-bold">Achievements - Coming Soon</h1></div>} />
              <Route path="ai-assistant" element={<div className="container mx-auto px-4 py-8"><h1 className="text-2xl font-bold">AI Assistant - Coming Soon</h1></div>} />
            </Route>
            <Route path="/auth" element={<AuthPage redirectAfterAuth="/dashboard" />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <Toaster />
      </ConvexAuthProvider>
    </InstrumentationProvider>
  </StrictMode>,
);