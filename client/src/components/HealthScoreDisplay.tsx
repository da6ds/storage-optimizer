import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { useSimulation, useI18n } from '../contexts/SimulationContext';

export default function HealthScoreDisplay() {
  const { getHealthScore, showDetails } = useSimulation();
  const { t } = useI18n();
  const [showExplainer, setShowExplainer] = useState(false);

  const score = getHealthScore();
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreZone = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'bg-green-500' };
    if (score >= 60) return { label: 'Good', color: 'bg-yellow-500' };
    return { label: 'Needs Attention', color: 'bg-red-500' };
  };

  const zone = getScoreZone(score);

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Storage Health Score</CardTitle>
            <CardDescription>Higher is better</CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowExplainer(!showExplainer)}
            data-testid="button-health-explainer"
          >
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-3xl font-bold">
            <span className={getScoreColor(score)}>{score}</span>
            <span className="text-lg text-muted-foreground">/100</span>
          </div>
          <Badge variant="outline" className={`${zone.color} text-white`}>
            {zone.label}
          </Badge>
        </div>
        
        <Progress value={score} className="h-2" />
        
        {showDetails && (showExplainer || true) && (
          <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
            <p className="font-medium">What this means:</p>
            <p>We look at duplicates, large old files, cost efficiency, and how scattered your files are. The score helps you understand your storage health at a glance.</p>
            <div className="mt-2 space-y-1">
              <p>• Duplication (35%): Fewer duplicates = higher score</p>
              <p>• Cold bulk (25%): Less old, large files = higher score</p>
              <p>• Cost efficiency (25%): Lower potential savings = higher score</p>
              <p>• Fragmentation (10%): Fewer providers = higher score</p>
              <p>• Risk posture (5%): Having backups = bonus points</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}