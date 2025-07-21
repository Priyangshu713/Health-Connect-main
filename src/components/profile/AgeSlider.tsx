
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Calendar } from 'lucide-react';

interface AgeSliderProps {
  value: number | null;
  onChange: (value: number) => void;
}

const AgeSlider: React.FC<AgeSliderProps> = ({ value, onChange }) => {
  const [sliderValue, setSliderValue] = useState<number[]>([value || 30]);
  const maxAge = 100;

  useEffect(() => {
    if (value !== null && value !== sliderValue[0]) {
      setSliderValue([value]);
    }
  }, [value]);

  const handleValueChange = (newValue: number[]) => {
    setSliderValue(newValue);
    onChange(newValue[0]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-xl font-medium flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-health-cream" /> 
          <motion.span
            key={sliderValue[0]}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {sliderValue[0]} years
          </motion.span>
        </span>
        
        <motion.div 
          className="bg-primary/10 text-primary px-3 py-1 rounded-full font-medium"
          animate={{ 
            scale: [1, 1.05, 1],
            backgroundColor: sliderValue[0] < 18 ? 'rgba(249, 115, 22, 0.1)' : 
                           sliderValue[0] < 30 ? 'rgba(139, 92, 246, 0.1)' : 
                           sliderValue[0] < 65 ? 'rgba(16, 185, 129, 0.1)' : 
                           'rgba(14, 165, 233, 0.1)',
            color: sliderValue[0] < 18 ? 'rgb(249, 115, 22)' : 
                  sliderValue[0] < 30 ? 'rgb(139, 92, 246)' : 
                  sliderValue[0] < 65 ? 'rgb(16, 185, 129)' : 
                  'rgb(14, 165, 233)',
          }}
          transition={{ duration: 0.5 }}
        >
          {sliderValue[0] < 18 ? 'Under 18' : 
           sliderValue[0] < 30 ? 'Young Adult' : 
           sliderValue[0] < 65 ? 'Adult' : 'Senior'}
        </motion.div>
      </div>

      <div className="py-4">
        <Slider
          defaultValue={[30]}
          min={1}
          max={maxAge}
          step={1}
          value={sliderValue}
          onValueChange={handleValueChange}
          className="bg-gradient-to-r from-health-cream via-health-pink to-health-lavender h-3 rounded-lg"
        />
        
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span>1</span>
          <span>{maxAge / 2}</span>
          <span>{maxAge}</span>
        </div>
      </div>
    </div>
  );
};

export default AgeSlider;
