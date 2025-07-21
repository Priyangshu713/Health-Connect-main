
import React from 'react';
import { Apple, CupSoda, Utensils, BookOpen } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { AdvancedHealthFormValues } from '../AdvancedHealthData';
import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';

interface NutritionSectionProps {
  form: UseFormReturn<AdvancedHealthFormValues>;
}

const NutritionSection: React.FC<NutritionSectionProps> = ({ form }) => {
  return (
    <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="border p-4 rounded-lg bg-card/80">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Apple className="h-5 w-5 text-green-500" />
        Nutrition & Hydration
      </h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="waterIntake"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <CupSoda className="h-4 w-4 text-health-sky" />
                Water Intake (liters per day)
              </FormLabel>
              <div className="space-y-2">
                <Slider
                  min={0}
                  max={5}
                  step={0.1}
                  defaultValue={[field.value]}
                  onValueChange={(vals) => field.onChange(vals[0])}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>0 L</span>
                  <span className="font-medium">{field.value} L</span>
                  <span>5 L</span>
                </div>
              </div>
              <FormDescription>
                Average water consumption per day
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* We'll use dietaryRestrictions instead of dietaryPreferences to match the schema */}
        <FormField
          control={form.control}
          name="dietaryRestrictions"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-amber-500" />
                Dietary Preferences & Restrictions
              </FormLabel>
              <FormControl>
                <Textarea
                  placeholder="List any dietary preferences or restrictions (e.g., vegetarian, gluten-free, allergies, etc.)"
                  {...field}
                  className="resize-none"
                />
              </FormControl>
              <FormDescription>
                This helps us provide more personalized nutrition recommendations
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="diet"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Diet Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="omnivore" id="diet-omnivore" />
                    <label htmlFor="diet-omnivore" className="text-sm">Omnivore (Meat and plants)</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vegetarian" id="diet-vegetarian" />
                    <label htmlFor="diet-vegetarian" className="text-sm">Vegetarian</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="vegan" id="diet-vegan" />
                    <label htmlFor="diet-vegan" className="text-sm">Vegan</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="pescatarian" id="diet-pescatarian" />
                    <label htmlFor="diet-pescatarian" className="text-sm">Pescatarian</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="keto" id="diet-keto" />
                    <label htmlFor="diet-keto" className="text-sm">Keto/Low-carb</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="balanced" id="diet-balanced" />
                    <label htmlFor="diet-balanced" className="text-sm">Balanced/No specific diet</label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="foodHabits"
          render={() => (
            <FormItem>
              <div className="mb-2">
                <FormLabel className="flex items-center gap-2">
                  <Utensils className="h-4 w-4 text-orange-500" />
                  Food Habits
                </FormLabel>
                <FormDescription>
                  Select all that apply to you
                </FormDescription>
              </div>
              <div className="space-y-2">
                <FormField
                  control={form.control}
                  name="foodHabits.regularMeals"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm">
                          I eat regular meals (3+ meals daily)
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="foodHabits.lateNightSnacking"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm">
                          I often snack late at night
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="foodHabits.fastFood"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm">
                          I eat fast food frequently (2+ times weekly)
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="foodHabits.highSugar"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm">
                          I consume high sugar foods/drinks daily
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </motion.div>
  );
};

export default NutritionSection;
