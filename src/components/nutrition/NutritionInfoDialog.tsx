
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight, X } from 'lucide-react';

interface NutritionInfoDialogProps {
  category: string;
  foods: string[];
  benefits: string;
  children?: React.ReactNode;
}

const NutritionInfoDialog = ({ category, foods, benefits, children }: NutritionInfoDialogProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-primary hover:text-primary/80 p-0"
          >
            Learn more
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{category}</DialogTitle>
          <DialogDescription>
            Detailed nutritional information and benefits
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Key Benefits</h3>
            <p className="text-muted-foreground">
              {benefits}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">Recommended Foods</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {foods.map((food, i) => (
                <li key={i} className="flex items-center bg-muted/30 p-2 rounded-md">
                  <ChevronRight className="h-4 w-4 text-primary mr-2" />
                  <span>{food}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">How to Include in Your Diet</h3>
            <p className="text-muted-foreground">
              Try to include {category.toLowerCase()} in your daily meals. Aim for variety and portion control.
              {category.includes('Vegetable') && ' Raw or lightly cooked vegetables retain more nutrients.'}
              {category.includes('Fruit') && ' Whole fruits are preferable to juices as they contain more fiber.'}
              {category.includes('Protein') && ' Distribute protein intake throughout the day for optimal muscle maintenance.'}
              {category.includes('Grain') && ' Choose whole, unprocessed grains over refined versions.'}
              {category.includes('Fat') && ' Remember that healthy fats are calorie-dense, so moderate portions are key.'}
            </p>
          </div>
        </div>
        
        {/* Removed the duplicate close button that was here */}
      </DialogContent>
    </Dialog>
  );
};

export default NutritionInfoDialog;
