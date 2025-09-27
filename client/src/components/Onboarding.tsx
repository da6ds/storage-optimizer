import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export type FamiliarityLevel = 'easy' | 'standard' | 'pro';
export type Goal = 'view' | 'suggest' | 'plan';

export interface OnboardingData {
  familiarity: FamiliarityLevel;
  goal: Goal;
}

interface OnboardingProps {
  onComplete: (data: OnboardingData) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [familiarity, setFamiliarity] = useState<FamiliarityLevel | null>(null);
  const [goal, setGoal] = useState<Goal | null>(null);

  const handleFamiliaritySelect = (level: FamiliarityLevel) => {
    setFamiliarity(level);
    setStep(2);
  };

  const handleGoalSelect = (selectedGoal: Goal) => {
    setGoal(selectedGoal);
    if (familiarity) {
      onComplete({ familiarity, goal: selectedGoal });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md" data-testid="onboarding-card">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {step === 1 ? 'Getting Started' : 'What\'s Your Goal?'}
          </CardTitle>
          <div className="flex justify-center gap-2 mt-4">
            <Badge variant={step === 1 ? "default" : "secondary"}>1</Badge>
            <Badge variant={step === 2 ? "default" : "secondary"}>2</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 1 && (
            <>
              <p className="text-center text-muted-foreground mb-6">
                How familiar are you with file storage and cloud services?
              </p>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 text-left hover-elevate"
                  onClick={() => handleFamiliaritySelect('easy')}
                  data-testid="button-familiarity-easy"
                >
                  <div>
                    <div className="font-medium">I'm not technical</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Keep it simple and explain things clearly
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 text-left hover-elevate"
                  onClick={() => handleFamiliaritySelect('standard')}
                  data-testid="button-familiarity-standard"
                >
                  <div>
                    <div className="font-medium">I'm comfortable with tech</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Show me the details and options
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 text-left hover-elevate"
                  onClick={() => handleFamiliaritySelect('pro')}
                  data-testid="button-familiarity-pro"
                >
                  <div>
                    <div className="font-medium">I work with systems/code</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Give me all the data and controls
                    </div>
                  </div>
                </Button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-center text-muted-foreground mb-6">
                What do you want to do today?
              </p>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 text-left hover-elevate"
                  onClick={() => handleGoalSelect('view')}
                  data-testid="button-goal-view"
                >
                  <div>
                    <div className="font-medium">Just show me where my stuff is</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      View your storage overview
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 text-left hover-elevate"
                  onClick={() => handleGoalSelect('suggest')}
                  data-testid="button-goal-suggest"
                >
                  <div>
                    <div className="font-medium">Recommend ways to save money</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Get optimization suggestions
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 text-left hover-elevate"
                  onClick={() => handleGoalSelect('plan')}
                  data-testid="button-goal-plan"
                >
                  <div>
                    <div className="font-medium">Create a step-by-step plan to do it for me</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Simulation only—no changes made
                    </div>
                  </div>
                </Button>
              </div>
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                className="w-full mt-4"
                data-testid="button-back"
              >
                Back
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}