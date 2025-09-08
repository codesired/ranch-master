import { Switch, Route } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import LoadingSpinner from "@/components/shared/loading-spinner";
import { AuthenticatedApp } from "./AuthenticatedApp";
import LoginPage from "@/pages/login";
import NotFound from "@/pages/not-found";

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-light-green flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner className="h-12 w-12 mx-auto" />
          <p className="mt-4 text-dark-green">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <>
          <Route path="/" component={LoginPage} />
          <Route component={NotFound} />
        </>
      ) : (
        <>
          <Route path="/*" component={AuthenticatedApp} />
          <Route component={NotFound} />
        </>
      )}
    </Switch>
  );
}

export default AppRouter;