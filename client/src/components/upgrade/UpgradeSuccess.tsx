import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { useSimulation } from '../../contexts/SimulationContext';
import { formatCurrency } from '../../../../shared/simulation';
import type { PricingPlan } from './types';

interface UpgradeSuccessProps {
  selectedPlan: PricingPlan | null;
  onBackToApp: () => void;
}

export default function UpgradeSuccess({ selectedPlan, onBackToApp }: UpgradeSuccessProps) {
  const { getPotentialSavings } = useSimulation();
  const potentialSavings = getPotentialSavings();

  const planDetails = {
    'one-time': { name: 'Clean it once', price: '$10', period: 'one-time' },
    'monthly': { name: 'Keep it optimized', price: '$5', period: 'monthly' }
  };

  const currentPlan = selectedPlan ? planDetails[selectedPlan] : null;

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <CheckCircle className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl mb-2">Welcome to Pro!</CardTitle>
          <Badge variant="secondary" className="mx-auto">
            <Sparkles className="h-3 w-3 mr-1" />
            {currentPlan?.name || 'Pro Plan'}
          </Badge>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div>
            <p className="text-lg font-semibold">
              You're now saving {formatCurrency(potentialSavings)}/month
            </p>
            <p className="text-sm text-muted-foreground">
              Your storage optimization is now active
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-primary mr-2" />
              Automatic duplicate removal is enabled
            </div>
            <div className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-primary mr-2" />
              Storage cost optimization is active
            </div>
            <div className="flex items-center text-sm">
              <CheckCircle className="h-4 w-4 text-primary mr-2" />
              Monthly savings reports will be sent
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm">
              <strong>What happens next?</strong>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              We'll start optimizing your storage immediately. 
              You can monitor progress from the main dashboard.
            </p>
          </div>

          <Button 
            onClick={onBackToApp}
            className="w-full"
            size="lg"
            data-testid="button-back-to-app"
          >
            Start optimizing
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>

          <p className="text-xs text-muted-foreground">
            You can manage your subscription in Settings
          </p>
        </CardContent>
      </Card>
    </div>
  );
}