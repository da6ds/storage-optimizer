import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useSimulation, UserMode, UserGoal } from '../contexts/SimulationContext';
import { useI18n } from '../contexts/SimulationContext';

export default function SimulationOnboarding() {
  const { t, isLoading } = useI18n();
  const { setUserMode, setUserGoal, completeOnboarding } = useSimulation();
  const [step, setStep] = useState(1);
  const [selectedMode, setSelectedMode] = useState<UserMode | null>(null);
  const [selectedGoal, setSelectedGoal] = useState<UserGoal | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleModeSelect = (mode: UserMode) => {
    setSelectedMode(mode);
  };

  const handleGoalSelect = (goal: UserGoal) => {
    setSelectedGoal(goal);
  };

  const handleNext = () => {
    if (step === 1 && selectedMode) {
      setUserMode(selectedMode);
      setStep(2);
    } else if (step === 2 && selectedGoal) {
      setUserGoal(selectedGoal);
      completeOnboarding();
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const canContinue = (step === 1 && selectedMode) || (step === 2 && selectedGoal);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">{t('onboarding.title')}</h1>
          <p className="text-muted-foreground">{t('onboarding.subtitle')}</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  1
                </div>
                <div className={`w-8 h-1 ${step >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  2
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {step}/2
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <CardTitle className="text-lg">{t('onboarding.q_familiarity')}</CardTitle>
                  <CardDescription className="mt-1">
                    This helps us customize your experience
                  </CardDescription>
                </div>

                <RadioGroup 
                  value={selectedMode || ''} 
                  onValueChange={(value) => handleModeSelect(value as UserMode)}
                  className="space-y-3"
                >
                  {(['easy', 'standard', 'pro'] as UserMode[]).map((mode) => (
                    <div key={mode} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem 
                          value={mode} 
                          id={mode}
                          data-testid={`radio-familiarity-${mode}`}
                        />
                        <Label 
                          htmlFor={mode} 
                          className="font-medium cursor-pointer flex-1"
                        >
                          {t(`onboarding.familiarity.${mode}`)}
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground ml-6">
                        {t(`onboarding.familiarity_help.${mode}`)}
                      </p>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <CardTitle className="text-lg">{t('onboarding.q_goal')}</CardTitle>
                  <CardDescription className="mt-1">
                    What would you like to focus on today?
                  </CardDescription>
                </div>

                <RadioGroup 
                  value={selectedGoal || ''} 
                  onValueChange={(value) => handleGoalSelect(value as UserGoal)}
                  className="space-y-3"
                >
                  {(['view', 'suggest', 'plan'] as UserGoal[]).map((goal) => (
                    <div key={goal} className="space-y-2">
                      <div className="flex items-center space-x-2">
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
                      <p className="text-sm text-muted-foreground ml-6">
                        {t(`onboarding.goal_help.${goal}`)}
                      </p>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}
          </CardContent>

          <div className="flex justify-between p-6 pt-0">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={step === 1}
              data-testid="button-onboarding-back"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              {t('labels.back')}
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canContinue}
              data-testid="button-onboarding-continue"
            >
              {step === 2 ? t('labels.done') : t('onboarding.button_continue')}
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </Card>

        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            File Inventory Optimizer - Simulation Mode
          </p>
        </div>
      </div>
    </div>
  );
}