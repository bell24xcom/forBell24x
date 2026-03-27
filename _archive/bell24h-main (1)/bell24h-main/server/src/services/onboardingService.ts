import { createContext, useContext, useState } from 'react';

interface OnboardingContextType {
  step: number;
  isComplete: boolean;
  nextStep: () => void;
  prevStep: () => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [step, setStep] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  
  const nextStep = () => {
    setStep(prev => Math.min(prev + 1, 3));
  };
  
  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 0));
  };
  
  const resetOnboarding = () => {
    setStep(0);
    setIsComplete(false);
  };
  
  return (
    <OnboardingContext.Provider 
      value={{ step, isComplete, nextStep, prevStep, resetOnboarding }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}; 