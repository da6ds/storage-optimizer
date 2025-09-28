import { Switch, Route, useLocation } from 'wouter';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { useSimulation, useRouting, useI18n } from '../contexts/SimulationContext';
import SimulationBottomNav from './SimulationBottomNav';
import PersistentChecklist from './PersistentChecklist';
import MapView from './views/MapView';
import DuplicatesView from './views/DuplicatesView';
import CostsView from './views/CostsView';
import ActionsView from './views/ActionsView';
import DiagnosticsView from './views/DiagnosticsView';
import PlanView from './views/PlanView';
import ModeGoalIndicator from './ModeGoalIndicator';
import LoadingScreen from './LoadingScreen';
import UpgradeFlow from './upgrade/UpgradeFlow';
import SettingsPage from './pages/SettingsPage';

export default function SimulationApp() {
  const { onboardingComplete, isLoading, error, showDetails, toggleDetails, mode, goal, setUserMode, setUserGoal, completeOnboarding } = useSimulation();
  const { getDefaultRoute } = useRouting();
  const { t } = useI18n();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-xl font-semibold text-destructive">{t('errors.loading_data_title')}</h1>
          <p className="text-muted-foreground">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            {t('errors.reload_button')}
          </button>
        </div>
      </div>
    );
  }

  // Skip modal onboarding - users interact with persistent checklist instead
  // Set default mode/goal and mark onboarding complete if not set to ensure app functionality
  useEffect(() => {
    if (!mode) {
      setUserMode('standard'); // Default to standard mode
    }
    if (!goal) {
      setUserGoal('suggest'); // Default to suggest goal
    }
    if (!onboardingComplete) {
      // Mark onboarding complete since we use persistent checklist
      completeOnboarding();
    }
  }, [mode, goal, onboardingComplete, setUserMode, setUserGoal, completeOnboarding]);

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header with mode/goal indicator */}
      <header className="flex-none border-b bg-card">
        <div className="flex items-center justify-between p-3 md:p-4">
          <div>
            <h1 className="text-lg font-semibold">{t('app.title')}</h1>
            <p className="text-xs text-muted-foreground">{t('app.subtitle')}</p>
          </div>
          <div className="flex items-center gap-2">
            <ModeGoalIndicator />
            <Button 
              variant="ghost" 
              size="sm"
              className="text-xs"
              onClick={toggleDetails}
              data-testid="button-details-toggle"
            >
              Details {showDetails ? '☑' : '☐'}
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setLocation('/settings')}
              data-testid="button-settings"
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Persistent checklist */}
      <PersistentChecklist />

      {/* Main content area with safe area padding */}
      <main className="flex-1 overflow-hidden pb-safe">
        <Switch>
          <Route path="/settings" component={SettingsPage} />
          <Route path="/upgrade" component={UpgradeFlow} />
          <Route path="/upgrade/:subpath*" component={UpgradeFlow} />
          <Route path="/map" component={MapView} />
          <Route path="/duplicates" component={DuplicatesView} />
          <Route path="/costs" component={CostsView} />
          <Route path="/actions" component={ActionsView} />
          <Route path="/diagnostics" component={DiagnosticsView} />
          <Route path="/plan" component={PlanView} />
          <Route>
            {/* Default route - redirect to map */}
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
  const [location, setLocation] = useLocation();
  
  // Use wouter navigation instead of window.location.reload to avoid full page reload
  const defaultRoute = getDefaultRoute();
  
  // Fix: useEffect must be called unconditionally at top level (Rules of Hooks)
  useEffect(() => {
    if (location !== defaultRoute) {
      // Use replace: true to avoid back button loops
      setLocation(defaultRoute, { replace: true });
    }
  }, [defaultRoute, location, setLocation]);
  
  return null;
}