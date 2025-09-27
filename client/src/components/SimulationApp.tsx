import { Switch, Route } from 'wouter';
import { useSimulation, useRouting } from '../contexts/SimulationContext';
import SimulationOnboarding from './SimulationOnboarding';
import SimulationBottomNav from './SimulationBottomNav';
import MapView from './views/MapView';
import DuplicatesView from './views/DuplicatesView';
import CostsView from './views/CostsView';
import ActionsView from './views/ActionsView';
import DiagnosticsView from './views/DiagnosticsView';
import PlanView from './views/PlanView';
import ModeGoalIndicator from './ModeGoalIndicator';
import LoadingScreen from './LoadingScreen';

export default function SimulationApp() {
  const { onboardingComplete, isLoading, error } = useSimulation();
  const { getDefaultRoute } = useRouting();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-xl font-semibold text-destructive">Error Loading Data</h1>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Reload Application
          </button>
        </div>
      </div>
    );
  }

  if (!onboardingComplete) {
    return <SimulationOnboarding />;
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header with mode/goal indicator */}
      <header className="flex-none border-b bg-card">
        <div className="flex items-center justify-between p-3 md:p-4">
          <div>
            <h1 className="text-lg font-semibold">File Inventory Optimizer</h1>
            <p className="text-xs text-muted-foreground">Simulation Mode</p>
          </div>
          <ModeGoalIndicator />
        </div>
      </header>

      {/* Main content area with safe area padding */}
      <main className="flex-1 overflow-hidden pb-safe">
        <Switch>
          <Route path="/onboarding" component={SimulationOnboarding} />
          <Route path="/map" component={MapView} />
          <Route path="/duplicates" component={DuplicatesView} />
          <Route path="/costs" component={CostsView} />
          <Route path="/actions" component={ActionsView} />
          <Route path="/diagnostics" component={DiagnosticsView} />
          <Route path="/plan" component={PlanView} />
          <Route>
            {/* Default route based on mode/goal */}
            <RedirectToDefault />
          </Route>
        </Switch>
      </main>

      {/* Bottom navigation */}
      <SimulationBottomNav />
    </div>
  );
}

function RedirectToDefault() {
  const { getDefaultRoute } = useRouting();
  
  // Simple redirect using window.location
  // In a more complex app, you might use wouter's useLocation hook
  const defaultRoute = getDefaultRoute();
  
  if (window.location.pathname !== defaultRoute) {
    window.history.replaceState(null, '', defaultRoute);
    window.location.reload();
  }
  
  return null;
}