
import React from 'react';
import { BedIcon } from 'lucide-react';
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
import { AdvancedHealthFormValues } from '../AdvancedHealthData';
import { motion } from 'framer-motion';

interface SleepSectionProps {
  form: UseFormReturn<AdvancedHealthFormValues>;
}

const SleepSection: React.FC<SleepSectionProps> = ({ form }) => {
  return (
    <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="border p-4 rounded-lg bg-card/80">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <BedIcon className="h-5 w-5 text-health-lavender" />
        Sleep
      </h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="sleepHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sleep Hours (per day)</FormLabel>
              <div className="space-y-2">
                <Slider
                  min={0}
                  max={12}
                  step={0.5}
                  defaultValue={[field.value]}
                  onValueChange={(vals) => field.onChange(vals[0])}
                  className="py-4"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>0 hrs</span>
                  <span className="font-medium">{field.value} hrs</span>
                  <span>12 hrs</span>
                </div>
              </div>
              <FormDescription>
                Average hours of sleep per night
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="sleepQuality"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Sleep Quality</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="poor" id="sleep-poor" />
                    <label htmlFor="sleep-poor" className="text-sm">Poor - Trouble falling/staying asleep</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="average" id="sleep-average" />
                    <label htmlFor="sleep-average" className="text-sm">Average - Occasional sleep issues</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="good" id="sleep-good" />
                    <label htmlFor="sleep-good" className="text-sm">Good - Generally sleep well</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="excellent" id="sleep-excellent" />
                    <label htmlFor="sleep-excellent" className="text-sm">Excellent - Fall asleep easily and wake refreshed</label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </motion.div>
  );
};

export default SleepSection;
