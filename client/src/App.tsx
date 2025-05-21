import { Switch, Route } from "wouter";
import { ClerkProviderWithRoutes } from "@/components/auth/ClerkProviderWithRoutes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/index";
import Dashboard from "@/pages/dashboard";
import Workspace from "@/pages/workspace";
import Onboarding from "@/pages/onboarding";
import TryDemo from "@/pages/try-demo";

function Router() {
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
  return (
    <ClerkProviderWithRoutes>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </ClerkProviderWithRoutes>
  );
}

export default App;
