import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { PWAPrompt } from "./components/PWAPrompt";
import { publicRoutes } from "./routes/PublicRoutes";
import { adminRoutes } from "./routes/AdminRoutes";
import PublicClientLayout from "./components/PublicClientLayout";
import { authRoutes } from "./routes/AuthRoutes";
import { Suspense } from "react";

function Router() {
  return (
    <Suspense fallback={<div className="text-center m-auto h-screen">Loading ...</div>}>
      <Routes>
        <Route element={<PublicClientLayout />}>
          {publicRoutes.map(route => (
            <Route key={route.path} path={route.path} element={<route.component />} />
          ))}
        </Route>

        {authRoutes.map(route => (
          <Route key={route.path} path={route.path} element={<route.component />} />
        ))}

        {adminRoutes.map(route => (
          <Route key={route.path} path={route.path} element={<route.component />} />
        ))}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <PWAPrompt />
          <BrowserRouter>
            <Router />
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
