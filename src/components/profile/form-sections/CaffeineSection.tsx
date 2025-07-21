
import React from 'react';
import { Coffee } from 'lucide-react';
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

interface CaffeineSectionProps {
  form: UseFormReturn<AdvancedHealthFormValues>;
}

const CaffeineSection: React.FC<CaffeineSectionProps> = ({ form }) => {
  return (
    <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="border p-4 rounded-lg bg-card/80">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Coffee className="h-5 w-5 text-health-cream" />
        Caffeine Intake
      </h3>
      <FormField
        control={form.control}
        name="caffeine"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Caffeine Intake (cups per day)</FormLabel>
            <div className="space-y-2">
              <Slider
                min={0}
                max={10}
                step={1}
                defaultValue={[field.value]}
                onValueChange={(vals) => field.onChange(vals[0])}
                className="py-4"
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>0 cups</span>
                <span className="font-medium">{field.value} cups</span>
                <span>10 cups</span>
              </div>
            </div>
            <FormDescription>
              Coffee, tea, energy drinks, etc.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </motion.div>
  );
};

export default CaffeineSection;
