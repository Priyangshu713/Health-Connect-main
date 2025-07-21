
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import { Heart, Apple, Salad } from 'lucide-react';

interface AuthViewProps {
  onLoginSuccess?: () => void;
}

const AuthView = ({ onLoginSuccess }: AuthViewProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="min-h-[calc(100vh-120px)] flex flex-col items-center justify-center px-4 pt-20 md:pt-24"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants} className="w-full max-w-lg mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center justify-center gap-2">
          <Heart className="text-primary h-6 w-6 animate-pulse-slow" />
          HealthConnect 
          <Heart className="text-primary h-6 w-6 animate-pulse-slow" />
        </h1>
        <p className="text-lg text-muted-foreground">Personalized health insights for your wellness journey</p>
      </motion.div>

      <motion.div variants={itemVariants} className="w-full max-w-md">
        <Card animate={true} className="bg-white/95 backdrop-blur-sm border-health-mint/20 shadow-lg">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-2xl font-bold text-center">
              {activeTab === 'login' ? 'Welcome Back!' : 'Create Account'}
            </CardTitle>
            <CardDescription className="text-center">
              {activeTab === 'login' 
                ? 'Sign in to your account to continue your health journey' 
                : 'Join us to start your personalized health experience'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center space-x-2 mb-4">
              <div 
                className={`px-4 py-2 rounded-full cursor-pointer transition-all duration-300 
                  ${activeTab === 'login' 
                    ? 'bg-primary text-white font-medium'
                    : 'bg-muted hover:bg-muted/70'}`}
                onClick={() => setActiveTab('login')}
              >
                Login
              </div>
              <div 
                className={`px-4 py-2 rounded-full cursor-pointer transition-all duration-300 
                  ${activeTab === 'signup' 
                    ? 'bg-primary text-white font-medium'
                    : 'bg-muted hover:bg-muted/70'}`}
                onClick={() => setActiveTab('signup')}
              >
                Sign Up
              </div>
            </div>
            
            {activeTab === 'login' ? <LoginForm onLoginSuccess={onLoginSuccess} /> : <SignupForm />}
          </CardContent>
        </Card>
      </motion.div>

      {/* Doctor portal link */}
      <motion.div variants={itemVariants} className="mt-4">
        <p className="text-sm text-primary underline cursor-pointer text-center hover:text-primary/80" onClick={() => navigate('/doctor-portal')}>
          Are you a Doctor?
        </p>
      </motion.div>

      <motion.div 
        variants={itemVariants}
        className="w-full max-w-md mt-8 flex items-center justify-center gap-6 opacity-90 text-muted-foreground"
      >
        <Apple className="h-6 w-6 text-health-mint animate-float" />
        <Salad className="h-6 w-6 text-health-sky animate-float" />
        <Heart className="h-6 w-6 text-health-pink animate-float" />
      </motion.div>
    </motion.div>
  );
};

export default AuthView;
