import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  Utensils,
  Dumbbell,
  Stethoscope,
  Brain,
  Wand2,
  RocketIcon,
  ChevronRight,
  InfoIcon,
  BedIcon,
  CupSoda
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useHealthStore } from '@/store/healthStore';
import { useHealthRecommendations } from '@/hooks/useHealthRecommendations';
import Navbar from '@/components/Navbar';
import AnimatedHealthScore from '@/components/health-report/AnimatedHealthScore';
import HealthMetricBar from '@/components/health-report/HealthMetricBar';
import RecommendationCard from '@/components/health-report/RecommendationCard';
import EmptyRecommendations from '@/components/health-report/EmptyRecommendations';
import LoadingRecommendations from '@/components/health-report/LoadingRecommendations';
import AdvancedHealthMetricsCard from '@/components/health-report/AdvancedHealthMetricsCard';

const HealthReport: React.FC = () => {
  const navigate = useNavigate();
  const { healthData } = useHealthStore();
  const {
    loading,
    recommendations,
    error,
    useAI,
    healthScore,
    handleToggleAI,
    fetchRecommendations,
    geminiTier
  } = useHealthRecommendations();

  // Check if user has a paid tier (lite or pro)
  const hasPaidTier = geminiTier !== 'free';

  useEffect(() => {
    if (!healthData.completedProfile) {
      navigate('/profile');
    }
  }, [healthData.completedProfile, navigate]);

  const dietRecs = recommendations.filter(rec => rec.type === 'diet');
  const exerciseRecs = recommendations.filter(rec => rec.type === 'exercise');
  const medicalRecs = recommendations.filter(rec => rec.type === 'medical');
  const lifestyleRecs = recommendations.filter(rec => rec.type === 'lifestyle');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  const hasAdvancedAnalysis = Boolean(healthData.completedAdvancedAnalysis);

  const advancedMetrics = hasAdvancedAnalysis ? [
    {
      icon: <BedIcon className="h-5 w-5 text-health-lavender" />,
      name: "Sleep Quality",
      value: `${healthData.sleepScore || 74}/100`,
      color: "text-health-lavender"
    },
    {
      icon: <Dumbbell className="h-5 w-5 text-health-mint" />,
      name: "Exercise Score",
      value: `${healthData.exerciseScore || 68}/100`,
      color: "text-health-mint"
    },
    {
      icon: <Brain className="h-5 w-5 text-health-pink" />,
      name: "Stress Level",
      value: `${healthData.stressScore || 82}/100`,
      color: "text-health-pink"
    },
    {
      icon: <CupSoda className="h-5 w-5 text-health-sky" />,
      name: "Hydration",
      value: `${healthData.hydrationScore || 55}/100`,
      color: "text-health-sky"
    }
  ] : undefined;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto max-w-5xl pt-24 pb-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Card className="overflow-hidden border border-health-lavender/20 shadow-lg">
            <CardHeader className="pb-2 bg-gradient-to-r from-health-lavender/10 to-health-pink/10">
              <CardTitle className="flex items-center gap-2">
                <SparklesIcon className="h-5 w-5 text-primary" />
                Health Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row items-center gap-8 py-4">
                <AnimatedHealthScore score={healthScore} />

                <div className="flex-1 space-y-6">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                  >
                    <h3 className="text-xl font-medium mb-4 flex items-center gap-2">
                      <InfoIcon className="h-4 w-4 text-primary" />
                      Your Health Metrics
                    </h3>

                    <div className="space-y-5">
                      <HealthMetricBar
                        label="BMI"
                        value={`${healthData.bmi} (${healthData.bmiCategory})`}
                        status={healthData.bmiCategory === 'Normal' ? 'Optimal' : 'Needs Attention'}
                        percentage={healthData.bmiCategory === 'Normal' ? 90 : 60}
                        delay={0.7}
                      />

                      <HealthMetricBar
                        label="Blood Glucose"
                        value={`${healthData.bloodGlucose} mg/dL`}
                        status={healthData.bloodGlucose && healthData.bloodGlucose <= 99 ? 'Normal' : 'Elevated'}
                        percentage={healthData.bloodGlucose && healthData.bloodGlucose <= 99 ? 85 : 65}
                        delay={0.8}
                      />
                    </div>
                  </motion.div>

                  <motion.p
                    className="text-sm text-muted-foreground"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.9 }}
                  >
                    Your health score is calculated based on your BMI, blood glucose level, and other health metrics.
                    {useAI && hasPaidTier && <span className="text-primary ml-1">Enhanced with AI analysis.</span>}
                  </motion.p>
                </div>
              </div>
            </CardContent>
          </Card>

          <AdvancedHealthMetricsCard
            hasAdvancedAnalysis={hasAdvancedAnalysis}
            metrics={advancedMetrics}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2 text-primary">
              {hasPaidTier ? (
                <>
                  <Wand2 className="h-5 w-5" />
                  AI Suggestions
                </>
              ) : (
                <>
                  <RocketIcon className="h-5 w-5" />
                  Suggestions
                </>
              )}
            </h2>
            {useAI && hasPaidTier && (
              <div className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full flex items-center gap-1 border border-primary/20">
                <Wand2 className="h-3 w-3" />
                AI-powered
              </div>
            )}
          </div>

          <Tabs defaultValue="all" className="w-full">
            <div className="relative">
              <TabsList className="mb-6 p-1 bg-primary/5 border border-primary/20 rounded-xl w-full grid grid-cols-4 shadow-sm">
                <TabsTrigger value="all" className="data-[state=active]:bg-primary rounded-lg">
                  <RocketIcon className="h-4 w-4 mr-2 md:mr-1" />
                  <span className="hidden md:inline">All</span>
                </TabsTrigger>
                <TabsTrigger value="diet" className="data-[state=active]:bg-primary rounded-lg">
                  <Utensils className="h-4 w-4 mr-2 md:mr-1" />
                  <span className="hidden md:inline">Diet</span>
                </TabsTrigger>
                <TabsTrigger value="exercise" className="data-[state=active]:bg-primary rounded-lg">
                  <Dumbbell className="h-4 w-4 mr-2 md:mr-1" />
                  <span className="hidden md:inline">Exercise</span>
                </TabsTrigger>
                <TabsTrigger value="medical" className="data-[state=active]:bg-primary rounded-lg">
                  <Stethoscope className="h-4 w-4 mr-2 md:mr-1" />
                  <span className="hidden md:inline">Medical</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <TabsContent value="all" className="mt-0">
              {loading ? (
                <LoadingRecommendations />
              ) : recommendations.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {recommendations.map((rec, index) => (
                    <RecommendationCard
                      key={rec.id || index}
                      recommendation={rec}
                      index={index}
                    />
                  ))}
                </motion.div>
              ) : (
                <EmptyRecommendations type="health" />
              )}
            </TabsContent>

            <TabsContent value="diet" className="mt-0">
              {loading ? (
                <LoadingRecommendations />
              ) : dietRecs.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {dietRecs.map((rec, index) => (
                    <RecommendationCard
                      key={rec.id || index}
                      recommendation={rec}
                      index={index}
                    />
                  ))}

                  <motion.div
                    className="pt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full gap-2 group"
                      onClick={() => navigate('/nutrition')}
                    >
                      <Utensils className="h-4 w-4" />
                      View Nutrition Suggestions
                      <ChevronRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <EmptyRecommendations type="diet" />
              )}
            </TabsContent>

            <TabsContent value="exercise" className="mt-0">
              {loading ? (
                <LoadingRecommendations />
              ) : exerciseRecs.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {exerciseRecs.map((rec, index) => (
                    <RecommendationCard
                      key={rec.id || index}
                      recommendation={rec}
                      index={index}
                    />
                  ))}
                </motion.div>
              ) : (
                <EmptyRecommendations type="exercise" />
              )}
            </TabsContent>

            <TabsContent value="medical" className="mt-0">
              {loading ? (
                <LoadingRecommendations />
              ) : medicalRecs.length > 0 ? (
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  {medicalRecs.map((rec, index) => (
                    <RecommendationCard
                      key={rec.id || index}
                      recommendation={rec}
                      index={index}
                    />
                  ))}

                  <motion.div
                    className="pt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full gap-2 group"
                      onClick={() => navigate('/ai-bot')}
                    >
                      <Brain className="h-4 w-4" />
                      Ask Our Health AI Bot
                      <ChevronRight className="h-4 w-4 ml-auto group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <EmptyRecommendations type="medical" />
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
    </div>
  );
};

export default HealthReport;
