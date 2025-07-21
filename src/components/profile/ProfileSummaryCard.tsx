
import React from 'react';
import { Check, Heart, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useHealthStore } from '@/store/healthStore';

interface ProfileSummaryProps {
  profileSummary: Array<{
    label: string;
    value: string | number;
    icon: JSX.Element;
  }>;
}

const ProfileSummaryCard: React.FC<ProfileSummaryProps> = ({ profileSummary }) => {
  const navigate = useNavigate();
  const { healthData } = useHealthStore();
  
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const pulse = {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  };

  return (
    <motion.div variants={item} className="md:col-span-2">
      <Card className="border-health-sky/20 bg-card/80 backdrop-blur-sm overflow-hidden">
        <CardHeader className="relative text-left">
          <motion.div 
            className="absolute -top-10 -right-10 w-32 h-32 bg-health-sky/10 rounded-full blur-3xl" 
            animate={pulse}
          />
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Profile Summary
          </CardTitle>
          <CardDescription className="text-left">
            Overview of your health information
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {profileSummary.map((summaryItem, index) => (
              <motion.div 
                key={index} 
                variants={item}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="p-4 bg-background/50 rounded-lg border border-health-lavender/10 flex flex-col items-center justify-center text-center hover:shadow-md hover:border-health-lavender/30 transition-all duration-300"
              >
                <motion.div 
                  whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="p-2 rounded-full bg-primary/10 mb-2"
                >
                  {summaryItem.icon}
                </motion.div>
                <p className="text-xs text-muted-foreground mb-1">{summaryItem.label}</p>
                <p className="text-lg font-semibold">{summaryItem.value}</p>
              </motion.div>
            ))}
          </div>
        </CardContent>
        
        <CardFooter className="border-t p-6">
          <div className="w-full flex justify-between items-center">
            <div>
              {healthData.completedProfile ? (
                <motion.span 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-sm flex items-center gap-1 text-green-500"
                >
                  <Check className="h-4 w-4" />
                  Profile completed
                </motion.span>
              ) : (
                <motion.span 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5 }}
                  className="text-sm text-muted-foreground"
                >
                  Complete your profile for personalized recommendations
                </motion.span>
              )}
            </div>
            
            <Button 
              onClick={() => navigate('/health-report')}
              disabled={!healthData.completedProfile}
              className="gap-2 relative overflow-hidden group"
            >
              <Heart className="h-4 w-4 group-hover:text-health-pink group-hover:scale-110 transition-all duration-300" />
              <span>View Health Report</span>
              
              <motion.span 
                initial={{ scale: 0, opacity: 0 }}
                animate={healthData.completedProfile ? 
                  { scale: [0, 1, 0.9, 1], opacity: 1 } : 
                  { scale: 0, opacity: 0 }
                }
                transition={{ duration: 0.5, delay: 0.5 }}
                className="absolute right-0 top-0 h-2 w-2 rounded-full bg-green-500"
              />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default ProfileSummaryCard;
