
import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { ChevronRight, Utensils } from 'lucide-react';
import NutritionInfoDialog from './NutritionInfoDialog';

interface NutritionCategory {
  category: string;
  benefits: string;
  foods: string[];
  imageUrl: string;
}

interface GeneralNutritionCardProps {
  category: NutritionCategory;
  variants: any;
}

const GeneralNutritionCard = ({ category, variants }: GeneralNutritionCardProps) => {
  // Use fallback image if the provided one fails to load or doesn't exist
  const fallbackImage = "/lovable-uploads/85e10dd8-810c-44de-8661-df3911e610ce.png";
  
  return (
    <motion.div variants={variants}>
      <Card className="overflow-hidden border-health-sky/20">
        <div className="md:flex">
          <div className="md:w-1/3 h-60 md:h-auto relative overflow-hidden">
            <img 
              src={category.imageUrl || fallbackImage}
              alt={category.category}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== fallbackImage) {
                  target.src = fallbackImage;
                }
              }}
            />
          </div>
          <div className="md:w-2/3 p-6">
            <h3 className="text-xl font-semibold mb-2 flex items-center">
              <Utensils className="mr-2 h-5 w-5 text-primary" />
              {category.category}
            </h3>
            
            <p className="text-muted-foreground mb-4">{category.benefits}</p>
            
            <h4 className="text-sm font-medium mb-2">Top Foods:</h4>
            <ul className="grid grid-cols-2 gap-1 mb-4">
              {category.foods.slice(0, 5).map((food, i) => (
                <li key={i} className="flex items-start">
                  <ChevronRight className="h-4 w-4 text-primary mt-1 mr-1 flex-shrink-0" />
                  <span>{food}</span>
                </li>
              ))}
            </ul>
            
            <NutritionInfoDialog 
              category={category.category}
              foods={category.foods}
              benefits={category.benefits}
            />
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default GeneralNutritionCard;
