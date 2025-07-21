
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Ruler, Weight } from 'lucide-react';

interface HeightWeightSlidersProps {
  height: number | null;
  weight: number | null;
  onHeightChange: (value: number) => void;
  onWeightChange: (value: number) => void;
}

const HeightWeightSliders: React.FC<HeightWeightSlidersProps> = ({ 
  height, 
  weight, 
  onHeightChange, 
  onWeightChange 
}) => {
  const [heightValue, setHeightValue] = useState<number[]>([height || 170]);
  const [weightValue, setWeightValue] = useState<number[]>([weight || 70]);

  useEffect(() => {
    if (height !== null && height !== heightValue[0]) {
      setHeightValue([height]);
    }
  }, [height]);

  useEffect(() => {
    if (weight !== null && weight !== weightValue[0]) {
      setWeightValue([weight]);
    }
  }, [weight]);

  const handleHeightChange = (newValue: number[]) => {
    setHeightValue(newValue);
    onHeightChange(newValue[0]);
  };

  const handleWeightChange = (newValue: number[]) => {
    setWeightValue(newValue);
    onWeightChange(newValue[0]);
  };

  // Convert cm to feet and inches
  const cmToFeetInches = (cm: number) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'${inches}"`;
  };

  return (
    <div className="space-y-8">
      {/* Height Slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium flex items-center">
            <Ruler className="mr-2 h-5 w-5 text-health-mint" /> Height
          </span>
          
          <div className="flex items-center gap-2">
            <motion.div 
              className="bg-health-mint/10 text-health-mint px-3 py-1 rounded-full font-medium"
              key={heightValue[0]}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {heightValue[0]} cm
            </motion.div>
            <motion.div 
              className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium"
              key={`ft-${heightValue[0]}`}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {cmToFeetInches(heightValue[0])}
            </motion.div>
          </div>
        </div>

        <div className="py-4">
          <Slider
            defaultValue={[170]}
            min={100}
            max={220}
            step={1}
            value={heightValue}
            onValueChange={handleHeightChange}
            className="bg-gradient-to-r from-health-mint/30 to-health-mint h-3 rounded-lg"
          />
          
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>100 cm</span>
            <span>160 cm</span>
            <span>220 cm</span>
          </div>
        </div>
      </div>

      {/* Weight Slider */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-medium flex items-center">
            <Weight className="mr-2 h-5 w-5 text-health-sky" /> Weight
          </span>
          
          <motion.div 
            className="bg-health-sky/10 text-health-sky px-3 py-1 rounded-full font-medium"
            key={weightValue[0]}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {weightValue[0]} kg
          </motion.div>
        </div>

        <div className="py-4">
          <Slider
            defaultValue={[70]}
            min={30}
            max={150}
            step={1}
            value={weightValue}
            onValueChange={handleWeightChange}
            className="bg-gradient-to-r from-health-sky/30 to-health-sky h-3 rounded-lg"
          />
          
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span>30 kg</span>
            <span>90 kg</span>
            <span>150 kg</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeightWeightSliders;
