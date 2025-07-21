
import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { RefreshCw, Brain } from 'lucide-react';
import { InsightSection } from './types';
import InsightCard from './InsightCard';

interface InsightsContentProps {
  healthDataComplete: boolean;
  loading: boolean;
  error: string | null;
  insights: InsightSection[];
  onRetry: () => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const InsightsContent: React.FC<InsightsContentProps> = ({
  healthDataComplete,
  loading,
  error,
  insights,
  onRetry
}) => {
  if (!healthDataComplete) {
    return (
      <div className="flex flex-col items-center justify-center py-6 text-center space-y-3">
        <Brain className="h-10 w-10 text-muted-foreground/40" />
        <p className="text-muted-foreground">
          Complete your health profile to receive personalized AI insights
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-destructive">{error}</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="mt-4"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-4" 
      variants={container}
      initial="hidden"
      animate="show"
    >
      {insights.map((insight, index) => (
        <InsightCard key={index} insight={insight} index={index} />
      ))}
    </motion.div>
  );
};

export default InsightsContent;
