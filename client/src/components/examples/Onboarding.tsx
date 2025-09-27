import Onboarding from '../Onboarding';

export default function OnboardingExample() {
  const handleComplete = (data: any) => {
    console.log('Onboarding completed:', data);
  };

  return <Onboarding onComplete={handleComplete} />;
}