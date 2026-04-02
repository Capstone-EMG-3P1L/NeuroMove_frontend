import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";

import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import Main from "@/pages/Main";
import Logs from "@/pages/Logs";
import LogDetail from "@/pages/LogDetail";
import CalibrationResult from "@/pages/calibration/Result";
import CalibrationStart from "@/pages/calibration/Start";
import CalibrationStep2 from "@/pages/calibration/Step2";
import CalibrationStep3 from "@/pages/calibration/Step3";
import CalibrationStep4 from "@/pages/calibration/Step4";
import CalibrationStep5 from "@/pages/calibration/Step5";

import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { clearUser } from "@/lib/userStore";

const queryClient = new QueryClient();

function ProtectedLayout({
  children,
  isAuthenticated,
  onLogout,
  showSidebar = true,
}: {
  children: React.ReactNode;
  isAuthenticated: boolean;
  onLogout?: () => void;
  showSidebar?: boolean;
}) {
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setLocation("/login");
    }
  }, [isAuthenticated, setLocation]);

  if (!isAuthenticated) return null;

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <AppSidebar onLogout={onLogout} />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [location] = useLocation();

  const handleLogin = () => setIsAuthenticated(true);
  const handleLogout = () => {
    setIsAuthenticated(false);
    clearUser();
  };

  return (
    <AnimatePresence mode="wait">
      <Switch location={location} key={location}>
        <Route path="/login">
          <Login onLogin={handleLogin} />
        </Route>
        <Route path="/signup">
          <Signup onSignup={handleLogin} />
        </Route>
        <Route path="/">
          <ProtectedLayout isAuthenticated={isAuthenticated} onLogout={handleLogout}>
            <Main />
          </ProtectedLayout>
        </Route>
        <Route path="/main">
          <ProtectedLayout isAuthenticated={isAuthenticated} onLogout={handleLogout}>
            <Main />
          </ProtectedLayout>
        </Route>
        <Route path="/logs">
          <ProtectedLayout isAuthenticated={isAuthenticated} onLogout={handleLogout}>
            <Logs />
          </ProtectedLayout>
        </Route>
        <Route path="/logs/detail">
          <ProtectedLayout isAuthenticated={isAuthenticated} onLogout={handleLogout}>
            <LogDetail />
          </ProtectedLayout>
        </Route>
        <Route path="/calibration/result">
          <ProtectedLayout isAuthenticated={isAuthenticated} onLogout={handleLogout}>
            <CalibrationResult />
          </ProtectedLayout>
        </Route>
        <Route path="/calibration/start">
          <ProtectedLayout isAuthenticated={isAuthenticated} showSidebar={false}>
            <CalibrationStart />
          </ProtectedLayout>
        </Route>
        <Route path="/calibration/step2">
          <ProtectedLayout isAuthenticated={isAuthenticated} showSidebar={false}>
            <CalibrationStep2 />
          </ProtectedLayout>
        </Route>
        <Route path="/calibration/step3">
          <ProtectedLayout isAuthenticated={isAuthenticated} showSidebar={false}>
            <CalibrationStep3 />
          </ProtectedLayout>
        </Route>
        <Route path="/calibration/step4">
          <ProtectedLayout isAuthenticated={isAuthenticated} showSidebar={false}>
            <CalibrationStep4 />
          </ProtectedLayout>
        </Route>
        <Route path="/calibration/step5">
          <ProtectedLayout isAuthenticated={isAuthenticated} showSidebar={false}>
            <CalibrationStep5 />
          </ProtectedLayout>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </AnimatePresence>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
