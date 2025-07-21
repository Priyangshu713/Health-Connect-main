import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from 'sonner';
import { PlusCircle, Save, Trash2, Dumbbell, Clock, BarChart } from 'lucide-react';
import { WorkoutEntry, saveWorkoutEntry, getWorkoutEntriesForDate, deleteWorkoutEntry, getBMRData } from '@/services/MealTrackerService';
import { analyzeWorkout } from '@/services/WorkoutGeminiService';
import { useHealthStore } from '@/store/healthStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';

interface WorkoutEntryFormProps {
    selectedDate: Date;
    caloriesConsumed: number;
    onWorkoutAnalysisComplete: (analysis: any) => void;
}

interface WorkoutType {
    id: string;
    name: string;
    category: string;
}

const WorkoutEntryForm: React.FC<WorkoutEntryFormProps> = ({
    selectedDate,
    caloriesConsumed,
    onWorkoutAnalysisComplete
}) => {
    const { geminiApiKey, geminiModel } = useHealthStore();
    const [workoutEntries, setWorkoutEntries] = useState<WorkoutEntry[]>([]);
    const [analyzing, setAnalyzing] = useState(false);
    const [bmrData, setBmrData] = useState<any>(null);

    const workoutTypes: WorkoutType[] = [
        // Strength Training
        { id: 'weight_lifting', name: 'Weight Lifting', category: 'strength_training' },
        { id: 'bodyweight_training', name: 'Bodyweight Training', category: 'strength_training' },
        { id: 'resistance_bands', name: 'Resistance Bands', category: 'strength_training' },

        // Cardio
        { id: 'running', name: 'Running', category: 'cardio' },
        { id: 'cycling', name: 'Cycling', category: 'cardio' },
        { id: 'swimming', name: 'Swimming', category: 'cardio' },
        { id: 'rowing', name: 'Rowing', category: 'cardio' },
        { id: 'jump_rope', name: 'Jump Rope', category: 'cardio' },
        { id: 'hiit', name: 'HIIT', category: 'cardio' },

        // Flexibility & Mobility
        { id: 'yoga', name: 'Yoga', category: 'flexibility' },
        { id: 'pilates', name: 'Pilates', category: 'flexibility' },
        { id: 'stretching', name: 'Stretching', category: 'flexibility' },

        // Other
        { id: 'sports', name: 'Sports', category: 'other' },
        { id: 'walking', name: 'Walking', category: 'other' },
        { id: 'dance', name: 'Dance', category: 'other' }
    ];

    useEffect(() => {
        const loadWorkoutEntries = async () => {
            try {
                // Get BMR data
                const bmrDataResult = await getBMRData();
                setBmrData(bmrDataResult);

                // Get workout entries for selected date
                const entries = await getWorkoutEntriesForDate(selectedDate);
                setWorkoutEntries(entries);

                // If there are entries, analyze them
                if (entries.length > 0 && bmrDataResult) {
                    analyzeTotalWorkouts(entries, bmrDataResult, caloriesConsumed);
                }
            } catch (error) {
                console.error('Error loading workout entries:', error);
            }
        };

        loadWorkoutEntries();
    }, [selectedDate, caloriesConsumed]);

    const analyzeTotalWorkouts = async (entries: WorkoutEntry[], bmrData: any, caloriesConsumed: number) => {
        if (!geminiApiKey || !bmrData) return;

        try {
            setAnalyzing(true);

            // Combine all workouts for analysis
            const totalDuration = entries.reduce((sum, entry) => sum + entry.duration, 0);
            const mainWorkoutType = entries.length > 0
                ? entries[0].workoutType
                : 'mixed';

            // Use most intense workout as the overall intensity
            let overallIntensity: 'light' | 'moderate' | 'intense' = 'moderate';
            if (entries.some(e => e.intensity === 'intense')) {
                overallIntensity = 'intense';
            } else if (entries.some(e => e.intensity === 'moderate')) {
                overallIntensity = 'moderate';
            } else {
                overallIntensity = 'light';
            }

            const analysis = await analyzeWorkout(
                entries.map(e => workoutTypes.find(wt => wt.id === e.workoutType)?.name || e.workoutType).join(', '),
                totalDuration,
                overallIntensity,
                bmrData.weight || 70,
                bmrData.gender || 'not specified',
                bmrData.age || 30,
                caloriesConsumed,
                bmrData.bmr || 1500,
                geminiApiKey,
                geminiModel
            );

            // Pass the analysis to parent component
            onWorkoutAnalysisComplete(analysis);
        } catch (error) {
            console.error('Error analyzing workouts:', error);
        } finally {
            setAnalyzing(false);
        }
    };

    const handleAddWorkout = () => {
        const newEntry: WorkoutEntry = {
            id: `workout-${Date.now()}`,
            date: selectedDate.toISOString(),
            workoutType: 'weight_lifting',
            duration: 45,
            intensity: 'moderate',
            caloriesBurned: null
        };

        setWorkoutEntries([...workoutEntries, newEntry]);
    };

    const handleDeleteWorkout = async (id: string) => {
        try {
            await deleteWorkoutEntry(id);
            const updatedEntries = workoutEntries.filter(entry => entry.id !== id);
            setWorkoutEntries(updatedEntries);

            if (updatedEntries.length > 0 && bmrData) {
                analyzeTotalWorkouts(updatedEntries, bmrData, caloriesConsumed);
            } else {
                onWorkoutAnalysisComplete(null);
            }

            toast("Workout deleted", {
                description: "The workout entry was successfully removed."
            });
        } catch (error) {
            console.error('Error deleting workout entry:', error);
            toast("Error", {
                description: "Failed to delete workout entry."
            });
        }
    };

    const handleSaveWorkout = async (id: string) => {
        const workoutToSave = workoutEntries.find(entry => entry.id === id);

        if (!workoutToSave) {
            toast("Cannot save", {
                description: "Workout entry not found."
            });
            return;
        }

        try {
            setAnalyzing(true);

            // Save without analysis first
            await saveWorkoutEntry(workoutToSave);

            if (geminiApiKey && bmrData) {
                // Get workout name
                const workoutName = workoutTypes.find(wt => wt.id === workoutToSave.workoutType)?.name || workoutToSave.workoutType;

                // Analyze this specific workout
                const analysis = await analyzeWorkout(
                    workoutName,
                    workoutToSave.duration,
                    workoutToSave.intensity,
                    bmrData.weight || 70,
                    bmrData.gender || 'not specified',
                    bmrData.age || 30,
                    caloriesConsumed,
                    bmrData.bmr || 1500,
                    geminiApiKey,
                    geminiModel
                );

                // Update workout with calories burned
                const updatedWorkout = {
                    ...workoutToSave,
                    caloriesBurned: analysis.caloriesBurned
                };

                await saveWorkoutEntry(updatedWorkout);

                // Update state
                setWorkoutEntries(workoutEntries.map(entry =>
                    entry.id === id ? updatedWorkout : entry
                ));

                // Analyze all workouts together
                analyzeTotalWorkouts(workoutEntries.map(entry =>
                    entry.id === id ? updatedWorkout : entry
                ), bmrData, caloriesConsumed);
            }

            toast("Workout saved", {
                description: "Your workout entry has been saved successfully."
            });
        } catch (error) {
            console.error('Error saving workout entry:', error);
            toast("Error", {
                description: "Failed to save workout entry."
            });
        } finally {
            setAnalyzing(false);
        }
    };

    const handleUpdateField = (id: string, field: keyof WorkoutEntry, value: any) => {
        setWorkoutEntries(workoutEntries.map(entry =>
            entry.id === id ? { ...entry, [field]: value } : entry
        ));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Workout Tracking</CardTitle>
                <CardDescription>
                    Record your workouts to track calories burned and progress
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-6">
                        {workoutEntries.length > 0 ? (
                            workoutEntries.map(entry => (
                                <Card key={entry.id} className="bg-muted/30">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                <Dumbbell className="h-5 w-5" />
                                                <Select
                                                    value={entry.workoutType}
                                                    onValueChange={(value) => handleUpdateField(entry.id, 'workoutType', value)}
                                                >
                                                    <SelectTrigger className="w-[180px]">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="strength_training_category" disabled className="font-semibold">
                                                            Strength Training
                                                        </SelectItem>
                                                        {workoutTypes
                                                            .filter(wt => wt.category === 'strength_training')
                                                            .map(wt => (
                                                                <SelectItem key={wt.id} value={wt.id}>
                                                                    {wt.name}
                                                                </SelectItem>
                                                            ))}

                                                        <SelectItem value="cardio_category" disabled className="font-semibold">
                                                            Cardio
                                                        </SelectItem>
                                                        {workoutTypes
                                                            .filter(wt => wt.category === 'cardio')
                                                            .map(wt => (
                                                                <SelectItem key={wt.id} value={wt.id}>
                                                                    {wt.name}
                                                                </SelectItem>
                                                            ))}

                                                        <SelectItem value="flexibility_category" disabled className="font-semibold">
                                                            Flexibility & Mobility
                                                        </SelectItem>
                                                        {workoutTypes
                                                            .filter(wt => wt.category === 'flexibility')
                                                            .map(wt => (
                                                                <SelectItem key={wt.id} value={wt.id}>
                                                                    {wt.name}
                                                                </SelectItem>
                                                            ))}

                                                        <SelectItem value="other_category" disabled className="font-semibold">
                                                            Other Activities
                                                        </SelectItem>
                                                        {workoutTypes
                                                            .filter(wt => wt.category === 'other')
                                                            .map(wt => (
                                                                <SelectItem key={wt.id} value={wt.id}>
                                                                    {wt.name}
                                                                </SelectItem>
                                                            ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteWorkout(entry.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Duration Input */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <Label htmlFor={`duration-${entry.id}`} className="text-sm">
                                                    Duration
                                                </Label>
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm font-medium">{entry.duration} min</span>
                                                </div>
                                            </div>
                                            <Slider
                                                id={`duration-${entry.id}`}
                                                min={5}
                                                max={180}
                                                step={5}
                                                value={[entry.duration]}
                                                onValueChange={(values) => handleUpdateField(entry.id, 'duration', values[0])}
                                            />
                                        </div>

                                        {/* Intensity Selection */}
                                        <div className="space-y-2">
                                            <Label className="text-sm">Intensity</Label>
                                            <div className="flex gap-2">
                                                <Button
                                                    type="button"
                                                    variant={entry.intensity === 'light' ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => handleUpdateField(entry.id, 'intensity', 'light')}
                                                    className="flex-1"
                                                >
                                                    Light
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={entry.intensity === 'moderate' ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => handleUpdateField(entry.id, 'intensity', 'moderate')}
                                                    className="flex-1"
                                                >
                                                    Moderate
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant={entry.intensity === 'intense' ? 'default' : 'outline'}
                                                    size="sm"
                                                    onClick={() => handleUpdateField(entry.id, 'intensity', 'intense')}
                                                    className="flex-1"
                                                >
                                                    Intense
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Calories burned (if available) */}
                                        {entry.caloriesBurned && (
                                            <div className="flex items-center justify-between bg-background/50 p-3 rounded-md">
                                                <div className="flex items-center gap-2">
                                                    <BarChart className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">Estimated calories burned:</span>
                                                </div>
                                                <span className="font-medium">{entry.caloriesBurned} kcal</span>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="ml-auto"
                                            onClick={() => handleSaveWorkout(entry.id)}
                                            disabled={analyzing}
                                        >
                                            <Save className="mr-2 h-4 w-4" />
                                            {analyzing ? 'Analyzing...' : 'Save & Analyze'}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No workout entries yet. Add a workout to get started.
                            </div>
                        )}

                        <div className="pt-4">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleAddWorkout}
                                className="w-full"
                            >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add Workout
                            </Button>
                        </div>
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default WorkoutEntryForm;
