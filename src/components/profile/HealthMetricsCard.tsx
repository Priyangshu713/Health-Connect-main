
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, User, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useHealthStore } from '@/store/healthStore';
import HealthMetrics from '@/components/HealthMetrics';
import { useNavigate } from 'react-router-dom';

interface HealthMetricsCardProps {
  onReset: () => void;
}

const HealthMetricsCard: React.FC<HealthMetricsCardProps> = ({ onReset }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { healthData } = useHealthStore();
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateHealthData = () => {
    // Check if age is valid (not null and greater than 0)
    if (!healthData.age || healthData.age <= 0) {
      return "Please enter a valid age";
    }

    // Check if height is valid (not null and greater than 0)
    if (!healthData.height || healthData.height <= 0) {
      return "Please enter a valid height";
    }

    // Check if weight is valid (not null and greater than 0)
    if (!healthData.weight || healthData.weight <= 0) {
      return "Please enter a valid weight";
    }

    // Check if gender is selected
    if (!healthData.gender) {
      return "Please select your gender";
    }

    return null;
  };

  const handleSave = () => {
    // Validate the health data first
    const validationError = validateHealthData();

    if (validationError) {
      setError(validationError);

      toast({
        title: 'Incomplete profile',
        description: validationError,
        variant: 'destructive',
      });

      // Return early without saving
      return;
    }

    // Clear any previous errors
    setError(null);

    // Set loading state
    setSaveLoading(true);

    // Simulate saving data
    setTimeout(() => {
      setSaveLoading(false);

      toast({
        title: 'Profile saved',
        description: 'Your health profile has been updated successfully.',
      });

      // Only show the health report toast if the profile is complete
      if (healthData.completedProfile) {
        toast({
          title: 'Health report available',
          description: 'View your personalized health recommendations.',
          action: (
            <Button
              variant="outline"
              onClick={() => navigate('/health-report')}
              size="sm"
            >
              View Report
            </Button>
          ),
        });
      }
    }, 1500);
  };

  // Animation variants
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const pulse = {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
  };

  return (
    <motion.div variants={item}>
      <Card className="overflow-hidden border-health-lavender/20 bg-card/80 backdrop-blur-sm">
        <CardHeader className="pb-0 relative text-left">
          <motion.div
            className="absolute -top-10 -right-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl"
            animate={pulse}
          />
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Health Information
          </CardTitle>
          <CardDescription className="text-left">
            Enter your health details to receive personalized recommendations
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <HealthMetrics />
        </CardContent>

        <CardFooter className="flex justify-between border-t p-6">
          <Button
            variant="outline"
            onClick={onReset}
            className="relative overflow-hidden transition-all duration-300 hover:border-destructive/30 group"
          >
            <span className="relative z-10 group-hover:text-destructive transition-colors duration-300">Reset</span>
            <span className="absolute inset-0 bg-destructive/0 group-hover:bg-destructive/5 transition-colors duration-300"></span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={saveLoading}
            className="gap-2 relative overflow-hidden transition-all duration-300 group"
          >
            {saveLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="h-4 w-4 rounded-full border-2 border-current border-t-transparent"
                />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                Save Profile
                <span className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300"></span>
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default HealthMetricsCard;
