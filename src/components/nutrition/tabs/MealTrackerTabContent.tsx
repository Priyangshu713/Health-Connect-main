import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import MealEntryForm from '@/components/nutrition/meal-tracker/MealEntryForm';
import WorkoutEntryForm from '@/components/nutrition/meal-tracker/WorkoutEntryForm';
import DailyNutritionSummary from '@/components/nutrition/meal-tracker/DailyNutritionSummary';
import BMRCalculator from '@/components/nutrition/meal-tracker/BMRCalculator';
import { DatePicker } from '@/components/ui/date-picker';
import UpgradePrompt from '@/components/nutrition/UpgradePrompt';
import { Button } from '@/components/ui/button';
import { getMealEntriesForDate } from '@/services/MealTrackerService';

interface MealTrackerTabContentProps {
    geminiTier: string;
    setUpgradeDialogTab: (tab: string) => void;
    setShowUpgradeDialog: (show: boolean) => void;
    containerVariants: any;
    itemVariants: any;
}

const MealTrackerTabContent: React.FC<MealTrackerTabContentProps> = ({
    geminiTier,
    setUpgradeDialogTab,
    setShowUpgradeDialog,
    containerVariants,
    itemVariants
}) => {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [showBMRCalculator, setShowBMRCalculator] = useState<boolean>(false);
    const [workoutAnalysis, setWorkoutAnalysis] = useState<any>(null);
    const [totalCaloriesConsumed, setTotalCaloriesConsumed] = useState<number>(0);
    const [nutritionUpdated, setNutritionUpdated] = useState<boolean>(false);
    const [mealEntries, setMealEntries] = useState<any[]>([]);
    const bmrCalculatorRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    // Calculate calories consumed from meal entries
    const handleMealEntriesUpdated = (caloriesConsumed: number) => {
        setTotalCaloriesConsumed(caloriesConsumed);
    };

    // Handle real-time nutrition updates
    const handleNutritionUpdate = async () => {
        const entries = await getMealEntriesForDate(selectedDate);
        setMealEntries(entries);
        setNutritionUpdated(!nutritionUpdated); // Toggle to force re-render
    };

    // Handle workout analysis results
    const handleWorkoutAnalysisComplete = (analysis: any) => {
        setWorkoutAnalysis(analysis);
    };

    // Handle BMR calculator display and scrolling
    const handleShowBMRCalculator = () => {
        setShowBMRCalculator(true);

        // After setting the state to show the calculator, wait for component to render
        setTimeout(() => {
            if (bmrCalculatorRef.current) {
                bmrCalculatorRef.current.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }, 100);
    };

    // Handle BMR calculator completion
    const handleBMRComplete = () => {
        setShowBMRCalculator(false);

        // Scroll back to top of content area
        if (contentRef.current) {
            contentRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    // Reset workout analysis when date changes
    const handleDateChange = (date: Date) => {
        setSelectedDate(date);
        setWorkoutAnalysis(null); // Reset workout analysis for the new date
    };

    // Load meal entries when date changes
    useEffect(() => {
        const loadEntries = async () => {
            const entries = await getMealEntriesForDate(selectedDate);
            setMealEntries(entries);
        };

        loadEntries();
    }, [selectedDate]);

    return (
        <motion.div
            ref={contentRef}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-8"
        >
            {geminiTier !== 'pro' ? (
                <UpgradePrompt
                    title="Pro Feature: Nutrition & Fitness Tracker"
                    description="Track your meals and workouts, calculate calories, and get AI-powered health insights with the Pro tier."
                    features={[
                        "Track meals and calorie intake",
                        "Record and analyze workouts",
                        "Get AI-powered nutrition analysis",
                        "Calculate BMR and TDEE",
                        "Monitor workout impact on calorie balance"
                    ]}
                    tier="pro"
                    onUpgrade={() => {
                        setUpgradeDialogTab('pro');
                        setShowUpgradeDialog(true);
                    }}
                />
            ) : (
                <>
                    <motion.div variants={itemVariants}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <DatePicker date={selectedDate} onSelect={handleDateChange} />
                            <Card className="w-full sm:w-auto">
                                <CardContent className="p-3">
                                    <Button
                                        onClick={handleShowBMRCalculator}
                                        className="text-sm text-primary hover:underline"
                                        variant="link"
                                    >
                                        Update BMR & TDEE
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <MealEntryForm
                            selectedDate={selectedDate}
                            onCaloriesUpdated={handleMealEntriesUpdated}
                            onMealSaved={handleNutritionUpdate}
                        />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <WorkoutEntryForm
                            selectedDate={selectedDate}
                            caloriesConsumed={totalCaloriesConsumed}
                            onWorkoutAnalysisComplete={handleWorkoutAnalysisComplete}
                        />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <DailyNutritionSummary
                            selectedDate={selectedDate}
                            workoutAnalysis={workoutAnalysis}
                            mealEntries={mealEntries}
                            nutritionUpdated={nutritionUpdated}
                        />
                    </motion.div>

                    {showBMRCalculator && (
                        <div ref={bmrCalculatorRef}>
                            <BMRCalculator
                                onComplete={handleBMRComplete}
                            />
                        </div>
                    )}
                </>
            )}
        </motion.div>
    );
};

export default MealTrackerTabContent;
