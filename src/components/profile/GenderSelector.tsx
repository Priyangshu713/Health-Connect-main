
import React from 'react';
import { motion } from 'framer-motion';
import { User, UserCircle, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GenderSelectorProps {
  value: 'male' | 'female' | 'other' | null;
  onChange: (value: 'male' | 'female' | 'other') => void;
}

const GenderSelector: React.FC<GenderSelectorProps> = ({ value, onChange }) => {
  const options = [
    { 
      id: 'male', 
      label: 'Male',
      icon: <User className="h-8 w-8" />,
      color: 'bg-health-sky/10 border-health-sky/30 hover:bg-health-sky/20',
      activeColor: 'bg-health-sky/30 border-health-sky text-health-sky'
    },
    { 
      id: 'female', 
      label: 'Female',
      icon: <UserCircle className="h-8 w-8" />,
      color: 'bg-health-pink/10 border-health-pink/30 hover:bg-health-pink/20',
      activeColor: 'bg-health-pink/30 border-health-pink text-health-pink'
    },
    { 
      id: 'other', 
      label: 'Other',
      icon: <Users className="h-8 w-8" />,
      color: 'bg-health-lavender/10 border-health-lavender/30 hover:bg-health-lavender/20',
      activeColor: 'bg-health-lavender/30 border-health-lavender text-health-lavender'
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {options.map((option) => (
        <motion.div
          key={option.id}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            "flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300",
            value === option.id ? option.activeColor : option.color
          )}
          onClick={() => onChange(option.id as 'male' | 'female' | 'other')}
        >
          <div className="relative">
            {value === option.id && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full"
              />
            )}
            <motion.div 
              animate={value === option.id ? { y: [0, -5, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              {option.icon}
            </motion.div>
          </div>
          <span className="mt-2 font-medium">{option.label}</span>
        </motion.div>
      ))}
    </div>
  );
};

export default GenderSelector;
