import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Circle, 
  Smartphone, 
  Cloud, 
  Zap, 
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useSimulation, ChecklistState } from '../contexts/SimulationContext';

interface ChecklistItem {
  id: keyof ChecklistState;
  title: string;
  description: string;
  icon: typeof Circle;
  action: () => void;
}

export default function PersistentChecklist() {
  const [isExpanded, setIsExpanded] = useState(false);
  const { 
    checklist, 
    markDeviceLinked, 
    markCloudAccountsLinked, 
    markOptimizeRun,
    isChecklistComplete,
    refreshData 
  } = useSimulation();

  const checklistItems: ChecklistItem[] = [
    {
      id: 'deviceLinked',
      title: 'Link this device',
      description: 'Grant local scan permission',
      icon: Smartphone,
      action: markDeviceLinked
    },
    {
      id: 'cloudAccountsLinked',
      title: 'Link cloud accounts',
      description: 'Drive, iCloud, OneDrive, Dropbox',
      icon: Cloud,
      action: markCloudAccountsLinked
    },
    {
      id: 'optimizeRun',
      title: 'Optimize',
      description: 'Run suggestions/plan',
      icon: Zap,
      action: markOptimizeRun
    }
  ];

  const completedItems = checklistItems.filter(item => checklist[item.id]);
  const pendingItems = checklistItems.filter(item => !checklist[item.id]);
  const allComplete = isChecklistComplete();

  // If all items are complete, show collapsed "All set" state
  if (allComplete) {
    return (
      <div className="border-b bg-muted/30" data-testid="checklist-all-set">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-2">
            <Badge variant="default" className="gap-1">
              <CheckCircle2 className="w-3 h-3" />
              All set
            </Badge>
            <span className="text-sm text-muted-foreground">
              Setup complete
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshData}
            className="gap-1"
            data-testid="button-refresh-connections"
          >
            <RefreshCw className="w-3 h-3" />
            Refresh connections
          </Button>
        </div>
      </div>
    );
  }

  // Show active checklist with expandable content
  return (
    <div className="border-b bg-muted/30" data-testid="checklist-active">
      {/* Always visible header */}
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover-elevate"
        onClick={() => setIsExpanded(!isExpanded)}
        data-testid="checklist-header"
      >
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            {completedItems.length}/{checklistItems.length}
          </Badge>
          <span className="text-sm font-medium">
            Complete setup
          </span>
          <span className="text-xs text-muted-foreground">
            {pendingItems.length} remaining
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Expandable checklist content */}
      {isExpanded && (
        <div className="px-3 pb-3" data-testid="checklist-content">
          <Card>
            <CardContent className="p-3 space-y-2">
              {checklistItems.map((item) => {
                const isCompleted = checklist[item.id];
                const Icon = item.icon;
                const StatusIcon = isCompleted ? CheckCircle2 : Circle;

                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 rounded-md hover-elevate"
                    data-testid={`checklist-item-${item.id}`}
                  >
                    <StatusIcon 
                      className={`w-5 h-5 ${
                        isCompleted 
                          ? 'text-primary' 
                          : 'text-muted-foreground'
                      }`} 
                    />
                    <Icon className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium ${
                        isCompleted 
                          ? 'text-muted-foreground line-through' 
                          : 'text-foreground'
                      }`}>
                        {item.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                    {!isCompleted && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={item.action}
                        className="text-xs"
                        data-testid={`button-${item.id}`}
                      >
                        Set up
                      </Button>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}