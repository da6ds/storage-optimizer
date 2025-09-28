import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign } from 'lucide-react';
import { useSimulation, useI18n } from '../../contexts/SimulationContext';
import { formatFileSize, formatCurrency } from '../../../../shared/simulation';
import EstimatedSavingsBanner from '../EstimatedSavingsBanner';
import HealthScoreDisplay from '../HealthScoreDisplay';

export default function CostsView() {
  const { storageBreakdown, mode } = useSimulation();
  const { t } = useI18n();

  const totalCost = storageBreakdown.reduce((sum, p) => sum + p.estimated_monthly_cost, 0);
  const maxCost = Math.max(...storageBreakdown.map(p => p.estimated_monthly_cost));

  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t('costs.title')}</h1>
        <p className="text-muted-foreground">{t('costs.subtitle')}</p>
      </div>

      {/* Health Score */}
      <HealthScoreDisplay />

      {/* Estimated Savings Banner */}
      <EstimatedSavingsBanner />

      {/* Total cost summary */}
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-3xl font-bold">{formatCurrency(totalCost)}</div>
          <div className="text-sm text-muted-foreground">{t('costs.total_monthly')}</div>
          <Badge variant="outline" className="mt-2 text-xs">
            {t('costs.sample_pricing_badge')}
          </Badge>
        </CardContent>
      </Card>

      {/* Explanation */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            {t(`costs.what_this_means.${mode}`)}
          </p>
        </CardContent>
      </Card>

      {/* Cost breakdown table */}
      <Card>
        <CardHeader>
          <CardTitle>Cost Breakdown</CardTitle>
          <CardDescription>Monthly estimates by provider</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Table header */}
            <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground border-b pb-2">
              <div>{t('costs.provider')}</div>
              <div className="text-right">{t('costs.used')}</div>
              <div className="text-right">{t('costs.cost')}</div>
              <div>Comparison</div>
            </div>

            {/* Cost rows */}
            {storageBreakdown.length === 0 ? (
              <div className="text-center py-8">
                <DollarSign className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No cost data available</p>
              </div>
            ) : (
              storageBreakdown.map((provider) => (
                <div key={provider.provider} className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 items-center">
                    <div>
                      <div className="font-medium text-sm">
                        {t(`providers.${provider.provider}`)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {provider.total_files.toLocaleString()} files
                      </div>
                    </div>
                    <div className="text-right text-sm">
                      {formatFileSize(provider.total_size_gb * 1024 * 1024 * 1024)}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatCurrency(provider.estimated_monthly_cost)}
                      </div>
                      <div className="text-xs text-muted-foreground">monthly</div>
                    </div>
                    <div className="w-full">
                      {/* Horizontal bar for cost comparison */}
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ 
                            width: maxCost > 0 ? `${(provider.estimated_monthly_cost / maxCost) * 100}%` : '0%' 
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}