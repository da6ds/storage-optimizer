import DuplicateViewer from '../DuplicateViewer';

// todo: remove mock data
const mockDuplicateGroups = [
  {
    id: 'group-1',
    files: [
      {
        id: 'file-1a',
        name: 'vacation-photo.jpg',
        size: 5242880, // 5MB
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
      },
      {
        id: 'file-1c',
        name: 'vacation-photo (1).jpg',
        size: 5242880,
        provider: 'Dropbox',
        lastModified: new Date('2024-03-12'),
        path: '/Camera Uploads/vacation-photo (1).jpg',
        hash: 'sha256:abc123def456...'
      }
    ],
    totalSize: 15728640, // 15MB
    potentialSavings: 2.85
  },
  {
    id: 'group-2',
    files: [
      {
        id: 'file-2a',
        name: 'presentation.pptx',
        size: 10485760, // 10MB
        provider: 'OneDrive',
        lastModified: new Date('2024-03-20'),
        path: '/Work/presentations/presentation.pptx',
        hash: 'sha256:def456ghi789...'
      },
      {
        id: 'file-2b',
        name: 'presentation.pptx',
        size: 10485760,
        provider: 'Google Drive',
        lastModified: new Date('2024-03-18'),
        path: '/Work Docs/presentation.pptx',
        hash: 'sha256:def456ghi789...'
      }
    ],
    totalSize: 20971520, // 20MB
    potentialSavings: 1.99
  }
];

export default function DuplicateViewerExample() {
  return (
    <div className="p-4">
      <DuplicateViewer
        duplicateGroups={mockDuplicateGroups}
        mode="standard"
      />
    </div>
  );
}