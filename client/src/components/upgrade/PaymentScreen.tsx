import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CreditCard, Lock } from 'lucide-react';
import { useSimulation } from '../../contexts/SimulationContext';
import type { PricingPlan } from './types';

interface PaymentScreenProps {
  selectedPlan: PricingPlan | null;
  onPaymentComplete: () => void;
  onBack: () => void;
}

export default function PaymentScreen({ selectedPlan, onPaymentComplete, onBack }: PaymentScreenProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { upgradeToOneTime, upgradeToMonthly } = useSimulation();

  const planDetails = {
    'one-time': { name: 'Clean it once', price: '$10', period: 'one-time' },
    'monthly': { name: 'Keep it optimized', price: '$5', period: 'monthly' }
  };

  const currentPlan = selectedPlan ? planDetails[selectedPlan] : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Actually upgrade the user's subscription
    if (selectedPlan === 'one-time') {
      upgradeToOneTime();
    } else if (selectedPlan === 'monthly') {
      upgradeToMonthly();
    }
    
    onPaymentComplete();
  };

  if (!currentPlan) {
    return (
      <div className="container max-w-md mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p>No plan selected. Please go back and select a plan.</p>
            <Button onClick={onBack} className="mt-4">Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto px-4 py-8">
      {/* Back button */}
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="mb-4"
        data-testid="button-back-to-pricing"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to pricing
      </Button>

      {/* Payment form */}
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <CreditCard className="h-5 w-5" />
            Complete Your Purchase
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {currentPlan.name} - {currentPlan.price} {currentPlan.period === 'monthly' ? '/month' : ''}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number</Label>
              <Input 
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                required
                data-testid="input-card-number"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expiry">Expiry</Label>
                <Input 
                  id="expiry"
                  placeholder="MM/YY"
                  required
                  data-testid="input-expiry"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cvc">CVC</Label>
                <Input 
                  id="cvc"
                  placeholder="123"
                  required
                  data-testid="input-cvc"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Cardholder Name</Label>
              <Input 
                id="name"
                placeholder="John Doe"
                required
                data-testid="input-cardholder-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email"
                placeholder="john@example.com"
                required
                data-testid="input-email"
              />
            </div>

            <Button 
              type="submit"
              className="w-full"
              disabled={isProcessing}
              data-testid="button-complete-payment"
            >
              {isProcessing ? 'Processing...' : `Pay ${currentPlan.price}`}
            </Button>

            <div className="flex items-center justify-center text-xs text-muted-foreground mt-4">
              <Lock className="h-3 w-3 mr-1" />
              Secure checkout powered by Stripe
            </div>
          </form>
        </CardContent>
      </Card>

      <p className="text-xs text-center text-muted-foreground mt-4">
        This is a demo app. No real payment will be processed.
      </p>
    </div>
  );
}