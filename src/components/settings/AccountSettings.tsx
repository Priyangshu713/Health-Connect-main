import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { format } from 'date-fns';
import { User, Upload, X, Camera, Zap, AlertTriangle, CheckCircle, ShieldCheck, Crown, CreditCard, Info } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { getUserProfile, updateUserProfile, synchronizeTier, updateProfileImage, deleteUserAccount, updateUserTier, cancelSubscription, getSubscriptionDetails } from '@/api/auth';
import { useHealthStore } from '@/store/healthStore';

// Form schema
const profileSchema = z.object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters long' }),
});

interface AccountSettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

type ProfileData = {
    name: string;
    email: string;
    tier: 'free' | 'lite' | 'pro';
    profileImage?: string;
    createdAt: string;
};

const AccountSettings: React.FC<AccountSettingsProps> = ({ isOpen, onClose }) => {
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSynchronizing, setIsSynchronizing] = useState(false);
    const { geminiTier } = useHealthStore();

    // States for deletion flow
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showDeleteWarning, setShowDeleteWarning] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [showPaymentDetails, setShowPaymentDetails] = useState(false);

    // States for payment management flow
    const [paymentStep, setPaymentStep] = useState<'details' | 'tier' | 'cancel'>('details');
    const [selectedTier, setSelectedTier] = useState<'free' | 'lite' | 'pro'>('free');
    const [isUpdatingTier, setIsUpdatingTier] = useState(false);
    const [cancelReasons, setCancelReasons] = useState<string[]>([]);
    const [cancelPassword, setCancelPassword] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);
    const [cancelError, setCancelError] = useState('');
    const [subscriptionDetails, setSubscriptionDetails] = useState<{ amount: number; currency: string; nextBillingDate: string; daysLeft: number } | null>(null);

    // Helper to compare tiers – higher number means higher tier
    const tierRank = { free: 0, lite: 1, pro: 2 } as const;
    const isDowngradeAttempt = tierRank[selectedTier] < tierRank[profileData?.tier || 'free'];
    // ----- Options for subscription management -----
    const reasonOptions = [
        'Too expensive',
        'Not using the service enough',
        'Found a better alternative',
        'Temporary financial reasons',
        'Other',
    ] as const;

    const tierOptions: { value: 'free' | 'lite' | 'pro'; label: string; price: string }[] = [
        { value: 'free', label: 'Free', price: '₹0' },
        { value: 'lite', label: 'Lite', price: '₹799/mo' },
        { value: 'pro', label: 'Pro', price: '₹999/mo' },
    ];

    // Form setup
    const form = useForm<z.infer<typeof profileSchema>>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: '',
        },
    });

    // Fetch user profile data
    useEffect(() => {
        if (isOpen) {
            fetchProfileData();
        }
    }, [isOpen]);

    // Reset payment flow states whenever the payment dialog is opened or profile data changes
    useEffect(() => {
        if (showPaymentDetails) {
            setPaymentStep('details');
            // Fetch latest subscription details
            (async () => {
                try {
                    const details = await getSubscriptionDetails();
                    setSubscriptionDetails(details);
                    // If backend downgraded to free, update local tier
                    if (details.plan && details.plan !== profileData?.tier) {
                        setProfileData(prev => prev ? { ...prev, tier: details.plan } : prev);
                        localStorage.setItem('geminiTier', details.plan);
                    }
                } catch (err) {
                    console.error('Failed to fetch subscription details:', err);
                    setSubscriptionDetails(null);
                }
            })();
            if (profileData) {
                setSelectedTier(profileData.tier);
            }
            setCancelReasons([]);
            setCancelPassword('');
            setCancelError('');
        }
    }, [showPaymentDetails, profileData]);

    const fetchProfileData = async () => {
        setIsLoading(true);
        try {
            // First, try to synchronize the tier
            await synchronizeTierWithBackend();

            const data = await getUserProfile();
            setProfileData({
                name: data.name,
                email: data.email,
                tier: data.tier as 'free' | 'lite' | 'pro',
                profileImage: data.profileImage,
                createdAt: data.createdAt
            });
            form.setValue('name', data.name);
            setProfileImage(data.profileImage || null);
        } catch (error) {
            console.error('Error fetching profile data:', error);
            toast({
                title: 'Error',
                description: 'Failed to load account settings',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const synchronizeTierWithBackend = async () => {
        setIsSynchronizing(true);
        try {
            // Only synchronize if user has a tier set in localStorage
            const localTier = localStorage.getItem('geminiTier');
            if (localTier) {
                console.log(`Attempting to synchronize tier: ${localTier}`);
                await synchronizeTier();
                toast({
                    title: 'Tier Synchronized',
                    description: `Your ${localTier.charAt(0).toUpperCase() + localTier.slice(1)} tier has been synchronized with the server.`,
                });
            }
        } catch (error) {
            console.error('Error synchronizing tier:', error);
            // Don't show error toast here to not interrupt the user experience
        } finally {
            setIsSynchronizing(false);
        }
    };

    const createTinyAvatar = (letter: string, color: string = '#4f46e5') => {
        // Create a tiny canvas for simple text avatar
        const canvas = document.createElement('canvas');
        canvas.width = 60;
        canvas.height = 60;
        const ctx = canvas.getContext('2d');

        if (!ctx) return null;

        // Draw background
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, 60, 60);

        // Draw text
        ctx.fillStyle = 'white';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(letter.toUpperCase(), 30, 30);

        // Convert to very small JPEG
        return canvas.toDataURL('image/jpeg', 0.01);
    };

    const onSubmit = async (values: z.infer<typeof profileSchema>) => {
        setIsLoading(true);
        let successMessages = [];
        let retryWithFallback = false;

        try {
            // Handle profile updates in two separate steps for reliability:
            // 1. First update name if changed
            if (values.name !== profileData?.name) {
                console.log('Updating name to:', values.name);

                try {
                    await updateUserProfile({ name: values.name });

                    // Update local storage with new name
                    const currentName = localStorage.getItem('userName');
                    if (currentName && values.name !== currentName) {
                        localStorage.setItem('userName', values.name);
                    }

                    successMessages.push('Name updated successfully');
                } catch (nameError: any) {
                    console.error('Error updating name:', nameError);
                    toast({
                        title: 'Name update failed',
                        description: nameError.message || 'Failed to update your name',
                        variant: 'destructive',
                    });
                }
            }

            // 2. Then update profile image if changed
            // First check if the image was removed (current is null but original had an image)
            const wasImageRemoved = profileImage === null && profileData?.profileImage !== null;

            // Then check if we're adding/changing an image
            const isImageChanged = profileImage !== null && profileImage !== profileData?.profileImage;

            if (isImageChanged) {
                console.log('Updating profile image...');
                console.log(`Image size: ${Math.round((profileImage as string).length / 1024)}KB`);

                try {
                    // Use the dedicated profile image update function
                    await updateProfileImage(profileImage as string);

                    // Dispatch a profile updated event
                    window.dispatchEvent(new Event('profileUpdated'));

                    successMessages.push('Profile image updated successfully');
                } catch (imageError: any) {
                    console.error('Error updating profile image:', imageError);

                    // Check if it's the request entity too large error
                    const isTooLarge =
                        imageError.message?.includes('too large') ||
                        imageError.message?.includes('entity') ||
                        imageError.message?.includes('size');

                    if (isTooLarge) {
                        // Try our extreme fallback option - create a text-based avatar
                        retryWithFallback = true;

                        toast({
                            title: 'Trying alternative method',
                            description: 'Image is too large, using a simple letter avatar instead',
                        });
                    } else {
                        // Show regular error for other issues
                        toast({
                            title: 'Image update failed',
                            description: imageError.message || 'Failed to update profile image',
                            variant: 'destructive',
                        });
                    }
                }

                // If the standard method failed due to size limits, try fallback
                if (retryWithFallback) {
                    try {
                        console.log('Trying fallback letter avatar...');
                        // Create a tiny text avatar with first letter
                        const letter = values.name?.charAt(0) || 'U';
                        const tinyAvatar = createTinyAvatar(letter);

                        if (tinyAvatar) {
                            console.log(`Tiny letter avatar size: ${Math.round(tinyAvatar.length / 1024)}KB`);
                            await updateProfileImage(tinyAvatar);

                            // Update UI
                            window.dispatchEvent(new Event('profileUpdated'));
                            successMessages.push('Simple avatar created successfully');
                        }
                    } catch (fallbackError) {
                        console.error('Fallback avatar also failed:', fallbackError);
                        toast({
                            title: 'Image update failed',
                            description: 'Could not update profile image, even with fallback method',
                            variant: 'destructive',
                        });
                    }
                }
            } else if (wasImageRemoved) {
                // Image removal was handled separately by the removeProfileImage function
                // Just add a success message for the form submission feedback
                successMessages.push('Profile image removal confirmed');
            }

            // Show success message if any of the updates succeeded
            if (successMessages.length > 0) {
                toast({
                    title: 'Account updated',
                    description: successMessages.join('. '),
                });
                onClose();
            } else if (!isImageChanged && !wasImageRemoved && values.name === profileData?.name) {
                toast({
                    title: 'No changes',
                    description: 'No changes were detected to save',
                });
                onClose();
            }
        } catch (error: any) {
            console.error('Unexpected error in profile update:', error);
            toast({
                title: 'Update failed',
                description: 'An unexpected error occurred. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Then modify the handleImageUpload function to use compression for large images
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);

        // File size validation (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            toast({
                title: 'File too large',
                description: 'Please select an image smaller than 10MB',
                variant: 'destructive',
            });
            setIsUploading(false);
            return;
        }

        try {
            const reader = new FileReader();
            reader.onload = async (event) => {
                if (event.target?.result) {
                    const originalImage = event.target.result as string;

                    // For debugging
                    console.log(`Original image size: ${Math.round(originalImage.length / 1024)}KB`);

                    try {
                        // Apply better balanced compression
                        const img = new Image();
                        img.src = originalImage;

                        await new Promise<void>((resolve) => {
                            img.onload = () => resolve();
                        });

                        // Create a medium-sized canvas - 300px max width/height for better quality
                        const canvas = document.createElement('canvas');
                        const MAX_DIM = 300;
                        const scale = Math.min(MAX_DIM / img.width, MAX_DIM / img.height);
                        canvas.width = Math.floor(img.width * scale);
                        canvas.height = Math.floor(img.height * scale);

                        const ctx = canvas.getContext('2d');
                        if (!ctx) throw new Error('Could not get canvas context');

                        // Draw image with high quality smoothing
                        ctx.imageSmoothingQuality = 'high';
                        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                        // Start with better quality (40%)
                        let compressedImage = canvas.toDataURL('image/jpeg', 0.4);
                        let imageSize = Math.round(compressedImage.length / 1024);
                        console.log(`Medium quality image (300px, 0.4 quality): ${imageSize}KB`);

                        // Only reduce quality if the image is too large
                        if (imageSize > 60) {
                            // Try with slightly lower quality (25%)
                            compressedImage = canvas.toDataURL('image/jpeg', 0.25);
                            imageSize = Math.round(compressedImage.length / 1024);
                            console.log(`Lower quality image (300px, 0.25 quality): ${imageSize}KB`);

                            // If still too large, reduce dimensions and quality more
                            if (imageSize > 40) {
                                // Reduce dimensions to 200px
                                canvas.width = 200;
                                canvas.height = 200 * (canvas.height / canvas.width);
                                ctx.imageSmoothingQuality = 'high';
                                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                                compressedImage = canvas.toDataURL('image/jpeg', 0.2);
                                imageSize = Math.round(compressedImage.length / 1024);
                                console.log(`Small image (200px, 0.2 quality): ${imageSize}KB`);
                            }
                        }

                        // Set the image in state
                        setProfileImage(compressedImage);
                        toast({
                            title: 'Image processed',
                            description: 'Image prepared for upload with balanced quality.',
                        });
                    } catch (compressionError) {
                        console.error('Error compressing image:', compressionError);
                        toast({
                            title: 'Image processing error',
                            description: 'Failed to process the image. Please try a different one.',
                            variant: 'destructive',
                        });
                    }
                }
                setIsUploading(false);
            };
            reader.onerror = () => {
                toast({
                    title: 'Error',
                    description: 'Failed to read image file',
                    variant: 'destructive',
                });
                setIsUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error('Error processing image:', error);
            toast({
                title: 'Error',
                description: 'An unexpected error occurred while processing the image',
                variant: 'destructive',
            });
            setIsUploading(false);
        }
    };

    const removeProfileImage = async () => {
        try {
            setIsUploading(true);

            // Set local state to null to update UI immediately
            setProfileImage(null);

            console.log('Removing profile image...');

            // Force clear browser cache for any avatar images
            const clearImageCache = () => {
                // Add a random query parameter to force browser to reload image
                const timestamp = new Date().getTime();
                const avatarElements = document.querySelectorAll('.avatar-image');
                avatarElements.forEach(el => {
                    if (el instanceof HTMLImageElement) {
                        // Set src to empty then force reload with timestamp
                        el.setAttribute('src', '');
                        // Force browser to forget this image
                        el.style.display = 'none';
                        setTimeout(() => {
                            el.style.display = '';
                        }, 50);
                    }
                });
                console.log('Cleared browser cache for avatar images');
            };

            // Clear cache first
            clearImageCache();

            // Call API to update profile with null profile image
            const response = await updateUserProfile({ profileImage: null });
            console.log('Profile image removal response:', response);

            // Update the profileData state to reflect the change
            if (profileData) {
                setProfileData({
                    ...profileData,
                    profileImage: null
                });
            }

            // Force navbar and UI updates with cache-busting timestamp
            window.dispatchEvent(new CustomEvent('forceProfileReload', {
                detail: { timestamp: Date.now() }
            }));

            // Force close the dialog after successful removal
            onClose();

            // Notify user of success
            toast({
                title: 'Profile image removed',
                description: 'Your profile image has been removed successfully.',
            });
        } catch (error) {
            console.error('Failed to remove profile image:', error);

            // If server update fails, restore the previous image
            if (profileData?.profileImage) {
                setProfileImage(profileData.profileImage);
            }

            toast({
                title: 'Error',
                description: 'Failed to remove profile image. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsUploading(false);
        }
    };

    const getTierBadgeClass = (tier: string) => {
        switch (tier) {
            case 'pro':
                return 'bg-amber-50 text-amber-700 border-amber-200';
            case 'lite':
                return 'bg-purple-50 text-purple-700 border-purple-200';
            default:
                return 'bg-blue-50 text-blue-700 border-blue-200';
        }
    };

    const getTierName = (tier: string) => {
        switch (tier) {
            case 'pro':
                return 'Pro';
            case 'lite':
                return 'Lite';
            default:
                return 'Free';
        }
    };

    // Format the createdAt date
    const formatJoinDate = (dateString: string) => {
        if (!dateString) return 'Unknown';
        try {
            const date = new Date(dateString);
            return format(date, 'MMMM d, yyyy');
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Unknown';
        }
    };

    // Get tier benefits based on user's tier
    const getTierBenefits = (tier: string) => {
        switch (tier) {
            case 'pro':
                return [
                    'Access to Meal tracking, Food search and Meal Generator',
                    'Advanced health reports with detailed analytics',
                    'Access to newer model and premium models',
                    'Access to Advanced Analysis',
                    'Access to Find Specialist feature'
                ];
            case 'lite':
                return [
                    'Access to Personalized diet plan with detailed nutrition breakdowns',
                    'Access to Health Connect AI Assistant',
                    'Priority email support',
                    'AI-powered recommendations for health improvements',
                    'Ad-free experience throughout the application'
                ];
            default: // free
                return [
                    'Access to Health Metrics',
                    'Acces to Basic Profile Summary',
                    'Access to General Recomendation in Nutrition ',
                    'Access to essential health tracking features'
                ];
        }
    };

    // Show the initial deletion warning
    const initiateDeleteAccount = () => {
        setShowDeleteWarning(true);
    };

    // Proceed to password confirmation
    const proceedToPasswordConfirm = () => {
        setShowDeleteWarning(false);
        setShowDeleteConfirm(true);
    };

    // Handle account deletion
    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            setDeleteError('Password is required to confirm deletion');
            return;
        }

        setIsDeleting(true);
        setDeleteError('');

        try {
            await deleteUserAccount(deletePassword);

            // Account successfully deleted, show toast and redirect to login
            toast({
                title: 'Account Deleted',
                description: 'Your account has been permanently deleted.',
            });

            // Close both dialogs
            setShowDeleteConfirm(false);
            onClose();

            // Redirect to home page after a short delay
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } catch (error: any) {
            console.error('Error deleting account:', error);
            // Check if it's a route not found error
            if (error.message?.includes('not found') || error.message?.includes('Failed to fetch')) {
                setDeleteError('Account deletion is currently unavailable. Please try again later.');
            } else {
                setDeleteError(error.message || 'Failed to delete account. Please check your password and try again.');
            }
        } finally {
            setIsDeleting(false);
        }
    };

    // ------- Tier Update & Subscription Cancellation -------
    const handleUpdateTier = async () => {
        if (selectedTier === profileData?.tier) {
            toast({ title: 'No Change', description: 'You are already on this tier.' });
            return;
        }
        setIsUpdatingTier(true);
        try {
            await updateUserTier(selectedTier);
            toast({ title: 'Subscription Updated', description: `You have switched to ${getTierName(selectedTier)} tier.` });
            setProfileData(prev => prev ? { ...prev, tier: selectedTier } : prev);
            localStorage.setItem('geminiTier', selectedTier);
            setPaymentStep('details');
        } catch (error: any) {
            console.error('Error updating tier:', error);
            toast({ title: 'Error', description: error.message || 'Failed to update tier', variant: 'destructive' });
        } finally {
            setIsUpdatingTier(false);
        }
    };

    const handleReasonToggle = (reason: string, checked: boolean | string) => {
        const isChecked = typeof checked === 'boolean' ? checked : Boolean(checked);
        if (isChecked) {
            setCancelReasons(prev => [...prev, reason]);
        } else {
            setCancelReasons(prev => prev.filter(r => r !== reason));
        }
    };

    const handleCancelSubscription = async () => {
        if (!cancelReasons.length) {
            setCancelError('Please select at least one reason.');
            return;
        }
        if (!cancelPassword) {
            setCancelError('Please enter your password.');
            return;
        }
        setIsCancelling(true);
        setCancelError('');
        try {
            await cancelSubscription(cancelPassword, cancelReasons);
            toast({ title: 'Subscription Cancelled', description: 'Your subscription has been cancelled.' });
            setProfileData(prev => prev ? { ...prev, tier: 'free' } : prev);
            localStorage.setItem('geminiTier', 'free');
            setShowPaymentDetails(false);
        } catch (error: any) {
            console.error('Error cancelling subscription:', error);
            setCancelError(error.message || 'Failed to cancel subscription.');
        } finally {
            setIsCancelling(false);
        }
    };



    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] rounded-xl md:rounded-lg overflow-hidden flex flex-col">
                <DialogHeader className="pb-2 shrink-0">
                    <DialogTitle>Account Settings</DialogTitle>
                    <DialogDescription>
                        Update your account settings here
                    </DialogDescription>
                </DialogHeader>

                {isLoading && !profileData ? (
                    <div className="py-6 text-center">Loading account settings...</div>
                ) : (
                    <div className="flex flex-col flex-1 overflow-hidden">
                        <div className="overflow-y-auto pr-1 flex-1 max-h-[460px]">
                            <form onSubmit={form.handleSubmit(onSubmit)}>
                                <div className="space-y-4">
                                    {/* Profile Image */}
                                    <div className="flex flex-col items-center gap-3 py-2">
                                        <div className="relative">
                                            <Avatar className="h-20 w-20 border-2 border-primary/20 rounded-full">
                                                {profileImage ? (
                                                    <AvatarImage src={profileImage} alt="Profile" className="rounded-full" />
                                                ) : (
                                                    <AvatarFallback className="bg-primary/10 text-primary text-xl rounded-full">
                                                        {profileData?.name?.charAt(0).toUpperCase() || <User />}
                                                    </AvatarFallback>
                                                )}
                                            </Avatar>

                                            <div className="absolute -bottom-2 -right-2 flex gap-1">
                                                <label
                                                    htmlFor="profile-image-upload"
                                                    className="bg-primary text-white p-1.5 rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                                                >
                                                    <Camera className="h-4 w-4" />
                                                    <input
                                                        id="profile-image-upload"
                                                        type="file"
                                                        accept="image/*"
                                                        className="hidden"
                                                        onChange={handleImageUpload}
                                                        disabled={isUploading}
                                                    />
                                                </label>

                                                {profileImage && (
                                                    <button
                                                        type="button"
                                                        onClick={removeProfileImage}
                                                        className="bg-destructive text-white p-1.5 rounded-full hover:bg-destructive/90 transition-colors"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {isUploading && <div className="text-sm text-muted-foreground">Uploading image...</div>}
                                    </div>

                                    {/* Account Information */}
                                    <div className="space-y-3">
                                        <div>
                                            <Label htmlFor="name">Display Name</Label>
                                            <Input
                                                id="name"
                                                {...form.register('name')}
                                                placeholder="Your name"
                                                className="mt-1"
                                            />
                                            {form.formState.errors.name && (
                                                <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label>Email</Label>
                                            <Input
                                                value={profileData?.email}
                                                readOnly
                                                disabled
                                                className="mt-1 bg-muted/50"
                                            />
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <Label>Current Plan</Label>
                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                                                <div className={`mt-1 inline-flex items-center gap-2 px-3 py-2 rounded-md border ${getTierBadgeClass(profileData?.tier || 'free')}`}>
                                                    {getTierName(profileData?.tier || 'free')} Tier
                                                </div>
                                                {isSynchronizing ? (
                                                    <Button type="button" variant="ghost" size="sm" disabled className="h-8 px-2 mt-1">
                                                        <Zap className="h-3.5 w-3.5 animate-pulse mr-1" />
                                                        Refreshing...
                                                    </Button>
                                                ) : (
                                                    <Button type="button" variant="ghost" size="sm" onClick={synchronizeTierWithBackend} className="h-8 px-2 mt-1">
                                                        <Zap className="h-3.5 w-3.5 mr-1" />
                                                        Refresh
                                                    </Button>
                                                )}
                                                <Button type="button" variant="ghost" size="sm" onClick={() => setShowPaymentDetails(true)} className="h-8 px-2 mt-1">
                                                    <CreditCard className="h-3.5 w-3.5 mr-1" />
                                                    Payment Details
                                                </Button>
                                            </div>

                                            <div className="flex flex-col gap-1">
                                                <Label>Member Since</Label>
                                                <div className="mt-1 text-muted-foreground text-sm">
                                                    {formatJoinDate(profileData?.createdAt || '')}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Visual end of content - natural stopping point for most users */}
                                    <div className="h-8"></div>

                                    {/* Danger Zone - positioned way below so it requires deliberate scrolling */}
                                    <div className="mt-28 pt-6 border-t border-destructive/20">
                                        <h3 className="text-destructive flex items-center font-semibold text-sm">
                                            <AlertTriangle className="h-4 w-4 mr-2" />
                                            Danger Zone
                                        </h3>
                                        <p className="text-sm text-muted-foreground mt-1 mb-4">
                                            Actions in this section cannot be undone
                                        </p>

                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="w-full sm:w-auto"
                                            onClick={() => setShowDeleteWarning(true)}
                                        >
                                            Delete Account
                                        </Button>
                                    </div>

                                    {/* Extra space after danger zone */}
                                    <div className="h-6"></div>
                                </div>

                                <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-4 sticky bottom-0 bg-background pt-2 pb-1">
                                    <DialogClose asChild>
                                        <Button type="button" variant="outline" className="w-full sm:w-auto">Cancel</Button>
                                    </DialogClose>
                                    <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                                        {isLoading ? 'Saving...' : 'Save changes'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </div>
                    </div>
                )}
            </DialogContent>

            {/* Payment Details Dialog */}
            <Dialog open={showPaymentDetails} onOpenChange={setShowPaymentDetails}>
                <DialogContent className="sm:max-w-[500px] rounded-xl md:rounded-lg">
                    {paymentStep === 'details' && (
                        <>
                            <DialogHeader>
                                <DialogTitle className="flex items-center">
                                    <CreditCard className="h-5 w-5 mr-2" />
                                    Payment Details
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-3 py-2 text-sm">
                                <p><span className="font-medium">Current Plan:</span> {getTierName(profileData?.tier || 'free')}</p>
                                <p><span className="font-medium">Amount Billed:</span> {subscriptionDetails ? `${subscriptionDetails.currency === 'INR' ? '₹' : subscriptionDetails.currency}${subscriptionDetails.amount.toFixed(2)}` : '—'}</p>
                                <p><span className="font-medium">Next Billing Date:</span> {subscriptionDetails ? `${format(new Date(subscriptionDetails.nextBillingDate), 'MMMM d, yyyy')}` : '—'}
                                    {subscriptionDetails ? <span className="ml-2 text-xs text-muted-foreground">({subscriptionDetails.daysLeft} days left)</span> : null}
                                </p>
                                <p className="text-muted-foreground text-xs">Detailed billing history will be available soon.</p>
                            </div>
                            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                                <Button variant="secondary" onClick={() => setPaymentStep('tier')} className="w-full sm:w-auto">
                                    Plans
                                </Button>

                                <Button variant="outline" onClick={() => setShowPaymentDetails(false)} className="w-full sm:w-auto">
                                    Close
                                </Button>
                            </DialogFooter>
                        </>
                    )}

                    {paymentStep === 'tier' && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Plans</DialogTitle>
                            </DialogHeader>

                            <RadioGroup value={selectedTier} onValueChange={value => setSelectedTier(value as 'free' | 'lite' | 'pro')} className="space-y-3">
                                {tierOptions.map(option => (
                                    <div
                                        key={option.value}
                                        className={`flex items-start gap-4 p-5 rounded-lg cursor-pointer w-full transition
                                            ${selectedTier === option.value ? 'border-2 border-primary bg-primary/5 shadow-lg' : 'border hover:border-primary/60'}`}
                                    >
                                        <RadioGroupItem value={option.value} id={`tier-${option.value}`} className="sr-only" />
                                        <label htmlFor={`tier-${option.value}`} className="flex items-center gap-4 w-full cursor-pointer">
                                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary flex-shrink-0">
                                                {option.value === 'pro' ? (
                                                    <Crown className="h-5 w-5" />
                                                ) : option.value === 'lite' ? (
                                                    <Zap className="h-5 w-5" />
                                                ) : (
                                                    <ShieldCheck className="h-5 w-5" />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{option.label}</span>
                                                <span className="text-xs text-muted-foreground">{option.price}</span>
                                            </div>
                                        </label>
                                    </div>
                                ))}
                            </RadioGroup>

                            {/* Selected plan benefits */}
                            <div className="mt-4">
                                <h4 className="font-medium text-sm mb-1">Benefits of the {getTierName(selectedTier)} plan:</h4>
                                <ul className="list-disc pl-6 text-xs text-muted-foreground space-y-1">
                                    {getTierBenefits(selectedTier).map(benefit => (
                                        <li key={benefit}>{benefit}</li>
                                    ))}
                                </ul>
                            </div>

                            <DialogFooter className="flex justify-between items-center mt-6">
                                {profileData?.tier !== 'free' && (
                                    <Button
                                        type="button"
                                        variant="link"
                                        size="sm"
                                        onClick={() => setPaymentStep('cancel')}
                                        className="text-xs p-0 m-0 text-muted-foreground underline order-first"
                                    >
                                        Cancel Subscription?
                                    </Button>
                                )}
                                <Button variant="outline" onClick={() => setPaymentStep('details')}>Back</Button>
                            </DialogFooter>
                        </>
                    )}

                    {paymentStep === 'cancel' && (
                        <>
                            <DialogHeader>
                                <DialogTitle>Cancel Subscription</DialogTitle>
                                <DialogDescription>Help us understand why you're leaving</DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    {reasonOptions.map(reason => (
                                        <div key={reason} className="flex items-center gap-2">
                                            <Checkbox
                                                id={`reason-${reason}`}
                                                checked={cancelReasons.includes(reason)}
                                                onCheckedChange={checked => handleReasonToggle(reason, checked)}
                                            />
                                            <label htmlFor={`reason-${reason}`}>{reason}</label>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-1">
                                    <Label htmlFor="cancel-password">Confirm Password</Label>
                                    <Input
                                        id="cancel-password"
                                        type="password"
                                        value={cancelPassword}
                                        onChange={e => setCancelPassword(e.target.value)}
                                        placeholder="Enter your password"
                                    />
                                </div>

                                {cancelError && <p className="text-sm text-destructive">{cancelError}</p>}
                            </div>

                            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                                <Button variant="outline" onClick={() => setPaymentStep('details')} className="w-full sm:w-auto">
                                    Back
                                </Button>
                                <Button variant="destructive" disabled={isCancelling} onClick={handleCancelSubscription} className="w-full sm:w-auto">
                                    {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                                </Button>
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            {/* Account Deletion Warning Dialog */}
            <Dialog open={showDeleteWarning} onOpenChange={setShowDeleteWarning}>
                <DialogContent className="sm:max-w-[500px] rounded-xl md:rounded-lg max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl">
                            <span className="text-destructive block text-2xl font-bold">
                                We're Sorry To See You Go! 😔
                            </span>
                        </DialogTitle>
                        <DialogDescription className="text-center pt-2">
                            Before you delete your account, remember the benefits of your {getTierName(profileData?.tier || 'free')} subscription:
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                            <h3 className="flex items-center text-lg font-medium mb-3">
                                <Crown className={`h-5 w-5 mr-2 ${profileData?.tier === 'pro' ? 'text-amber-500' :
                                    profileData?.tier === 'lite' ? 'text-purple-500' :
                                        'text-blue-500'
                                    }`} />
                                Your {getTierName(profileData?.tier || 'free')} Tier Benefits
                            </h3>
                            <ul className="space-y-2">
                                {getTierBenefits(profileData?.tier || 'free').map((benefit, index) => (
                                    <li key={index} className="flex items-start">
                                        <CheckCircle className="h-5 w-5 text-primary mr-2 mt-0.5 flex-shrink-0" />
                                        <span>{benefit}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="bg-amber-50 text-amber-800 p-4 rounded-lg border border-amber-200">
                            <h4 className="flex items-center font-medium mb-2">
                                <ShieldCheck className="h-5 w-5 mr-2" />
                                What you'll lose by deleting your account:
                            </h4>
                            <ul className="space-y-1 ml-7 list-disc text-sm">
                                <li>All your health and nutrition tracking history</li>
                                <li>Personalized recommendations based on your data</li>
                                <li>Access to premium features you've unlocked</li>
                                <li>Your subscription benefits (you won't get a refund)</li>
                            </ul>
                        </div>

                        <p className="text-sm text-gray-600 italic text-center">
                            Instead of deleting your account, you can take a break and come back anytime!
                        </p>
                    </div>

                    <DialogFooter className="flex-col space-y-3 sm:space-y-0 sm:flex-row sm:justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowDeleteWarning(false)}
                            className="w-full sm:w-auto"
                        >
                            Keep My Account
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={proceedToPasswordConfirm}
                            className="w-full sm:w-auto"
                        >
                            I Still Want To Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Password Confirmation Dialog */}
            <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
                <DialogContent className="sm:max-w-[400px] rounded-xl md:rounded-lg">
                    <DialogHeader>
                        <DialogTitle className="text-destructive flex items-center">
                            <AlertTriangle className="h-5 w-5 mr-2" />
                            Delete Account
                        </DialogTitle>
                        <DialogDescription>
                            This action is permanent and cannot be undone. All your data will be permanently deleted.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <p className="text-sm font-medium text-destructive">
                            Please enter your password to confirm account deletion:
                        </p>

                        <div>
                            <Label htmlFor="delete-password">Password</Label>
                            <Input
                                id="delete-password"
                                type="password"
                                value={deletePassword}
                                onChange={(e) => setDeletePassword(e.target.value)}
                                placeholder="Enter your password"
                                className="mt-1"
                            />
                            {deleteError && (
                                <p className="text-sm text-destructive mt-1">{deleteError}</p>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowDeleteConfirm(false)}
                            disabled={isDeleting}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDeleteAccount}
                            disabled={isDeleting}
                            className="w-full sm:w-auto"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete My Account'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </Dialog>
    );
};

export default AccountSettings; 
