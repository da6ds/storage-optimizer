import { useState, useEffect } from 'react';
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import Onboarding, { type OnboardingData } from "./components/Onboarding";
import Dashboard from "./components/Dashboard";

function App() {
  const [onboardingData, setOnboardingData] = useState<OnboardingData | null>(null);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  
  useEffect(() => {
    // Check if user has completed onboarding before
    const savedData = localStorage.getItem('file-optimizer-onboarding');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setOnboardingData(parsed);
        setIsOnboardingComplete(true);
      } catch (error) {
        console.error('Failed to parse saved onboarding data:', error);
      }
    }
  }, []);
  
  const handleOnboardingComplete = (data: OnboardingData) => {
    setOnboardingData(data);
    setIsOnboardingComplete(true);
    localStorage.setItem('file-optimizer-onboarding', JSON.stringify(data));
  };
  
  const handleFamiliarityChange = (familiarity: OnboardingData['familiarity']) => {
    if (onboardingData) {
      const newData = { ...onboardingData, familiarity };
      setOnboardingData(newData);
      localStorage.setItem('file-optimizer-onboarding', JSON.stringify(newData));
    }
  };
  
  const handleGoalChange = (goal: OnboardingData['goal']) => {
    if (onboardingData) {
      const newData = { ...onboardingData, goal };
      setOnboardingData(newData);
      localStorage.setItem('file-optimizer-onboarding', JSON.stringify(newData));
    }
  };
  
  const handleResetOnboarding = () => {
    setOnboardingData(null);
    setIsOnboardingComplete(false);
    localStorage.removeItem('file-optimizer-onboarding');
  };
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen">
          {!isOnboardingComplete || !onboardingData ? (
            <Onboarding onComplete={handleOnboardingComplete} />
          ) : (
            <Dashboard
              familiarity={onboardingData.familiarity}
              goal={onboardingData.goal}
              onFamiliarityChange={handleFamiliarityChange}
              onGoalChange={handleGoalChange}
              onResetOnboarding={handleResetOnboarding}
            />
          )}
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
