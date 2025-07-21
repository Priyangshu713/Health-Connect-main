
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Droplet } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface BloodGlucoseInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
}

const BloodGlucoseInput: React.FC<BloodGlucoseInputProps> = ({ value, onChange }) => {
  const [inputValue, setInputValue] = useState<string>(value ? value.toString() : '');

  useEffect(() => {
    if (value !== null && value.toString() !== inputValue) {
      setInputValue(value.toString());
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const numValue = parseFloat(newValue);
    if (!isNaN(numValue)) {
      onChange(numValue);
    } else if (newValue === '') {
      onChange(null);
    }
  };

  // Determine color based on blood glucose level
  const getGlucoseStatus = () => {
    if (!value) return { color: 'text-muted-foreground', label: 'Not specified', progress: 0 };
    
    if (value < 70) return { 
      color: 'text-blue-500', 
      label: 'Low', 
      progress: 30,
      progressColor: 'bg-blue-500'
    };
    if (value >= 70 && value <= 99) return { 
      color: 'text-green-500', 
      label: 'Normal', 
      progress: 60,
      progressColor: 'bg-green-500'
    };
    if (value >= 100 && value <= 125) return { 
      color: 'text-amber-500', 
      label: 'Pre-diabetic', 
      progress: 80,
      progressColor: 'bg-amber-500'
    };
    return { 
      color: 'text-red-500', 
      label: 'Diabetic range', 
      progress: 100,
      progressColor: 'bg-red-500'
    };
  };

  const glucoseStatus = getGlucoseStatus();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-lg font-medium flex items-center">
          <Droplet className="mr-2 h-5 w-5 text-health-lavender" /> Blood Glucose
        </span>
        
        {value && (
          <motion.div 
            className={`px-3 py-1 rounded-full font-medium ${glucoseStatus.color.replace('text-', 'bg-')}/10 ${glucoseStatus.color}`}
            key={value}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {glucoseStatus.label}
          </motion.div>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            type="number"
            min="0"
            max="600"
            placeholder="Enter blood glucose level"
            value={inputValue}
            onChange={handleChange}
            className="transition-all duration-300 h-12 text-lg"
          />
        </div>
        <div className="bg-gray-100 px-3 py-2 rounded-md text-gray-600">
          mg/dL
        </div>
      </div>

      {value && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Progress value={glucoseStatus.progress} className="h-2" />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Low (&lt;70)</span>
            <span>Normal (70-99)</span>
            <span>High (&gt;125)</span>
          </div>
        </motion.div>
      )}
      
      <p className="text-sm text-muted-foreground">
        Normal fasting range: 70-99 mg/dL
      </p>
    </div>
  );
};

export default BloodGlucoseInput;
