
import React, { useEffect } from 'react';
import { useHealthStore, HealthData } from '@/store/healthStore';
import { Card, CardContent } from '@/components/ui/card';
import { motion } from 'framer-motion';
import AgeSlider from '@/components/profile/AgeSlider';
import GenderSelector from '@/components/profile/GenderSelector';
import HeightWeightSliders from '@/components/profile/HeightWeightSliders';
import BloodGlucoseInput from '@/components/profile/BloodGlucoseInput';
import { useIsMobile } from '@/hooks/use-mobile';

interface HealthMetricsProps {
  className?: string;
}

const HealthMetrics: React.FC<HealthMetricsProps> = ({ className }) => {
  const { healthData, updateHealthData, calculateBMI } = useHealthStore();
  const isMobile = useIsMobile();

  useEffect(() => {
    // Calculate BMI whenever height or weight changes
    if (healthData.height && healthData.weight && healthData.height > 0 && healthData.weight > 0) {
      calculateBMI();
    }
  }, [healthData.height, healthData.weight, calculateBMI]);

  const handleAgeChange = (value: number) => {
    // Only update if the value is valid (greater than 0)
    if (value > 0) {
      updateHealthData({ age: value });
    }
  };

  const handleGenderChange = (value: 'male' | 'female' | 'other') => {
    updateHealthData({ gender: value });
  };

  const handleHeightChange = (value: number) => {
    // Only update if the value is valid (greater than 0)
    if (value > 0) {
      updateHealthData({ height: value });
    }
  };

  const handleWeightChange = (value: number) => {
    // Only update if the value is valid (greater than 0)
    if (value > 0) {
      updateHealthData({ weight: value });
    }
  };

  const handleBloodGlucoseChange = (value: number | null) => {
    updateHealthData({ bloodGlucose: value });
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: isMobile ? 0.05 : 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: isMobile ? 0.3 : 0.5 } }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={className}
    >
      <Card className="overflow-hidden bg-background/80 backdrop-blur-sm border-health-lavender/20">
        <CardContent className="p-4 sm:p-6">
          <motion.div className="space-y-6 sm:space-y-8" variants={container}>
            {/* Age */}
            <motion.div variants={item} className="space-y-3">
              <h3 className="text-base sm:text-lg font-semibold">Age</h3>
              <AgeSlider
                value={healthData.age}
                onChange={handleAgeChange}
              />
            </motion.div>

            {/* Gender */}
            <motion.div variants={item} className="space-y-3">
              <h3 className="text-base sm:text-lg font-semibold">Gender</h3>
              <GenderSelector
                value={healthData.gender}
                onChange={handleGenderChange}
              />
            </motion.div>

            {/* Height & Weight */}
            <motion.div variants={item} className="space-y-3">
              <h3 className="text-base sm:text-lg font-semibold">Body Measurements</h3>
              <HeightWeightSliders
                height={healthData.height}
                weight={healthData.weight}
                onHeightChange={handleHeightChange}
                onWeightChange={handleWeightChange}
              />

              {healthData.bmi && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="mt-4 p-3 sm:p-4 rounded-lg bg-background/50 border text-center transition-all duration-300"
                >
                  <div className="text-sm font-medium mb-1">Your BMI</div>
                  <div className={`text-xl sm:text-2xl font-bold ${healthData.bmi < 18.5 ? 'text-blue-500' :
                      healthData.bmi < 25 ? 'text-green-500' :
                        healthData.bmi < 30 ? 'text-amber-500' : 'text-red-500'
                    }`}>
                    {healthData.bmi}
                  </div>
                  <div className="text-xs sm:text-sm mt-1">
                    {healthData.bmiCategory}
                  </div>
                </motion.div>
              )}
            </motion.div>

            {/* Blood Glucose */}
            <motion.div variants={item} className="space-y-3">
              <h3 className="text-base sm:text-lg font-semibold">Blood Glucose</h3>
              <BloodGlucoseInput
                value={healthData.bloodGlucose}
                onChange={handleBloodGlucoseChange}
              />
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HealthMetrics;
