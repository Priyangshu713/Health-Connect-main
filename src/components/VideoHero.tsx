
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface VideoHeroProps {
  videoUrl?: string;
  imageUrl?: string;
  posterUrl?: string;
  title: React.ReactNode;  // Changed from string to ReactNode
  subtitle?: React.ReactNode;  // Also update subtitle for consistency
  cta?: React.ReactNode;
  overlay?: boolean;
  className?: string;
  height?: string;
  children?: React.ReactNode;
}

const VideoHero: React.FC<VideoHeroProps> = ({
  imageUrl,
  title,
  subtitle,
  cta,
  overlay = true,
  className,
  height = 'h-[80vh]',
  children,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [parallaxY, setParallaxY] = useState(0);
  const [imageError, setImageError] = useState(false);

  // Parallax effect for the background image
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setParallaxY(scrollPosition * 0.15); // Reduced for more subtle movement
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle image load event
  const handleImageLoad = () => {
    console.log('Image loaded successfully');
    setIsLoaded(true);
  };

  // Handle image error event
  const handleImageError = () => {
    console.error('Failed to load image:', imageUrl);
    setImageError(true);
    // Show content even if image fails to load
    setIsLoaded(true);
  };

  // Preload the image
  useEffect(() => {
    if (imageUrl) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = handleImageLoad;
      img.onerror = handleImageError;
      
      // Set a timeout to force show content if image takes too long
      const timer = setTimeout(() => {
        if (!isLoaded) {
          console.log('Image load timeout - showing content anyway');
          setIsLoaded(true);
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      // If no image, just show content
      setIsLoaded(true);
    }
  }, [imageUrl, isLoaded]);

  // Fallback image if the main one fails
  const fallbackImage = '/lovable-uploads/85e10dd8-810c-44de-8661-df3911e610ce.png';
  const effectiveImageUrl = imageError ? fallbackImage : (imageUrl || fallbackImage);

  return (
    <div 
      className={cn(
        'relative w-full overflow-hidden',
        height,
        className
      )}
    >
      {/* Background Image */}
      <div 
        style={{ 
          backgroundImage: `url(${effectiveImageUrl})`,
          transform: `translateY(${parallaxY}px)`,
          backgroundPosition: 'center',
          backgroundSize: 'cover',
        }} 
        className="absolute inset-0 w-full h-full transition-transform duration-500 ease-out"
      />
      
      {/* Loading state */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-background flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
      
      {/* Minimal overlay for better text readability */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/40 to-background/70"></div>
      )}
      
      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 max-w-5xl mx-auto">
        <motion.div
          initial={{ y: 150, opacity: 0 }}
          animate={isLoaded ? { y: 0, opacity: 1 } : {}}
          transition={{ 
            duration: 0.8, 
            delay: 0.3,
            ease: [0.215, 0.61, 0.355, 1]
          }}
          className="mb-6"
        >
          {/* Simply render the title directly as it might be a React element */}
          <div className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-white drop-shadow-lg">
            {title}
          </div>
        </motion.div>
        
        {subtitle && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={isLoaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.9 }}
            className="text-lg md:text-xl text-white max-w-3xl mb-8 font-medium drop-shadow-md"
          >
            {subtitle}
          </motion.div>
        )}
        
        {cta && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isLoaded ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: 1.2 }}
            className="relative"
          >
            <motion.div
              animate={{ 
                boxShadow: ["0px 0px 0px 0px rgba(180, 161, 255, 0)", "0px 0px 30px 10px rgba(180, 161, 255, 0.3)", "0px 0px 0px 0px rgba(180, 161, 255, 0)"] 
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                repeatType: "loop"
              }}
              className="absolute inset-0 rounded-full"
            />
            {cta}
          </motion.div>
        )}
        
        {children}
      </div>

      {/* Animated scroll indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="w-8 h-12 rounded-full border-2 border-white flex items-start justify-center p-1">
          <motion.div 
            className="w-1 h-3 bg-white rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default VideoHero;
