import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Sparkles, Zap } from 'lucide-react';
import { useSimulation } from '../../contexts/SimulationContext';
import { formatCurrency } from '../../../../shared/simulation';
import type { PricingPlan } from './types';

interface PricingSelectionProps {
  onPlanSelect: (plan: PricingPlan) => void;
}

export default function PricingSelection({ onPlanSelect }: PricingSelectionProps) {
  const { getPotentialSavings } = useSimulation();
  const potentialSavings = getPotentialSavings();

  const features = [
    'Apply all optimizations automatically',
    'Remove duplicate files safely', 
    'Optimize storage costs',
    'Get detailed savings reports',
    'Priority support'
  ];

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-lg text-muted-foreground mb-2">
          You could save about {formatCurrency(potentialSavings)}/month
        </p>
        <p className="text-sm text-muted-foreground">
          Start optimizing your storage today
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* One-time Plan */}
        <Card className="relative border-2 hover-elevate">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-2">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl mb-2">Clean it once</CardTitle>
            <div className="text-3xl font-bold">$10</div>
            <div className="text-sm text-muted-foreground">one-time payment</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {features.slice(0, 3).map((feature, index) => (
                <li key={index} className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-primary mr-2 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button 
              onClick={() => onPlanSelect('one-time')}
              className="w-full"
              variant="outline"
              size="lg"
              data-testid="button-select-one-time"
            >
              Clean it once
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Perfect for a one-time cleanup
            </p>
          </CardContent>
        </Card>

        {/* Monthly Plan */}
        <Card className="relative border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10 hover-elevate">
          <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
            Recommended
          </Badge>
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-2">
              <Sparkles className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-xl mb-2">Keep it optimized</CardTitle>
            <div className="text-3xl font-bold">$5</div>
            <div className="text-sm text-muted-foreground">per month</div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {features.map((feature, index) => (
                <li key={index} className="flex items-center text-sm">
                  <Check className="h-4 w-4 text-primary mr-2 shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button 
              onClick={() => onPlanSelect('monthly')}
              className="w-full"
              size="lg"
              data-testid="button-select-monthly"
            >
              Keep it optimized
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Continuous optimization and monitoring
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom info */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          All plans include a 30-day money-back guarantee • Cancel anytime
        </p>
      </div>
    </div>
  );
}