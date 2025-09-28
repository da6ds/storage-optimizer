import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, Table } from 'lucide-react';
import { useState } from 'react';
import { useSimulation, useI18n } from '../../contexts/SimulationContext';
import { formatFileSize, formatCurrency } from '../../../../shared/simulation';
import EstimatedSavingsBanner from '../EstimatedSavingsBanner';
import HealthScoreDisplay from '../HealthScoreDisplay';

export default function MapView() {
  const { storageBreakdown, mode } = useSimulation();
  const { t } = useI18n();
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');

  const totalFiles = storageBreakdown.reduce((sum, p) => sum + p.total_files, 0);
  const totalSize = storageBreakdown.reduce((sum, p) => sum + p.total_size_gb, 0);
  const totalCost = storageBreakdown.reduce((sum, p) => sum + p.estimated_monthly_cost, 0);

  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t('map.title')}</h1>
        <p className="text-muted-foreground">{t('map.subtitle')}</p>
      </div>

      {/* Health Score */}
      <HealthScoreDisplay />

      {/* Estimated Savings Banner */}
      <EstimatedSavingsBanner />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-lg font-semibold">{totalFiles.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">{t('map.total_files')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-lg font-semibold">{formatFileSize(totalSize * 1024 * 1024 * 1024)}</div>
            <div className="text-xs text-muted-foreground">{t('map.total_size')}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 text-center">
            <div className="text-lg font-semibold">{formatCurrency(totalCost)}</div>
            <div className="text-xs text-muted-foreground">{t('map.estimated_cost')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Provider breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('map.provider_tiles_title')}</CardTitle>
              <CardDescription>Storage usage by provider</CardDescription>
            </div>
            <div className="flex items-center space-x-1">
              <Badge variant="outline" className="text-xs">
                {t('labels.sample_pricing')}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {storageBreakdown.map((provider) => (
            <div key={provider.provider} className="flex items-center justify-between p-3 rounded-lg border">
              <div className="flex-1">
                <div className="font-medium">{t(`providers.${provider.provider}`)}</div>
                <div className="text-sm text-muted-foreground">
                  {provider.total_files.toLocaleString()} files • {formatFileSize(provider.total_size_gb * 1024 * 1024 * 1024)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">{formatCurrency(provider.estimated_monthly_cost)}</div>
                <div className="text-xs text-muted-foreground">monthly</div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* File type breakdown */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('map.storage_breakdown_title')}</CardTitle>
              <CardDescription>What types of files are using your storage</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === 'chart' ? 'table' : 'chart')}
              data-testid={`button-toggle-view-${viewMode}`}
            >
              {viewMode === 'chart' ? <Table className="h-4 w-4" /> : <BarChart3 className="h-4 w-4" />}
              <span className="ml-1">
                {viewMode === 'chart' ? t('map.view_as_table') : t('map.view_as_chart')}
              </span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <FileTypeBreakdown providers={storageBreakdown} viewMode={viewMode} />
        </CardContent>
      </Card>

      {/* What this means explanation */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            {t(`map.what_this_means.${mode}`)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function FileTypeBreakdown({ providers, viewMode }: { 
  providers: any[], 
  viewMode: 'chart' | 'table' 
}) {
  const { t } = useI18n();

  // Aggregate file types across all providers
  const typeStats = providers.reduce((acc, provider) => {
    for (const [type, stats] of Object.entries(provider.file_types)) {
      const typedStats = stats as { count: number; size_gb: number };
      if (!acc[type]) {
        acc[type] = { count: 0, size_gb: 0 };
      }
      acc[type].count += typedStats.count;
      acc[type].size_gb += typedStats.size_gb;
    }
    return acc;
  }, {} as Record<string, { count: number; size_gb: number }>);

  if (viewMode === 'table') {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground border-b pb-2">
          <div>Type</div>
          <div className="text-right">Files</div>
          <div className="text-right">Size</div>
        </div>
        {Object.entries(typeStats).map(([type, stats]) => (
          <div key={type} className="grid grid-cols-3 gap-2 text-sm">
            <div>{t(`file_types.${type}`)}</div>
            <div className="text-right">{stats.count.toLocaleString()}</div>
            <div className="text-right">{formatFileSize(stats.size_gb * 1024 * 1024 * 1024)}</div>
          </div>
        ))}
      </div>
    );
  }

  // Simple bar chart view
  const maxSize = Math.max(...Object.values(typeStats).map((s: { count: number; size_gb: number }) => s.size_gb));

  return (
    <div className="space-y-3">
      {Object.entries(typeStats).map(([type, stats]) => (
        <div key={type} className="space-y-1">
          <div className="flex justify-between text-sm">
            <span>{t(`file_types.${type}`)}</span>
            <span className="text-muted-foreground">
              {stats.count} files • {formatFileSize(stats.size_gb * 1024 * 1024 * 1024)}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full"
              style={{ width: `${(stats.size_gb / maxSize) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}