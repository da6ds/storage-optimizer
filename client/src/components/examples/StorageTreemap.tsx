import StorageTreemap from '../StorageTreemap';

// todo: remove mock data
const mockItems = [
  { name: 'Photos 2024', size: 45000000000, provider: 'Google Drive', color: '#4285f4', percentage: 35 },
  { name: 'Video Projects', size: 32000000000, provider: 'Dropbox', color: '#0061ff', percentage: 25 },
  { name: 'Documents', size: 16000000000, provider: 'OneDrive', color: '#0078d4', percentage: 12.5 },
  { name: 'Music Library', size: 12000000000, provider: 'iCloud', color: '#007aff', percentage: 9.5 },
  { name: 'Backups', size: 8000000000, provider: 'Local', color: '#6b7280', percentage: 6.2 },
  { name: 'Old Files', size: 6000000000, provider: 'Google Drive', color: '#4285f4', percentage: 4.7 },
  { name: 'Archives', size: 4000000000, provider: 'Dropbox', color: '#0061ff', percentage: 3.1 },
  { name: 'Temp Files', size: 3000000000, provider: 'Local', color: '#6b7280', percentage: 2.3 },
  { name: 'Screenshots', size: 2000000000, provider: 'iCloud', color: '#007aff', percentage: 1.6 },
  { name: 'Downloads', size: 1000000000, provider: 'Local', color: '#6b7280', percentage: 0.8 }
];

const totalSize = mockItems.reduce((sum, item) => sum + item.size, 0);

export default function StorageTreemapExample() {
  return (
    <div className="p-4">
      <StorageTreemap
        items={mockItems}
        totalSize={totalSize}
        mode="standard"
      />
    </div>
  );
}