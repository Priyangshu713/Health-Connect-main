
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Apple, Dumbbell, HeartPulse, Carrot, Fish, Salad, Activity, Weight, Utensils } from 'lucide-react';

const GetStartedCTA = () => {
  const navigate = useNavigate();

  const floatingIcons = [
    {
      icon: <Apple className="text-health-mint/20" />,
      initialPosition: { x: '10%', y: '20%' },
      animate: { x: ['10%', '15%', '10%'], y: ['20%', '25%', '20%'] },
      duration: 18,
      size: 32
    },
    {
      icon: <Dumbbell className="text-health-lavender/20" />,
      initialPosition: { x: '80%', y: '70%' },
      animate: { x: ['80%', '75%', '80%'], y: ['70%', '65%', '70%'] },
      duration: 20,
      size: 40
    },
    {
      icon: <HeartPulse className="text-health-pink/20" />,
      initialPosition: { x: '60%', y: '20%' },
      animate: { x: ['60%', '65%', '60%'], y: ['20%', '25%', '20%'] },
      duration: 15,
      size: 36
    },
    {
      icon: <Carrot className="text-health-beige/20" />,
      initialPosition: { x: '30%', y: '60%' },
      animate: { x: ['30%', '35%', '30%'], y: ['60%', '55%', '60%'] },
      duration: 17,
      size: 28
    },
    {
      icon: <Fish className="text-health-sky/20" />,
      initialPosition: { x: '85%', y: '30%' },
      animate: { x: ['85%', '80%', '85%'], y: ['30%', '35%', '30%'] },
      duration: 19,
      size: 34
    },
    {
      icon: <Salad className="text-health-mint/20" />,
      initialPosition: { x: '15%', y: '75%' },
      animate: { x: ['15%', '20%', '15%'], y: ['75%', '70%', '75%'] },
      duration: 22,
      size: 38
    },
    {
      icon: <Activity className="text-health-lavender/20" />,
      initialPosition: { x: '40%', y: '15%' },
      animate: { x: ['40%', '45%', '40%'], y: ['15%', '20%', '15%'] },
      duration: 16,
      size: 30
    },
    {
      icon: <Weight className="text-health-pink/20" />,
      initialPosition: { x: '70%', y: '85%' },
      animate: { x: ['70%', '65%', '70%'], y: ['85%', '80%', '85%'] },
      duration: 21,
      size: 32
    },
    {
      icon: <Utensils className="text-health-beige/20" />,
      initialPosition: { x: '20%', y: '40%' },
      animate: { x: ['20%', '25%', '20%'], y: ['40%', '45%', '40%'] },
      duration: 23,
      size: 26
    }
  ];

  const handleGetStarted = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('Get Started Now button clicked');
    navigate('/profile');
  };

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-health-mint/20 via-health-lavender/10 to-health-cream/20 opacity-70"></div>

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
            animate={item.animate}
            transition={{
              duration: item.duration,
              repeat: Infinity,
              repeatType: "reverse",
              ease: "easeInOut"
            }}
          >
            {React.cloneElement(item.icon as React.ReactElement, {
              size: item.size,
              style: { opacity: 0.3 }
            })}
          </motion.div>
        ))}

        <motion.div
          className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-health-mint/20 blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
        <motion.div
          className="absolute bottom-1/3 right-1/3 w-96 h-96 rounded-full bg-health-lavender/20 blur-3xl"
          animate={{
            x: [0, -70, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        />
      </div>

      <div className="container mx-auto relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-6 text-gradient text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Ready to Start Your Health Journey?
          </motion.h2>

          <motion.p
            className="text-lg text-foreground/80 mb-8 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Join thousands of users who are taking control of their health with personalized guidance and tracking.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="relative z-50"
          >
            <Button
              size="lg"
              className="rounded-full bg-health-lavender hover:bg-health-lavender/90 text-white shadow-lg shadow-health-lavender/20 border border-white/20 relative z-50"
              onClick={handleGetStarted}
            >
              Get Started Now
            </Button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default GetStartedCTA;
