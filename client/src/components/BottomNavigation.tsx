import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Map, Copy, DollarSign, Zap } from 'lucide-react';

export type NavTab = 'map' | 'duplicates' | 'costs' | 'actions';

interface BottomNavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  duplicateCount?: number;
  savingsAmount?: number;
}

const navItems = [
  { id: 'map' as NavTab, label: 'Map', icon: Map },
  { id: 'duplicates' as NavTab, label: 'Duplicates', icon: Copy },
  { id: 'costs' as NavTab, label: 'Costs', icon: DollarSign },
  { id: 'actions' as NavTab, label: 'Actions', icon: Zap },
];

export default function BottomNavigation({ 
  activeTab, 
  onTabChange, 
  duplicateCount, 
  savingsAmount 
}: BottomNavigationProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border safe-area-pb">
      <div className="flex justify-around items-center py-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <Button
              key={item.id}
              variant="ghost"
              size="sm"
              className={`flex flex-col items-center gap-1 min-h-12 px-3 relative hover-elevate ${
                isActive ? 'text-primary' : 'text-muted-foreground'
              }`}
              onClick={() => onTabChange(item.id)}
              data-testid={`nav-${item.id}`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.id === 'duplicates' && duplicateCount && duplicateCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center">
                    {duplicateCount > 99 ? '99+' : duplicateCount}
                  </Badge>
                )}
                {item.id === 'actions' && savingsAmount && savingsAmount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center bg-chart-2">
                    $
                  </Badge>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
}