
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles } from 'lucide-react';

const ProfileHeader: React.FC = () => {
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.6 } }
  };

  const slideUp = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  return (
    <motion.div 
      initial="hidden" 
      animate="visible" 
      variants={fadeIn}
      className="relative mb-10"
    >
      <motion.div
        animate={{ rotate: [0, 1, 0, -1, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-14 -right-14 w-48 h-48 bg-health-lavender/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ rotate: [0, -1, 0, 1, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-10 -left-10 w-40 h-40 bg-health-sky/10 rounded-full blur-2xl"
      />
      
      <header className="relative z-10 text-left">
        <motion.div 
          variants={slideUp}
          className="flex items-center gap-3 mb-3"
        >
          <Shield className="h-6 w-6 text-health-lavender animate-pulse-slow" />
          <h1 className="text-3xl md:text-4xl font-bold text-gradient">Your Health Profile</h1>
          <Sparkles className="h-5 w-5 text-health-cream animate-float" />
        </motion.div>
        <motion.p 
          variants={slideUp}
          className="text-muted-foreground max-w-xl text-left"
        >
          Complete your profile to receive personalized health recommendations tailored just for you
        </motion.p>
      </header>
    </motion.div>
  );
};

export default ProfileHeader;
