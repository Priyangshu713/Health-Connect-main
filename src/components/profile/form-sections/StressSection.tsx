
import React from 'react';
import { Brain } from 'lucide-react';
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

interface StressSectionProps {
  form: UseFormReturn<AdvancedHealthFormValues>;
}

const StressSection: React.FC<StressSectionProps> = ({ form }) => {
  return (
    <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="border p-4 rounded-lg bg-card/80">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Brain className="h-5 w-5 text-health-pink" />
        Stress & Mental Health
      </h3>
      <FormField
        control={form.control}
        name="stressLevel"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Stress Level</FormLabel>
            <div className="space-y-2">
              <Slider
                min={1}
                max={10}
                step={1}
                defaultValue={[field.value]}
                onValueChange={(vals) => field.onChange(vals[0])}
                className="py-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Low</span>
                <span className="font-medium">Level {field.value}</span>
                <span>High</span>
              </div>
            </div>
            <FormDescription>
              Rate your average stress level
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </motion.div>
  );
};

export default StressSection;
