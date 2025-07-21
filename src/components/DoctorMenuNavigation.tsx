import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDoctorAuth } from '@/hooks/useDoctorAuth';
import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import { cn } from '@/lib/utils';
import { UserRound, Stethoscope, LogIn } from 'lucide-react';

const DoctorMenuNavigation: React.FC = () => {
    const { isAuthenticated } = useDoctorAuth();
    const [isDoctorUser, setIsDoctorUser] = useState(false);

    useEffect(() => {
        // Check if user is a doctor
        const checkDoctorStatus = () => {
            const isDoctorAuth = localStorage.getItem('isDoctorAuthenticated') === 'true';
            setIsDoctorUser(isDoctorAuth);
        };

        checkDoctorStatus();

        // Listen for doctor auth changes
        window.addEventListener('doctorAuthChanged', checkDoctorStatus);
        window.addEventListener('storage', checkDoctorStatus);

        return () => {
            window.removeEventListener('doctorAuthChanged', checkDoctorStatus);
            window.removeEventListener('storage', checkDoctorStatus);
        };
    }, []);

    if (!isDoctorUser && !isAuthenticated) {
        return null; // Hide the menu for non-doctor users
    }

    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-transparent">
                        <Stethoscope className="mr-2 h-4 w-4" />
                        <span>For Doctors</span>
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid gap-3 p-4 w-[200px]">
                            {//Temporarily disabled Doctor Portal
                            <li>
                                <NavigationMenuLink asChild>
                                    <Link
                                        to="/doctor-portal"
                                        className={cn(
                                            "flex items-center p-2 rounded-md hover:bg-accent w-full",
                                            "transition-colors duration-200"
                                        )}
                                    >
                                        {isAuthenticated ? (
                                            <>
                                                <UserRound className="mr-2 h-4 w-4" />
                                                <span>Doctor Portal</span>
                                            </>
                                        ) : (
                                            <>
                                                <LogIn className="mr-2 h-4 w-4" />
                                                <span>Doctor Login</span>
                                            </>
                                        )}
                                    </Link>
                                </NavigationMenuLink>
                            </li>
                            }
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    );
};

export default DoctorMenuNavigation;
