import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Zap, AlertCircle, Copy, Archive, FolderOpen } from 'lucide-react';
import { useLocation } from 'wouter';
import { useSimulation, useI18n } from '../../contexts/SimulationContext';
import { formatCurrency } from '../../../../shared/simulation';
import EstimatedSavingsBanner from '../EstimatedSavingsBanner';
import HealthScoreDisplay from '../HealthScoreDisplay';

export default function ActionsView() {
  const { mode, isProUser, showDetails, getRealisticOptimizationActions } = useSimulation();
  const { t } = useI18n();
  const [, setLocation] = useLocation();
  
  const isPro = isProUser();

  // Get centralized realistic actions with proper scaling
  const { actions: realisticActions, totalSavings: fullTotalSavings } = getRealisticOptimizationActions();

  // Limit to 3-5 items max and sort by savings (avoid mutating original array)
  const maxItems = mode === 'easy' ? 3 : 5;
  const sortedActions = [...realisticActions]
    .sort((a, b) => b.estimated_savings_usd - a.estimated_savings_usd)
    .slice(0, maxItems);

  // For display, show the sum of visible actions, not the full total
  const totalSavings = sortedActions.reduce((sum, action) => sum + action.estimated_savings_usd, 0);

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

      {/* Health Score */}
      <HealthScoreDisplay />

      {/* Estimated Savings Banner */}
      <EstimatedSavingsBanner />

      {/* Total savings potential - always show in simulation */}
      {totalSavings > 0 && (
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(totalSavings)}
            </div>
            <div className="text-sm text-muted-foreground" data-testid="text-total-savings">
              {t('labels.potential_monthly_savings')} • {sortedActions.length} {sortedActions.length === 1 ? t('labels.recommendation') : t('labels.recommendations')}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Explanation */}
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            {mode === 'easy' 
              ? t('actions.explanation_easy')
              : t('actions.explanation_standard')
            }
          </p>
        </CardContent>
      </Card>

      {/* Actions list */}
      <div className="space-y-3">
        {sortedActions.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center">
              <Zap className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">{t('actions.no_actions')}</p>
            </CardContent>
          </Card>
        ) : (
          sortedActions.map((action, index) => {
            const Icon = getActionIcon(action.type);
            const isRecommended = index === 0; // Top action is recommended
            const isSecondary = index === 1; // Second action gets secondary highlight
            
            return (
              <Card 
                key={action.id} 
                className={`hover-elevate ${
                  isRecommended 
                    ? 'ring-2 ring-primary bg-primary/5 dark:bg-primary/10' 
                    : isSecondary 
                    ? 'ring-1 ring-primary/50 bg-primary/5 dark:bg-primary/10'
                    : ''
                }`}
                data-testid={`card-action-${action.id}`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className="mt-1">
                        <Icon className={`h-5 w-5 ${isRecommended ? 'text-primary' : 'text-muted-foreground'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <CardTitle className="text-base">
                            {action.title}
                          </CardTitle>
                          {isRecommended && (
                            <Badge className="text-xs bg-primary text-primary-foreground">
                              {t('actions.recommended_badge')}
                            </Badge>
                          )}
                          {isSecondary && (
                            <Badge variant="outline" className="text-xs border-primary/50 text-primary">
                              {t('actions.good_choice_badge')}
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="mt-1">
                          {action.description}
                        </CardDescription>
                        
                        {/* Action metadata - always show savings in simulation */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="text-lg font-bold text-green-600 dark:text-green-400" data-testid={`text-action-savings-${action.id}`}>
                            {formatCurrency(action.estimated_savings_usd)} / month
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getFrictionColor(action.friction)}`}
                            data-testid={`badge-friction-${action.id}`}
                          >
                            {t(`actions.friction_levels.${action.friction}`)} effort
                          </Badge>
                        </div>

                        {/* Simplified summary */}
                        {showDetails && (
                          <div className="text-xs text-muted-foreground mt-2">
                            {action.affected_files.length} files
                          </div>
                        )}
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
          {isPro ? (
            // Paid tier users - go to Plan preview
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => setLocation('/plan')}
              data-testid="button-plan-savings"
            >
              <Zap className="h-4 w-4 mr-2" />
              {t('actions.plan_savings_cta')}
            </Button>
          ) : (
            // Free tier users - go to Upgrade flow
            <Button 
              size="lg" 
              className="w-full"
              onClick={() => setLocation('/upgrade')}
              data-testid="button-plan-savings"
            >
              <Zap className="h-4 w-4 mr-2" />
              {t('actions.plan_savings_cta')}
            </Button>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {isPro ? t('labels.risk_note') : 'Upgrade to apply these optimizations automatically'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}