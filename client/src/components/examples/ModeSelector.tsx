import { useState } from 'react';
import ModeSelector from '../ModeSelector';
import type { FamiliarityLevel, Goal } from '../Onboarding';

export default function ModeSelectorExample() {
  const [familiarity, setFamiliarity] = useState<FamiliarityLevel>('standard');
  const [goal, setGoal] = useState<Goal>('suggest');

  return (
    <div className="p-4">
      <ModeSelector
        familiarity={familiarity}
        goal={goal}
        onFamiliarityChange={setFamiliarity}
        onGoalChange={setGoal}
      />
    </div>
  );
}