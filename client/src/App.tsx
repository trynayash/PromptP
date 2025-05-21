import { Switch, Route } from "wouter";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/index";
import Dashboard from "@/pages/dashboard";
import Workspace from "@/pages/workspace";
import Onboarding from "@/pages/onboarding";
import TryDemo from "@/pages/try-demo";
import { useLocation } from "wouter";

// Public routes that don't require authentication
const publicPages = ["/", "/try-demo"];

function Router() {
  const [location] = useLocation();
  const isPublicPage = publicPages.includes(location);

  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/workspace" component={Workspace} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/try-demo" component={TryDemo} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  const isPublicPage = publicPages.includes(location);

  return (
    <TooltipProvider>
      <Toaster />
      {isPublicPage ? (
        <Router />
      ) : (
        <>
          <SignedIn>
            <Router />
          </SignedIn>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
        </>
      )}
    </TooltipProvider>
  );
}

export default App;
