
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Info, Heart, List, Utensils } from 'lucide-react';

interface NutritionTipsProps {
  variants: any;
}

const NutritionTips = ({ variants }: NutritionTipsProps) => {
  return (
    <motion.div variants={variants}>
      <Card className="border-health-lavender/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-primary" />
            Quick Nutrition Tips
          </CardTitle>
          <CardDescription>
            Simple guidelines for healthier eating habits
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="p-2 rounded-full bg-health-mint/20 h-fit">
              <Heart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium mb-1">Stay Hydrated</h4>
              <p className="text-sm text-muted-foreground">
                Aim for 8 glasses of water daily. Proper hydration supports all bodily functions and helps control appetite.
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex gap-4">
            <div className="p-2 rounded-full bg-health-cream/20 h-fit">
              <List className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium mb-1">Portion Control</h4>
              <p className="text-sm text-muted-foreground">
                Use smaller plates, eat slowly, and be mindful of serving sizes to avoid overeating.
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex gap-4">
            <div className="p-2 rounded-full bg-health-pink/20 h-fit">
              <Utensils className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h4 className="font-medium mb-1">Balanced Meals</h4>
              <p className="text-sm text-muted-foreground">
                Aim for a mix of protein, healthy fats, and complex carbohydrates at each meal to maintain energy levels.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default NutritionTips;
