
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useHealthStore } from '@/store/healthStore';

// Import section components
import SleepSection from './form-sections/SleepSection';
import ExerciseSection from './form-sections/ExerciseSection';
import StressSection from './form-sections/StressSection';
import NutritionSection from './form-sections/NutritionSection';
import CaffeineSection from './form-sections/CaffeineSection';
import LifestyleSection from './form-sections/LifestyleSection';
import MedicalHistorySection from './form-sections/MedicalHistorySection';

const advancedHealthSchema = z.object({
  sleepHours: z.number().min(0).max(24),
  exerciseHours: z.number().min(0).max(24),
  stressLevel: z.number().min(1).max(10),
  waterIntake: z.number().min(0),
  caffeine: z.number().min(0),
  dietaryRestrictions: z.string().optional(),
  diet: z.string(),
  foodHabits: z.object({
    regularMeals: z.boolean().default(false),
    lateNightSnacking: z.boolean().default(false),
    fastFood: z.boolean().default(false),
    highSugar: z.boolean().default(false),
  }),
  smoking: z.string(),
  alcoholConsumption: z.string(),
  medicalConditions: z.string().optional(),
  medications: z.string().optional(),
  familyHistory: z.string().optional(),
  sleepQuality: z.string(),
});

export type AdvancedHealthFormValues = z.infer<typeof advancedHealthSchema>;

interface AdvancedHealthDataProps {
  onComplete: (data: AdvancedHealthFormValues) => void;
  onCancel: () => void;
}

const AdvancedHealthData: React.FC<AdvancedHealthDataProps> = ({ 
  onComplete,
  onCancel
}) => {
  const { toast } = useToast();
  const { healthData } = useHealthStore();
  const [submitting, setSubmitting] = useState(false);
  
  const defaultValues: AdvancedHealthFormValues = {
    sleepHours: 7,
    exerciseHours: 1,
    stressLevel: 5,
    waterIntake: 2,
    caffeine: 2,
    dietaryRestrictions: '',
    diet: 'balanced',
    foodHabits: {
      regularMeals: false,
      lateNightSnacking: false,
      fastFood: false,
      highSugar: false,
    },
    smoking: 'never',
    alcoholConsumption: 'occasional',
    medicalConditions: '',
    medications: '',
    familyHistory: '',
    sleepQuality: 'average',
  };
  
  const form = useForm<AdvancedHealthFormValues>({
    resolver: zodResolver(advancedHealthSchema),
    defaultValues,
  });
  
  const onSubmit = (data: AdvancedHealthFormValues) => {
    setSubmitting(true);
    
    setTimeout(() => {
      setSubmitting(false);
      onComplete(data);
      
      toast({
        title: "Data submitted successfully",
        description: "Your advanced health data has been processed.",
      });
    }, 1500);
  };
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };
  
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item} className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Advanced Health Assessment</h2>
        <p className="text-muted-foreground">
          This additional information helps us provide more personalized health insights.
        </p>
      </motion.div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <motion.div variants={container} className="space-y-6">
            <SleepSection form={form} />
            <ExerciseSection form={form} />
            <StressSection form={form} />
            <NutritionSection form={form} />
            <CaffeineSection form={form} />
            <LifestyleSection form={form} />
            <MedicalHistorySection form={form} />
          </motion.div>
          
          <motion.div variants={item} className="flex justify-between pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={submitting}
              className="gap-2"
            >
              {submitting ? (
                <>
                  <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                  />
                  Analyzing...
                </>
              ) : 'Submit & Analyze'}
            </Button>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
};

export default AdvancedHealthData;
