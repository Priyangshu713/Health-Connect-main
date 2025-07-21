
import React from 'react';
import { motion } from 'framer-motion';
import { Utensils } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const LoadingNutritionPlan: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="animate-pulse flex items-center justify-center h-10 w-10 rounded-full bg-primary/20">
          <Utensils className="h-5 w-5 text-primary/40" />
        </div>
        <div>
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-4 w-48 mt-1" />
        </div>
      </div>
      
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden border-health-sky/20">
          <CardHeader className="pb-2">
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-8 w-full" />
                ))}
              </div>
              <Skeleton className="h-20 w-full" />
            </div>
          </CardContent>
        </Card>
      ))}
    </motion.div>
  );
};

export default LoadingNutritionPlan;
