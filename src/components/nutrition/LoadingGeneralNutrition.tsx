
import React from 'react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingGeneralNutritionProps {
  count?: number;
}

const LoadingGeneralNutrition: React.FC<LoadingGeneralNutritionProps> = ({ count = 3 }) => {
  return (
    <div className="space-y-6">
      {Array(count).fill(0).map((_, index) => (
        <Card key={index} className="overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/3 h-60">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="md:w-2/3 p-6 space-y-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              
              <div className="pt-2">
                <Skeleton className="h-4 w-1/4 mb-2" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
              
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default LoadingGeneralNutrition;
