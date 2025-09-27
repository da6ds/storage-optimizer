import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  Map, 
  Copy, 
  DollarSign, 
  Zap, 
  Terminal,
  FileCheck
} from 'lucide-react';
import { useSimulation, useRouting } from '../contexts/SimulationContext';
import { useI18n } from '../contexts/SimulationContext';

const navItems = {
  map: { icon: Map, label: 'navigation.map' },
  duplicates: { icon: Copy, label: 'navigation.duplicates' },
  costs: { icon: DollarSign, label: 'navigation.costs' },
  actions: { icon: Zap, label: 'navigation.actions' },
  diagnostics: { icon: Terminal, label: 'navigation.diagnostics' },
  plan: { icon: FileCheck, label: 'navigation.plan' }
};

export default function SimulationBottomNav() {
  const { mode, goal } = useSimulation();
  const { getBottomNavOrder } = useRouting();
  const { t } = useI18n();
  const [location] = useLocation();

  if (!mode || !goal) return null;

  const navOrder = getBottomNavOrder();
  const visibleNavItems = navOrder.slice(0, 4); // Show max 4 tabs for mobile

  return (
    <nav className="flex-none border-t bg-card">
      <div className="flex items-center justify-around p-2 pb-safe">
        {visibleNavItems.map((itemKey) => {
          const item = navItems[itemKey as keyof typeof navItems];
          if (!item) return null;

          const isActive = location === `/${itemKey}`;
          const Icon = item.icon;

          return (
            <Link key={itemKey} href={`/${itemKey}`}>
              <Button
                variant={isActive ? "default" : "ghost"}
                size="sm"
                className="flex flex-col h-12 w-16 px-1 py-1"
                data-testid={`nav-${itemKey}`}
              >
                <Icon className="h-4 w-4 mb-1" />
                <span className="text-xs leading-none">
                  {t(item.label)}
                </span>
              </Button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}