
import React from 'react';
import { ChevronRight, Lock } from 'lucide-react';

interface FoodItemProps {
  food: string;
  useAI: boolean;
  onFoodClick: (food: string) => void;
  onAIRequiredNotice: () => void;
}

const FoodItem = ({ food, useAI, onFoodClick, onAIRequiredNotice }: FoodItemProps) => {
  if (useAI) {
    return (
      <div 
        className="flex items-center bg-muted/40 p-2 rounded-md cursor-pointer hover:bg-muted/70 transition-colors relative group"
        onClick={() => onFoodClick(food)}
      >
        <ChevronRight className="h-4 w-4 text-primary mr-1 flex-shrink-0" />
        <span>{food}</span>
        <span className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
          <span className="bg-background/80 text-xs px-2 py-1 rounded-full font-medium">
            View nutrition info
          </span>
        </span>
      </div>
    );
  } else {
    return (
      <div 
        className="flex items-center bg-muted/40 p-2 rounded-md relative group"
        onClick={onAIRequiredNotice}
      >
        <ChevronRight className="h-4 w-4 text-muted-foreground mr-1 flex-shrink-0" />
        <span className="text-muted-foreground">{food}</span>
        <span className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <Lock className="h-3 w-3 text-muted-foreground" />
        </span>
      </div>
    );
  }
};

export default FoodItem;
