import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import CostTiles from './CostTiles';
import StorageTreemap from './StorageTreemap';
import OptimizationCards from './OptimizationCards';
import DuplicateViewer from './DuplicateViewer';
import BottomNavigation, { type NavTab } from './BottomNavigation';
import ModeSelector from './ModeSelector';
import ThemeToggle from './ThemeToggle';
import type { FamiliarityLevel, Goal } from './Onboarding';
import { Filter, Download, Settings, HelpCircle } from 'lucide-react';

interface DashboardProps {
  familiarity: FamiliarityLevel;
  goal: Goal;
  onFamiliarityChange: (familiarity: FamiliarityLevel) => void;
  onGoalChange: (goal: Goal) => void;
  onResetOnboarding: () => void;
}

// todo: remove mock data
const mockProviders = [
  { provider: 'Google Drive', cost: 9.99, storage: 2048, trend: 'up' as const, color: '#4285f4' },
  { provider: 'Dropbox', cost: 11.99, storage: 2048, trend: 'stable' as const, color: '#0061ff' },
  { provider: 'OneDrive', cost: 6.99, storage: 1024, trend: 'down' as const, color: '#0078d4' },
  { provider: 'iCloud', cost: 2.99, storage: 200, trend: 'up' as const, color: '#007aff' },
  { provider: 'Local', cost: 0, storage: 512, trend: 'stable' as const, color: '#6b7280' },
];

// todo: remove mock data
const mockStorageItems = [
  { name: 'Photos 2024', size: 45000000000, provider: 'Google Drive', color: '#4285f4', percentage: 35 },
  { name: 'Video Projects', size: 32000000000, provider: 'Dropbox', color: '#0061ff', percentage: 25 },
  { name: 'Documents', size: 16000000000, provider: 'OneDrive', color: '#0078d4', percentage: 12.5 },
  { name: 'Music Library', size: 12000000000, provider: 'iCloud', color: '#007aff', percentage: 9.5 },
  { name: 'Backups', size: 8000000000, provider: 'Local', color: '#6b7280', percentage: 6.2 },
];

// todo: remove mock data
const mockRecommendations = [
  {
    id: 'cold-1',
    type: 'cold' as const,
    title: 'Move old files to archive',
    description: 'Archive 89 large files older than 6 months to cheaper cold storage',
    savingsPerMonth: 15.25,
    frictionLevel: 'medium' as const,
    itemCount: 89,
    providerChanges: ['Dropbox', 'Google Drive']
  },
  {
    id: 'dup-1',
    type: 'duplicate' as const,
    title: 'Remove duplicate photos',
    description: 'Found 1,247 duplicate photos across Google Drive and iCloud taking up 12.3 GB',
    savingsPerMonth: 8.50,
    frictionLevel: 'low' as const,
    itemCount: 1247,
    providerChanges: ['Google Drive', 'iCloud']
  },
  {
    id: 'cons-1',
    type: 'consolidation' as const,
    title: 'Consolidate document folders',
    description: 'Merge scattered document folders from 3 providers into OneDrive',
    savingsPerMonth: 6.75,
    frictionLevel: 'high' as const,
    itemCount: 456,
    providerChanges: ['Google Drive', 'Dropbox', 'OneDrive']
  }
];

// todo: remove mock data
const mockDuplicateGroups = [
  {
    id: 'group-1',
    files: [
      {
        id: 'file-1a',
        name: 'vacation-photo.jpg',
        size: 5242880,
        provider: 'Google Drive',
        lastModified: new Date('2024-03-15'),
        path: '/Photos/2024/vacation-photo.jpg',
        hash: 'sha256:abc123def456...'
      },
      {
        id: 'file-1b',
        name: 'vacation-photo.jpg',
        size: 5242880,
        provider: 'iCloud',
        lastModified: new Date('2024-03-10'),
        path: '/Photos/vacation-photo.jpg',
        hash: 'sha256:abc123def456...'
      }
    ],
    totalSize: 10485760,
    potentialSavings: 2.85
  }
];

export default function Dashboard({
  familiarity,
  goal,
  onFamiliarityChange,
  onGoalChange,
  onResetOnboarding
}: DashboardProps) {
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    // Set initial tab based on mode and goal
    if (familiarity === 'easy' && goal === 'view') return 'map';
    if (goal === 'suggest') return 'actions';
    if (familiarity === 'pro') return 'costs';
    return 'map';
  });
  
  const totalCost = mockProviders.reduce((sum, p) => sum + p.cost, 0);
  const totalSavings = mockRecommendations.reduce((sum, r) => sum + r.savingsPerMonth, 0);
  const duplicateCount = mockDuplicateGroups.reduce((sum, g) => sum + g.files.length - 1, 0);
  
  const handleRecommendationClick = (id: string) => {
    console.log('Recommendation clicked:', id);
    if (id.startsWith('dup-')) {
      setActiveTab('duplicates');
    }
  };
  
  const renderContent = () => {
    switch (activeTab) {
      case 'map':
        return (
          <div className="space-y-6">
            <CostTiles 
              providers={mockProviders} 
              totalCost={totalCost} 
              mode={familiarity} 
            />
            <StorageTreemap 
              items={mockStorageItems} 
              totalSize={mockStorageItems.reduce((sum, item) => sum + item.size, 0)}
              mode={familiarity} 
            />
          </div>
        );
      
      case 'duplicates':
        return (
          <DuplicateViewer 
            duplicateGroups={mockDuplicateGroups} 
            mode={familiarity} 
          />
        );
      
      case 'costs':
        return (
          <div className="space-y-6">
            <CostTiles 
              providers={mockProviders} 
              totalCost={totalCost} 
              mode={familiarity} 
            />
            {familiarity === 'pro' && (
              <Card>
                <CardHeader>
                  <CardTitle>Cost Breakdown Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Base Storage</div>
                        <div className="text-2xl font-bold">${(totalCost * 0.7).toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="font-medium">Overage Fees</div>
                        <div className="text-2xl font-bold">${(totalCost * 0.25).toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="font-medium">API Requests</div>
                        <div className="text-2xl font-bold">${(totalCost * 0.05).toFixed(2)}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );
      
      case 'actions':
        return (
          <OptimizationCards 
            recommendations={mockRecommendations} 
            mode={familiarity} 
            onRecommendationClick={handleRecommendationClick}
          />
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold">File Optimizer</h1>
              <ModeSelector
                familiarity={familiarity}
                goal={goal}
                onFamiliarityChange={onFamiliarityChange}
                onGoalChange={onGoalChange}
              />
            </div>
            
            <div className="flex items-center gap-2">
              {familiarity === 'easy' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  data-testid="button-help"
                >
                  <HelpCircle className="w-4 h-4" />
                </Button>
              )}
              
              {familiarity !== 'easy' && (
                <>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    data-testid="button-filters"
                  >
                    <Filter className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    data-testid="button-export"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </>
              )}
              
              {familiarity === 'pro' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  data-testid="button-settings"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              )}
              
              <ThemeToggle />
            </div>
          </div>
          
          {/* Stats summary */}
          <div className="flex items-center gap-4 mt-3 text-sm">
            <Badge variant="secondary">
              ${totalCost.toFixed(2)}/mo current cost
            </Badge>
            <Badge variant="default" className="bg-chart-2">
              ${totalSavings.toFixed(2)}/mo potential savings
            </Badge>
            {duplicateCount > 0 && (
              <Badge variant="outline" className="text-chart-3">
                {duplicateCount} duplicates found
              </Badge>
            )}
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="px-4 py-6">
        {renderContent()}
      </main>
      
      {/* Bottom navigation */}
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={setActiveTab}
        duplicateCount={duplicateCount}
        savingsAmount={totalSavings > 0 ? totalSavings : undefined}
      />
    </div>
  );
}