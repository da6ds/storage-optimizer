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
                        
                        {/* Enhanced action metadata */}
                        <div className="space-y-3 mt-3">
                          {/* Primary savings display */}
                          <div className="flex items-center justify-between">
                            <div className="text-lg font-bold text-green-600 dark:text-green-400" data-testid={`text-action-savings-${action.id}`}>
                              {formatCurrency(action.estimated_savings_usd)} {t('actions.per_month')}
                            </div>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${getFrictionColor(action.friction)}`}
                              data-testid={`badge-friction-${action.id}`}
                            >
                              {t(`actions.friction_levels.${action.friction}`)} effort
                            </Badge>
                          </div>

                          {/* GB affected and impact details */}
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <div className="text-muted-foreground text-xs">
                                {action.type === 'dedupe' ? t('actions.gb_saved') :
                                 action.type === 'cold_storage' ? t('actions.gb_archived') :
                                 t('actions.gb_affected')}
                              </div>
                              <div className="font-medium" data-testid={`text-gb-affected-${action.id}`}>
                                {(() => {
                                  const totalGB = action.affected_files.reduce((sum, file) => sum + file.size_bytes, 0) / (1024 * 1024 * 1024);
                                  if (action.type === 'dedupe') {
                                    // For dedupe, only count redundant copies (all but one)
                                    const redundantGB = totalGB * (action.affected_files.length - 1) / action.affected_files.length;
                                    return redundantGB.toFixed(1);
                                  }
                                  return totalGB.toFixed(1);
                                })()}
                                {' '}{t('units.gb')}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground text-xs">{t('actions.files_affected')}</div>
                              <div className="font-medium" data-testid={`text-files-affected-${action.id}`}>
                                {action.affected_files.length} {action.affected_files.length === 1 ? t('labels.file') : t('labels.files')}
                              </div>
                            </div>
                          </div>

                          {/* Migration costs and provider changes */}
                          {showDetails && action.provider_changes.length > 0 && (
                            <div className="space-y-2">
                              <div className="text-xs text-muted-foreground">
                                <div className="font-medium">{t('actions.provider_changes')}:</div>
                                <div className="mt-1">
                                  {action.provider_changes.map((change, idx) => (
                                    <div key={idx} className="text-xs text-muted-foreground">
                                      • {change}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {/* One-time migration cost estimate */}
                              {action.type === 'consolidation' && action.affected_files.length > 0 && (
                                <div className="text-xs text-amber-600 dark:text-amber-400" data-testid={`text-migration-cost-${action.id}`}>
                                  {t('actions.migration_cost_note')}: ~{formatCurrency(Math.max(1, action.estimated_savings_usd * 0.1))} {t('actions.one_time')}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Redundancy safety for deduplication actions */}
                          {action.type === 'dedupe' && (
                            <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-md border border-green-200 dark:border-green-800">
                              <div className="text-xs text-green-700 dark:text-green-300">
                                <div className="font-medium">{t('actions.redundancy_safety')}</div>
                                <div className="mt-1">{t('actions.redundancy_explanation', { copies: 1 })}</div>
                              </div>
                            </div>
                          )}

                          {/* Special handling for provider closure actions */}
                          {action.type === 'consolidation' && action.affected_files.length === 0 && (
                            <div className="bg-orange-50 dark:bg-orange-950/20 p-3 rounded-md border border-orange-200 dark:border-orange-800">
                              <div className="text-xs text-orange-700 dark:text-orange-300">
                                <div className="font-medium">{t('actions.provider_closure_warning')}</div>
                                <div className="mt-1">{t('actions.closure_caveat')}</div>
                              </div>
                            </div>
                          )}
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