
import React from 'react';
import { InfoIcon, Lightbulb, Sparkles } from 'lucide-react';
import { InsightIconType } from './types';

export const getInsightIcon = (type: InsightIconType) => {
  switch (type) {
    case 'positive':
      return <Lightbulb className="h-5 w-5 text-green-500" />;
    case 'warning':
      return <InfoIcon className="h-5 w-5 text-amber-500" />;
    case 'critical':
      return <InfoIcon className="h-5 w-5 text-red-500" />;
    default:
      return <Sparkles className="h-5 w-5 text-blue-500" />;
  }
};
