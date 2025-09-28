import { useState } from 'react';
import { Route, Switch, useLocation, useRoute } from 'wouter';
import PricingSelection from './PricingSelection';
import PaymentScreen from './PaymentScreen';
import UpgradeSuccess from './UpgradeSuccess';
import type { PricingPlan } from './types';

export default function UpgradeFlow() {
  const [, setLocation] = useLocation();
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);
  const [, params] = useRoute('/upgrade/:step?');

  const handlePlanSelect = (plan: PricingPlan) => {
    setSelectedPlan(plan);
    setLocation('/upgrade/payment');
  };

  const handlePaymentComplete = () => {
    setLocation('/upgrade/success');
  };

  const handleBackToApp = () => {
    setLocation('/');
  };

  // Determine which component to render based on the current path
  const currentStep = params?.step || '';

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'payment':
        return (
          <PaymentScreen 
            selectedPlan={selectedPlan} 
            onPaymentComplete={handlePaymentComplete}
            onBack={() => setLocation('/upgrade')}
          />
        );
      case 'success':
        return (
          <UpgradeSuccess 
            selectedPlan={selectedPlan}
            onBackToApp={handleBackToApp}
          />
        );
      default:
        return <PricingSelection onPlanSelect={handlePlanSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {renderCurrentStep()}
    </div>
  );
}