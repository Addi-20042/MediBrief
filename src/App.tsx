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
import RouteErrorBoundary from "@/components/RouteErrorBoundary";

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
const Admin = lazy(() => import("./pages/Admin"));
const Settings = lazy(() => import("./pages/Settings"));
const HealthTracking = lazy(() => import("./pages/HealthTracking"));
const Emergency = lazy(() => import("./pages/Emergency"));
const FirstAid = lazy(() => import("./pages/FirstAid"));
const Profile = lazy(() => import("./pages/Profile"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const MedicalDisclaimer = lazy(() => import("./pages/MedicalDisclaimer"));
const Contact = lazy(() => import("./pages/Contact"));
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
        <Route path="/symptoms" element={<RouteErrorBoundary><Suspense fallback={<SkeletonPage><SymptomsSkeleton /></SkeletonPage>}><Symptoms /></Suspense></RouteErrorBoundary>} />
        <Route path="/upload" element={<RouteErrorBoundary><Suspense fallback={<SkeletonPage><UploadReportSkeleton /></SkeletonPage>}><UploadReport /></Suspense></RouteErrorBoundary>} />
        <Route path="/chatbot" element={<RouteErrorBoundary><Suspense fallback={<SkeletonPage><ChatbotSkeleton /></SkeletonPage>}><Chatbot /></Suspense></RouteErrorBoundary>} />
        <Route path="/learn" element={<RouteErrorBoundary><Suspense fallback={<SkeletonPage><LearnSkeleton /></SkeletonPage>}><Learn /></Suspense></RouteErrorBoundary>} />
        <Route path="/history" element={<RouteErrorBoundary><Suspense fallback={<SkeletonPage><HistorySkeleton /></SkeletonPage>}><History /></Suspense></RouteErrorBoundary>} />
        <Route path="/dashboard" element={<RouteErrorBoundary><Suspense fallback={<SkeletonPage><DashboardSkeleton /></SkeletonPage>}><Dashboard /></Suspense></RouteErrorBoundary>} />
        <Route path="/admin" element={<RouteErrorBoundary><Suspense fallback={<SkeletonPage><DashboardSkeleton /></SkeletonPage>}><Admin /></Suspense></RouteErrorBoundary>} />
        <Route path="/settings" element={<RouteErrorBoundary><Suspense fallback={<SkeletonPage><SettingsSkeleton /></SkeletonPage>}><Settings /></Suspense></RouteErrorBoundary>} />
        <Route path="/profile" element={<RouteErrorBoundary><Suspense fallback={<SkeletonPage><SettingsSkeleton /></SkeletonPage>}><Profile /></Suspense></RouteErrorBoundary>} />
        <Route path="/health-tracking" element={<RouteErrorBoundary><Suspense fallback={<SkeletonPage><HealthTrackingSkeleton /></SkeletonPage>}><HealthTracking /></Suspense></RouteErrorBoundary>} />
        <Route path="/emergency" element={<RouteErrorBoundary><Suspense fallback={<SkeletonPage><EmergencySkeleton /></SkeletonPage>}><Emergency /></Suspense></RouteErrorBoundary>} />
        <Route path="/first-aid" element={<RouteErrorBoundary><Suspense fallback={<SkeletonPage><EmergencySkeleton /></SkeletonPage>}><FirstAid /></Suspense></RouteErrorBoundary>} />
        <Route path="/privacy" element={<Suspense fallback={null}><Privacy /></Suspense>} />
        <Route path="/terms" element={<Suspense fallback={null}><Terms /></Suspense>} />
        <Route path="/medical-disclaimer" element={<Suspense fallback={null}><MedicalDisclaimer /></Suspense>} />
        <Route path="/contact" element={<Suspense fallback={null}><Contact /></Suspense>} />
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
