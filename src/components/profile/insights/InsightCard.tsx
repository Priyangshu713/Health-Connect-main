
import React from 'react';
import { motion } from 'framer-motion';
import { InsightSection } from './types';

interface InsightCardProps {
  insight: InsightSection;
  index: number;
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

const InsightCard: React.FC<InsightCardProps> = ({ insight, index }) => {
  const getCardClassName = (type: string) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-800/30';
      case 'warning':
        return 'bg-amber-50/50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/30';
      case 'critical':
        return 'bg-red-50/50 border-red-200 dark:bg-red-950/20 dark:border-red-800/30';
      default:
        return 'bg-blue-50/50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800/30';
    }
  };

  return (
    <motion.div 
      key={index} 
      variants={item}
      className={`p-4 rounded-lg border flex gap-3 ${getCardClassName(insight.type)}`}
    >
      <div className="flex-shrink-0 mt-1">
        {insight.icon}
      </div>
      <div className="space-y-1 text-left prose-sm max-w-none">
        <h4 className="font-medium text-left">{insight.title}</h4>
        <div 
          className="text-sm text-muted-foreground text-left"
          dangerouslySetInnerHTML={{ __html: insight.content }}
        />
        {insight.recommendation && (
          <div className="text-sm mt-1 pt-1 border-t border-dashed border-muted text-left">
            <span className="font-medium">Recommendation:</span> {insight.recommendation}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default InsightCard;
