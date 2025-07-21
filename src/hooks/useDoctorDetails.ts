
import { useState, useEffect } from 'react';
import { Doctor } from '@/types/doctor';
import { sampleDoctors } from '@/data/sampleDoctors';

export function useDoctorDetails(doctorId: string | undefined) {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    console.log(`Fetching details for doctor ID: ${doctorId}`);
    const fetchDoctorDetails = async () => {
      if (!doctorId) {
        setIsLoading(false);
        setError(new Error('Doctor ID is required'));
        return;
      }
      
      setIsLoading(true);
      
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Find doctor in sample data
        const foundDoctor = sampleDoctors.find(d => d._id === doctorId);
        
        if (foundDoctor) {
          setDoctor(foundDoctor);
        } else {
          setError(new Error('Doctor not found'));
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching doctor details:', err);
        setError(err as Error);
        setIsLoading(false);
      }
    };
    
    fetchDoctorDetails();
  }, [doctorId]);

  return {
    doctor,
    isLoading,
    error
  };
}
