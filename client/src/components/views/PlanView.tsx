import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock } from 'lucide-react';
import { useSimulation, useI18n } from '../../contexts/SimulationContext';
import { formatCurrency } from '../../../../shared/simulation';

export default function PlanView() {
  const { optimizationActions } = useSimulation();
  const { t } = useI18n();

  const totalSavings = optimizationActions.reduce((sum, action) => sum + action.estimated_savings_usd, 0);

  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t('plan_preview.title')}</h1>
        <p className="text-muted-foreground">{t('plan_preview.subtitle')}</p>
      </div>

      {/* Total savings potential */}
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(totalSavings)}
          </div>
          <div className="text-sm text-muted-foreground">
            {t('plan_preview.total_estimated_savings', { amount: formatCurrency(totalSavings) })}
          </div>
        </CardContent>
      </Card>

      {/* Simulation notice */}
      <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
        <CardContent className="p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            {t('plan_preview.simulation_note')}
          </p>
        </CardContent>
      </Card>

      {/* Optimization steps */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('plan_preview.steps')}</CardTitle>
          <CardDescription>Recommended actions in order of impact</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {optimizationActions.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
              <p className="text-muted-foreground">No optimization steps needed</p>
            </div>
          ) : (
            optimizationActions.map((action, index) => (
              <div
                key={action.id}
                className="flex items-start space-x-3 p-3 rounded-lg border bg-card"
              >
                <div className="flex-none">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium">{action.title}</h3>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {t('plan_preview.step_pending')}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {action.description}
                  </p>
                  
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="font-medium text-green-600 dark:text-green-400">
                      {formatCurrency(action.estimated_savings_usd)} / month savings
                    </span>
                    <span className="text-muted-foreground">
                      {action.affected_files.length} files affected
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {t(`actions.friction_levels.${action.friction}`)} effort
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}