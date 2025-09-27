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

interface SimulationState {
  // User configuration
  mode: UserMode | null;
  goal: UserGoal | null;
  onboardingComplete: boolean;
  
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
    files: [],
    pricingConfig: null,
    duplicateClusters: [],
    optimizationActions: [],
    storageBreakdown: [],
    isLoading: true,
    error: null
  });

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

  const contextValue: SimulationContextType = {
    ...state,
    setUserMode,
    setUserGoal,
    completeOnboarding,
    refreshData,
    resetOnboarding
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

    // Route matrix as specified in requirements
    if (mode === 'easy') {
      switch (goal) {
        case 'view': return '/map';
        case 'suggest': return '/actions';
        case 'plan': return '/plan';
        default: return '/map';
      }
    }

    if (mode === 'standard') {
      switch (goal) {
        case 'view': return '/map';
        case 'suggest': return '/actions';
        case 'plan': return '/actions'; // Plan is integrated into actions for standard
        default: return '/map';
      }
    }

    // Pro mode always goes to diagnostics
    return '/diagnostics';
  };

  const getBottomNavOrder = (): string[] => {
    if (!mode || !goal) return ['map', 'duplicates', 'costs', 'actions'];

    // Reorder tabs based on mode and goal
    if (mode === 'easy') {
      if (goal === 'view') return ['map', 'duplicates', 'costs', 'actions'];
      if (goal === 'suggest') return ['actions', 'map', 'duplicates', 'costs'];
      if (goal === 'plan') return ['plan', 'actions', 'map', 'costs'];
    }

    if (mode === 'standard') {
      if (goal === 'suggest') return ['actions', 'map', 'duplicates', 'costs'];
      return ['map', 'actions', 'duplicates', 'costs'];
    }

    // Pro mode
    return ['diagnostics', 'map', 'duplicates', 'costs', 'actions'];
  };

  return { getDefaultRoute, getBottomNavOrder };
}