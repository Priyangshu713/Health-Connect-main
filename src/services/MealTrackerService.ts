import { NutritionAnalysis } from './NutritionGeminiService';

export interface MealEntry {
    id: string;
    date: string;
    mealType: string;
    mealName: string;
    foods: string;
    time: string;
    nutritionAnalysis: NutritionAnalysis | null;
}

export interface WorkoutEntry {
    id: string;
    date: string;
    workoutType: string;
    duration: number; // in minutes
    intensity: 'light' | 'moderate' | 'intense';
    caloriesBurned: number | null;
}

export interface BMRData {
    bmr: number;
    tdee: number;
    age: number;
    weight: number;
    height: number;
    gender: string;
    activityLevel: string;
    workingOut: boolean;
    workoutType?: string;
    date: string;
}

// Storage key constants
const MEAL_ENTRIES_KEY = 'meal_entries';
const WORKOUT_ENTRIES_KEY = 'workout_entries';
const BMR_DATA_KEY = 'bmr_data';

/**
 * Save BMR calculation data
 */
export const saveBMRData = async (data: BMRData): Promise<void> => {
    try {
        localStorage.setItem(BMR_DATA_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('Error saving BMR data:', error);
        throw new Error('Failed to save BMR data');
    }
};

/**
 * Get BMR calculation data
 */
export const getBMRData = async (): Promise<BMRData | null> => {
    try {
        const data = localStorage.getItem(BMR_DATA_KEY);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error('Error retrieving BMR data:', error);
        throw new Error('Failed to retrieve BMR data');
    }
};

/**
 * Save a meal entry
 */
export const saveMealEntry = async (entry: MealEntry): Promise<void> => {
    try {
        // Get existing entries
        const entriesJSON = localStorage.getItem(MEAL_ENTRIES_KEY);
        let entries: MealEntry[] = entriesJSON ? JSON.parse(entriesJSON) : [];

        // Check if entry already exists
        const existingIndex = entries.findIndex(e => e.id === entry.id);

        if (existingIndex >= 0) {
            // Update existing entry
            entries[existingIndex] = entry;
        } else {
            // Add new entry
            entries.push(entry);
        }

        // Save back to storage
        localStorage.setItem(MEAL_ENTRIES_KEY, JSON.stringify(entries));
    } catch (error) {
        console.error('Error saving meal entry:', error);
        throw new Error('Failed to save meal entry');
    }
};

/**
 * Delete a meal entry by ID
 */
export const deleteMealEntry = async (id: string): Promise<void> => {
    try {
        // Get existing entries
        const entriesJSON = localStorage.getItem(MEAL_ENTRIES_KEY);
        if (!entriesJSON) return;

        let entries: MealEntry[] = JSON.parse(entriesJSON);

        // Filter out the entry to delete
        entries = entries.filter(entry => entry.id !== id);

        // Save back to storage
        localStorage.setItem(MEAL_ENTRIES_KEY, JSON.stringify(entries));
    } catch (error) {
        console.error('Error deleting meal entry:', error);
        throw new Error('Failed to delete meal entry');
    }
};

/**
 * Get all meal entries for a specific date
 */
export const getMealEntriesForDate = async (date: Date): Promise<MealEntry[]> => {
    try {
        // Get all entries
        const entriesJSON = localStorage.getItem(MEAL_ENTRIES_KEY);
        if (!entriesJSON) return [];

        const entries: MealEntry[] = JSON.parse(entriesJSON);

        // Format date to YYYY-MM-DD for comparison
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        const targetDateStr = targetDate.toISOString().split('T')[0];

        // Filter entries for the specific date
        return entries.filter(entry => {
            const entryDate = new Date(entry.date);
            entryDate.setHours(0, 0, 0, 0);
            const entryDateStr = entryDate.toISOString().split('T')[0];

            return entryDateStr === targetDateStr;
        });
    } catch (error) {
        console.error('Error retrieving meal entries:', error);
        throw new Error('Failed to retrieve meal entries');
    }
};

/**
 * Get entries for multiple dates (for reporting)
 */
export const getMealEntriesForDateRange = async (startDate: Date, endDate: Date): Promise<MealEntry[]> => {
    try {
        // Get all entries
        const entriesJSON = localStorage.getItem(MEAL_ENTRIES_KEY);
        if (!entriesJSON) return [];

        const entries: MealEntry[] = JSON.parse(entriesJSON);

        // Create date objects with time set to midnight
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        // Filter entries in the date range
        return entries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= start && entryDate <= end;
        });
    } catch (error) {
        console.error('Error retrieving meal entries:', error);
        throw new Error('Failed to retrieve meal entries');
    }
};

/**
 * Clear all meal entries (for testing)
 */
export const clearAllMealEntries = async (): Promise<void> => {
    try {
        localStorage.removeItem(MEAL_ENTRIES_KEY);
    } catch (error) {
        console.error('Error clearing meal entries:', error);
        throw new Error('Failed to clear meal entries');
    }
};

/**
 * Save a workout entry
 */
export const saveWorkoutEntry = async (entry: WorkoutEntry): Promise<void> => {
    try {
        // Get existing entries
        const entriesJSON = localStorage.getItem(WORKOUT_ENTRIES_KEY);
        let entries: WorkoutEntry[] = entriesJSON ? JSON.parse(entriesJSON) : [];

        // Check if entry already exists
        const existingIndex = entries.findIndex(e => e.id === entry.id);

        if (existingIndex >= 0) {
            // Update existing entry
            entries[existingIndex] = entry;
        } else {
            // Add new entry
            entries.push(entry);
        }

        // Save back to storage
        localStorage.setItem(WORKOUT_ENTRIES_KEY, JSON.stringify(entries));
    } catch (error) {
        console.error('Error saving workout entry:', error);
        throw new Error('Failed to save workout entry');
    }
};

/**
 * Delete a workout entry by ID
 */
export const deleteWorkoutEntry = async (id: string): Promise<void> => {
    try {
        // Get existing entries
        const entriesJSON = localStorage.getItem(WORKOUT_ENTRIES_KEY);
        if (!entriesJSON) return;

        let entries: WorkoutEntry[] = JSON.parse(entriesJSON);

        // Filter out the entry to delete
        entries = entries.filter(entry => entry.id !== id);

        // Save back to storage
        localStorage.setItem(WORKOUT_ENTRIES_KEY, JSON.stringify(entries));
    } catch (error) {
        console.error('Error deleting workout entry:', error);
        throw new Error('Failed to delete workout entry');
    }
};

/**
 * Get all workout entries for a specific date
 */
export const getWorkoutEntriesForDate = async (date: Date): Promise<WorkoutEntry[]> => {
    try {
        // Get all entries
        const entriesJSON = localStorage.getItem(WORKOUT_ENTRIES_KEY);
        if (!entriesJSON) return [];

        const entries: WorkoutEntry[] = JSON.parse(entriesJSON);

        // Format date to YYYY-MM-DD for comparison
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);
        const targetDateStr = targetDate.toISOString().split('T')[0];

        // Filter entries for the specific date
        return entries.filter(entry => {
            const entryDate = new Date(entry.date);
            entryDate.setHours(0, 0, 0, 0);
            const entryDateStr = entryDate.toISOString().split('T')[0];

            return entryDateStr === targetDateStr;
        });
    } catch (error) {
        console.error('Error retrieving workout entries:', error);
        throw new Error('Failed to retrieve workout entries');
    }
};
