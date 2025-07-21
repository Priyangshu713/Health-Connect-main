
import { ReactElement } from 'react';

export interface InsightSection {
  title: string;
  content: string;
  type: 'normal' | 'warning' | 'critical' | 'positive';
  icon: ReactElement;
  recommendation?: string;
}

export interface HealthInsightsProps {
  className?: string;
}

export type InsightIconType = 'normal' | 'warning' | 'critical' | 'positive';
