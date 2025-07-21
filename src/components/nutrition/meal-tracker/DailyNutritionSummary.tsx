
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getMealEntriesForDate, getBMRData } from '@/services/MealTrackerService';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Dumbbell, Activity, Scale, Flame, Utensils } from 'lucide-react';

interface DailyNutritionSummaryProps {
    selectedDate: Date;
    workoutAnalysis: any;
    mealEntries?: any[];
    nutritionUpdated?: boolean;
}

interface NutritionTotals {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    caloriesGoal: number;
    proteinGoal: number;
    carbsGoal: number;
    fatGoal: number;
    fiberGoal: number;
}

const DailyNutritionSummary: React.FC<DailyNutritionSummaryProps> = ({
    selectedDate,
    workoutAnalysis,
    mealEntries: externalMealEntries,
    nutritionUpdated
}) => {
    const [nutritionTotals, setNutritionTotals] = useState<NutritionTotals>({
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        caloriesGoal: 2000, // Default goals
        proteinGoal: 50,
        carbsGoal: 250,
        fatGoal: 65,
        fiberGoal: 30
    });
    const [loading, setLoading] = useState(true);
    const [mealBreakdown, setMealBreakdown] = useState<any[]>([]);
    const [macroBreakdown, setMacroBreakdown] = useState<any[]>([]);
    const [mealEntries, setMealEntries] = useState<any[]>([]);

    useEffect(() => {
        if (externalMealEntries) {
            processMealData(externalMealEntries);
        } else {
            fetchMealData();
        }
    }, [selectedDate, nutritionUpdated, externalMealEntries]);

    const fetchMealData = async () => {
        try {
            setLoading(true);

            const entries = await getMealEntriesForDate(selectedDate);
            setMealEntries(entries);

            processMealData(entries);
        } catch (error) {
            console.error('Error fetching meal data:', error);
            setLoading(false);
        }
    };

    const processMealData = async (entries: any[]) => {
        try {
            const bmrData = await getBMRData();

            let calories = 0;
            let protein = 0;
            let carbs = 0;
            let fat = 0;
            let fiber = 0;

            const mealData: any[] = [];

            entries.forEach(entry => {
                if (entry.nutritionAnalysis) {
                    const calorieValue = parseFloat(entry.nutritionAnalysis.calories?.replace(/[^0-9.]/g, '') || '0');
                    const proteinValue = parseFloat(entry.nutritionAnalysis.protein?.replace(/[^0-9.]/g, '') || '0');
                    const carbsValue = parseFloat(entry.nutritionAnalysis.carbs?.replace(/[^0-9.]/g, '') || '0');
                    const fatValue = parseFloat(entry.nutritionAnalysis.fat?.replace(/[^0-9.]/g, '') || '0');
                    const fiberValue = parseFloat(entry.nutritionAnalysis.fiber?.replace(/[^0-9.]/g, '') || '0');

                    calories += calorieValue;
                    protein += proteinValue;
                    carbs += carbsValue;
                    fat += fatValue;
                    fiber += fiberValue;

                    mealData.push({
                        name: entry.mealName,
                        value: calorieValue,
                        time: entry.time
                    });
                }
            });

            let caloriesGoal = 2000;

            if (bmrData && bmrData.tdee) {
                caloriesGoal = bmrData.tdee;
            }

            let proteinGoal = 50;
            if (bmrData && bmrData.weight) {
                proteinGoal = Math.round(bmrData.weight * 0.8);
            }

            const carbsGoal = Math.round((caloriesGoal * 0.5) / 4);
            const fatGoal = Math.round((caloriesGoal * 0.25) / 9);

            setNutritionTotals({
                calories,
                protein,
                carbs,
                fat,
                fiber,
                caloriesGoal,
                proteinGoal,
                carbsGoal,
                fatGoal,
                fiberGoal: 30
            });

            setMealBreakdown(mealData);

            setMacroBreakdown([
                { name: 'Protein', value: protein * 4 },
                { name: 'Carbs', value: carbs * 4 },
                { name: 'Fat', value: fat * 9 }
            ]);

            setLoading(false);
        } catch (error) {
            console.error('Error processing meal data:', error);
            setLoading(false);
        }
    };

    const getProgressColor = (current: number, goal: number) => {
        const percentage = (current / goal) * 100;
        if (percentage < 70) return 'bg-blue-500';
        if (percentage <= 100) return 'bg-green-500';
        return 'bg-amber-500';
    };

    const getProgressPercentage = (current: number, goal: number) => {
        return Math.min(Math.round((current / goal) * 100), 100);
    };

    const MEAL_COLORS = ['#8884d8', '#83a6ed', '#8dd1e1', '#82ca9d', '#a4de6c', '#d0ed57'];
    const MACRO_COLORS = ['#FF8042', '#0088FE', '#00C49F'];

    const truncateLabel = (label: string | number, maxLength: number = 10) => {
        if (typeof label === 'number') {
            return label.toString();
        }
        return label.length > maxLength ? `${label.slice(0, maxLength)}...` : label;
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="py-10">
                    <div className="flex flex-col items-center justify-center h-40">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        <p className="mt-4 text-muted-foreground">Loading nutrition data...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {workoutAnalysis?.calorieBalance && (
                <Card className="border-2 border-primary/10">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            Energy Balance
                        </CardTitle>
                        <CardDescription>
                            Your daily calorie balance and body impact
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="bg-muted/40 rounded-md p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="font-medium text-sm">Calories In vs Out</h4>
                                        <span className={`text-sm font-medium ${workoutAnalysis.calorieBalance.deficit > 0 ? 'text-green-500' : 'text-amber-500'}`}>
                                            {workoutAnalysis.calorieBalance.deficit > 0 ? 'Deficit' : 'Surplus'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-muted-foreground text-sm">Consumed</span>
                                        <span className="font-medium">{workoutAnalysis.calorieBalance.consumed} kcal</span>
                                    </div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-muted-foreground text-sm">Burned (Total)</span>
                                        <span className="font-medium">{workoutAnalysis.calorieBalance.totalBurned} kcal</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-border">
                                        <span className="font-medium">Balance</span>
                                        <span className={`font-bold ${workoutAnalysis.calorieBalance.deficit > 0 ? 'text-green-500' : 'text-amber-500'}`}>
                                            {workoutAnalysis.calorieBalance.deficit > 0 ? '-' : '+'}{Math.abs(workoutAnalysis.calorieBalance.deficit)} kcal
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-muted/40 rounded-md p-4">
                                    <h4 className="font-medium text-sm mb-3">Calories Burned Breakdown</h4>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Flame className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground text-sm">BMR</span>
                                            </div>
                                            <span>{workoutAnalysis.calorieBalance.bmr} kcal</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Dumbbell className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-muted-foreground text-sm">Activity</span>
                                            </div>
                                            <span>{workoutAnalysis.calorieBalance.activityBurn} kcal</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-muted/40 rounded-md p-4">
                                <div className="flex items-center gap-2 mb-3">
                                    <Scale className="h-4 w-4 text-muted-foreground" />
                                    <h4 className="font-medium text-sm">Body Impact</h4>
                                </div>
                                <p className="text-sm mb-3">{workoutAnalysis.calorieBalance.weightImpact}</p>
                                <div className="mt-4 pt-3 border-t border-border">
                                    <p className="text-xs text-muted-foreground">* Based on your current activity and nutrition</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card className="overflow-hidden border shadow-sm">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 pb-2">
                    <div className="flex items-center gap-2">
                        <Utensils className="h-5 w-5 text-primary" />
                        <CardTitle className="text-xl font-semibold">Daily Nutrition Overview</CardTitle>
                    </div>
                    <CardDescription>
                        Track your nutrition goals and macronutrient balance
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-5">
                        <div className="bg-white/50 dark:bg-black/5 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-full bg-blue-100 p-1.5 dark:bg-blue-900/20">
                                        <Flame className="h-4 w-4 text-blue-500" />
                                    </div>
                                    <span className="font-medium text-blue-700 dark:text-blue-300">Calories</span>
                                </div>
                                <span className="font-semibold">
                                    <span className="text-lg">{nutritionTotals.calories}</span>
                                    <span className="text-muted-foreground text-sm"> / {nutritionTotals.caloriesGoal} kcal</span>
                                </span>
                            </div>
                            <div className="relative pt-1">
                                <div className="flex mb-1 items-center justify-between">
                                    <div>
                                        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                                            {getProgressPercentage(nutritionTotals.calories, nutritionTotals.caloriesGoal)}%
                                        </span>
                                    </div>
                                </div>
                                <div className="overflow-hidden h-2 mb-1 text-xs flex rounded-full bg-blue-200">
                                    <div
                                        style={{ width: `${getProgressPercentage(nutritionTotals.calories, nutritionTotals.caloriesGoal)}%` }}
                                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
                                    ></div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white/50 dark:bg-black/5 rounded-lg p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Protein</span>
                                    <span>
                                        {nutritionTotals.protein} / {nutritionTotals.proteinGoal} g
                                    </span>
                                </div>
                                <Progress
                                    value={getProgressPercentage(nutritionTotals.protein, nutritionTotals.proteinGoal)}
                                    className="h-2 bg-gray-200"
                                />
                                <div className="text-xs text-right mt-1 text-muted-foreground">
                                    {getProgressPercentage(nutritionTotals.protein, nutritionTotals.proteinGoal)}%
                                </div>
                            </div>

                            <div className="bg-white/50 dark:bg-black/5 rounded-lg p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Carbohydrates</span>
                                    <span>
                                        {nutritionTotals.carbs} / {nutritionTotals.carbsGoal} g
                                    </span>
                                </div>
                                <Progress
                                    value={getProgressPercentage(nutritionTotals.carbs, nutritionTotals.carbsGoal)}
                                    className="h-2 bg-gray-200"
                                />
                                <div className="text-xs text-right mt-1 text-muted-foreground">
                                    {getProgressPercentage(nutritionTotals.carbs, nutritionTotals.carbsGoal)}%
                                </div>
                            </div>

                            <div className="bg-white/50 dark:bg-black/5 rounded-lg p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Fat</span>
                                    <span>
                                        {nutritionTotals.fat} / {nutritionTotals.fatGoal} g
                                    </span>
                                </div>
                                <Progress
                                    value={getProgressPercentage(nutritionTotals.fat, nutritionTotals.fatGoal)}
                                    className="h-2 bg-gray-200"
                                />
                                <div className="text-xs text-right mt-1 text-muted-foreground">
                                    {getProgressPercentage(nutritionTotals.fat, nutritionTotals.fatGoal)}%
                                </div>
                            </div>

                            <div className="bg-white/50 dark:bg-black/5 rounded-lg p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Fiber</span>
                                    <span>
                                        {nutritionTotals.fiber} / {nutritionTotals.fiberGoal} g
                                    </span>
                                </div>
                                <Progress
                                    value={getProgressPercentage(nutritionTotals.fiber, nutritionTotals.fiberGoal)}
                                    className="h-2 bg-gray-200"
                                />
                                <div className="text-xs text-right mt-1 text-muted-foreground">
                                    {getProgressPercentage(nutritionTotals.fiber, nutritionTotals.fiberGoal)}%
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Meal Calorie Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {mealBreakdown.length > 0 ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={mealBreakdown}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        label={(entry) => {
                                            const displayName = truncateLabel(entry.name);
                                            return `${displayName}: ${entry.value} kcal`;
                                        }}
                                    >
                                        {mealBreakdown.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={MEAL_COLORS[index % MEAL_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name) => [value, truncateLabel(name as string)]}
                                    />
                                    <Legend
                                        formatter={(value) => truncateLabel(value as string)}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                No meal data available
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Macro Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {macroBreakdown.length > 0 && macroBreakdown.some(item => item.value > 0) ? (
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={macroBreakdown}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        fill="#8884d8"
                                        label={(entry) => {
                                            const displayName = truncateLabel(entry.name);
                                            return `${displayName}: ${Math.round((entry.value / nutritionTotals.calories) * 100)}%`;
                                        }}
                                    >
                                        {macroBreakdown.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={MACRO_COLORS[index % MACRO_COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        formatter={(value, name) => [value, truncateLabel(name as string)]}
                                    />
                                    <Legend
                                        formatter={(value) => truncateLabel(value as string)}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                                No macro data available
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {workoutAnalysis && (
                <Card className="bg-muted/30">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Dumbbell className="h-5 w-5" />
                            Workout Benefits
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <p>{workoutAnalysis.benefitsSummary}</p>

                        {workoutAnalysis.recommendations.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-medium">Recommendations</h4>
                                <ul className="list-disc pl-5 space-y-1">
                                    {workoutAnalysis.recommendations.map((rec: string, i: number) => (
                                        <li key={i} className="text-sm">{rec}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="space-y-2">
                            <h4 className="font-medium">Body Impact</h4>
                            <p className="text-sm">{workoutAnalysis.bodyImpact}</p>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default DailyNutritionSummary;
