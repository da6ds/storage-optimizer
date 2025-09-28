import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronRight } from 'lucide-react';
import { useSimulation, UserGoal } from '../contexts/SimulationContext';
import { useI18n } from '../contexts/SimulationContext';

export default function SimulationOnboarding() {
  const { t, isLoading } = useI18n();
  const { setUserMode, setUserGoal, completeOnboarding } = useSimulation();
  const [selectedGoal, setSelectedGoal] = useState<UserGoal | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">{t('labels.loading')}</p>
        </div>
      </div>
    );
  }

  const handleGoalSelect = (goal: UserGoal) => {
    setSelectedGoal(goal);
  };

  const handleContinue = () => {
    if (selectedGoal) {
      // Set mode to 'standard' by default for simplified onboarding
      setUserMode('standard');
      setUserGoal(selectedGoal);
      completeOnboarding();
    }
  };

  const canContinue = selectedGoal !== null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{t('onboarding.title')}</h1>
          <p className="text-muted-foreground">{t('onboarding.subtitle')}</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl text-center">{t('onboarding.q_single')}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <RadioGroup 
              value={selectedGoal || ''} 
              onValueChange={(value) => handleGoalSelect(value as UserGoal)}
              className="space-y-4"
            >
              {(['view', 'suggest', 'plan'] as UserGoal[]).map((goal) => (
                <div key={goal} className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem 
                      value={goal} 
                      id={goal}
                      data-testid={`radio-goal-${goal}`}
                    />
                    <Label 
                      htmlFor={goal} 
                      className="font-medium cursor-pointer flex-1"
                    >
                      {t(`onboarding.goal.${goal}`)}
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground ml-7">
                    {t(`onboarding.goal_help.${goal}`)}
                  </p>
                </div>
              ))}
            </RadioGroup>
          </CardContent>

          <div className="flex justify-center p-6 pt-0">
            <Button
              onClick={handleContinue}
              disabled={!canContinue}
              data-testid="button-onboarding-continue"
              size="lg"
              className="min-w-48"
            >
              {t('onboarding.button_continue')}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            {t('onboarding.upgrade_footnote')}
          </p>
        </div>
      </div>
    </div>
  );
}