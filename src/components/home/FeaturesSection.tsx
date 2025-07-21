import React, { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { HeartPulse, Utensils, Brain, Shield, BarChart } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const FeaturesSection = () => {
  const isMobile = useIsMobile();
  const { scrollYProgress } = useScroll();
  const featureOpacity = useTransform(scrollYProgress, [0, 0.2], [0, 1]);
  const featureY = useTransform(scrollYProgress, [0, 0.2], [100, 0]);

  // Reference for features section
  const featuresRef = useRef(null);
  const featuresInView = useInView(featuresRef, { once: true, amount: isMobile ? 0.1 : 0.2 });

  const features = [
    {
      title: 'Personalized Health Insights',
      description: 'Receive custom recommendations based on your unique health profile.',
      icon: <HeartPulse className="h-10 w-10 sm:h-12 sm:w-12 text-health-pink" />,
      color: 'bg-health-pink/20',
      borderColor: 'border-health-pink/30',
    },
    {
      title: 'Nutrition Guidance',
      description: 'Learn which foods are best for your specific health conditions and goals.',
      icon: <Utensils className="h-10 w-10 sm:h-12 sm:w-12 text-health-mint" />,
      color: 'bg-health-mint/20',
      borderColor: 'border-health-mint/30',
    },
    {
      title: 'AI Health Assistant',
      description: 'Get immediate answers to your health questions anytime, anywhere.',
      icon: <Brain className="h-10 w-10 sm:h-12 sm:w-12 text-health-lavender" />,
      color: 'bg-health-lavender/20',
      borderColor: 'border-health-lavender/30',
    },
    {
      title: 'Health Tracking',
      description: 'Monitor your key health metrics and see how they change over time.',
      icon: <BarChart className="h-10 w-10 sm:h-12 sm:w-12 text-health-sky" />,
      color: 'bg-health-sky/20',
      borderColor: 'border-health-sky/30',
    },
    {
      title: 'Preventive Care',
      description: 'Stay ahead of potential health issues with preventive recommendations.',
      icon: <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-health-cream" />,
      color: 'bg-health-cream/20',
      borderColor: 'border-health-cream/30',
    },
  ];

  return (
    <section ref={featuresRef} className="py-12 sm:py-16 md:py-20 px-4 relative">
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent to-health-lavender/5 pointer-events-none"
        style={{ opacity: featureOpacity, y: featureY }}
      />

      <motion.div
        className="container mx-auto text-center mb-8 sm:mb-12"
        initial={{ opacity: 0, y: 30 }}
        animate={featuresInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.7 }}
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 text-gradient text-center">Your Health, Simplified</h2>
        <p className="text-base sm:text-lg text-foreground max-w-xl mx-auto px-4 sm:px-0 text-center">
          Health Connect provides the tools and insights you need to make informed decisions about your well-being.
        </p>
      </motion.div>

      <div
        className="container mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
      >
        {features.map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 30 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.2 + (index * (isMobile ? 0.05 : 0.1)) }}
            whileHover={{ y: -10, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
            className="transition-all duration-300"
          >
            <Card className={`h-full border ${feature.borderColor} shadow-md hover:shadow-xl transition-all duration-500`}>
              <CardContent className="p-4 sm:p-6 flex flex-col items-center text-center">
                <motion.div
                  className={`p-3 sm:p-4 rounded-full ${feature.color} mb-3 sm:mb-4`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-lg sm:text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FeaturesSection;
