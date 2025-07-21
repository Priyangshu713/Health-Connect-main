
import React from 'react';
import { HeartPulse } from 'lucide-react';
import { UseFormReturn } from 'react-hook-form';
import { 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { AdvancedHealthFormValues } from '../AdvancedHealthData';
import { motion } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MedicalHistorySectionProps {
  form: UseFormReturn<AdvancedHealthFormValues>;
}

const MedicalHistorySection: React.FC<MedicalHistorySectionProps> = ({ form }) => {
  return (
    <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }} className="border p-4 rounded-lg bg-card/80">
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <HeartPulse className="h-5 w-5 text-health-lavender" />
        Medical History
      </h3>
      
      <Alert className="mb-4 bg-primary/5 border-primary/20">
        <AlertDescription>
          Providing your medical history helps us generate more personalized health insights tailored to your specific needs.
        </AlertDescription>
      </Alert>
      
      <div className="space-y-4">
        <FormField
          control={form.control}
          name="medicalConditions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Medical Conditions or Concerns</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="List any medical conditions, allergies, or health concerns..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional: Share any relevant health information
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="medications"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Medications</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="List any medications or supplements you take regularly..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional: Helps determine potential interactions
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="familyHistory"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Family Medical History</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="List any significant health conditions in your immediate family..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Optional: Information about conditions that run in your family
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </motion.div>
  );
};

export default MedicalHistorySection;
