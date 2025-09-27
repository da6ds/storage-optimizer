import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, ExternalLink, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface DuplicateFile {
  id: string;
  name: string;
  size: number;
  provider: string;
  lastModified: Date;
  path: string;
  hash: string;
}

interface DuplicateGroup {
  id: string;
  files: DuplicateFile[];
  totalSize: number;
  potentialSavings: number;
}

interface DuplicateViewerProps {
  duplicateGroups: DuplicateGroup[];
  mode: 'easy' | 'standard' | 'pro';
}

export default function DuplicateViewer({ duplicateGroups, mode }: DuplicateViewerProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  
  const toggleGroup = (groupId: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(groupId)) {
      newExpanded.delete(groupId);
    } else {
      newExpanded.add(groupId);
    }
    setExpandedGroups(newExpanded);
  };
  
  const formatSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    if (mb < 1024) return `${mb.toFixed(1)} MB`;
    return `${(mb / 1024).toFixed(1)} GB`;
  };
  
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const totalSavings = duplicateGroups.reduce((sum, group) => sum + group.potentialSavings, 0);
  const totalDuplicates = duplicateGroups.reduce((sum, group) => sum + group.files.length - 1, 0);
  
  return (
    <div className="space-y-4">
      <div className="bg-chart-3/10 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Duplicate Files Detected</h3>
            <p className="text-sm text-muted-foreground">
              Found {totalDuplicates} duplicate files that can be safely removed
            </p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-chart-2">
              ${totalSavings.toFixed(2)}/mo
            </div>
            <div className="text-xs text-muted-foreground">Potential savings</div>
          </div>
        </div>
      </div>
      
      {mode === 'easy' && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="text-sm">
              <strong>💡 What this means:</strong>
              <br />These are identical files stored in multiple places. You can safely delete the extras 
              to save storage space and money. We'll always keep the newest version.
            </div>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-3">
        {duplicateGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.id);
          const newestFile = group.files.reduce((newest, file) => 
            file.lastModified > newest.lastModified ? file : newest
          );
          
          return (
            <Card key={group.id} className="hover-elevate">
              <CardHeader 
                className="cursor-pointer" 
                onClick={() => toggleGroup(group.id)}
                data-testid={`duplicate-group-${group.id}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Copy className="w-5 h-5 text-chart-3" />
                    <div>
                      <CardTitle className="text-base">{newestFile.name}</CardTitle>
                      <div className="text-sm text-muted-foreground">
                        {group.files.length} copies • {formatSize(group.totalSize)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-chart-2">
                      ${group.potentialSavings.toFixed(2)}/mo
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {group.files.length - 1} to remove
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              {isExpanded && (
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {group.files.map((file, index) => {
                      const isNewest = file.id === newestFile.id;
                      
                      return (
                        <div 
                          key={file.id} 
                          className={`p-3 rounded-lg border ${
                            isNewest ? 'bg-chart-2/10 border-chart-2' : 'bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{file.provider}</span>
                                {isNewest && (
                                  <Badge variant="default" className="text-xs">
                                    Keep (Newest)
                                  </Badge>
                                )}
                                {!isNewest && (
                                  <Badge variant="destructive" className="text-xs">
                                    Remove
                                  </Badge>
                                )}
                              </div>
                              <div className="text-sm text-muted-foreground truncate">
                                {file.path}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Modified: {formatDate(file.lastModified)} • {formatSize(file.size)}
                              </div>
                              {mode === 'pro' && (
                                <div className="text-xs font-mono text-muted-foreground">
                                  Hash: {file.hash.substring(0, 16)}...
                                </div>
                              )}
                            </div>
                            
                            {mode !== 'easy' && (
                              <div className="flex gap-2">
                                <Button variant="ghost" size="sm">
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                                {!isNewest && (
                                  <Button variant="ghost" size="sm" className="text-destructive">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}