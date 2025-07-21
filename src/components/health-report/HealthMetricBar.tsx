
import React from 'react';
import { motion } from 'framer-motion';

interface HealthMetricBarProps {
  label: string;
  value: string | number;
  status: string; 
  percentage: number;
  delay?: number;
}

const HealthMetricBar: React.FC<HealthMetricBarProps> = ({ 
  label, 
  value, 
  status, 
  percentage,
  delay = 0
}) => {
  // Get bar color based on status
  const getBarColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'optimal':
      case 'normal':
        return 'bg-green-500';
      case 'elevated':
      case 'needs attention':
        return 'bg-amber-500';
      case 'high':
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-blue-500';
    }
  };
  
  // Get status text color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'optimal':
      case 'normal':
        return 'text-green-500';
      case 'elevated':
      case 'needs attention':
        return 'text-amber-500';
      case 'high':
      case 'critical':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center mb-1 text-sm">
        <span className="font-medium">{label}: <span className="text-foreground">{value}</span></span>
        <span className={getStatusColor(status)}>
          {status}
        </span>
      </div>
      
      <div className="h-2.5 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div 
          className={`h-full rounded-full ${getBarColor(status)}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, delay: delay, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default HealthMetricBar;
