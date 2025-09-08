import { Switch, Route } from "wouter";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/dashboard";
import Livestock from "@/pages/livestock";
import Finances from "@/pages/finances";
import Inventory from "@/pages/inventory";
import Equipment from "@/pages/equipment";
import Documents from "@/pages/documents";
import Reports from "@/pages/reports";
import Profile from "@/pages/profile";
import Settings from "@/pages/settings";
import Admin from "@/pages/admin";
import Manual from "@/pages/manual";
import NotFound from "@/pages/not-found";

export function AuthenticatedApp() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/livestock" component={Livestock} />
        <Route path="/finances" component={Finances} />
        <Route path="/inventory" component={Inventory} />
        <Route path="/equipment" component={Equipment} />
        <Route path="/documents" component={Documents} />
        <Route path="/reports" component={Reports} />
        <Route path="/profile" component={Profile} />
        <Route path="/settings" component={Settings} />
        <Route path="/admin" component={Admin} />
        <Route path="/manual" component={Manual} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}