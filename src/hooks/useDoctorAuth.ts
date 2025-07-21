
import { useState, useEffect } from 'react';
import { Doctor } from '@/types/doctor';
import { sampleDoctors } from '@/data/sampleDoctors';
import { dispatchAuthEvent } from '@/App';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000/api';

export function useDoctorAuth() {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('isDoctorAuthenticated') === 'true';
    });

    const [currentDoctor, setCurrentDoctor] = useState<Doctor | null>(() => {
        const doctorId = localStorage.getItem('doctorId');
        const doctorProfile = JSON.parse(localStorage.getItem('doctorProfile'));
        if (doctorId == doctorProfile?._id) {
            return doctorProfile;    
        }
        return null;
    });

    useEffect(() => {
        const checkAuth = () => {
            const isAuth = localStorage.getItem('isDoctorAuthenticated') === 'true';
            setIsAuthenticated(isAuth);

            if (isAuth) {
                const doctorId = localStorage.getItem('doctorId');
                if (doctorId) {
                    const doctor = sampleDoctors.find(d => d._id === doctorId) || null;
                    setCurrentDoctor(doctor);
                }
            } else {
                setCurrentDoctor(null);
            }
        };

        checkAuth();

        window.addEventListener('storage', checkAuth);
        window.addEventListener('doctorAuthChanged', (event: Event) => {
            checkAuth();
        });

        return () => {
            window.removeEventListener('storage', checkAuth);
            window.removeEventListener('doctorAuthChanged', (event: Event) => {
                checkAuth();
            });
        };
    }, []);

    const loginDoctor = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await fetch(`${API_URL}/auth/loginDoctor`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();
            const doctor = sampleDoctors.find(d =>
                d.contactInfo?.email.toLowerCase() === data.doctor.contactInfo?.email.toLowerCase()
            );
            if (!doctor) {

                sampleDoctors.push(data.doctor); // Add the doctor to the sample data for demo purposes
                return { success: true, message: 'Doctor login success fully' };
            }
            localStorage.setItem('isDoctorAuthenticated', 'true');
            localStorage.setItem('doctorId', data.doctor._id);
            localStorage.setItem('doctorProfile', JSON.stringify(data.doctor));
            localStorage.setItem('isDoctorAuthenticated', 'true');
            setIsAuthenticated(true);
            setCurrentDoctor(data.doctor);
            const event = new CustomEvent('doctorAuthChanged', { detail: { isAuthenticated: true, doctor: data.doctor } });
            window.dispatchEvent(event);

            return { success: true, message: 'Doctor login successful!' };

        } catch (error) {
            console.error('Error during doctor login:', error);
            return { success: false, message: 'An error occurred during login.' };
        }





        // return new Promise((resolve) => {
        //     // Simulate API call
        //     setTimeout(() => {
        //         // Find doctor by email (using contactInfo.email)
        //         const doctor = sampleDoctors.find(d =>
        //             d.contactInfo?.email.toLowerCase() === email.toLowerCase()
        //         );

        //         if (!doctor) {
        //             resolve({ success: false, message: 'Doctor not found with this email.' });
        //             return;
        //         }

        //         // In a real app, we would check password hash, but for demo we'll use a simple check
        //         // For demo, if password matches the last name (lowercase), login succeeds
        //         if (password.toLowerCase() === doctor.lastName.toLowerCase()) {
        //             localStorage.setItem('isDoctorAuthenticated', 'true');
        //             localStorage.setItem('doctorId', doctor._id);

        //             // Update the current doctor state
        //             setIsAuthenticated(true);
        //             setCurrentDoctor(doctor);

        //             // Dispatch event for global state updates
        //             const event = new CustomEvent('doctorAuthChanged', { detail: { isAuthenticated: true, doctor } });
        //             window.dispatchEvent(event);

        //             resolve({ success: true, message: 'Login successful!' });
        //         } else {
        //             resolve({ success: false, message: 'Invalid password.' });
        //         }
        //     }, 1000);
        // });
    };

    const logoutDoctor = (): void => {
        localStorage.removeItem('isDoctorAuthenticated');
        localStorage.removeItem('doctorId');

        setIsAuthenticated(false);
        setCurrentDoctor(null);

        // Dispatch event for global state updates
        const event = new CustomEvent('doctorAuthChanged', { detail: { isAuthenticated: false, doctor: null } });
        window.dispatchEvent(event);
    };

    const updateDoctorProfile = (updatedDoctor: Partial<Doctor>): Promise<{ success: boolean; message: string }> => {
        return new Promise((resolve) => {
            if (!currentDoctor) {
                resolve({ success: false, message: 'Not authenticated as a doctor.' });
                return;
            }

            // Simulate API call
            setTimeout(() => {
                try {
                    // Find doctor index
                    const doctorIndex = sampleDoctors.findIndex(d => d._id === currentDoctor._id);

                    if (doctorIndex === -1) {
                        resolve({ success: false, message: 'Doctor not found.' });
                        return;
                    }

                    // Update doctor in the sample data
                    // In a real app, this would be an API call to update the database
                    const updatedDoctorData = {
                        ...sampleDoctors[doctorIndex],
                        ...updatedDoctor
                    };

                    // Update the sample data (this is for demo only)
                    sampleDoctors[doctorIndex] = updatedDoctorData;

                    // Update current doctor state
                    setCurrentDoctor(updatedDoctorData);

                    resolve({ success: true, message: 'Profile updated successfully!' });
                } catch (error) {
                    console.error('Error updating doctor profile:', error);
                    resolve({ success: false, message: 'An error occurred while updating profile.' });
                }
            }, 1000);
        });
    };

    return {
        isAuthenticated,
        currentDoctor,
        loginDoctor,
        logoutDoctor,
        updateDoctorProfile
    };
}
