import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ChatBot from '@/components/ChatBot';
import Navbar from '@/components/Navbar';
import { Bot, MessageSquare, Crown, Info, Shield, Brain, Clock, User, AlertTriangle, Settings, LogIn, Sparkles } from 'lucide-react';
import GeminiApiKeyManager from '@/components/common/GeminiApiKeyManager';
import ModelSelector from '@/components/common/ModelSelector';
import { useHealthStore } from '@/store/healthStore';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import SubscriptionPlansDialog from '@/components/common/SubscriptionPlansDialog';
import AuthView from '@/components/auth/AuthView';
import { useNavigate } from 'react-router-dom';
import GeminiTierSelector from '@/components/common/GeminiTierSelector';

const AIBot = () => {
  const healthStore = useHealthStore();
  const { geminiApiKey, geminiModel, geminiTier } = healthStore;
  const [useAI, setUseAI] = useState(!!geminiApiKey && geminiTier !== 'free');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showSubscriptionDialog, setShowSubscriptionDialog] = useState(false);
  const isThinkingModel = geminiModel.includes("thinking") || geminiModel === "gemini-2.5-pro-exp-03-25";
  const isGemini25Pro = geminiModel === "gemini-2.5-pro-exp-03-25";
  const isFreeUser = geminiTier === 'free';
  const isPaidUser = geminiTier === 'lite' || geminiTier === 'pro';
  const navigate = useNavigate();
  
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  
  // Refresh useAI state when API key or tier changes
  useEffect(() => {
    setUseAI(!!geminiApiKey && geminiTier !== 'free');
  }, [geminiApiKey, geminiTier]);
  
  // Add event listener for tier changes
  useEffect(() => {
    const handleTierChanged = (event: CustomEvent) => {
      const { tier } = event.detail;
      if (tier && (tier === 'lite' || tier === 'pro')) {
        setUseAI(true);
      } else {
        setUseAI(false);
      }
    };
    
    window.addEventListener('geminiTierChanged', handleTierChanged as EventListener);
    
    return () => {
      window.removeEventListener('geminiTierChanged', handleTierChanged as EventListener);
    };
  }, []);
  
  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const isAuth = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(isAuth);
    };
    
    const handleAuthStateChanged = (event: CustomEvent) => {
      const { isAuthenticated } = event.detail;
      setIsAuthenticated(isAuthenticated);
    };
    
    checkAuth();
    
    window.addEventListener('authStateChanged', handleAuthStateChanged as EventListener);
    
    return () => {
      window.removeEventListener('authStateChanged', handleAuthStateChanged as EventListener);
    };
  }, []);
  
  // Handle toggling the AI functionality
  const handleToggleAI = (enabled: boolean) => {
    setUseAI(enabled);
  };
  
  // Handle upgrade request
  const handleUpgradeRequest = () => {
    setShowSubscriptionDialog(true);
  };
  
  // Handle login success
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate('/ai-bot', { state: { justLoggedIn: true } });
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  };
  
  // Features
  const features = [
    {
      title: '24/7 Availability',
      description: 'Get answers to your health questions anytime, anywhere.',
      icon: <Clock className="h-5 w-5 text-health-lavender" />,
      color: 'bg-health-lavender/10',
      borderColor: 'border-health-lavender/20',
    },
    {
      title: 'Personalized Guidance',
      description: 'Receive advice tailored to your specific health needs.',
      icon: <User className="h-5 w-5 text-health-pink" />,
      color: 'bg-health-pink/10',
      borderColor: 'border-health-pink/20',
    },
    {
      title: 'Confidentiality',
      description: 'Your health information remains private and secure.',
      icon: <Shield className="h-5 w-5 text-health-mint" />,
      color: 'bg-health-mint/10',
      borderColor: 'border-health-mint/20',
    },
    {
      title: 'Well-Researched Information',
      description: 'All responses are based on up-to-date medical knowledge.',
      icon: <Brain className="h-5 w-5 text-health-sky" />,
      color: 'bg-health-sky/10',
      borderColor: 'border-health-sky/20',
    },
  ];
  
  // If not authenticated, show login/signup component
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-health-mint/10 safe-area-insets">
        <Navbar />
        <main className="container mx-auto max-w-3xl pt-24 pb-16 px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-2">
              AI Health Assistant
            </h1>
            <p className="text-muted-foreground">
              Login or sign up to access the AI chat assistant
            </p>
          </div>
          
          <Card className="border-health-lavender/20 shadow-md mb-8">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center text-center gap-4">
                <div className="bg-health-lavender/10 p-4 rounded-full">
                  <LogIn className="h-10 w-10 text-health-lavender" />
                </div>
                <h2 className="text-xl font-semibold">Authentication Required</h2>
                <p className="text-muted-foreground">
                  You need to be logged in to use the AI Health Assistant.
                  Please login or create an account to continue.
                </p>
                <Button 
                  className="mt-2 bg-gradient-to-r from-health-lavender to-health-sky hover:from-health-lavender/90 hover:to-health-sky/90 text-white"
                  size="lg"
                  onClick={() => document.getElementById('auth-view-container')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Login or Sign Up
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-4">Features</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <Card key={index} className={`border-${feature.borderColor}`}>
                  <CardContent className="p-4 flex gap-3 items-start">
                    <div className={`p-2 rounded-full ${feature.color} h-fit`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          <div id="auth-view-container">
            <AuthView onLoginSuccess={handleLoginSuccess} />
          </div>
        </main>
      </div>
    );
  }
  
  // If authenticated, show the normal AI bot page
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto max-w-5xl pt-24 pb-16 px-4">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gradient mb-2">AI Health Assistant</h1>
            <p className="text-muted-foreground">
              Chat with our AI assistant for health advice and information
            </p>
          </div>
          <div className="flex gap-2">
            {isPaidUser ? (
              <GeminiTierSelector onToggleAI={handleToggleAI} />
            ) : (
              <Button 
                onClick={() => setShowSubscriptionDialog(true)}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
              >
               Upgrade
              </Button>
            )}
          </div>
        </header>
        
        <div className="grid md:grid-cols-3 gap-6">
          {/* Sidebar */}
          <motion.div
            className="md:col-span-1 space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <Card className="border-health-lavender/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Info className="h-5 w-5 text-health-lavender" />
                    How It Works
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <div className="p-1.5 rounded-full bg-health-pink/10 h-fit">
                      <MessageSquare className="h-4 w-4 text-health-pink" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Ask Questions</h4>
                      <p className="text-xs text-muted-foreground">
                        Type your health-related questions in the chat.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="p-1.5 rounded-full bg-health-mint/10 h-fit">
                      <Bot className="h-4 w-4 text-health-mint" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Get Answers</h4>
                      <p className="text-xs text-muted-foreground">
                        {useAI 
                          ? "Receive responses powered by Google Gemini AI." 
                          : "Receive instant responses based on current medical knowledge."}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-3">
                    <div className="p-1.5 rounded-full bg-health-sky/10 h-fit">
                      <Crown className="h-4 w-4 text-health-sky" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-1">Follow Advice</h4>
                      <p className="text-xs text-muted-foreground">
                        Use the guidance to improve your health and well-being.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            {/* Conditionally render model selector for paid users */}
            {isPaidUser && (
              <motion.div variants={itemVariants}>
                <Card className="border-health-lavender/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Brain className="h-5 w-5 text-health-lavender" />
                      AI Model Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground mb-3">
                        Select which AI model to use for health recommendations
                      </p>
                      <ModelSelector />
                      {isThinkingModel && (
                        <div className="mt-3 p-2 bg-purple-50 rounded-md border border-purple-100">
                          <div className="flex items-center gap-2">
                            <Brain className="h-4 w-4 text-purple-500" />
                            <p className="text-xs text-purple-700">This model shows its thinking process</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            <motion.div variants={itemVariants}>
              <Card className="border-health-mint/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Bot className="h-5 w-5 text-health-mint" />
                    AI Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {features.map((feature, index) => (
                      <div key={index} className="flex gap-3">
                        <div className={`p-1.5 rounded-full ${feature.color} h-fit`}>
                          {feature.icon}
                        </div>
                        <div>
                          <h4 className="text-sm font-medium mb-1">{feature.title}</h4>
                          <p className="text-xs text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Card className="border-health-sky/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-health-pink" />
                    Important Note
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    This AI assistant provides general health information only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
          
          {/* Chat Interface */}
          <motion.div
            className="md:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="border-health-lavender/20 h-[600px] flex flex-col">
              <CardHeader className="pb-3 flex-shrink-0 flex flex-row justify-between items-center">
                <CardTitle className="text-xl flex items-center gap-2">
                  {isGemini25Pro ? (
                    <Sparkles className="h-5 w-5 text-amber-600" />
                  ) : isThinkingModel ? (
                    <Brain className="h-5 w-5 text-purple-500" />
                  ) : (
                    <Bot className="h-5 w-5 text-health-lavender" />
                  )}
                  {isPaidUser ? 'Health Connect AI Assistant' : 'Health Connect AI Assistant'}
                  {isPaidUser && (
                    <>
                      <span className="ml-2 text-xs bg-health-lavender/10 text-health-lavender py-1 px-2 rounded-full">
                        Powered by Google Gemini
                      </span>
                      {isGemini25Pro && (
                        <span className="ml-2 text-xs bg-amber-100 text-amber-700 py-1 px-2 rounded-full flex items-center gap-1">
                          <Sparkles className="h-3 w-3" /> Gemini 2.5 Pro
                        </span>
                      )}
                      {isThinkingModel && !isGemini25Pro && (
                        <span className="ml-2 text-xs bg-purple-100 text-purple-700 py-1 px-2 rounded-full flex items-center gap-1">
                          <Brain className="h-3 w-3" /> Thinking
                        </span>
                      )}
                    </>
                  )}
                </CardTitle>
                
                {isPaidUser && (
                  <div className="hidden sm:block">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-4" align="end">
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">AI Model Settings</h4>
                          <p className="text-xs text-muted-foreground mb-3">
                            Select which model to use for health recommendations
                          </p>
                          <ModelSelector />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </CardHeader>
              
              <CardContent className="p-0 flex-grow overflow-hidden">
                <ChatBot 
                  useGemini={useAI} 
                  geminiTier={geminiTier} 
                  onRequestUpgrade={handleUpgradeRequest}
                />
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      
      {/* Subscription Plans Dialog */}
      <SubscriptionPlansDialog
        isOpen={showSubscriptionDialog}
        onClose={() => setShowSubscriptionDialog(false)}
        onSelectTier={(tier) => {
          // Handle tier selection
          if (tier !== 'free') {
            setUseAI(true);
          }
        }}
        initialTab="lite"
      />
    </div>
  );
};

export default AIBot;
