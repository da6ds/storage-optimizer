import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface ProviderCost {
  provider: string;
  cost: number;
  storage: number;
  trend: 'up' | 'down' | 'stable';
  color: string;
}

interface CostTilesProps {
  providers: ProviderCost[];
  totalCost: number;
  mode: 'easy' | 'standard' | 'pro';
}

export default function CostTiles({ providers, totalCost, mode }: CostTilesProps) {
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-chart-4" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-chart-2" />;
      default: return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const formatStorage = (gb: number) => {
    if (gb < 1) return `${(gb * 1024).toFixed(0)} MB`;
    if (gb < 1024) return `${gb.toFixed(1)} GB`;
    return `${(gb / 1024).toFixed(1)} TB`;
  };

  return (
    <div className="space-y-4">
      {mode === 'easy' && (
        <div className="text-center mb-6">
          <div className="text-3xl font-bold">${totalCost.toFixed(2)}/mo</div>
          <div className="text-muted-foreground">You're using about this much across 5 services</div>
          <div className="text-sm text-muted-foreground mt-2">
            💡 What this means: This is your monthly cloud storage cost
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {providers.map((provider) => (
          <Card 
            key={provider.provider} 
            className="hover-elevate cursor-pointer" 
            data-testid={`cost-tile-${provider.provider.toLowerCase()}`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: provider.color }}
                  />
                  <span className="font-medium">{provider.provider}</span>
                </div>
                {getTrendIcon(provider.trend)}
              </div>
              
              <div className="space-y-2">
                <div className="text-2xl font-bold">${provider.cost.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">
                  {formatStorage(provider.storage)}
                </div>
                
                {mode !== 'easy' && (
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Per GB: ${(provider.cost / provider.storage).toFixed(3)}</span>
                    <Badge variant="secondary" className="text-xs">
                      {provider.trend === 'up' ? '+' : provider.trend === 'down' ? '-' : '='}
                      {Math.abs(Math.random() * 10).toFixed(1)}%
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {mode === 'easy' && (
        <Card className="bg-muted/50">
          <CardContent className="p-4">
            <div className="text-sm">
              <strong>💡 What this means:</strong>
              <br />Each tile shows how much you spend with each cloud storage service. 
              The arrows show if your costs are going up ↗️, down ↘️, or staying the same.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}