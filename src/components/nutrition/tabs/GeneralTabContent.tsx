
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';
import GeneralNutritionCard from '../GeneralNutritionCard';
import NutritionTips from '../NutritionTips';
import LoadingGeneralNutrition from '../LoadingGeneralNutrition';

interface NutritionCategory {
  category: string;
  benefits: string;
  foods: string[];
  imageUrl: string;
}

interface GeneralTabContentProps {
  generalNutrition: NutritionCategory[];
  generalLoading: boolean;
  generalError: string | null;
  refreshData: () => void;
  containerVariants: any;
  itemVariants: any;
}

const GeneralTabContent = ({ 
  generalNutrition, 
  generalLoading, 
  generalError, 
  refreshData,
  containerVariants,
  itemVariants
}: GeneralTabContentProps) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {generalLoading ? (
        <LoadingGeneralNutrition count={5} />
      ) : generalError ? (
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-xl">Error Loading Recommendations</CardTitle>
            <CardDescription>{generalError}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={refreshData} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          {generalNutrition.map((category, index) => (
            <GeneralNutritionCard 
              key={index} 
              category={category} 
              variants={itemVariants}
            />
          ))}
          
          <motion.div variants={itemVariants} className="mt-4 flex justify-end">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Recommendations
            </Button>
          </motion.div>
        </>
      )}
      
      <NutritionTips variants={itemVariants} />
    </motion.div>
  );
};

export default GeneralTabContent;
