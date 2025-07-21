import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Livestock from "@/pages/livestock";
import Finances from "@/pages/finances";
import Inventory from "@/pages/inventory";
import Equipment from "@/pages/equipment";
import Documents from "@/pages/documents";
import Reports from "@/pages/reports";
import Profile from "@/pages/profile";
import Manual from "@/pages/manual";
import Admin from "@/pages/admin";
import Header from "@/components/layout/header";
import Navigation from "@/components/layout/navigation";
import MobileNav from "@/components/layout/mobile-nav";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-green flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-farm-green mx-auto"></div>
          <p className="mt-4 text-dark-green">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <div className="min-h-screen bg-light-green">
            <Header />
            <Navigation />
            <main className="container mx-auto px-4 py-6 pb-20 md:pb-6">
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/livestock" component={Livestock} />
                <Route path="/finances" component={Finances} />
                <Route path="/inventory" component={Inventory} />
                <Route path="/equipment" component={Equipment} />
                <Route path="/documents" component={Documents} />
                <Route path="/reports" component={Reports} />
                <Route path="/profile" component={Profile} />
                <Route path="/admin" component={Admin} />
                <Route path="/manual" component={Manual} />
                <Route component={NotFound} />
              </Switch>
            </main>
            <MobileNav />
          </div>
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;