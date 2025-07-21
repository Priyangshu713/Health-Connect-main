
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { fetchNutritionData, NutritionCategory } from '@/services/EdamamNutritionService';

export const useNutritionData = () => {
  const { toast } = useToast();
  const [nutritionData, setNutritionData] = useState<NutritionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Check if we have cached data
      const cachedData = sessionStorage.getItem('nutrition-general-data');
      
      if (cachedData) {
        setNutritionData(JSON.parse(cachedData));
        setLoading(false);
        return;
      }
      
      // No cache, fetch fresh data
      const data = await fetchNutritionData();
      setNutritionData(data);
      
      // Cache the data in session storage
      sessionStorage.setItem('nutrition-general-data', JSON.stringify(data));
    } catch (err) {
      console.error('Error fetching nutrition data:', err);
      setError('Failed to load nutrition recommendations. Please try again later.');
      
      toast({
        title: 'Error',
        description: 'Could not load nutrition recommendations.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch data on initial load
  useEffect(() => {
    fetchData();
  }, []);
  
  const refreshData = () => {
    // Clear the cache and fetch new data
    sessionStorage.removeItem('nutrition-general-data');
    fetchData();
  };
  
  return {
    nutritionData,
    loading,
    error,
    refreshData
  };
};
