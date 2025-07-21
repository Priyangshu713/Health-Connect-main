
import React from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

const LoadingRecommendations: React.FC = () => {
  const items = [1, 2, 3, 4, 5];
  
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <motion.div 
          key={item}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: item * 0.05 }}
        >
          <div className="flex gap-4 p-5 border rounded-lg">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-[40%]" />
              <Skeleton className="h-3 w-[25%]" />
              <Skeleton className="h-3 w-full mt-2" />
              <Skeleton className="h-3 w-[90%]" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default LoadingRecommendations;
