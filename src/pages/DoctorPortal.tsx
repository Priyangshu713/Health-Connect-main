
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDoctorAuth } from '@/hooks/useDoctorAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Doctor } from '@/types/doctor';
import { Mail, Lock, Eye, EyeOff, User, Building, MapPin, BookOpen, Award, Users, Phone, Clock, Calendar } from 'lucide-react';
import Inbox from '@/components/doctor/Inbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000/api';

// Login form schema
const loginSchema = z.object({
    email: z.string().email({ message: 'Please enter a valid email' }),
    password: z.string().min(1, { message: 'Password is required' }),
});

// Profile update schema
const profileSchema = z.object({
    firstName: z.string().min(2, { message: 'First name must be at least 2 characters' }),
    lastName: z.string().min(2, { message: 'Last name must be at least 2 characters' }),
    specialty: z.string().min(2, { message: 'Specialty is required' }),
    hospital: z.string().min(2, { message: 'Hospital name is required' }),
    location: z.string().min(2, { message: 'Location is required' }),
    experience: z.coerce.number().min(0, { message: 'Experience must be a positive number' }),
    bio: z.string().min(10, { message: 'Bio should be at least 10 characters' }),
    email: z.string().email({ message: 'Please enter a valid email' }),
    phone: z.string().min(5, { message: 'Phone number is required' }),
    availabilityHours: z.string().min(3, { message: 'Please specify your hours' }),
    availableDays: z.array(z.string()).min(1, { message: 'Select at least one day' }),
});

const daysOfWeek = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' },
];

const DoctorPortal: React.FC = () => {
    const { isAuthenticated, currentDoctor, loginDoctor, logoutDoctor, updateDoctorProfile } = useDoctorAuth();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    // const [getMessages, setGetMessages] = useState<any>([]);

    // Login form
    const loginForm = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });
    // useEffect(() => {
    //     (async () => {
    //         // Check if user is authenticated
    //         if (isAuthenticated && currentDoctor) {
    //             // Redirect to profile tab if authenticated
    //             // navigate('/doctor-portal/profile');
    //             const response = await fetch(`${API_URL}/auth/getAllmessage`, {
    //                 method: 'POST',
    //                 headers: {
    //                     'Content-Type': 'application/json',
    //                 },
    //                 body: JSON.stringify({ doctorEmail:currentDoctor?.contactInfo?.email }),
    //             });
    //             const data = await response.json();
    //             setGetMessages(data.allMessges);

    //         } else {
    //             // If not authenticated, redirect to login
    //             navigate('/doctor-portal/login');
    //         }

    //     })()

    // }, [isAuthenticated, currentDoctor]);


    // Profile form
    const profileForm = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: currentDoctor?.firstName || '',
            lastName: currentDoctor?.lastName || '',
            specialty: currentDoctor?.specialty || '',
            hospital: currentDoctor?.hospital || '',
            location: currentDoctor?.location || '',
            experience: currentDoctor?.experience || 0,
            bio: currentDoctor?.bio || '',
            email: currentDoctor?.contactInfo?.email || '',
            phone: currentDoctor?.contactInfo?.phone || '',
            availabilityHours: currentDoctor?.availability?.hours || '9:00 AM - 5:00 PM',
            availableDays: currentDoctor?.availability?.days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        },
    });

    // Update profile form values when currentDoctor changes
    React.useEffect(() => {
        if (currentDoctor) {
            profileForm.reset({
                firstName: currentDoctor.firstName,
                lastName: currentDoctor.lastName,
                specialty: currentDoctor.specialty,
                hospital: currentDoctor.hospital,
                location: currentDoctor.location,
                experience: currentDoctor.experience,
                bio: currentDoctor.bio,
                email: currentDoctor.contactInfo?.email || '',
                phone: currentDoctor.contactInfo?.phone || '',
                availabilityHours: currentDoctor.availability?.hours || '9:00 AM - 5:00 PM',
                availableDays: currentDoctor.availability?.days || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            });
        }
    }, [currentDoctor, profileForm]);

    const handleLogin = async (data: z.infer<typeof loginSchema>) => {
        setIsLoading(true);

        try {
            const result = await loginDoctor(data.email, data.password);

            if (result.success) {
                toast({
                    title: 'Login successful',
                    description: 'Welcome to your doctor portal!',
                });
            } else {
                toast({
                    title: 'Login failed',
                    description: result.message,
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An unexpected error occurred',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpdateProfile = async (data: z.infer<typeof profileSchema>) => {
        setIsLoading(true);

        try {
            const updatedDoctor: Partial<Doctor> = {
                firstName: data.firstName,
                lastName: data.lastName,
                specialty: data.specialty,
                hospital: data.hospital,
                location: data.location,
                experience: data.experience,
                bio: data.bio,
                contactInfo: {
                    email: data.email,
                    phone: data.phone,
                },
                availability: {
                    days: data.availableDays,
                    hours: data.availabilityHours,
                },
            };

            const result = await updateDoctorProfile(updatedDoctor);

            if (result.success) {
                toast({
                    title: 'Profile updated',
                    description: 'Your profile has been successfully updated',
                });
            } else {
                toast({
                    title: 'Update failed',
                    description: result.message,
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'An unexpected error occurred',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        logoutDoctor();
        toast({
            title: 'Logged out',
            description: 'You have been successfully logged out',
        });
    };

    return (
        <div className="container mx-auto py-10 px-4 max-h-screen overflow-hidden pt-[var(--nav-height,80px)]">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Doctor Specialist Portal</h1>

                {!isAuthenticated ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Doctor Login</CardTitle>
                            <CardDescription>
                                Please enter your credentials to access the specialist portal
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Form {...loginForm}>
                                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                                    <FormField
                                        control={loginForm.control}
                                        name="email"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Email</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            placeholder="doctor@example.com"
                                                            className="pl-10"
                                                            {...field}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={loginForm.control}
                                        name="password"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Password</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                        <Input
                                                            type={showPassword ? 'text' : 'password'}
                                                            placeholder="••••••••"
                                                            className="pl-10 pr-10"
                                                            {...field}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(prev => !prev)}
                                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
                                                        >
                                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                                        </button>
                                                    </div>
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />

                                    <Button
                                        type="submit"
                                        className="w-full"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Logging in...' : 'Login'}
                                    </Button>
                                </form>
                            </Form>

                            <div className="mt-4 text-sm text-muted-foreground">
                                <p className="text-center">
                                    For demo: Use any doctor email from the specialists section with their last name as password
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="h-[calc(100vh-180px)] flex flex-col">
                        <Card className="mb-4">
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <div>
                                        <CardTitle>Welcome, Dr. {currentDoctor?.lastName}</CardTitle>
                                        <CardDescription>{currentDoctor?.specialty} at {currentDoctor?.hospital}</CardDescription>
                                    </div>
                                    <Button variant="outline" onClick={handleLogout}>Logout</Button>
                                </div>
                            </CardHeader>
                        </Card>

                        <ScrollArea className="flex-1">
                            <Tabs defaultValue="profile" className="w-full">
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="profile">Profile</TabsTrigger>
                                    <TabsTrigger value="availability">Availability</TabsTrigger>
                                    <TabsTrigger value="stats">Stats & Info</TabsTrigger>
                                    <TabsTrigger value="inbox">Inbox</TabsTrigger>
                                </TabsList>

                                <TabsContent value="profile">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Update Your Profile</CardTitle>
                                            <CardDescription>
                                                Make changes to your profile information here. These changes will be visible to patients.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Form {...profileForm}>
                                                <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="space-y-4">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <FormField
                                                            control={profileForm.control}
                                                            name="firstName"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>First Name</FormLabel>
                                                                    <FormControl>
                                                                        <div className="relative">
                                                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                                            <Input className="pl-10" {...field} />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={profileForm.control}
                                                            name="lastName"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Last Name</FormLabel>
                                                                    <FormControl>
                                                                        <div className="relative">
                                                                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                                            <Input className="pl-10" {...field} />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={profileForm.control}
                                                            name="specialty"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Specialty</FormLabel>
                                                                    <FormControl>
                                                                        <div className="relative">
                                                                            <Award className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                                            <Input className="pl-10" {...field} />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={profileForm.control}
                                                            name="hospital"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Hospital/Clinic</FormLabel>
                                                                    <FormControl>
                                                                        <div className="relative">
                                                                            <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                                            <Input className="pl-10" {...field} />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={profileForm.control}
                                                            name="location"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Location</FormLabel>
                                                                    <FormControl>
                                                                        <div className="relative">
                                                                            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                                            <Input className="pl-10" {...field} />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={profileForm.control}
                                                            name="experience"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Years of Experience</FormLabel>
                                                                    <FormControl>
                                                                        <div className="relative">
                                                                            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                                            <Input type="number" className="pl-10" {...field} />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={profileForm.control}
                                                            name="email"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Email</FormLabel>
                                                                    <FormControl>
                                                                        <div className="relative">
                                                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                                            <Input className="pl-10" {...field} />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        <FormField
                                                            control={profileForm.control}
                                                            name="phone"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Phone</FormLabel>
                                                                    <FormControl>
                                                                        <div className="relative">
                                                                            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                                            <Input className="pl-10" {...field} />
                                                                        </div>
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>

                                                    <FormField
                                                        control={profileForm.control}
                                                        name="bio"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Professional Bio</FormLabel>
                                                                <FormControl>
                                                                    <div className="relative">
                                                                        <BookOpen className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                                        <Textarea
                                                                            placeholder="Tell patients about your professional background and expertise..."
                                                                            className="min-h-32 pl-10 pt-2"
                                                                            {...field}
                                                                        />
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <Button
                                                        type="submit"
                                                        className="w-full"
                                                        disabled={isLoading}
                                                    >
                                                        {isLoading ? 'Updating Profile...' : 'Update Profile'}
                                                    </Button>
                                                </form>
                                            </Form>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                <TabsContent value="availability">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Set Your Availability</CardTitle>
                                            <CardDescription>
                                                Specify when you're available for appointments. This information will be shown to patients.
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <Form {...profileForm}>
                                                <form onSubmit={profileForm.handleSubmit(handleUpdateProfile)} className="space-y-6">
                                                    <FormField
                                                        control={profileForm.control}
                                                        name="availableDays"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel className="text-base">Available Days</FormLabel>
                                                                <div className="space-y-2">
                                                                    {daysOfWeek.map((day) => (
                                                                        <FormField
                                                                            key={day.id}
                                                                            control={profileForm.control}
                                                                            name="availableDays"
                                                                            render={({ field }) => {
                                                                                return (
                                                                                    <FormItem
                                                                                        key={day.id}
                                                                                        className="flex flex-row items-start space-x-3 space-y-0"
                                                                                    >
                                                                                        <FormControl>
                                                                                            <Checkbox
                                                                                                checked={field.value?.includes(day.id)}
                                                                                                onCheckedChange={(checked) => {
                                                                                                    return checked
                                                                                                        ? field.onChange([...field.value, day.id])
                                                                                                        : field.onChange(
                                                                                                            field.value?.filter(
                                                                                                                (value) => value !== day.id
                                                                                                            )
                                                                                                        )
                                                                                                }}
                                                                                            />
                                                                                        </FormControl>
                                                                                        <FormLabel className="font-normal">
                                                                                            {day.label}
                                                                                        </FormLabel>
                                                                                    </FormItem>
                                                                                )
                                                                            }}
                                                                        />
                                                                    ))}
                                                                </div>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <FormField
                                                        control={profileForm.control}
                                                        name="availabilityHours"
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <FormLabel>Office Hours</FormLabel>
                                                                <FormControl>
                                                                    <div className="relative">
                                                                        <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                                        <Input
                                                                            placeholder="e.g., 9:00 AM - 5:00 PM"
                                                                            className="pl-10"
                                                                            {...field}
                                                                        />
                                                                    </div>
                                                                </FormControl>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />

                                                    <Button
                                                        type="submit"
                                                        className="w-full"
                                                        disabled={isLoading}
                                                    >
                                                        {isLoading ? 'Updating Availability...' : 'Update Availability'}
                                                    </Button>
                                                </form>
                                            </Form>
                                        </CardContent>
                                    </Card>
                                </TabsContent>

                                {/* Inbox Tab */}
                                <TabsContent value="inbox">
                                    <Inbox />
                                </TabsContent>

                                <TabsContent value="stats">
                                    <Card>
                                        <CardHeader>
                                            <CardTitle>Your Practice Statistics</CardTitle>
                                            <CardDescription>View statistics about your practice and patient interactions</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="border rounded-lg p-4">
                                                    <p className="text-muted-foreground text-sm">Total Patients</p>
                                                    <p className="text-2xl font-bold">{currentDoctor?.patients || 0}</p>
                                                </div>
                                                <div className="border rounded-lg p-4">
                                                    <p className="text-muted-foreground text-sm">Rating</p>
                                                    <p className="text-2xl font-bold">{currentDoctor?.rating || 0}/5</p>
                                                </div>
                                                <div className="border rounded-lg p-4">
                                                    <p className="text-muted-foreground text-sm">Reviews</p>
                                                    <p className="text-2xl font-bold">{currentDoctor?.reviewCount || 0}</p>
                                                </div>
                                                <div className="border rounded-lg p-4">
                                                    <p className="text-muted-foreground text-sm">Years of Experience</p>
                                                    <p className="text-2xl font-bold">{currentDoctor?.experience || 0}</p>
                                                </div>
                                            </div>

                                            {currentDoctor?.subspecialties && currentDoctor.subspecialties.length > 0 && (
                                                <div className="mt-6">
                                                    <p className="font-medium mb-2">Subspecialties</p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {currentDoctor.subspecialties.map((subspecialty, index) => (
                                                            <span key={index} className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                                                                {subspecialty}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {currentDoctor?.education && currentDoctor.education.length > 0 && (
                                                <div className="mt-6">
                                                    <p className="font-medium mb-2">Education</p>
                                                    <ul className="list-disc pl-5 space-y-1">
                                                        {currentDoctor.education.map((edu, index) => (
                                                            <li key={index} className="text-sm">{edu}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {currentDoctor?.certifications && currentDoctor.certifications.length > 0 && (
                                                <div className="mt-6">
                                                    <p className="font-medium mb-2">Certifications</p>
                                                    <ul className="list-disc pl-5 space-y-1">
                                                        {currentDoctor.certifications.map((cert, index) => (
                                                            <li key={index} className="text-sm">{cert}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </CardContent>
                                        <CardFooter className="flex justify-center border-t pt-4">
                                            <p className="text-sm text-muted-foreground">
                                                Note: To update subspecialties, education, and certifications,
                                                please contact the platform administrator.
                                            </p>
                                        </CardFooter>
                                    </Card>
                                </TabsContent>
                            </Tabs>
                        </ScrollArea>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorPortal;
