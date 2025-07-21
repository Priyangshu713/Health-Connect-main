
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { HeartPulse } from 'lucide-react';

interface AnimatedHealthScoreProps {
  score: number;
}

const AnimatedHealthScore: React.FC<AnimatedHealthScoreProps> = ({ score }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  // Get score color based on value
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-amber-500';
    return 'text-red-500';
  };
  
  // Get progress color for health score
  const getProgressColor = (score: number) => {
    if (score >= 80) return 'stroke-green-500';
    if (score >= 60) return 'stroke-amber-500';
    return 'stroke-red-500';
  };
  
  // Animate score value on load or when it changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedScore(0);
      const interval = setInterval(() => {
        setAnimatedScore(prev => {
          if (prev < score) {
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 20);
      
      return () => clearInterval(interval);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [score]);

  // Calculate dash offset for circular progress
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (circumference * animatedScore) / 100;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative h-48 w-48 flex items-center justify-center"
    >
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-gray-200 dark:text-gray-800"
        />
        
        {/* Animated progress circle */}
        <motion.circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
          className={getProgressColor(score)}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span 
          className={`text-5xl font-bold ${getScoreColor(score)}`}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          {animatedScore}
        </motion.span>
        <motion.div 
          className="flex items-center gap-1 mt-1"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <HeartPulse className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-sm text-muted-foreground">Health Score</span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AnimatedHealthScore;
