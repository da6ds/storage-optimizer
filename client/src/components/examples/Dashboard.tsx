import { useState } from 'react';
import Dashboard from '../Dashboard';
import type { FamiliarityLevel, Goal } from '../Onboarding';

export default function DashboardExample() {
  const [familiarity, setFamiliarity] = useState<FamiliarityLevel>('easy');
  const [goal, setGoal] = useState<Goal>('suggest');
  
  const handleResetOnboarding = () => {
    console.log('Reset onboarding');
  };
  
  return (
    <Dashboard
      familiarity={familiarity}
      goal={goal}
      onFamiliarityChange={setFamiliarity}
      onGoalChange={setGoal}
      onResetOnboarding={handleResetOnboarding}
    />
  );
}