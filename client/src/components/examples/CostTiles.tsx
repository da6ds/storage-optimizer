import CostTiles from '../CostTiles';

// todo: remove mock data
const mockProviders = [
  { provider: 'Google Drive', cost: 9.99, storage: 2048, trend: 'up' as const, color: '#4285f4' },
  { provider: 'Dropbox', cost: 11.99, storage: 2048, trend: 'stable' as const, color: '#0061ff' },
  { provider: 'OneDrive', cost: 6.99, storage: 1024, trend: 'down' as const, color: '#0078d4' },
  { provider: 'iCloud', cost: 2.99, storage: 200, trend: 'up' as const, color: '#007aff' },
  { provider: 'Local', cost: 0, storage: 512, trend: 'stable' as const, color: '#6b7280' },
];

export default function CostTilesExample() {
  const totalCost = mockProviders.reduce((sum, p) => sum + p.cost, 0);
  
  return (
    <div className="p-4">
      <CostTiles
        providers={mockProviders}
        totalCost={totalCost}
        mode="easy"
      />
    </div>
  );
}