import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import type { FamiliarityLevel, Goal } from './Onboarding';

interface ModeSelectorProps {
  familiarity: FamiliarityLevel;
  goal: Goal;
  onFamiliarityChange: (familiarity: FamiliarityLevel) => void;
  onGoalChange: (goal: Goal) => void;
}

const familiarityLabels = {
  easy: 'Easy',
  standard: 'Standard', 
  pro: 'Pro'
};

const goalLabels = {
  view: 'View Only',
  suggest: 'Suggestions',
  plan: 'Plan'
};

export default function ModeSelector({ 
  familiarity, 
  goal, 
  onFamiliarityChange, 
  onGoalChange 
}: ModeSelectorProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" data-testid="button-familiarity-selector">
            {familiarityLabels[familiarity]}
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onFamiliarityChange('easy')}>
            Easy
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFamiliarityChange('standard')}>
            Standard
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onFamiliarityChange('pro')}>
            Pro
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" data-testid="button-goal-selector">
            {goalLabels[goal]}
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onGoalChange('view')}>
            View Only
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onGoalChange('suggest')}>
            Suggestions
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onGoalChange('plan')}>
            Plan
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}