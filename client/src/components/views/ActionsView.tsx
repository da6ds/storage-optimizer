import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Zap, AlertCircle, Copy, Archive, FolderOpen } from 'lucide-react';
import { useSimulation, useI18n } from '../../contexts/SimulationContext';
import { formatCurrency } from '../../../../shared/simulation';
import EstimatedSavingsBanner from '../EstimatedSavingsBanner';

export default function ActionsView() {
  const { optimizationActions, mode } = useSimulation();
  const { t } = useI18n();

  const totalSavings = optimizationActions.reduce((sum, action) => sum + action.estimated_savings_usd, 0);

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'dedupe': return Copy;
      case 'cold_storage': return Archive;
      case 'consolidation': return FolderOpen;
      default: return Zap;
    }
  };

  const getFrictionColor = (friction: string) => {
    switch (friction) {
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="h-full overflow-auto p-4 space-y-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{t('actions.title')}</h1>
        <p className="text-muted-foreground">{t('actions.subtitle')}</p>
      </div>

      {/* Estimated Savings Banner */}
      <EstimatedSavingsBanner />

      {/* Total savings potential */}
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(totalSavings)}
          </div>
          <div className="text-sm text-muted-foreground">
            {t('labels.save_per_month')}
          </div>
        </CardContent>
      </Card>

      {/* Explanation */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            {t(`actions.what_this_means.${mode}`)}
          </p>
        </CardContent>
      </Card>

      {/* Actions list */}
      <div className="space-y-3">
        {optimizationActions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">{t('actions.no_actions')}</p>
            </CardContent>
          </Card>
        ) : (
          optimizationActions.map((action) => {
            const Icon = getActionIcon(action.type);
            
            return (
              <Card key={action.id} className="hover-elevate">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-1">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">
                          {action.title}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {action.description}
                        </CardDescription>
                        
                        {/* Action metadata */}
                        <div className="flex items-center space-x-3 mt-2">
                          <div className="text-sm font-medium text-green-600 dark:text-green-400">
                            {formatCurrency(action.estimated_savings_usd)} / month
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getFrictionColor(action.friction)}`}
                          >
                            {t(`actions.friction_levels.${action.friction}`)} {t('labels.friction')}
                          </Badge>
                          <Tooltip>
                            <TooltipTrigger>
                              <AlertCircle className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs">{t('labels.risk_note')}</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        {/* Affected files/providers summary */}
                        <div className="text-xs text-muted-foreground mt-2">
                          Affects {action.affected_files.length} files across {action.provider_changes.length} providers
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })
        )}
      </div>

      {/* Plan my savings CTA */}
      <Card className="border-dashed">
        <CardContent className="p-4 text-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                disabled 
                size="lg" 
                className="w-full"
                data-testid="button-plan-savings"
              >
                <Zap className="h-4 w-4 mr-2" />
                {t('actions.plan_savings_cta')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">
                {t('actions.plan_disabled_tooltip')}
              </p>
            </TooltipContent>
          </Tooltip>
          <p className="text-xs text-muted-foreground mt-2">
            {t('labels.risk_note')}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}