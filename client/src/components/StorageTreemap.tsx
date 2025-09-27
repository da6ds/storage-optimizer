import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Grid3X3 } from 'lucide-react';
import { useState } from 'react';

interface StorageItem {
  name: string;
  size: number;
  provider: string;
  color: string;
  percentage: number;
}

interface StorageTreemapProps {
  items: StorageItem[];
  totalSize: number;
  mode: 'easy' | 'standard' | 'pro';
}

export default function StorageTreemap({ items, totalSize, mode }: StorageTreemapProps) {
  const [viewMode, setViewMode] = useState<'treemap' | 'table'>('treemap');
  
  const formatSize = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024);
    if (gb < 1) return `${(gb * 1024).toFixed(0)} MB`;
    if (gb < 1024) return `${gb.toFixed(1)} GB`;
    return `${(gb / 1024).toFixed(1)} TB`;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className={mode === 'easy' ? 'text-xl' : 'text-lg'}>Storage Map</CardTitle>
        {mode !== 'easy' && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'treemap' ? 'table' : 'treemap')}
            data-testid="button-view-toggle"
          >
            {viewMode === 'treemap' ? <BarChart3 className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />}
            View as {viewMode === 'treemap' ? 'table' : 'treemap'}
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {viewMode === 'treemap' ? (
          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-1 h-40 rounded-lg overflow-hidden border">
              {items.map((item, index) => {
                const width = Math.max(Math.sqrt(item.percentage / 100) * 6, 1);
                const height = Math.max((item.percentage / 100) * 6, 1);
                
                return (
                  <div
                    key={`${item.name}-${index}`}
                    className={`relative overflow-hidden rounded-sm hover-elevate cursor-pointer col-span-${Math.min(Math.ceil(width), 6)} row-span-${Math.min(Math.ceil(height), 4)}`}
                    style={{ 
                      backgroundColor: item.color,
                      minHeight: '20px'
                    }}
                    data-testid={`treemap-item-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                    title={`${item.name}: ${formatSize(item.size)} (${item.percentage.toFixed(1)}%)`}
                  >
                    <div className="p-1 text-white text-xs font-medium truncate">
                      {item.percentage > 5 && item.name}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="space-y-2">
              {items.slice(0, 5).map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">({item.provider})</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatSize(item.size)}</div>
                    <div className="text-xs text-muted-foreground">{item.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Name</th>
                  <th className="text-left p-2">Provider</th>
                  <th className="text-right p-2">Size</th>
                  <th className="text-right p-2">%</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.name} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-sm"
                          style={{ backgroundColor: item.color }}
                        />
                        {item.name}
                      </div>
                    </td>
                    <td className="p-2 text-muted-foreground">{item.provider}</td>
                    <td className="p-2 text-right font-medium">{formatSize(item.size)}</td>
                    <td className="p-2 text-right">{item.percentage.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {mode === 'easy' && (
          <Card className="mt-4 bg-muted/50">
            <CardContent className="p-4">
              <div className="text-sm">
                <strong>💡 What this means:</strong>
                <br />This map shows your largest files and folders. Bigger rectangles = more storage space used. 
                Different colors represent different cloud services.
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
}