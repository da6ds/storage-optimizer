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

export interface ChecklistState {
  deviceLinked: boolean;
  cloudAccountsLinked: boolean;
  optimizeRun: boolean;
}

export interface ChecklistActions {
  markDeviceLinked: () => void;
  markCloudAccountsLinked: () => void;
  markOptimizeRun: () => void;
  resetChecklist: () => void;
  isChecklistComplete: () => boolean;
}

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
  showDetails: boolean;
  
  // Onboarding checklist
  checklist: ChecklistState;
  
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
  toggleDetails: () => void;
  
  // Checklist actions
  markDeviceLinked: () => void;
  markCloudAccountsLinked: () => void;
  markOptimizeRun: () => void;
  resetChecklist: () => void;
  isChecklistComplete: () => boolean;
  
  // Subscription actions
  upgradeToOneTime: () => void;
  upgradeToMonthly: () => void;
  cancelSubscription: () => void;
  isProUser: () => boolean;
  getPotentialSavings: () => number;
  
  // Health score
  getHealthScore: () => number;
  
  // Gating logic for Score/Savings display
  shouldShowScore: () => boolean;
  shouldShowSavings: () => boolean;
  getGatingMessage: () => string;
  getNextGatingStep: () => 'device' | 'cloud' | null;
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
    showDetails: false,
    checklist: {
      deviceLinked: false,
      cloudAccountsLinked: false,
      optimizeRun: false
    },
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

      // Restore checklist state
      const savedChecklist = localStorage.getItem('simulation_checklist');
      if (savedChecklist) {
        const parsedChecklist = JSON.parse(savedChecklist);
        setState(prev => ({
          ...prev,
          checklist: parsedChecklist
        }));
      }
      
      // Check if this is a fresh onboarding start (no device linked)
      const hasLinkedDevice = localStorage.getItem('hasLinkedDevice');
      if (!hasLinkedDevice) {
        // Ensure checklist starts fresh for new onboarding
        setState(prev => ({
          ...prev,
          checklist: {
            deviceLinked: false,
            cloudAccountsLinked: false,
            optimizeRun: false
          }
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

  // Persist checklist state to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem('simulation_checklist', JSON.stringify(state.checklist));
    } catch (error) {
      console.warn('Failed to persist checklist state:', error);
    }
  }, [state.checklist]);

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

  const toggleDetails = () => {
    setState(prev => ({ 
      ...prev, 
      showDetails: !prev.showDetails 
    }));
  };

  // Checklist actions
  const markDeviceLinked = () => {
    setState(prev => ({
      ...prev,
      checklist: { ...prev.checklist, deviceLinked: true }
    }));
  };

  const markCloudAccountsLinked = () => {
    setState(prev => ({
      ...prev,
      checklist: { ...prev.checklist, cloudAccountsLinked: true }
    }));
  };

  const markOptimizeRun = () => {
    setState(prev => ({
      ...prev,
      checklist: { ...prev.checklist, optimizeRun: true }
    }));
  };

  const resetChecklist = () => {
    setState(prev => ({
      ...prev,
      checklist: {
        deviceLinked: false,
        cloudAccountsLinked: false,
        optimizeRun: false
      }
    }));
  };

  const isChecklistComplete = (): boolean => {
    return state.checklist.deviceLinked && 
           state.checklist.cloudAccountsLinked && 
           state.checklist.optimizeRun;
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
    const currentCost = state.storageBreakdown.reduce((sum, breakdown) => sum + breakdown.estimated_monthly_cost, 0);
    
    // Separate dedupe and cold storage savings to prevent double-counting
    const dedupeActions = state.optimizationActions.filter(action => action.type === 'dedupe');
    const coldStorageActions = state.optimizationActions.filter(action => action.type === 'cold_storage');
    const otherActions = state.optimizationActions.filter(action => !['dedupe', 'cold_storage'].includes(action.type));
    
    // Calculate dedupe savings
    const dedupeSavings = dedupeActions.reduce((sum, action) => sum + action.estimated_savings_usd, 0);
    
    // Calculate cold storage savings on non-duplicate files to avoid double-counting
    const coldStorageSavings = coldStorageActions.reduce((sum, action) => sum + action.estimated_savings_usd, 0);
    
    // Other optimization savings
    const otherSavings = otherActions.reduce((sum, action) => sum + action.estimated_savings_usd, 0);
    
    // Apply realistic migration overhead based on volume (estimate $0.01 per GB moved)
    const coldStorageFiles = coldStorageActions.flatMap(action => action.affected_files || []);
    const otherFiles = otherActions.flatMap(action => action.affected_files || []);
    const movedBytes = [...coldStorageFiles, ...otherFiles].reduce((sum, file) => sum + file.size_bytes, 0);
    const movedGB = movedBytes / (1024 * 1024 * 1024);
    const migrationOverhead = movedGB * 0.01; // $0.01 per GB moved
    
    // Total realistic savings
    const totalSavings = dedupeSavings + coldStorageSavings + otherSavings - migrationOverhead;
    
    // Cap savings at 40% of current monthly cost to be realistic
    const maxSavings = currentCost * 0.40;
    
    // Apply realistic constraints
    if (totalSavings < 1) {
      return 0; // Don't show tiny savings
    }
    
    return Math.min(totalSavings, maxSavings);
  };

  const getHealthScore = (): number => {
    if (state.files.length === 0) return 100;

    // Helper function to clamp values between 0 and 1
    const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

    // Calculate duplicate ratio (35% weight)
    const totalFiles = state.files.length;
    const duplicateFiles = state.duplicateClusters.reduce((sum, cluster) => sum + cluster.files.length - 1, 0);
    const duplicateRatio = totalFiles > 0 ? duplicateFiles / totalFiles : 0;
    const duplicationScore = 100 * (1 - clamp(duplicateRatio, 0, 1));

    // Calculate cold bulk ratio (25% weight) - files over 1GB and older than 180 days
    const totalSizeBytes = state.files.reduce((sum, file) => sum + file.size_bytes, 0);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 180);
    const coldBulkBytes = state.files
      .filter(file => {
        const fileDate = new Date(file.last_modified);
        const sizeGb = file.size_bytes / (1024 * 1024 * 1024);
        return fileDate < cutoffDate && sizeGb >= 1;
      })
      .reduce((sum, file) => sum + file.size_bytes, 0);
    const coldBulkRatio = totalSizeBytes > 0 ? coldBulkBytes / totalSizeBytes : 0;
    const coldBulkScore = 100 * (1 - clamp(coldBulkRatio, 0, 1));

    // Calculate cost efficiency (25% weight) - use realistic savings that match display
    const currentCost = state.storageBreakdown.reduce((sum, breakdown) => sum + breakdown.estimated_monthly_cost, 0);
    const realisticSavings = getPotentialSavings(); // Use same logic as displayed savings
    const savingsRatio = currentCost > 0 ? realisticSavings / currentCost : 0;
    const costEfficiencyScore = 100 * (1 - clamp(savingsRatio, 0, 1));

    // Calculate fragmentation (10% weight) - penalize for using multiple providers (max 5 providers)
    const providerCount = new Set(state.files.map(file => file.provider)).size;
    const maxProviders = 5;
    const fragmentationRatio = providerCount > 1 ? (providerCount - 1) / (maxProviders - 1) : 0;
    const fragmentationScore = 100 * (1 - clamp(fragmentationRatio, 0, 1));

    // Risk posture (5% weight) - having duplicates provides backup redundancy
    const hasBackups = state.duplicateClusters.length > 0;
    const riskScore = hasBackups ? 100 : 80; // Penalty for no redundancy

    // Weighted average
    const healthScore = Math.round(
      (duplicationScore * 0.35) +
      (coldBulkScore * 0.25) +
      (costEfficiencyScore * 0.25) +
      (fragmentationScore * 0.10) +
      (riskScore * 0.05)
    );

    return clamp(healthScore, 0, 100);
  };

  // Gating logic for Score/Savings display based on checklist progress
  const shouldShowScore = (): boolean => {
    // Hide Score until Step 2 (cloudAccountsLinked) is complete
    return state.checklist.cloudAccountsLinked;
  };

  const shouldShowSavings = (): boolean => {
    // Hide Savings until Step 1 (deviceLinked) is complete
    return state.checklist.deviceLinked;
  };

  const getGatingMessage = (): string => {
    if (!state.checklist.deviceLinked) {
      return "Link this device to begin.";
    }
    if (!state.checklist.cloudAccountsLinked) {
      return "Partial (device only)";
    }
    return "";
  };

  const getNextGatingStep = (): 'device' | 'cloud' | null => {
    if (!state.checklist.deviceLinked) {
      return 'device';
    }
    if (!state.checklist.cloudAccountsLinked) {
      return 'cloud';  
    }
    return null;
  };

  const contextValue: SimulationContextType = {
    ...state,
    setUserMode,
    setUserGoal,
    completeOnboarding,
    refreshData,
    resetOnboarding,
    toggleDetails,
    markDeviceLinked,
    markCloudAccountsLinked,
    markOptimizeRun,
    resetChecklist,
    isChecklistComplete,
    upgradeToOneTime,
    upgradeToMonthly,
    cancelSubscription,
    isProUser,
    getPotentialSavings,
    getHealthScore,
    shouldShowScore,
    shouldShowSavings,
    getGatingMessage,
    getNextGatingStep
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
    // Always start with Map tab since we use persistent checklist instead of modal onboarding
    return '/map';
  };

  return { getDefaultRoute };
}