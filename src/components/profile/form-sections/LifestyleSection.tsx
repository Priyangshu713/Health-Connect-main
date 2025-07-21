
import React from 'react';
import { Wine, Cigarette } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AdvancedHealthFormValues } from '../AdvancedHealthData';
import { motion } from 'framer-motion';

interface LifestyleSectionProps {
  form: UseFormReturn<AdvancedHealthFormValues>;
}

const LifestyleSection: React.FC<LifestyleSectionProps> = ({ form }) => {
  return (
    <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="border p-4 rounded-lg bg-card/80">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Wine className="h-5 w-5 text-purple-500" />
        Lifestyle Factors
      </h3>
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="smoking"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel className="flex items-center gap-2">
                <Cigarette className="h-4 w-4 text-gray-500" />
                Smoking Status
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="never" id="smoke-never" />
                    <label htmlFor="smoke-never" className="text-sm">Never smoked</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="former" id="smoke-former" />
                    <label htmlFor="smoke-former" className="text-sm">Former smoker</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="occasional" id="smoke-occasional" />
                    <label htmlFor="smoke-occasional" className="text-sm">Occasional smoker</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="regular" id="smoke-regular" />
                    <label htmlFor="smoke-regular" className="text-sm">Regular smoker</label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="alcoholConsumption"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Alcohol Consumption</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="never" id="alcohol-never" />
                    <label htmlFor="alcohol-never" className="text-sm">Never drink alcohol</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="occasional" id="alcohol-occasional" />
                    <label htmlFor="alcohol-occasional" className="text-sm">Occasional (few drinks monthly)</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moderate" id="alcohol-moderate" />
                    <label htmlFor="alcohol-moderate" className="text-sm">Moderate (few drinks weekly)</label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="frequent" id="alcohol-frequent" />
                    <label htmlFor="alcohol-frequent" className="text-sm">Frequent (almost daily)</label>
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

export default LifestyleSection;
