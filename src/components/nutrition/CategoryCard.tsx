
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Utensils, Wand2, CookingPot, RefreshCw, ChefHat, Lock } from 'lucide-react';
import FoodItem from './FoodItem';

interface Category {
  category: string;
  benefits: string;
  foods: string[];
  mealPlan?: string;
}

interface CategoryCardProps {
  category: Category;
  useAI: boolean;
  index: number;
  refreshingCategory: string | null;
  fetchRecipeDetails: (mealPlan: string) => void;
  refreshCategoryMealPlan: (categoryName: string) => void;
  handleFoodClick: (food: string) => void;
  handleAIRequiredNotice: () => void;
  variants: any;
}

const CategoryCard = ({ 
  category, 
  useAI,
  index,
  refreshingCategory,
  fetchRecipeDetails,
  refreshCategoryMealPlan,
  handleFoodClick,
  handleAIRequiredNotice,
  variants 
}: CategoryCardProps) => {
  return (
    <motion.div variants={variants}>
      <Card className="overflow-hidden border-health-sky/20">
        <CardHeader className="pb-2">
          <Badge variant="outline" className="w-fit mb-2">
            {useAI ? (
              <div className="flex items-center gap-1">
                <Wand2 className="h-3 w-3 text-primary mr-1" />
                AI Recommendation
              </div>
            ) : (
              "Recommended"
            )}
          </Badge>
          <CardTitle className="text-xl font-semibold flex items-center">
            <Utensils className="mr-2 h-5 w-5 text-primary" />
            {category.category}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            {category.benefits}
          </p>
          
          <div>
            <h4 className="text-sm font-medium mb-2 flex items-center">
              Recommended Foods:
              {!useAI && (
                <span className="ml-2 flex items-center text-xs text-muted-foreground">
                  <Lock className="h-3 w-3 mr-1" />
                  Enable AI for details
                </span>
              )}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {category.foods.map((food, i) => (
                <FoodItem 
                  key={i} 
                  food={food} 
                  useAI={useAI} 
                  onFoodClick={handleFoodClick} 
                  onAIRequiredNotice={handleAIRequiredNotice} 
                />
              ))}
            </div>
          </div>
          
          {useAI && category.mealPlan && (
            <div className="mt-4 relative">
              <div className="p-4 bg-muted/50 rounded-lg border group hover:bg-muted/70 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium flex items-center">
                    <CookingPot className="h-4 w-4 text-primary mr-1" />
                    Meal Ideas
                  </h4>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      refreshCategoryMealPlan(category.category);
                    }}
                    disabled={refreshingCategory === category.category}
                  >
                    {refreshingCategory === category.category ? (
                      <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                      />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                
                <div 
                  className="text-sm relative cursor-pointer"
                  onClick={() => fetchRecipeDetails(category.mealPlan || "")}
                >
                  {category.mealPlan}
                  
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-primary/10 backdrop-blur-sm transition-opacity rounded">
                    <Button size="sm" variant="secondary" className="gap-2">
                      <ChefHat className="h-4 w-4" />
                      View Recipe
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CategoryCard;
