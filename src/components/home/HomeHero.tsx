import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import VideoHero from '@/components/VideoHero';
import { ChevronDown, Apple, Dumbbell, HeartPulse, Salad, Activity, Weight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const HomeHero = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Array of icons with their properties for the hero section
  const floatingIcons = [
    {
      icon: <HeartPulse className="text-white/20" />,
      initialPosition: { x: '20%', y: '20%' },
      animate: { x: ['20%', '25%', '20%'], y: ['20%', '25%', '20%'] },
      duration: 20,
      size: isMobile ? 36 : 50
    },
    {
      icon: <Dumbbell className="text-white/20" />,
      initialPosition: { x: '70%', y: '70%' },
      animate: { x: ['70%', '65%', '70%'], y: ['70%', '65%', '70%'] },
      duration: 25,
      size: isMobile ? 40 : 60
    },
    {
      icon: <Apple className="text-white/20" />,
      initialPosition: { x: '80%', y: '30%' },
      animate: { x: ['80%', '75%', '80%'], y: ['30%', '35%', '30%'] },
      duration: 22,
      size: isMobile ? 32 : 45
    },
    {
      icon: <Salad className="text-white/20" />,
      initialPosition: { x: '30%', y: '80%' },
      animate: { x: ['30%', '35%', '30%'], y: ['80%', '75%', '80%'] },
      duration: 28,
      size: isMobile ? 38 : 55
    },
    {
      icon: <Activity className="text-white/20" />,
      initialPosition: { x: '15%', y: '60%' },
      animate: { x: ['15%', '20%', '15%'], y: ['60%', '55%', '60%'] },
      duration: 24,
      size: isMobile ? 34 : 48
    },
    {
      icon: <Weight className="text-white/20" />,
      initialPosition: { x: '60%', y: '15%' },
      animate: { x: ['60%', '55%', '60%'], y: ['15%', '20%', '15%'] },
      duration: 26,
      size: isMobile ? 30 : 42
    }
  ];

  // Use animated title with motion components that will work with the updated VideoHero
  const animatedTitle = (
    <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight text-center">
      Your Personal Health Journey Starts Here
    </h1>
  );

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Get Started button clicked directly');
    navigate('/profile');
  };

  const handleExploreNutrition = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Explore Nutrition button clicked');
    navigate('/nutrition');
  };

  return (
    <>
      {/* Hero Section with surgical team image */}
      <VideoHero
        imageUrl="/lovable-uploads/80786ea8-1b69-48c8-a9fe-06092d2c5641.png"
        title={animatedTitle}
        subtitle={
          <p className="text-base md:text-lg max-w-md md:max-w-xl mx-auto text-center">
            Smart insights, personalized nutrition advice, and health tracking to help you live your best life.
          </p>
        }
        height={isMobile ? "h-[90vh]" : "h-screen"}
        overlay={true}
        cta={
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full px-4 sm:px-0 relative z-50 text-center">
            <Button
              size={isMobile ? "default" : "lg"}
              className="w-full sm:w-auto rounded-full bg-health-lavender text-white hover:bg-health-lavender/90 shadow-lg shadow-health-lavender/20 border border-white/20 relative z-50"
              onClick={handleGetStarted}
            >
              Get Started
            </Button>
            <Button
              variant="outline"
              size={isMobile ? "default" : "lg"}
              className="w-full sm:w-auto rounded-full bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white border-white/30 relative z-50"
              onClick={handleExploreNutrition}
            >
              Explore Nutrition
            </Button>
          </div>
        }
      >
        {/* Floating icons in hero section */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {floatingIcons.map((item, index) => (
            <motion.div
              key={index}
              className="absolute"
              style={{
                top: item.initialPosition.y,
                left: item.initialPosition.x,
                width: item.size,
                height: item.size
              }}
              initial={{ opacity: 0 }}
              animate={{
                opacity: 0.3,
                x: item.animate.x,
                y: item.animate.y,
              }}
              transition={{
                opacity: { delay: 1.5 + (index * 0.1), duration: 1 },
                x: { duration: item.duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" },
                y: { duration: item.duration, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }
              }}
            >
              {React.cloneElement(item.icon as React.ReactElement, {
                size: item.size,
                style: { filter: 'drop-shadow(0px 0px 8px rgba(255, 255, 255, 0.3))' }
              })}
            </motion.div>
          ))}
        </div>
      </VideoHero>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-white text-sm font-medium flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <span className="mb-2">Scroll to explore</span>
        <ChevronDown className="animate-bounce" />
      </motion.div>
    </>
  );
};

export default HomeHero;
