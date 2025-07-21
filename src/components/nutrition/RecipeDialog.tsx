
import React from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Recipe } from '@/services/NutritionGeminiService';
import { Clock, UtensilsCrossed, ScrollText, Leaf } from 'lucide-react';

interface RecipeDialogProps {
  recipe: Recipe | null;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
}

const RecipeDialog: React.FC<RecipeDialogProps> = ({ recipe, isOpen, onClose, isLoading }) => {
  if (!recipe && !isLoading) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <div className="flex justify-center">
              <motion.div 
                className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <p className="text-center text-muted-foreground">Generating recipe...</p>
          </div>
        ) : recipe ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">{recipe.title}</DialogTitle>
              <p className="text-center text-muted-foreground">{recipe.description}</p>
            </DialogHeader>
            
            <div className="flex items-center justify-center gap-4 my-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{recipe.preparationTime}</span>
              </div>
              {recipe.nutritionInfo && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <div className="flex items-center gap-1">
                    <Leaf className="h-4 w-4 text-green-500" />
                    <span className="text-sm">Nutrition info available</span>
                  </div>
                </>
              )}
            </div>
            
            <Separator />
            
            <div className="space-y-6 py-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  Ingredients
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={index} className="flex items-center">
                      <span className="h-2 w-2 rounded-full bg-primary mr-2" />
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                  <ScrollText className="h-5 w-5 text-primary" />
                  Instructions
                </h3>
                <ol className="space-y-3">
                  {recipe.instructions.map((step, index) => (
                    <li key={index} className="flex">
                      <span className="flex-shrink-0 h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 mt-0.5">
                        {index + 1}
                      </span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              
              {recipe.nutritionInfo && (
                <>
                  <Separator />
                  <div>
                    <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-green-500" />
                      Nutrition Information
                    </h3>
                    <p className="text-muted-foreground">{recipe.nutritionInfo}</p>
                  </div>
                </>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>Close</Button>
            </DialogFooter>
          </>
        ) : (
          <div className="p-8">
            <p className="text-center text-muted-foreground">No recipe data available</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default RecipeDialog;
