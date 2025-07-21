
import React from 'react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface DoctorListSkeletonProps {
  count?: number;
}

export const DoctorListSkeleton: React.FC<DoctorListSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array(count).fill(0).map((_, index) => (
        <Card key={index} className="h-full">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-5 w-24" />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </CardContent>
          <CardFooter className="px-6 pb-6 pt-0">
            <Skeleton className="h-9 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
