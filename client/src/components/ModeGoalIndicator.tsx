import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings } from 'lucide-react';
import { useSimulation } from '../contexts/SimulationContext';
import { useI18n } from '../contexts/SimulationContext';

export default function ModeGoalIndicator() {
  const { goal, resetOnboarding } = useSimulation();
  const { t } = useI18n();

  if (!goal) return null;

  return (
    <div className="flex items-center space-x-2">
      <Badge variant="outline" className="text-xs">
        {t(`goal_indicator.${goal}`)}
      </Badge>
      <Button
        variant="ghost"
        size="icon"
        onClick={resetOnboarding}
        className="h-8 w-8"
        data-testid="button-change-mode"
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
}