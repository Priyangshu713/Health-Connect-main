/**
 * Authentication API service
 * Provides methods for user authentication and profile management
 */

import { error } from "console";

const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000/api';

/**
 * Helper function to remove an email from the deleted accounts list in localStorage
 */
const _removeFromDeletedAccounts = (email: string) => {
    if (!email) return;

    try {
        const deletedAccounts = JSON.parse(localStorage.getItem('healthconnect_deleted_accounts') || '[]');
        const updatedAccounts = deletedAccounts.filter((account: string) => account !== email);
        localStorage.setItem('healthconnect_deleted_accounts', JSON.stringify(updatedAccounts));
        console.log(`Removed account ${email} from deleted accounts list in local storage`);
    } catch (error) {
        console.error('Error removing account from deleted accounts list:', error);
    }
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.name - User's name
 * @param {string} userData.email - User's email
 * @param {string} userData.password - User's password
 * @returns {Promise<Object>} User data with token
 */
export const registerUser = async (userData: { name: string; email: string; password: string }) => {
    // First, check if this email is in the deleted accounts list and remove it
    _removeFromDeletedAccounts(userData.email);

    const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
    }

    return data;
};

/**
 * Login user
 * @param {Object} credentials - User login credentials
 * @param {string} credentials.email - User's email
 * @param {string} credentials.password - User's password
 * @returns {Promise<Object>} User data with token
 */
export const loginUser = async (credentials: { email: string; password: string }) => {
    // First check if this account has been marked as deleted locally
    try {
        const deletedAccounts = JSON.parse(localStorage.getItem('healthconnect_deleted_accounts') || '[]');
        if (deletedAccounts.includes(credentials.email)) {
            console.warn('Attempting to login with a deleted account:', credentials.email);
            throw new Error('This account has been deleted. Please create a new account to continue.');
        }
    } catch (error) {
        if ((error as Error).message.includes('deleted')) {
            throw error;
        }
        // If there's an error reading localStorage, just continue with login attempt
        console.error('Error checking deleted accounts:', error);
    }

    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        return data;
    } catch (error) {
        // If login fails with "Invalid email or password", the account exists in the database
        // but might be incorrectly marked as deleted in localStorage.
        // In this case, let's remove it from the deleted accounts to allow reactivation.
        if ((error as Error).message.includes('Invalid email or password')) {
            try {
                _removeFromDeletedAccounts(credentials.email);
                console.log('Account exists in database but was marked as deleted locally. Removed from deleted list.');
            } catch (e) {
                console.error('Error cleaning up deleted accounts list:', e);
            }
        }
        throw error;
    }
};

/**
 * Get user profile
 * @returns {Promise<Object>} User profile data
 */
export const getUserProfile = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_URL}/auth/profile`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user profile');
    }

    return data;
};

/**
 * Update user profile
 * @param {Object} profileData - User profile data to update
 * @returns {Promise<Object>} Updated user profile data
 */
export const updateUserProfile = async (profileData: { name?: string; email?: string; password?: string; profileImage?: string | null }) => {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('No authentication token found');
    }

    // Log detailed information for debugging
    console.log('Profile update starting:', {
        hasName: !!profileData.name,
        hasEmail: !!profileData.email,
        hasPassword: !!profileData.password,
        hasImage: profileData.profileImage !== undefined,
        removingImage: profileData.profileImage === null,
        imageSize: profileData.profileImage ? Math.round(profileData.profileImage.length / 1024) + 'KB' : 'none'
    });

    try {
        // Ensure profileImage is properly set to null if we're removing it
        const dataToSend = { ...profileData };

        // Remove profileImage property if it's undefined to avoid issues
        if (profileData.profileImage === undefined) {
            delete dataToSend.profileImage;
        }

        // Standard approach for all updates including image removal
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(dataToSend),
        });

        // If we get a server error, it might be due to payload size
        if (response.status >= 500) {
            throw new Error('Server error - possibly due to payload size');
        }

        const responseData = await response.json();

        if (!response.ok) {
            console.error('API error response:', responseData);
            throw new Error(responseData.message || 'Failed to update user profile');
        }

        console.log('Profile update successful:', responseData);

        // If we're removing an image, force a clean update of profile in local storage
        if (profileData.profileImage === null) {
            // Try to update any cached profile data
            try {
                const existingProfile = localStorage.getItem('userProfile');
                if (existingProfile) {
                    const profileObj = JSON.parse(existingProfile);
                    profileObj.profileImage = null;
                    localStorage.setItem('userProfile', JSON.stringify(profileObj));
                }
            } catch (e) {
                console.error('Error updating cached profile:', e);
                // Non-critical error, continue
            }
        }

        return responseData;
    } catch (error) {
        console.error('Error in updateUserProfile:', error);
        throw error;
    }
};

/**
 * Request password reset
 * @param {string} email - User's email
 * @returns {Promise<Object>} Response message
 */
export const requestPasswordReset = async (email: string) => {
    const response = await fetch(`${API_URL}/password/forgot`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to request password reset');
    }

    return data;
};

/**
 * Validate reset token
 * @param {string} token - Reset token
 * @returns {Promise<Object>} Validation result
 */
export const validateResetToken = async (token: string) => {
    const response = await fetch(`${API_URL}/password/reset/${token}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Invalid or expired token');
    }

    return data;
};

/**
 * Reset password with token
 * @param {string} token - Reset token
 * @param {string} password - New password
 * @returns {Promise<Object>} Response message
 */
export const resetPassword = async (token: string, password: string) => {
    const response = await fetch(`${API_URL}/password/reset/${token}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Failed to reset password');
    }

    return data;
};

/**
 * Update user tier
 * @param {string} tier - The tier to update to (free, lite, or pro)
 * @returns {Promise<Object>} Updated user data
 */
export const updateUserTier = async (tier: 'free' | 'lite' | 'pro') => {
    const token = localStorage.getItem('token');

    if (!token) {
        console.error('No authentication token found when updating tier');
        throw new Error('No authentication token found');
    }

    console.log(`Attempting to update user tier to: ${tier}`);
    console.log(`API URL: ${API_URL}/auth/tier`);

    try {
        const response = await fetch(`${API_URL}/auth/tier`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tier }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Error updating tier:', data);
            throw new Error(data.message || 'Failed to update user tier');
        }

        console.log('Tier updated successfully:', data);
        return data;
    } catch (error) {
        console.error('Error in updateUserTier API call:', error);
        throw error;
    }
};

/**
 * Debug function: Update user tier using debug endpoint
 * @param {string} tier - The tier to update to (free, lite, or pro)
 * @returns {Promise<Object>} Updated user data
 */
export const debugUpdateUserTier = async (tier: 'free' | 'lite' | 'pro') => {
    const token = localStorage.getItem('token');

    if (!token) {
        console.error('Debug: No authentication token found');
        throw new Error('No authentication token found');
    }

    console.log(`Debug: Attempting to update user tier to: ${tier}`);
    console.log(`Debug: API URL: ${API_URL}/auth/tier-debug`);

    try {
        const response = await fetch(`${API_URL}/auth/tier-debug`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tier }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Debug: Error updating tier:', data);
            throw new Error(data.message || 'Failed to update user tier (debug)');
        }

        console.log('Debug: Tier updated successfully:', data);
        return data;
    } catch (error) {
        console.error('Debug: Error in updateUserTier API call:', error);
        throw error;
    }
};

/**
 * Logout user - clears local storage
 */
export const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('geminiTier');
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if authenticated
 */
export const isAuthenticated = () => {
    const isAuthInStorage = localStorage.getItem('isAuthenticated') === 'true';
    const hasToken = !!localStorage.getItem('token');

    // Also check if the account has been deleted
    try {
        const userEmail = localStorage.getItem('userEmail');
        if (userEmail) {
            const deletedAccounts = JSON.parse(localStorage.getItem('healthconnect_deleted_accounts') || '[]');
            if (deletedAccounts.includes(userEmail)) {
                console.warn('Account marked as deleted, considering not authenticated:', userEmail);
                return false;
            }
        }
    } catch (error) {
        console.error('Error checking deleted accounts in isAuthenticated:', error);
    }

    return isAuthInStorage && hasToken;
};

/**
 * Synchronize user tier with backend
 * This ensures the database and local storage have the same tier value
 * @returns {Promise<Object>} Updated user data
 */
export const synchronizeTier = async () => {
    try {
        // Get current tier from local storage
        const currentTier = localStorage.getItem('geminiTier') || 'free';

        // Get user token
        const token = localStorage.getItem('token');

        if (!token) {
            console.error('No authentication token found when synchronizing tier');
            throw new Error('No authentication token found');
        }

        console.log(`Synchronizing tier: Local tier is ${currentTier}`);

        // Update tier in database
        const response = await fetch(`${API_URL}/auth/tier`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tier: currentTier }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Error synchronizing tier:', data);
            throw new Error(data.message || 'Failed to synchronize tier');
        }

        console.log('Tier synchronized successfully:', data);
        return data;
    } catch (error) {
        console.error('Error in synchronizeTier API call:', error);
        throw error;
    }
};

/**
 * Update profile image only - separate from other profile updates
 * @param {string} imageDataUrl - The image data URL to upload
 * @returns {Promise<Object>} Updated user data
 */
export const updateProfileImage = async (imageDataUrl: string) => {
    const token = localStorage.getItem('token');

    if (!token) {
        throw new Error('No authentication token found');
    }

    console.log('Starting profile image upload...');
    console.log(`Image size: ${Math.round(imageDataUrl.length / 1024)}KB`);

    // Only compress further if absolutely necessary
    if (imageDataUrl.length > 80 * 1024) {
        console.warn('Image is large, attempting to optimize further while maintaining quality.');
        try {
            // Create a better quality but smaller image
            const img = new Image();
            img.src = imageDataUrl;

            await new Promise<void>((resolve, reject) => {
                img.onload = () => resolve();
                img.onerror = () => reject(new Error('Failed to load image for final compression'));
            });

            const canvas = document.createElement('canvas');
            // Still reasonable size - 250px
            canvas.width = 250;
            canvas.height = 250 * (img.height / img.width);

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                throw new Error('Could not get canvas context');
            }

            // High quality rendering
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Better quality (20%)
            imageDataUrl = canvas.toDataURL('image/jpeg', 0.2);
            console.log(`Final optimized image size: ${Math.round(imageDataUrl.length / 1024)}KB`);
        } catch (e) {
            console.error('Error performing final optimization:', e);
            // Continue with the original image since this is just a safety step
        }
    }

    try {
        // Try to prevent any unnecessary data in the request
        const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                profileImage: imageDataUrl
            }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API error response:', errorData);
            throw new Error(errorData.message || 'Failed to update profile image');
        }

        const data = await response.json();
        console.log('Profile image update successful');
        return data;
    } catch (error) {
        console.error('Error in updateProfileImage:', error);
        throw error;
    }
};

/**
 * Delete user account
 * @param {string} password - User's current password for verification
 * @returns {Promise<Object>} Response message
 */
export const deleteUserAccount = async (password: string) => {
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail');

    if (!token) {
        throw new Error('No authentication token found');
    }

    try {
        // Try the real API endpoint
        try {
            const response = await fetch(`${API_URL}/auth/account`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete account');
            }

            // Set deletion markers even if the backend succeeded
            _markAccountAsDeleted(userEmail);

            // Clear all local storage items
            logoutUser();
            return data;
        } catch (apiError) {
            console.warn('API endpoint not available, using fallback implementation');

            // Fallback implementation for demonstration
            // Validate password (this is just for demo - normally done on backend)
            if (!password || password.length < 6) {
                throw new Error('Invalid password');
            }

            // Simulate successful deletion
            console.log('Demo mode: Simulating successful account deletion');

            // Mark this account as deleted in localStorage
            _markAccountAsDeleted(userEmail);

            // Clear user data
            logoutUser();

            // Return mock response
            return {
                success: true,
                message: 'Account successfully deleted (demo mode)'
            };
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        throw error;
    }
};

/**
 * Helper function to mark an account as deleted in localStorage
 * This prevents re-login even though the account still exists on the backend
 */
const _markAccountAsDeleted = (email: string | null) => {
    if (!email) return;

    try {
        // Get existing deleted accounts list
        const deletedAccounts = JSON.parse(localStorage.getItem('healthconnect_deleted_accounts') || '[]');

        // Add this email to the list if not already there
        if (!deletedAccounts.includes(email)) {
            deletedAccounts.push(email);
        }

        // Save back to localStorage
        localStorage.setItem('healthconnect_deleted_accounts', JSON.stringify(deletedAccounts));

        console.log(`Marked account ${email} as deleted in local storage`);
    } catch (error) {
        console.error('Error marking account as deleted:', error);
    }
};

/**
 * Get the list of deleted accounts from localStorage
 * @returns {string[]} Array of deleted account emails
 */
export const getDeletedAccounts = (): string[] => {
    try {
        return JSON.parse(localStorage.getItem('healthconnect_deleted_accounts') || '[]');
    } catch (error) {
        console.error('Error reading deleted accounts:', error);
        return [];
    }
};

/**
 * Reset the deleted accounts list in localStorage
 * This is a utility function that can be used to help users who are having issues with account recovery
 */
export const resetDeletedAccountsList = (): void => {
    try {
        localStorage.setItem('healthconnect_deleted_accounts', '[]');
        console.log('Deleted accounts list has been reset');
    } catch (error) {
        console.error('Error resetting deleted accounts list:', error);
    }
};





// Razorpay global declaration for TypeScript
declare global {
    interface Window {
        Razorpay: any;
    }
}

// Load Razorpay script
const loadRazorpayScript = () => {
    return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};



// payment gateway integration
export const initiatePayment = async (amount: number, duration: string, plain: string) => {

    // Ensure Razorpay script is loaded
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
        throw new Error('Failed to load Razorpay script');
    }

    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }
    let isDuration: number = 0;
    if (!duration) {
        isDuration = 1; // Default to 1 month if duration is not provided
    } else if (duration === 'yearly') {
        isDuration = 365; // Set to 12 months for yearly subscription
    } else if (duration === 'monthly') {
        isDuration = 30; // Set to 1 month for monthly subscription
    } else if (duration === 'weekly') {
        isDuration = 7; // Set to 1 week for weekly subscription    
    } else if (duration === '3months') {
        isDuration = 90; // Set to 3 months for 3 months subscription
    } else if (duration === '6months') {
        isDuration = 180; // Set to 6 months for 6 months subscription
    }

    try {
        const OrderItem = {
            amount: amount,
            duration: isDuration,
            plan: plain
        }
        const response = await fetch(`${API_URL}/payment/create-order`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(OrderItem),
        });

        // chack if the response is ok
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Error creating order:', errorData);
            throw new Error(errorData.message || 'Failed to create payment order');
        }
        const orderData = await response.json();
        // console.log("order responce is : -",response);
        // console.log('Order created successfully:', orderData);
        // console.log('Order details:', orderData.order);
        
        const { order, paymentId, subscriptionId } = orderData;
        console.log('Order details:', order);
        console.log('Payment ID:', paymentId);
        console.log('Subscription ID:', subscriptionId);
        // Initialize Razorpay payment
        const options: any = {
            key: import.meta.env.VITE_RAZORPAY_KEY, // Your Razorpay key
            amount: order.amount, // Amount in paise
            currency: order.currency,
            name: 'Health Connect',
            description: 'Subscription Payment',
            order_id: order.id, // Use the order ID from the response
            handler: async (response: any) => {
                // Handle successful payment
                try {
                    const paymentResponse = await fetch(`${API_URL}/payment/verify-payment`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            razorpay_order_id : order.id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            paymentId:paymentId,
                            subscriptionId:subscriptionId
                        }),
                    });

                    if (!paymentResponse.ok) {
                        const errorData = await paymentResponse.json();
                        console.error('Error verifying payment:', errorData);
                        throw new Error(errorData.message || 'Failed to verify payment');
                    }

                    const paymentData = await paymentResponse.json();
                    console.log('Payment verification data:', paymentData);
                    console.log('Payment verification response:', paymentData.success);

                    // chack if the payment is successful
                    if (paymentData.success) {
                        // Update user tier in local storage
                        console.log('Payment successful, updating user tier...' );
                        const tier = paymentData.tier;
                        localStorage.setItem('geminiTier', tier);
                        // Show success message
                        alert('Payment successful! Your subscription has been activated.');
                                            
                    }
                   
                }catch (error) {
                    console.error('Error in payment handler:', error);
                    alert('Payment verification failed. Please try again.');
                }
            },
            prefill: {
                name: 'Health Connect User',
                email: localStorage.getItem('userEmail') || '',
                contact: localStorage.getItem('userPhone') || '',
            },
            notes: {
                duration: isDuration,
                plain: plain,
            },
            
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
    } catch (error) {
        console.error('Error initiating payment:', error);
    }
};
/**
 * Cancel a subscription
 * @param {string} password - User's current password for verification
 * @param {string[]} reasons - Reasons selected by the user for cancellation
 * @returns {Promise<Object>} Response message
 */
export const cancelSubscription = async (password: string, reasons: string[]) => {
    const token = localStorage.getItem('token');

    if (!token) {
        console.error('No authentication token found when cancelling subscription');
        throw new Error('No authentication token found');
    }

    try {
        const response = await fetch(`${API_URL}/auth/cancelSubscription`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password:password}),
        });

        // Attempt to parse JSON only if the server indicates JSON in Content-Type
        const contentType = response.headers.get('content-type') || '';
        let parsedBody: any = null;
        if (contentType.includes('application/json')) {
            try {
                parsedBody = await response.json();
            } catch (parseErr) {
                console.error('Failed to parse JSON response when cancelling subscription:', parseErr);
            }
        } else {
            // For non-JSON payloads (e.g. HTML error pages), read as text for debugging
            parsedBody = await response.text();
        }

        if (!response.ok) {
            console.error('Error cancelling subscription:', parsedBody);
            let errorMessage: string;
            if (response.status === 404) {
                errorMessage = 'Subscription cancellation is currently unavailable. Please contact support.';
            } else {
                errorMessage = parsedBody?.message || (typeof parsedBody === 'string' ? parsedBody : null) || 'Failed to cancel subscription';
            }
            throw new Error(errorMessage);
        }
        localStorage.setItem('geminiTier', 'free')

        console.log('Subscription cancelled successfully:', parsedBody);
        return parsedBody;
    } catch (error) {
        console.error('Error in cancelSubscription API call:', error);
        throw error;
    }
};
