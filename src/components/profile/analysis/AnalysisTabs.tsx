
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HeartPulse, Brain, Dumbbell, BedIcon, CupSoda, Utensils, Activity } from 'lucide-react';

const AnalysisTabs: React.FC = () => {
  return (
    <TabsList className="w-full mb-6 flex flex-nowrap overflow-x-auto hide-scrollbar py-1 justify-start sm:justify-between">
      <TabsTrigger value="overall" className="flex items-center gap-2 whitespace-nowrap">
        <HeartPulse className="h-4 w-4" />
        <span>Overall</span>
      </TabsTrigger>
      <TabsTrigger value="sleep" className="flex items-center gap-2 whitespace-nowrap">
        <BedIcon className="h-4 w-4" />
        <span>Sleep</span>
      </TabsTrigger>
      <TabsTrigger value="exercise" className="flex items-center gap-2 whitespace-nowrap">
        <Dumbbell className="h-4 w-4" />
        <span>Exercise</span>
      </TabsTrigger>
      <TabsTrigger value="nutrition" className="flex items-center gap-2 whitespace-nowrap">
        <Utensils className="h-4 w-4" />
        <span>Nutrition</span>
      </TabsTrigger>
      <TabsTrigger value="hydration" className="flex items-center gap-2 whitespace-nowrap">
        <CupSoda className="h-4 w-4" />
        <span>Hydration</span>
      </TabsTrigger>
      <TabsTrigger value="stress" className="flex items-center gap-2 whitespace-nowrap">
        <Brain className="h-4 w-4" />
        <span>Stress</span>
      </TabsTrigger>
      <TabsTrigger value="lifestyle" className="flex items-center gap-2 whitespace-nowrap">
        <Activity className="h-4 w-4" />
        <span>Lifestyle</span>
      </TabsTrigger>
    </TabsList>
  );
};

export default AnalysisTabs;
