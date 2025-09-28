import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  Map, 
  Copy, 
  DollarSign, 
  Zap
} from 'lucide-react';
import { useSimulation, useI18n } from '../contexts/SimulationContext';

const navItems = {
  map: { icon: Map, label: 'navigation.map' },
  duplicates: { icon: Copy, label: 'navigation.duplicates' },
  costs: { icon: DollarSign, label: 'navigation.costs' },
  actions: { icon: Zap, label: 'navigation.actions' }
};

export default function SimulationBottomNav() {
  const { t } = useI18n();
  const [location] = useLocation();

  // Fixed navigation: Map · Duplicates · Costs · Actions
  const fixedNavItems = ['map', 'duplicates', 'costs', 'actions'];

  return (
    <nav className="flex-none border-t bg-card">
      <div className="flex items-center justify-around p-2 pb-safe">
        {fixedNavItems.map((itemKey) => {
          const item = navItems[itemKey as keyof typeof navItems];
          if (!item) return null;

          const isActive = location === `/${itemKey}`;
          const Icon = item.icon;

          return (
            <Button
              key={itemKey}
              variant={isActive ? "default" : "ghost"}
              size="sm"
              className="flex flex-col h-12 w-16 px-1 py-1"
              data-testid={`nav-${itemKey}`}
              asChild
            >
              <Link href={`/${itemKey}`} aria-current={isActive ? "page" : undefined}>
                <Icon className="h-4 w-4 mb-1" />
                <span className="text-xs leading-none">
                  {t(item.label)}
                </span>
              </Link>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}