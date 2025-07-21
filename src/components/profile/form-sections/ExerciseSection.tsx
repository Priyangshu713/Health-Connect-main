
import React from 'react';
import { Dumbbell } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { AdvancedHealthFormValues } from '../AdvancedHealthData';
import { motion } from 'framer-motion';

interface ExerciseSectionProps {
  form: UseFormReturn<AdvancedHealthFormValues>;
}

const ExerciseSection: React.FC<ExerciseSectionProps> = ({ form }) => {
  return (
    <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="border p-4 rounded-lg bg-card/80">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Dumbbell className="h-5 w-5 text-health-mint" />
        Exercise
      </h3>
      <FormField
        control={form.control}
        name="exerciseHours"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Exercise (hours per week)</FormLabel>
            <div className="space-y-2">
              <Slider
                min={0}
                max={14}
                step={0.5}
                defaultValue={[field.value]}
                onValueChange={(vals) => field.onChange(vals[0])}
                className="py-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>0 hrs</span>
                <span className="font-medium">{field.value} hrs</span>
                <span>14 hrs</span>
              </div>
            </div>
            <FormDescription>
              Hours spent exercising per week
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </motion.div>
  );
};

export default ExerciseSection;
