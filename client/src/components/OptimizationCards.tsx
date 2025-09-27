import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Archive, Folder, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';

interface OptimizationRecommendation {
  id: string;
  type: 'duplicate' | 'cold' | 'consolidation';
  title: string;
  description: string;
  savingsPerMonth: number;
  frictionLevel: 'low' | 'medium' | 'high';
  itemCount: number;
  providerChanges?: string[];
}

interface OptimizationCardsProps {
  recommendations: OptimizationRecommendation[];
  mode: 'easy' | 'standard' | 'pro';
  onRecommendationClick: (id: string) => void;
}

const typeConfig = {
  duplicate: {
    icon: Copy,
    color: 'text-chart-3',
    bgColor: 'bg-chart-3/10',
    label: 'Duplicates'
  },
  cold: {
    icon: Archive,
    color: 'text-chart-1',
    bgColor: 'bg-chart-1/10',
    label: 'Cold Storage'
  },
  consolidation: {
    icon: Folder,
    color: 'text-chart-2',
    bgColor: 'bg-chart-2/10',
    label: 'Consolidation'
  }
};

const frictionColors = {
  low: 'text-chart-2',
  medium: 'text-chart-3',
  high: 'text-chart-4'
};

export default function OptimizationCards({ 
  recommendations, 
  mode, 
  onRecommendationClick 
}: OptimizationCardsProps) {
  const sortedRecommendations = recommendations.sort((a, b) => b.savingsPerMonth - a.savingsPerMonth);
  
  if (mode === 'easy') {
    return (
      <div className="space-y-6">
        <div className="text-center mb-6">
          <div className="text-2xl font-bold text-chart-2">
            You could save ~${sortedRecommendations.reduce((sum, r) => sum + r.savingsPerMonth, 0).toFixed(2)}/mo
          </div>
          <div className="text-muted-foreground">Here are three ways to optimize your storage</div>
        </div>
        
        <div className="grid gap-6">
          {sortedRecommendations.slice(0, 3).map((rec) => {
            const config = typeConfig[rec.type];
            const Icon = config.icon;
            
            return (
              <Card key={rec.id} className={`hover-elevate cursor-pointer ${config.bgColor}`}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-background ${config.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{config.label}</CardTitle>
                      <div className="text-2xl font-bold text-chart-2">
                        ${rec.savingsPerMonth.toFixed(2)}/mo savings
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4">{rec.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary">{rec.itemCount} items</Badge>
                    <Button 
                      size="sm" 
                      onClick={() => onRecommendationClick(rec.id)}
                      data-testid={`button-rec-${rec.type}`}
                    >
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="text-sm">
              <strong>💡 What this means:</strong>
              <br />These cards show the best ways to save money on your storage. 
              Each recommendation tells you how much you could save per month and how many files are involved.
            </div>
          </CardContent>
        </Card>
        
        <Button 
          className="w-full" 
          variant="outline" 
          disabled 
          data-testid="button-plan-savings"
        >
          Plan my savings (Coming Soon)
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {mode === 'standard' && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Recommendations</h2>
            <p className="text-sm text-muted-foreground">Sorted by monthly savings</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-chart-2">
              ${sortedRecommendations.reduce((sum, r) => sum + r.savingsPerMonth, 0).toFixed(2)}/mo
            </div>
            <div className="text-xs text-muted-foreground">Total potential savings</div>
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        {sortedRecommendations.map((rec) => {
          const config = typeConfig[rec.type];
          const Icon = config.icon;
          
          return (
            <Card 
              key={rec.id} 
              className="hover-elevate cursor-pointer"
              onClick={() => onRecommendationClick(rec.id)}
              data-testid={`rec-card-${rec.id}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className={`p-2 rounded-lg ${config.bgColor} ${config.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{rec.title}</div>
                      <div className="text-sm text-muted-foreground">{rec.description}</div>
                      
                      {mode === 'pro' && rec.providerChanges && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Affects: {rec.providerChanges.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right space-y-1">
                    <div className="font-bold text-chart-2">
                      ${rec.savingsPerMonth.toFixed(2)}/mo
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {rec.itemCount} items
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${frictionColors[rec.frictionLevel]}`}
                      >
                        {rec.frictionLevel} friction
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}