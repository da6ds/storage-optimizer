import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Copy } from 'lucide-react';
import { useState } from 'react';
import { useSimulation, useI18n } from '../../contexts/SimulationContext';
import { formatFileSize, formatCurrency } from '../../../../shared/simulation';
import EstimatedSavingsBanner from '../EstimatedSavingsBanner';

export default function DuplicatesView() {
  const { duplicateClusters, mode } = useSimulation();
  const { t } = useI18n();
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set());

  const totalDuplicates = duplicateClusters.reduce((sum, cluster) => sum + cluster.files.length - 1, 0);
  const totalSavings = duplicateClusters.reduce((sum, cluster) => sum + cluster.potential_savings_usd, 0);

  const toggleCluster = (hash: string) => {
    const newExpanded = new Set(expandedClusters);
    if (newExpanded.has(hash)) {
      newExpanded.delete(hash);
    } else {
      newExpanded.add(hash);
    }
    setExpandedClusters(newExpanded);
  };

  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t('duplicates.title')}</h1>
        <p className="text-muted-foreground">{t('duplicates.subtitle')}</p>
      </div>

      {/* Estimated Savings Banner */}
      <EstimatedSavingsBanner />

      {/* Summary stats */}
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

      {/* Explanation */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            {t(`duplicates.what_this_means.${mode}`)}
          </p>
        </CardContent>
      </Card>

      {/* Duplicate clusters */}
      <div className="space-y-3">
        {duplicateClusters.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Copy className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No duplicate files found</p>
            </CardContent>
          </Card>
        ) : (
          duplicateClusters.map((cluster) => (
            <Card key={cluster.hash}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">
                      {cluster.files[0].path.split('/').pop() || 'Unknown file'}
                    </CardTitle>
                    <CardDescription>
                      {t('duplicates.cluster_info', {
                        count: cluster.files.length,
                        providers: cluster.provider_count
                      })}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {formatCurrency(cluster.potential_savings_usd)} savings
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleCluster(cluster.hash)}
                      data-testid={`button-toggle-cluster-${cluster.hash}`}
                    >
                      {expandedClusters.has(cluster.hash) ? (
                        <><ChevronDown className="h-4 w-4" /> {t('duplicates.collapse_cluster')}</>
                      ) : (
                        <><ChevronRight className="h-4 w-4" /> {t('duplicates.expand_cluster')}</>
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>

              {expandedClusters.has(cluster.hash) && (
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {cluster.files.map((file) => (
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
                          <div className="text-xs text-muted-foreground truncate">
                            {file.path}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">
                            {formatFileSize(file.size_bytes)}
                          </span>
                          {file.id === cluster.recommended_keeper.id && (
                            <Badge variant="secondary" className="text-xs">
                              {t('duplicates.keep_here_badge')}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}