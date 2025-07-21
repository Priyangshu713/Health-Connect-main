
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useHealthStore } from '@/store/healthStore';
import { motion, AnimatePresence } from 'framer-motion';
import { saveBMRData } from '@/services/MealTrackerService';

interface BMRCalculatorProps {
    onComplete: () => void;
}

const activityLevels = [
    {
        value: 'sedentary',
        label: 'Sedentary',
        description: 'Little or no exercise',
        multiplier: 1.2
    },
    {
        value: 'light',
        label: 'Lightly Active',
        description: 'Light exercise/sports 1-3 days/week',
        multiplier: 1.375
    },
    {
        value: 'moderate',
        label: 'Moderately Active',
        description: 'Moderate exercise/sports 3-5 days/week',
        multiplier: 1.55
    },
    {
        value: 'active',
        label: 'Very Active',
        description: 'Hard exercise/sports 6-7 days/week',
        multiplier: 1.725
    },
    {
        value: 'extra',
        label: 'Extra Active',
        description: 'Hard daily exercise/sports & physical job',
        multiplier: 1.9
    }
];

const BMRCalculator: React.FC<BMRCalculatorProps> = ({ onComplete }) => {
    const { healthData } = useHealthStore();
    const [exiting, setExiting] = useState(false);

    // Initialize form data from health profile
    const [formData, setFormData] = useState({
        age: healthData.age || 30,
        weight: healthData.weight || 70, // kg
        height: healthData.height || 170, // cm
        gender: healthData.gender || 'male',
        activityLevel: 'moderate',
        workingOut: false,
        workoutType: 'normal',
    });

    const [bmr, setBMR] = useState<number | null>(null);
    const [tdee, setTDEE] = useState<number | null>(null);

    // Calculate BMR using the Mifflin-St Jeor Equation
    const calculateBMR = () => {
        const { age, weight, height, gender } = formData;

        if (!age || !weight || !height) return;

        let calculatedBMR = 0;

        if (gender === 'male') {
            calculatedBMR = 10 * weight + 6.25 * height - 5 * age + 5;
        } else {
            calculatedBMR = 10 * weight + 6.25 * height - 5 * age - 161;
        }

        // Find the activity multiplier
        const activityMultiplier = activityLevels.find(
            level => level.value === formData.activityLevel
        )?.multiplier || 1.2;

        // Calculate TDEE (Total Daily Energy Expenditure)
        const calculatedTDEE = calculatedBMR * activityMultiplier;

        // Add additional calories for workout if needed
        let workoutCalories = 0;
        if (formData.workingOut) {
            switch (formData.workoutType) {
                case 'normal':
                    workoutCalories = 150;
                    break;
                case 'gym':
                    workoutCalories = 300;
                    break;
                case 'intense':
                    workoutCalories = 500;
                    break;
            }
        }

        setBMR(Math.round(calculatedBMR));
        setTDEE(Math.round(calculatedTDEE + workoutCalories));
    };

    useEffect(() => {
        calculateBMR();
    }, [formData]);

    const handleExit = (callback: () => void) => {
        setExiting(true);

        // Scroll to top of the page
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Wait for animation to complete
        setTimeout(() => {
            callback();
        }, 500); // Match the duration of the exit animation
    };

    const handleSave = async () => {
        if (bmr && tdee) {
            try {
                // Save BMR data to storage
                await saveBMRData({
                    bmr,
                    tdee,
                    ...formData,
                    date: new Date().toISOString()
                });

                handleExit(onComplete);
            } catch (error) {
                console.error("Error saving BMR data:", error);
            }
        }
    };

    const handleSkip = () => {
        handleExit(onComplete);
    };

    return (
        <AnimatePresence>
            {!exiting && (
                <motion.div
                    key="bmr-calculator"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Calculate Your Basal Metabolic Rate (BMR)</CardTitle>
                            <CardDescription>
                                Your BMR represents the calories your body needs at rest. We've pre-filled data from your profile.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    {/* Age */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label htmlFor="age">Age</Label>
                                            <span className="text-muted-foreground">{formData.age} years</span>
                                        </div>
                                        <Slider
                                            id="age"
                                            min={18}
                                            max={90}
                                            step={1}
                                            value={[formData.age || 30]}
                                            onValueChange={(value) => setFormData({ ...formData, age: value[0] })}
                                        />
                                    </div>

                                    {/* Weight */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label htmlFor="weight">Weight</Label>
                                            <span className="text-muted-foreground">{formData.weight} kg</span>
                                        </div>
                                        <Slider
                                            id="weight"
                                            min={40}
                                            max={150}
                                            step={0.5}
                                            value={[formData.weight || 70]}
                                            onValueChange={(value) => setFormData({ ...formData, weight: value[0] })}
                                        />
                                    </div>

                                    {/* Height */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label htmlFor="height">Height</Label>
                                            <span className="text-muted-foreground">{formData.height} cm</span>
                                        </div>
                                        <Slider
                                            id="height"
                                            min={140}
                                            max={220}
                                            step={1}
                                            value={[formData.height || 170]}
                                            onValueChange={(value) => setFormData({ ...formData, height: value[0] })}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Gender */}
                                    <div className="space-y-2">
                                        <Label>Gender</Label>
                                        <RadioGroup
                                            value={formData.gender || 'male'}
                                            onValueChange={(value) => setFormData({ ...formData, gender: value as 'male' | 'female' | 'other' })}
                                            className="flex space-x-4"
                                        >
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="male" id="gender-male" />
                                                <Label htmlFor="gender-male">Male</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="female" id="gender-female" />
                                                <Label htmlFor="gender-female">Female</Label>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="other" id="gender-other" />
                                                <Label htmlFor="gender-other">Other</Label>
                                            </div>
                                        </RadioGroup>
                                    </div>

                                    {/* Activity Level */}
                                    <div className="space-y-2">
                                        <Label htmlFor="activityLevel">Activity Level</Label>
                                        <Select
                                            value={formData.activityLevel}
                                            onValueChange={(value) => setFormData({ ...formData, activityLevel: value })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select activity level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {activityLevels.map((level) => (
                                                    <SelectItem key={level.value} value={level.value}>
                                                        <span className="font-medium">{level.label}</span>
                                                        <span className="block text-xs text-muted-foreground">
                                                            {level.description}
                                                        </span>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {/* Workout Toggle */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="workout-toggle">Regular Workout</Label>
                                            <Switch
                                                id="workout-toggle"
                                                checked={formData.workingOut}
                                                onCheckedChange={(checked) => setFormData({ ...formData, workingOut: checked })}
                                            />
                                        </div>

                                        {formData.workingOut && (
                                            <div className="pt-2">
                                                <Label htmlFor="workoutType">Workout Type</Label>
                                                <Select
                                                    value={formData.workoutType}
                                                    onValueChange={(value) => setFormData({ ...formData, workoutType: value })}
                                                >
                                                    <SelectTrigger id="workoutType">
                                                        <SelectValue placeholder="Select workout type" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="normal">Normal (Light activity)</SelectItem>
                                                        <SelectItem value="gym">Gym (Moderate intensity)</SelectItem>
                                                        <SelectItem value="intense">Intense (High intensity training)</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Results */}
                            {bmr !== null && tdee !== null && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                                    <Card className="bg-muted/50">
                                        <CardContent className="p-4 text-center">
                                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Base Metabolic Rate</h4>
                                            <p className="text-3xl font-bold">{bmr} kcal</p>
                                            <p className="text-xs text-muted-foreground mt-1">Calories needed at complete rest</p>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-primary/10">
                                        <CardContent className="p-4 text-center">
                                            <h4 className="text-sm font-medium text-muted-foreground mb-1">Daily Calorie Need</h4>
                                            <p className="text-3xl font-bold text-primary">{tdee} kcal</p>
                                            <p className="text-xs text-muted-foreground mt-1">Total daily energy expenditure</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2">
                            <Button variant="outline" onClick={handleSkip}>
                                Skip
                            </Button>
                            <Button onClick={handleSave} disabled={!bmr || !tdee}>
                                Save and Continue
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default BMRCalculator;
