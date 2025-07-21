
import React, { useEffect } from 'react';
import { useHealthStore } from '@/store/healthStore';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface BMICalculatorProps {
  className?: string;
  showResult?: boolean;
}

const BMICalculator: React.FC<BMICalculatorProps> = ({ 
  className,
  showResult = true
}) => {
  const { healthData, updateHealthData, calculateBMI } = useHealthStore();
  
  useEffect(() => {
    // Calculate BMI whenever height or weight changes
    if (healthData.height && healthData.weight) {
      calculateBMI();
    }
  }, [healthData.height, healthData.weight, calculateBMI]);
  
  const getBMIColor = (bmi: number | null): string => {
    if (!bmi) return 'text-muted-foreground';
    if (bmi < 18.5) return 'text-blue-500';
    if (bmi >= 18.5 && bmi < 25) return 'text-green-500';
    if (bmi >= 25 && bmi < 30) return 'text-amber-500';
    return 'text-red-500';
  };
  
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    updateHealthData({ height: isNaN(value) ? null : value });
  };
  
  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    updateHealthData({ weight: isNaN(value) ? null : value });
  };
  
  return (
    <div className={cn('grid gap-4', className)}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="height">Height (cm)</Label>
          <Input
            id="height"
            type="number"
            min="50"
            max="250"
            placeholder="Enter height"
            value={healthData.height ?? ''}
            onChange={handleHeightChange}
            className="transition-all duration-300"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="weight">Weight (kg)</Label>
          <Input
            id="weight"
            type="number"
            min="1"
            max="300"
            placeholder="Enter weight"
            value={healthData.weight ?? ''}
            onChange={handleWeightChange}
            className="transition-all duration-300"
          />
        </div>
      </div>
      
      {showResult && (
        <div 
          className={cn(
            'mt-2 p-4 rounded-lg bg-background/50 border text-center transition-all duration-300',
            healthData.bmi ? 'opacity-100' : 'opacity-40'
          )}
        >
          <div className="text-sm font-medium mb-1">Your BMI</div>
          <div className={cn('text-2xl font-bold', getBMIColor(healthData.bmi))}>
            {healthData.bmi ? healthData.bmi : '–'}
          </div>
          <div className="text-sm mt-1">
            {healthData.bmiCategory || 'Enter height and weight to calculate BMI'}
          </div>
        </div>
      )}
    </div>
  );
};

export default BMICalculator;
