import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AnimatePresence } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext";
import { lazy, Suspense, useEffect } from "react";
import OfflineBanner from "@/components/OfflineBanner";
import ErrorBoundary from "@/components/ErrorBoundary";

// Skeleton imports
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";
import SymptomsSkeleton from "@/components/skeletons/SymptomsSkeleton";
import ChatbotSkeleton from "@/components/skeletons/ChatbotSkeleton";
import LearnSkeleton from "@/components/skeletons/LearnSkeleton";
import UploadReportSkeleton from "@/components/skeletons/UploadReportSkeleton";
import EmergencySkeleton from "@/components/skeletons/EmergencySkeleton";
import HealthTrackingSkeleton from "@/components/skeletons/HealthTrackingSkeleton";
import HistorySkeleton from "@/components/skeletons/HistorySkeleton";
import SettingsSkeleton from "@/components/skeletons/SettingsSkeleton";

// Lazy-loaded pages
const Index = lazy(() => import("./pages/Index"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const UpdatePassword = lazy(() => import("./pages/UpdatePassword"));
const Symptoms = lazy(() => import("./pages/Symptoms"));
const UploadReport = lazy(() => import("./pages/UploadReport"));
const Chatbot = lazy(() => import("./pages/Chatbot"));
const Learn = lazy(() => import("./pages/Learn"));
const History = lazy(() => import("./pages/History"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Settings = lazy(() => import("./pages/Settings"));
const HealthTracking = lazy(() => import("./pages/HealthTracking"));
const Emergency = lazy(() => import("./pages/Emergency"));
const FirstAid = lazy(() => import("./pages/FirstAid"));
const Profile = lazy(() => import("./pages/Profile"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const SkeletonPage = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);

const AnimatedRoutes = () => {
  const location = useLocation();

  // Register service worker in production; clean up stale ones in dev
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    if (import.meta.env.PROD) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
      return;
    }

    navigator.serviceWorker
      .getRegistrations()
      .then((regs) => regs.forEach((r) => r.unregister()))
      .catch(() => {});
  }, []);

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Suspense fallback={null}><Index /></Suspense>} />
        <Route path="/login" element={<Suspense fallback={null}><Login /></Suspense>} />
        <Route path="/signup" element={<Suspense fallback={null}><Signup /></Suspense>} />
        <Route path="/reset-password" element={<Suspense fallback={null}><ResetPassword /></Suspense>} />
        <Route path="/update-password" element={<Suspense fallback={null}><UpdatePassword /></Suspense>} />
        <Route path="/symptoms" element={<Suspense fallback={<SkeletonPage><SymptomsSkeleton /></SkeletonPage>}><Symptoms /></Suspense>} />
        <Route path="/upload" element={<Suspense fallback={<SkeletonPage><UploadReportSkeleton /></SkeletonPage>}><UploadReport /></Suspense>} />
        <Route path="/chatbot" element={<Suspense fallback={<SkeletonPage><ChatbotSkeleton /></SkeletonPage>}><Chatbot /></Suspense>} />
        <Route path="/learn" element={<Suspense fallback={<SkeletonPage><LearnSkeleton /></SkeletonPage>}><Learn /></Suspense>} />
        <Route path="/history" element={<Suspense fallback={<SkeletonPage><HistorySkeleton /></SkeletonPage>}><History /></Suspense>} />
        <Route path="/dashboard" element={<Suspense fallback={<SkeletonPage><DashboardSkeleton /></SkeletonPage>}><Dashboard /></Suspense>} />
        <Route path="/settings" element={<Suspense fallback={<SkeletonPage><SettingsSkeleton /></SkeletonPage>}><Settings /></Suspense>} />
        <Route path="/profile" element={<Suspense fallback={<SkeletonPage><SettingsSkeleton /></SkeletonPage>}><Profile /></Suspense>} />
        <Route path="/health-tracking" element={<Suspense fallback={<SkeletonPage><HealthTrackingSkeleton /></SkeletonPage>}><HealthTracking /></Suspense>} />
        <Route path="/emergency" element={<Suspense fallback={<SkeletonPage><EmergencySkeleton /></SkeletonPage>}><Emergency /></Suspense>} />
        <Route path="/first-aid" element={<Suspense fallback={<SkeletonPage><EmergencySkeleton /></SkeletonPage>}><FirstAid /></Suspense>} />
        <Route path="*" element={<Suspense fallback={null}><NotFound /></Suspense>} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <ErrorBoundary>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AuthProvider>
            <OfflineBanner />
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
              <AnimatedRoutes />
            </BrowserRouter>
          </AuthProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
