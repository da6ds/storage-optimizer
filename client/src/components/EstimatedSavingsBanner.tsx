import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react';
import { useSimulation } from '../contexts/SimulationContext';
import { formatCurrency } from '../../../shared/simulation';

interface EstimatedSavingsBannerProps {
  onUpgradeClick?: () => void;
}

export default function EstimatedSavingsBanner({ onUpgradeClick }: EstimatedSavingsBannerProps) {
  const { isProUser, getPotentialSavings } = useSimulation();
  
  // Don't show banner for pro users
  if (isProUser()) {
    return null;
  }

  const potentialSavings = getPotentialSavings();
  
  // Don't show banner if no savings are available
  if (potentialSavings <= 0) {
    return null;
  }

  const handleUpgradeClick = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else {
      // TODO: Navigate to upgrade flow (will implement in task 5)
      console.log('Navigate to upgrade flow');
    }
  };

  return (
    <Card className="border-2 border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 mb-4">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                You could save about {formatCurrency(potentialSavings)}/month
              </h3>
              <p className="text-sm text-muted-foreground">
                These are safe previews. Upgrade to apply them automatically.
              </p>
            </div>
          </div>
          <Button 
            onClick={handleUpgradeClick}
            className="shrink-0"
            data-testid="button-start-saving"
          >
            Start saving now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}