import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingScreenProps {
  onFinished?: () => void;
}

const LoadingScreen = ({ onFinished }: LoadingScreenProps) => {
  const [progress, setProgress] = useState(0);

  // Increase progress by 2.5% every second (~40 seconds total)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (progress < 100) {
        setProgress(prev => Math.min(100, prev + 2.5));
      } else if (onFinished) {
        // Extra delay after progress hits 100
        setTimeout(onFinished, 1000);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [progress, onFinished]);

  // Keep desktop width at 600px, but scale down for small screens via a media query.
  const helloStyles = `
    .hello__container {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
    }
    .hello__svg {
      width: 600px;
      height: auto;
      filter: drop-shadow(4px 4px 4px rgba(0, 0, 0, 0.25));
    }
    /* On screens up to 640px wide, shrink the SVG to 90% of container width */
    @media (max-width: 640px) {
      .hello__svg {
        width: 90%;
      }
    }
    .hello__path {
      fill: none;
      stroke-width: 35px;
      stroke-dasharray: 5800;
      stroke-dashoffset: 5800;
      animation: anim__hello 5s linear forwards;
      stroke: url(#helloGradient);
      stroke-linecap: round;
      stroke-miterlimit: 10;
    }
    @keyframes anim__hello {
      0% {
        stroke-dashoffset: 5800;
      }
      100% {
        stroke-dashoffset: 0;
      }
    }
  `;

  return (
    <motion.div className="fixed inset-0 z-50 bg-gradient-to-r from-health-mint/50 to-health-lavender/50">
      {/* Background Skeleton UI */}
      <div className="absolute inset-0 z-10 p-4">
        <div className="w-full space-y-6">
          <Skeleton className="h-40 w-full mb-4 bg-gradient-to-r from-health-beige/40 to-health-sky/40 animate-pulse" />
          <div className="flex gap-3">
            <Skeleton className="h-10 w-24 bg-gradient-to-r from-health-beige/40 to-health-sky/40 animate-pulse" />
            <Skeleton className="h-10 w-24 bg-gradient-to-r from-health-beige/40 to-health-sky/40 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <Skeleton className="h-28 w-full bg-gradient-to-r from-health-beige/40 to-health-sky/40 animate-pulse" />
            <Skeleton className="h-28 w-full bg-gradient-to-r from-health-beige/40 to-health-sky/40 animate-pulse" />
            <Skeleton className="h-28 w-full bg-gradient-to-r from-health-beige/40 to-health-sky/40 animate-pulse hidden md:block" />
          </div>
          <Skeleton className="h-64 w-full bg-gradient-to-r from-health-beige/40 to-health-sky/40 animate-pulse" />
        </div>
      </div>

      {/* Foreground Animation and Loading Elements */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen">
        <style>{helloStyles}</style>
        <div className="hello__container mb-8">
          <div className="hello__div">
            <svg className="hello__svg" viewBox="0 0 1230.94 414.57">
              <defs>
                {/* Lavender gradient for the stroke */}
                <linearGradient
                  id="helloGradient"
                  gradientUnits="userSpaceOnUse"
                  x1="0"
                  y1="207.285"
                  x2="1230.94"
                  y2="207.285"
                >
                  <stop offset="0%" stopColor="#D5C5FF" />
                  <stop offset="100%" stopColor="#BFA6FF" />
                </linearGradient>
              </defs>
              <path
                className="hello__path"
                d="M-293.58-104.62S-103.61-205.49-60-366.25c9.13-32.45,9-58.31,0-74-10.72-18.82-49.69-33.21-75.55,31.94-27.82,70.11-52.22,377.24-44.11,322.48s34-176.24,99.89-183.19c37.66-4,49.55,23.58,52.83,47.92a117.06,117.06,0,0,1-3,45.32c-7.17,27.28-20.47,97.67,33.51,96.86,66.93-1,131.91-53.89,159.55-84.49,31.1-36.17,31.1-70.64,19.27-90.25-16.74-29.92-69.47-33-92.79,16.73C62.78-179.86,98.7-93.8,159-81.63S302.7-99.55,393.3-269.92c29.86-58.16,52.85-114.71,46.14-150.08-7.44-39.21-59.74-54.5-92.87-8.7-47,65-61.78,266.62-34.74,308.53S416.62-58,481.52-130.31s133.2-188.56,146.54-256.23c14-71.15-56.94-94.64-88.4-47.32C500.53-375,467.58-229.49,503.3-127a73.73,73.73,0,0,0,23.43,33.67c25.49,20.23,55.1,16,77.46,6.32a111.25,111.25,0,0,0,30.44-19.87c37.73-34.23,29-36.71,64.58-127.53C724-284.3,785-298.63,821-259.13a71,71,0,0,1,13.69,22.56c17.68,46,6.81,80-6.81,107.89-12,24.62-34.56,42.72-61.45,47.91-23.06,4.45-48.37-.35-66.48-24.27a78.88,78.88,0,0,1-12.66-25.8c-14.75-51,4.14-88.76,11-101.41,6.18-11.39,37.26-69.61,103.42-42.24,55.71,23.05,100.66-23.31,100.66-23.31"
                transform="translate(311.08 476.02)"
              />
            </svg>
          </div>

          {/* Loading Text */}
          <motion.p
            className="text-sm text-foreground/60 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            Loading your health journey...
          </motion.p>

          {/* Progress Bar */}
          <motion.div
            className="w-full max-w-md h-1.5 bg-white/30 rounded-full mt-4 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.8 }}
          >
            <motion.div
              className="h-full bg-gradient-to-r from-health-lavender to-health-pink"
              style={{ width: `${progress}%` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
