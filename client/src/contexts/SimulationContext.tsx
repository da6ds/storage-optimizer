import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  SimulatedFile, 
  PricingConfig, 
  DuplicateCluster, 
  OptimizationAction, 
  StorageBreakdown,
  CostCalculator,
  FileAnalyzer
} from '../../../shared/simulation';
import YAML from 'yaml';

export type UserMode = 'easy' | 'standard' | 'pro';
export type UserGoal = 'view' | 'suggest' | 'plan';
export type SubscriptionTier = 'free' | 'pro';
export type SubscriptionPlan = 'one_time' | 'monthly';

export interface SubscriptionState {
  tier: SubscriptionTier;
  plan: SubscriptionPlan | null;
  isActive: boolean;
  expiresAt: Date | null;
}

// Plan metadata constants
export const SUBSCRIPTION_PLANS = {
  one_time: {
    priceUsd: 10,
    label: "Clean it once",
    description: "$10 one-time"
  },
  monthly: {
    priceUsd: 5,
    periodDays: 30,
    label: "Keep it optimized", 
    description: "$5/month"
  }
} as const;

interface SimulationState {
  // User configuration
  mode: UserMode | null;
  goal: UserGoal | null;
  onboardingComplete: boolean;
  
  // Subscription management
  subscription: SubscriptionState;
  
  // Data
  files: SimulatedFile[];
  pricingConfig: PricingConfig | null;
  
  // Computed data
  duplicateClusters: DuplicateCluster[];
  optimizationActions: OptimizationAction[];
  storageBreakdown: StorageBreakdown[];
  
  // Loading states
  isLoading: boolean;
  error: string | null;
}

interface SimulationActions {
  setUserMode: (mode: UserMode) => void;
  setUserGoal: (goal: UserGoal) => void;
  completeOnboarding: () => void;
  refreshData: () => Promise<void>;
  resetOnboarding: () => void;
  
  // Subscription actions
  upgradeToOneTime: () => void;
  upgradeToMonthly: () => void;
  cancelSubscription: () => void;
  isProUser: () => boolean;
  getPotentialSavings: () => number;
}

type SimulationContextType = SimulationState & SimulationActions;

const SimulationContext = createContext<SimulationContextType | null>(null);

interface SimulationProviderProps {
  children: ReactNode;
}

export function SimulationProvider({ children }: SimulationProviderProps) {
  const [state, setState] = useState<SimulationState>({
    mode: null,
    goal: null,
    onboardingComplete: false,
    subscription: {
      tier: 'free',
      plan: null,
      isActive: false,
      expiresAt: null
    },
    files: [],
    pricingConfig: null,
    duplicateClusters: [],
    optimizationActions: [],
    storageBreakdown: [],
    isLoading: true,
    error: null
  });

  // Restore subscription and onboarding state from localStorage on mount
  useEffect(() => {
    try {
      // Restore subscription state
      const savedSubscription = localStorage.getItem('simulation_subscription');
      if (savedSubscription) {
        const parsed = JSON.parse(savedSubscription);
        // Convert expiresAt string back to Date if it exists
        if (parsed.expiresAt) {
          parsed.expiresAt = new Date(parsed.expiresAt);
        }
        // Only update if different from default state
        if (parsed.tier !== 'free' || parsed.isActive) {
          setState(prev => ({
            ...prev,
            subscription: parsed
          }));
        }
      }

      // Restore onboarding completion state
      const savedOnboarding = localStorage.getItem('simulation_onboarding_complete');
      if (savedOnboarding === 'true') {
        setState(prev => ({
          ...prev,
          onboardingComplete: true
        }));
      }
    } catch (error) {
      console.warn('Failed to restore app state:', error);
    }
  }, []); // Run only on mount

  // Load initial data
  useEffect(() => {
    loadSimulationData();
  }, []);

  // Recompute derived data when files or pricing changes
  useEffect(() => {
    if (state.files.length > 0 && state.pricingConfig) {
      computeDerivedData();
    }
  }, [state.files, state.pricingConfig]);

  // Persist subscription state to localStorage when it changes
  useEffect(() => {
    try {
      // Fix: Always handle persistence - remove when free/inactive, save when Pro/active
      if (state.subscription.tier === 'free' && !state.subscription.isActive) {
        localStorage.removeItem('simulation_subscription');
      } else {
        localStorage.setItem('simulation_subscription', JSON.stringify(state.subscription));
      }
    } catch (error) {
      console.warn('Failed to persist subscription state:', error);
    }
  }, [state.subscription]);

  // Persist onboarding completion state to localStorage when it changes
  useEffect(() => {
    try {
      // Fix: Remove from localStorage when onboarding is reset, save when completed
      if (state.onboardingComplete) {
        localStorage.setItem('simulation_onboarding_complete', 'true');
      } else {
        localStorage.removeItem('simulation_onboarding_complete');
      }
    } catch (error) {
      console.warn('Failed to persist onboarding state:', error);
    }
  }, [state.onboardingComplete]);

  // Enforce monthly subscription expiration
  useEffect(() => {
    if (state.subscription.plan === 'monthly' && 
        state.subscription.isActive && 
        state.subscription.expiresAt) {
      const now = new Date();
      if (now > state.subscription.expiresAt) {
        // Auto-expire monthly subscription - reset to free tier
        setState(prev => ({
          ...prev,
          subscription: {
            tier: 'free',
            plan: null,
            isActive: false,
            expiresAt: null
          }
        }));
      }
    }
  }, [state.subscription]);

  const loadSimulationData = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Load files and pricing in parallel
      const [filesResponse, pricingResponse] = await Promise.all([
        fetch('/data/fake/files.json'),
        fetch('/config/pricing.yaml')
      ]);

      if (!filesResponse.ok || !pricingResponse.ok) {
        throw new Error('Failed to load simulation data');
      }

      const filesData = await filesResponse.json() as any;
      const pricingYaml = await pricingResponse.text();
      const pricingConfig = YAML.parse(pricingYaml) as PricingConfig;

      setState(prev => ({
        ...prev,
        files: Array.isArray(filesData) ? filesData : filesData.files || [],
        pricingConfig,
        isLoading: false
      }));

    } catch (error) {
      console.error('Failed to load simulation data:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Unknown error',
        isLoading: false
      }));
    }
  };

  const computeDerivedData = () => {
    if (!state.pricingConfig) return;

    const costCalculator = new CostCalculator(state.pricingConfig);
    const fileAnalyzer = new FileAnalyzer(costCalculator);

    const duplicateClusters = fileAnalyzer.findDuplicateClusters(state.files);
    const optimizationActions = fileAnalyzer.generateOptimizationActions(state.files);
    const storageBreakdown = fileAnalyzer.generateStorageBreakdown(state.files);

    setState(prev => ({
      ...prev,
      duplicateClusters,
      optimizationActions,
      storageBreakdown
    }));
  };

  const setUserMode = (mode: UserMode) => {
    setState(prev => ({ ...prev, mode }));
  };

  const setUserGoal = (goal: UserGoal) => {
    setState(prev => ({ ...prev, goal }));
  };

  const completeOnboarding = () => {
    setState(prev => ({ ...prev, onboardingComplete: true }));
  };

  const resetOnboarding = () => {
    setState(prev => ({ 
      ...prev, 
      mode: null, 
      goal: null, 
      onboardingComplete: false 
    }));
  };

  const refreshData = async () => {
    await loadSimulationData();
  };

  // Subscription management actions
  const upgradeToOneTime = () => {
    setState(prev => ({
      ...prev,
      subscription: {
        tier: 'pro',
        plan: 'one_time',
        isActive: true,
        expiresAt: null // One-time purchases don't expire
      }
    }));
  };

  const upgradeToMonthly = () => {
    const now = new Date();
    const daysInMs = SUBSCRIPTION_PLANS.monthly.periodDays * 24 * 60 * 60 * 1000;
    const expiresAt = new Date(now.getTime() + daysInMs);
    setState(prev => ({
      ...prev,
      subscription: {
        tier: 'pro',
        plan: 'monthly',
        isActive: true,
        expiresAt
      }
    }));
  };

  const cancelSubscription = () => {
    setState(prev => ({
      ...prev,
      subscription: {
        tier: 'free',
        plan: null,
        isActive: false,
        expiresAt: null
      }
    }));
  };

  const isProUser = (): boolean => {
    if (state.subscription.tier !== 'pro' || !state.subscription.isActive) {
      return false;
    }
    
    // Check expiration for monthly subscriptions (pure check, no state mutation)
    if (state.subscription.plan === 'monthly' && state.subscription.expiresAt) {
      const now = new Date();
      if (now > state.subscription.expiresAt) {
        return false;
      }
    }
    
    return true;
  };

  const getPotentialSavings = (): number => {
    return state.optimizationActions.reduce((sum, action) => sum + action.estimated_savings_usd, 0);
  };

  const contextValue: SimulationContextType = {
    ...state,
    setUserMode,
    setUserGoal,
    completeOnboarding,
    refreshData,
    resetOnboarding,
    upgradeToOneTime,
    upgradeToMonthly,
    cancelSubscription,
    isProUser,
    getPotentialSavings
  };

  return (
    <SimulationContext.Provider value={contextValue}>
      {children}
    </SimulationContext.Provider>
  );
}

export function useSimulation() {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
}

// Utility hooks for specific data
export function useI18n() {
  const [strings, setStrings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStrings = async () => {
      try {
        const response = await fetch('/i18n/strings.en.json');
        const data = await response.json();
        setStrings(data);
      } catch (error) {
        console.error('Failed to load i18n strings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStrings();
  }, []);

  const t = (key: string, params?: Record<string, any>) => {
    if (!strings) return key;
    
    const keys = key.split('.');
    let value = strings;
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) return key;
    }
    
    if (typeof value !== 'string') return key;
    
    // Simple parameter replacement
    if (params) {
      return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) => {
        return params[paramKey] || match;
      });
    }
    
    return value;
  };

  return { t, isLoading };
}

// Route determination based on mode × goal matrix
export function useRouting() {
  const { mode, goal, onboardingComplete } = useSimulation();

  const getDefaultRoute = (): string => {
    if (!onboardingComplete || !mode || !goal) {
      return '/onboarding';
    }

    // Fixed navigation - always start with Map tab
    return '/map';
  };

  return { getDefaultRoute };
}