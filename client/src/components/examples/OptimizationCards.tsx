import OptimizationCards from '../OptimizationCards';

// todo: remove mock data
const mockRecommendations = [
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

export default function OptimizationCardsExample() {
  const handleRecommendationClick = (id: string) => {
    console.log('Recommendation clicked:', id);
  };
  
  return (
    <div className="p-4">
      <OptimizationCards
        recommendations={mockRecommendations}
        mode="easy"
        onRecommendationClick={handleRecommendationClick}
      />
    </div>
  );
}