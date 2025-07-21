import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { PlusCircle, Trash2, Save, Apple, Coffee, UtensilsCrossed, Dumbbell, Clock } from 'lucide-react';
import { MealEntry, saveMealEntry, getMealEntriesForDate, deleteMealEntry } from '@/services/MealTrackerService';
import { useHealthStore } from '@/store/healthStore';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { analyzeNutrition } from '@/services/NutritionGeminiService';

interface MealEntryFormProps {
    selectedDate: Date;
    onCaloriesUpdated?: (totalCalories: number) => void;
    onMealSaved?: () => void;
}

interface MealType {
    id: string;
    name: string;
    icon: React.ReactNode;
    time: string;
}

const MealEntryForm: React.FC<MealEntryFormProps> = ({
    selectedDate,
    onCaloriesUpdated,
    onMealSaved
}) => {
    const { geminiApiKey, geminiModel } = useHealthStore();
    const [mealEntries, setMealEntries] = useState<MealEntry[]>([]);
    const [analyzing, setAnalyzing] = useState(false);
    const [bmrData, setBmrData] = useState<any>(null);
    const [workingOut, setWorkingOut] = useState(false);
    const [editingTime, setEditingTime] = useState<string | null>(null);

    // Define meal types with default times
    const standardMealTypes: MealType[] = [
        { id: 'breakfast', name: 'Breakfast', icon: <Coffee className="h-5 w-5" />, time: '08:00' },
        { id: 'lunch', name: 'Lunch', icon: <Apple className="h-5 w-5" />, time: '13:00' },
        { id: 'dinner', name: 'Dinner', icon: <UtensilsCrossed className="h-5 w-5" />, time: '19:00' },
        { id: 'snack', name: 'Snack', icon: <Apple className="h-5 w-5" />, time: '16:00' }
    ];

    const workoutMealTypes: MealType[] = [
        { id: 'pre_workout', name: 'Pre-Workout', icon: <Dumbbell className="h-5 w-5" />, time: '11:00' },
        { id: 'post_workout', name: 'Post-Workout', icon: <Dumbbell className="h-5 w-5" />, time: '12:30' }
    ];

    useEffect(() => {
        // Load saved meal entries for selected date
        const loadMealEntries = async () => {
            try {
                // Get BMR data to check if user is working out
                const bmrData = await getBMRData();
                setBmrData(bmrData);

                if (bmrData) {
                    setWorkingOut(bmrData.workingOut || false);
                }

                const entries = await getMealEntriesForDate(selectedDate);
                setMealEntries(entries);

                // Calculate and pass total calories to parent
                calculateTotalCalories(entries);
            } catch (error) {
                console.error('Error loading meal entries:', error);
            }
        };

        loadMealEntries();
    }, [selectedDate]);

    const calculateTotalCalories = (entries: MealEntry[]) => {
        let totalCalories = 0;

        entries.forEach(entry => {
            if (entry.nutritionAnalysis) {
                const calorieValue = parseFloat(entry.nutritionAnalysis.calories?.replace(/[^0-9.]/g, '') || '0');
                totalCalories += calorieValue;
            }
        });

        if (onCaloriesUpdated) {
            onCaloriesUpdated(totalCalories);
        }

        return totalCalories;
    };

    const getBMRData = async () => {
        try {
            // Simulating storage access - in a real app this would fetch from localStorage or database
            const bmrDataString = localStorage.getItem('bmr_data');
            if (bmrDataString) {
                return JSON.parse(bmrDataString);
            }
            return null;
        } catch (error) {
            console.error('Error loading BMR data:', error);
            return null;
        }
    };

    // Get all applicable meal types based on workout status
    const applicableMealTypes = workingOut
        ? [...standardMealTypes, ...workoutMealTypes]
        : standardMealTypes;

    const handleAddMeal = async (mealType: MealType) => {
        // Check if this meal type already exists for today
        const existingMeal = mealEntries.find(entry => entry.mealType === mealType.id);

        if (existingMeal) {
            toast("Meal already exists", {
                description: `You already have a ${mealType.name} entry for today. Please edit it instead.`,
            });
            return;
        }

        const newEntry: MealEntry = {
            id: `${mealType.id}-${Date.now()}`,
            date: selectedDate.toISOString(),
            mealType: mealType.id,
            mealName: mealType.name,
            foods: '',
            time: mealType.time,
            nutritionAnalysis: null
        };

        const updatedEntries = [...mealEntries, newEntry];
        setMealEntries(updatedEntries);
        calculateTotalCalories(updatedEntries);
    };

    const handleDeleteMeal = async (id: string) => {
        try {
            await deleteMealEntry(id);
            const updatedEntries = mealEntries.filter(entry => entry.id !== id);
            setMealEntries(updatedEntries);
            calculateTotalCalories(updatedEntries);

            // Notify parent component about the update
            if (onMealSaved) onMealSaved();

            toast("Meal deleted", {
                description: "The meal entry was successfully removed."
            });
        } catch (error) {
            console.error('Error deleting meal entry:', error);
            toast("Error", {
                description: "Failed to delete meal entry."
            });
        }
    };

    const handleSaveMeal = async (id: string) => {
        const mealToSave = mealEntries.find(entry => entry.id === id);

        if (!mealToSave || !mealToSave.foods.trim()) {
            toast("Cannot save", {
                description: "Please add some food items before saving."
            });
            return;
        }

        try {
            setAnalyzing(true);

            // Get nutrition analysis if API key is available
            if (geminiApiKey) {
                const analysis = await analyzeNutrition(mealToSave.foods, geminiApiKey, geminiModel);
                mealToSave.nutritionAnalysis = analysis;
            }

            await saveMealEntry(mealToSave);

            // Update the entry in state
            const updatedEntries = mealEntries.map(entry =>
                entry.id === id ? mealToSave : entry
            );

            setMealEntries(updatedEntries);
            calculateTotalCalories(updatedEntries);

            // Notify parent component about the update
            if (onMealSaved) onMealSaved();

            toast("Meal saved", {
                description: "Your meal entry has been saved successfully."
            });
        } catch (error) {
            console.error('Error saving meal entry:', error);
            toast("Error", {
                description: "Failed to save meal entry."
            });
        } finally {
            setAnalyzing(false);
        }
    };

    const handleUpdateField = (id: string, field: keyof MealEntry, value: string) => {
        setMealEntries(mealEntries.map(entry =>
            entry.id === id ? { ...entry, [field]: value } : entry
        ));
    };

    // Format time for display (add AM/PM)
    const formatTimeForDisplay = (time: string): string => {
        if (!time) return '';

        try {
            const [hours, minutes] = time.split(':').map(Number);
            if (isNaN(hours) || isNaN(minutes)) return time;

            const ampm = hours >= 12 ? 'PM' : 'AM';
            const displayHours = hours % 12 || 12; // Convert 0 to 12
            const displayMinutes = minutes.toString().padStart(2, '0');

            return `${displayHours}:${displayMinutes} ${ampm}`;
        } catch (error) {
            return time;
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Daily Nutrition & Workout Tracker</CardTitle>
                <CardDescription>
                    Record your meals and workouts to monitor nutrition and fitness progress
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[450px] pr-4">
                    <div className="space-y-6">
                        {mealEntries.length > 0 ? (
                            mealEntries.map(entry => (
                                <Card key={entry.id} className="bg-muted/30">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                                {/* Show the appropriate icon based on meal type */}
                                                {applicableMealTypes.find(type => type.id === entry.mealType)?.icon}
                                                <h4 className="font-medium">{entry.mealName}</h4>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1 group cursor-pointer relative"
                                                    onClick={() => setEditingTime(entry.id)}
                                                >
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                    {editingTime === entry.id ? (
                                                        <Input
                                                            type="time"
                                                            value={entry.time}
                                                            onChange={(e) => handleUpdateField(entry.id, 'time', e.target.value)}
                                                            className="w-[6.5rem] h-8"
                                                            aria-label="Meal time"
                                                            autoFocus
                                                            onBlur={() => setEditingTime(null)}
                                                            onKeyDown={(e) => {
                                                                if (e.key === 'Enter') {
                                                                    setEditingTime(null);
                                                                }
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="group-hover:bg-background/80 px-2 py-1 rounded transition-colors">
                                                            {formatTimeForDisplay(entry.time)}
                                                        </div>
                                                    )}
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteMeal(entry.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div>
                                            <Label htmlFor={`food-${entry.id}`} className="text-sm mb-1 block">
                                                Food Items
                                            </Label>
                                            <Textarea
                                                id={`food-${entry.id}`}
                                                value={entry.foods}
                                                onChange={(e) => handleUpdateField(entry.id, 'foods', e.target.value)}
                                                placeholder="List all foods and their approximate quantities (e.g., 2 eggs, 1 slice whole wheat bread, 1 tbsp butter)"
                                                className="resize-none"
                                                rows={4}
                                            />
                                        </div>

                                        {entry.nutritionAnalysis && (
                                            <div className="bg-background/50 p-3 rounded-md text-sm">
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                    <div className="text-center p-2 bg-background rounded-md">
                                                        <p className="font-semibold">{entry.nutritionAnalysis.calories}</p>
                                                        <p className="text-xs text-muted-foreground">Calories</p>
                                                    </div>
                                                    <div className="text-center p-2 bg-background rounded-md">
                                                        <p className="font-semibold">{entry.nutritionAnalysis.protein}</p>
                                                        <p className="text-xs text-muted-foreground">Protein</p>
                                                    </div>
                                                    <div className="text-center p-2 bg-background rounded-md">
                                                        <p className="font-semibold">{entry.nutritionAnalysis.carbs}</p>
                                                        <p className="text-xs text-muted-foreground">Carbs</p>
                                                    </div>
                                                    <div className="text-center p-2 bg-background rounded-md">
                                                        <p className="font-semibold">{entry.nutritionAnalysis.fat}</p>
                                                        <p className="text-xs text-muted-foreground">Fat</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            className="ml-auto"
                                            onClick={() => handleSaveMeal(entry.id)}
                                            disabled={analyzing || !entry.foods.trim()}
                                        >
                                            <Save className="mr-2 h-4 w-4" />
                                            {analyzing ? 'Analyzing...' : 'Save & Analyze'}
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                No meal entries yet. Add a meal to get started.
                            </div>
                        )}

                        <div className="pt-4">
                            <h4 className="text-sm font-medium mb-3">Add New Meal</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {applicableMealTypes.map(mealType => {
                                    // Check if this meal type already exists
                                    const exists = mealEntries.some(entry => entry.mealType === mealType.id);

                                    return (
                                        <Button
                                            key={mealType.id}
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleAddMeal(mealType)}
                                            disabled={exists}
                                            className="justify-start"
                                        >
                                            <PlusCircle className="mr-2 h-4 w-4" />
                                            {mealType.name}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
};

export default MealEntryForm;
