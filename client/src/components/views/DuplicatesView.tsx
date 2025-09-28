import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Copy, Image, Video, FileText } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { useSimulation, useI18n } from '../../contexts/SimulationContext';
import { formatFileSize, formatCurrency } from '../../../../shared/simulation';
import EstimatedSavingsBanner from '../EstimatedSavingsBanner';
import HealthScoreDisplay from '../HealthScoreDisplay';
import type { DuplicateCluster, SimulatedFile } from '../../../../shared/simulation';

// Helper function to get file category from MIME type
const getFileCategory = (mimeType: string): 'image' | 'video' | 'other' => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  return 'other';
};

// Helper function to categorize duplicate clusters
const categorizeDuplicates = (clusters: DuplicateCluster[]) => {
  const categories = {
    photos: [] as DuplicateCluster[],
    videos: [] as DuplicateCluster[],
    other: [] as DuplicateCluster[]
  };
  
  clusters.forEach(cluster => {
    const firstFile = cluster.files[0];
    const category = getFileCategory(firstFile.mime);
    
    if (category === 'image') {
      categories.photos.push(cluster);
    } else if (category === 'video') {
      categories.videos.push(cluster);
    } else {
      categories.other.push(cluster);
    }
  });
  
  return categories;
};

export default function DuplicatesView() {
  const { duplicateClusters, mode, showDetails, shouldShowSavings, getGatingMessage, getNextGatingStep } = useSimulation();
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set(['photos', 'videos', 'other']));

  const totalDuplicates = duplicateClusters.reduce((sum, cluster) => sum + cluster.files.length - 1, 0);
  const totalSavings = duplicateClusters.reduce((sum, cluster) => sum + cluster.potential_savings_usd, 0);
  
  // Categorize duplicates by type
  const categorizedDuplicates = categorizeDuplicates(duplicateClusters);

  // Check if duplicate data should be shown based on setup completion
  const canShowDuplicates = shouldShowSavings();
  const gatingMessage = getGatingMessage();

  const toggleCluster = (hash: string) => {
    const newExpanded = new Set(expandedClusters);
    if (newExpanded.has(hash)) {
      newExpanded.delete(hash);
    } else {
      newExpanded.add(hash);
    }
    setExpandedClusters(newExpanded);
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t('duplicates.title')}</h1>
        <p className="text-muted-foreground">{t('duplicates.subtitle')}</p>
      </div>

      {/* Health Score */}
      <HealthScoreDisplay />

      {/* Estimated Savings Banner */}
      <EstimatedSavingsBanner />

      {/* TODO: Add proper data gating for duplicates view */}
      {!canShowDuplicates && (
        <Card>
          <CardHeader>
            <CardTitle>Duplicate Files</CardTitle>
            <CardDescription>Find and remove duplicate files to save space</CardDescription>
          </CardHeader>
          <CardContent className="text-center py-8 space-y-4">
            <Copy className="h-12 w-12 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <p className="text-muted-foreground">
                {gatingMessage || "Connect your devices and cloud accounts to find duplicate files"}
              </p>
              <Button
                onClick={() => {
                  const nextStep = getNextGatingStep();
                  if (nextStep === 'device') {
                    setLocation('/connect/device');
                  } else if (nextStep === 'cloud') {
                    setLocation('/connect/cloud');
                  }
                }}
                data-testid="button-connect-for-duplicates"
              >
                {getNextGatingStep() === 'device' ? "Connect this device" : "Connect cloud accounts"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Duplicate content - only show when setup is complete */}
      {canShowDuplicates && (
        <>
          {/* Redundancy Safety Banner */}
      <Card className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="text-green-600 dark:text-green-400 text-lg">🛡️</div>
            <div className="text-sm">
              <div className="font-medium text-green-700 dark:text-green-300 mb-1">
                {t('actions.redundancy_safety')}
              </div>
              <div className="text-green-600 dark:text-green-400">
                {t('duplicates.safety_explanation')}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary stats */}
      {showDetails && (
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-semibold">{duplicateClusters.length}</div>
              <div className="text-xs text-muted-foreground">{t('duplicates.clusters_found')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-semibold">{totalDuplicates}</div>
              <div className="text-xs text-muted-foreground">{t('duplicates.total_duplicates')}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <div className="text-lg font-semibold">{formatCurrency(totalSavings)}</div>
              <div className="text-xs text-muted-foreground">{t('duplicates.potential_savings')}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Explanation */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            {t(`duplicates.what_this_means.${mode}`)}
          </p>
        </CardContent>
      </Card>

      {/* Categorized duplicate clusters */}
      <div className="space-y-4">
        {duplicateClusters.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Copy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No duplicate files found</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Same photos in multiple clouds */}
            {categorizedDuplicates.photos.length > 0 && (
              <Card>
                <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleCategory('photos')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Image className="h-5 w-5 text-blue-600" />
                      <div>
                        <CardTitle className="text-lg">Same photos in multiple clouds</CardTitle>
                        {showDetails && (
                          <CardDescription>
                            {categorizedDuplicates.photos.length} photo groups • {formatCurrency(categorizedDuplicates.photos.reduce((sum, cluster) => sum + cluster.potential_savings_usd, 0))} potential savings
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      {expandedCategories.has('photos') ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                
                {expandedCategories.has('photos') && (
                  <CardContent className="pt-0 space-y-3">
                    {categorizedDuplicates.photos.map((cluster) => (
                      <div key={cluster.hash} className="border rounded-lg">
                        <div className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {cluster.files[0].path.split('/').pop() || 'Unknown photo'}
                              </div>
                              {showDetails && (
                                <div className="text-xs text-muted-foreground">
                                  Found in {cluster.provider_count} cloud{cluster.provider_count > 1 ? 's' : ''} • {cluster.files.length} copies
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="text-right space-y-1">
                                {showDetails && (
                                  <Badge variant="outline" className="text-xs">
                                    {formatCurrency(cluster.potential_savings_usd)} savings
                                  </Badge>
                                )}
                                <div className="space-y-1">
                                  <Badge variant="secondary" className="text-xs block">
                                    {t('duplicates.to_remove', { count: cluster.files.length - 1 })}
                                  </Badge>
                                  <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                                    {t('duplicates.copies_remaining', { count: 1 })}
                                  </div>
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleCluster(cluster.hash)}
                                data-testid={`button-toggle-cluster-${cluster.hash}`}
                              >
                                {expandedClusters.has(cluster.hash) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          {expandedClusters.has(cluster.hash) && (
                            <div className="mt-3 space-y-2">
                              {cluster.files.map((file: SimulatedFile) => (
                                <div
                                  key={file.id}
                                  className={`flex items-center justify-between p-2 rounded border ${
                                    file.id === cluster.recommended_keeper.id 
                                      ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                                      : 'bg-muted/50'
                                  }`}
                                >
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">
                                      {t(`providers.${file.provider}`)}
                                    </div>
                                    {showDetails && (
                                      <div className="text-xs text-muted-foreground truncate">
                                        {file.path}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-muted-foreground">
                                      {formatFileSize(file.size_bytes)}
                                    </span>
                                    {file.id === cluster.recommended_keeper.id && (
                                      <Badge variant="secondary" className="text-xs">
                                        Keep here
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            )}

            {/* Identical videos */}
            {categorizedDuplicates.videos.length > 0 && (
              <Card>
                <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleCategory('videos')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Video className="h-5 w-5 text-purple-600" />
                      <div>
                        <CardTitle className="text-lg">Identical videos</CardTitle>
                        {showDetails && (
                          <CardDescription>
                            {categorizedDuplicates.videos.length} video groups • {formatCurrency(categorizedDuplicates.videos.reduce((sum, cluster) => sum + cluster.potential_savings_usd, 0))} potential savings
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      {expandedCategories.has('videos') ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                
                {expandedCategories.has('videos') && (
                  <CardContent className="pt-0 space-y-3">
                    {categorizedDuplicates.videos.map((cluster) => (
                      <div key={cluster.hash} className="border rounded-lg">
                        <div className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {cluster.files[0].path.split('/').pop() || 'Unknown video'}
                              </div>
                              {showDetails && (
                                <div className="text-xs text-muted-foreground">
                                  Found in {cluster.provider_count} cloud{cluster.provider_count > 1 ? 's' : ''} • {cluster.files.length} copies
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {showDetails && (
                                <Badge variant="outline" className="text-xs">
                                  {formatCurrency(cluster.potential_savings_usd)} savings
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleCluster(cluster.hash)}
                                data-testid={`button-toggle-cluster-${cluster.hash}`}
                              >
                                {expandedClusters.has(cluster.hash) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          {expandedClusters.has(cluster.hash) && (
                            <div className="mt-3 space-y-2">
                              {cluster.files.map((file: SimulatedFile) => (
                                <div
                                  key={file.id}
                                  className={`flex items-center justify-between p-2 rounded border ${
                                    file.id === cluster.recommended_keeper.id 
                                      ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                                      : 'bg-muted/50'
                                  }`}
                                >
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">
                                      {t(`providers.${file.provider}`)}
                                    </div>
                                    {showDetails && (
                                      <div className="text-xs text-muted-foreground truncate">
                                        {file.path}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-muted-foreground">
                                      {formatFileSize(file.size_bytes)}
                                    </span>
                                    {file.id === cluster.recommended_keeper.id && (
                                      <Badge variant="secondary" className="text-xs">
                                        Keep here
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            )}

            {/* Exact duplicates (other files) */}
            {categorizedDuplicates.other.length > 0 && (
              <Card>
                <CardHeader className="pb-3 cursor-pointer" onClick={() => toggleCategory('other')}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FileText className="h-5 w-5 text-green-600" />
                      <div>
                        <CardTitle className="text-lg">Exact duplicates</CardTitle>
                        {showDetails && (
                          <CardDescription>
                            {categorizedDuplicates.other.length} file groups • {formatCurrency(categorizedDuplicates.other.reduce((sum, cluster) => sum + cluster.potential_savings_usd, 0))} potential savings
                          </CardDescription>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      {expandedCategories.has('other') ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </CardHeader>
                
                {expandedCategories.has('other') && (
                  <CardContent className="pt-0 space-y-3">
                    {categorizedDuplicates.other.map((cluster) => (
                      <div key={cluster.hash} className="border rounded-lg">
                        <div className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {cluster.files[0].path.split('/').pop() || 'Unknown file'}
                              </div>
                              {showDetails && (
                                <div className="text-xs text-muted-foreground">
                                  Found in {cluster.provider_count} cloud{cluster.provider_count > 1 ? 's' : ''} • {cluster.files.length} copies
                                </div>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              {showDetails && (
                                <Badge variant="outline" className="text-xs">
                                  {formatCurrency(cluster.potential_savings_usd)} savings
                                </Badge>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleCluster(cluster.hash)}
                                data-testid={`button-toggle-cluster-${cluster.hash}`}
                              >
                                {expandedClusters.has(cluster.hash) ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          {expandedClusters.has(cluster.hash) && (
                            <div className="mt-3 space-y-2">
                              {cluster.files.map((file: SimulatedFile) => (
                                <div
                                  key={file.id}
                                  className={`flex items-center justify-between p-2 rounded border ${
                                    file.id === cluster.recommended_keeper.id 
                                      ? 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800' 
                                      : 'bg-muted/50'
                                  }`}
                                >
                                  <div className="flex-1">
                                    <div className="font-medium text-sm">
                                      {t(`providers.${file.provider}`)}
                                    </div>
                                    {showDetails && (
                                      <div className="text-xs text-muted-foreground truncate">
                                        {file.path}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-muted-foreground">
                                      {formatFileSize(file.size_bytes)}
                                    </span>
                                    {file.id === cluster.recommended_keeper.id && (
                                      <Badge variant="secondary" className="text-xs">
                                        Keep here
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}