import { getUserProfile, updateUserProfile, updateProfileImage } from "../api/auth";

const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size - 10MB maximum
    if (file.size > 10 * 1024 * 1024) {
        toast({
            title: "File too large",
            description: "Please select an image under 10MB",
            status: "error",
        });
        return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
        // Always compress the image before setting it
        compressImage(reader.result as string)
            .then(compressedImage => {
                setProfileImage(compressedImage);
                setHasImageChanged(true);
            })
            .catch(error => {
                console.error("Error compressing image:", error);
                toast({
                    title: "Image Processing Error",
                    description: "Failed to process the image. Please try a different one.",
                    status: "error",
                });
            });
    };
    reader.readAsDataURL(file);
};

// Add new image compression function
const compressImage = async (dataUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        try {
            const img = new Image();
            img.src = dataUrl;

            img.onload = () => {
                // Create canvas
                const canvas = document.createElement('canvas');

                // Limit max dimension to 300px for profile pics (reduced from 400px)
                const MAX_SIZE = 300;
                const scale = Math.min(MAX_SIZE / img.width, MAX_SIZE / img.height);
                canvas.width = img.width * scale;
                canvas.height = img.height * scale;

                // Draw and compress
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                // Use higher JPEG quality to avoid artifacts (0.7 = 70%)
                const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);

                const originalSize = Math.round(dataUrl.length / 1024);
                const compressedSize = Math.round(compressedDataUrl.length / 1024);

                console.log(`Image compressed from ${originalSize}KB to ${compressedSize}KB`);

                // If the compressed image is still very large, try with lower quality
                if (compressedSize > 100) {
                    const lowerQualityUrl = canvas.toDataURL('image/jpeg', 0.4);
                    const lowerSize = Math.round(lowerQualityUrl.length / 1024);
                    console.log(`Further compressed to ${lowerSize}KB`);
                    resolve(lowerQualityUrl);
                } else {
                    resolve(compressedDataUrl);
                }
            };

            img.onerror = () => {
                reject(new Error('Failed to load image'));
            };
        } catch (error) {
            reject(error);
        }
    });
};

const handleSave = async () => {
    setIsLoading(true);
    try {
        let successMessage = "";
        let nameUpdated = false;
        let imageUpdated = false;

        // First, handle the profile image separately if changed
        if (hasImageChanged && profileImage) {
            try {
                console.log("Uploading profile image separately...");
                await updateProfileImage(profileImage);
                console.log("Profile image uploaded successfully");

                // Reset the image change flag
                setHasImageChanged(false);
                imageUpdated = true;

                // Update UI immediately to reflect the change
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            } catch (imageError: any) {
                console.error("Failed to update profile image:", imageError);
                toast({
                    title: "Image Update Failed",
                    description: imageError.message || "Could not update your profile picture.",
                    status: "error",
                });
                // Continue with other updates even if image update failed
            }
        }

        // Then update other profile data if needed
        if (name !== userData?.name) {
            try {
                const updatedUser = await updateUserProfile({ name });

                // Update local state
                setUserData(updatedUser);
                nameUpdated = true;
            } catch (profileError: any) {
                console.error("Error updating profile data:", profileError);
                toast({
                    title: "Name Update Failed",
                    description: profileError.message || "Failed to update your name. Please try again.",
                    status: "error",
                });
                // If both updates failed, exit with error
                if (!imageUpdated) {
                    throw new Error("All updates failed");
                }
            }
        }

        // Build appropriate success message
        if (nameUpdated && imageUpdated) {
            successMessage = "Your profile name and picture have been updated.";
        } else if (nameUpdated) {
            successMessage = "Your profile name has been updated.";
        } else if (imageUpdated) {
            successMessage = "Your profile picture has been updated.";
        } else {
            successMessage = "No changes were detected to update.";
        }

        // Show success message if any update succeeded
        if (nameUpdated || imageUpdated) {
            toast({
                title: "Profile Updated",
                description: successMessage,
                status: "success",
            });
            // Close the dialog only if successful
            onClose();
        } else {
            toast({
                title: "No Changes",
                description: successMessage,
                status: "info",
            });
            onClose();
        }
    } catch (error: any) {
        console.error("Unexpected error in handleSave:", error);
        toast({
            title: "Update Failed",
            description: "An unexpected error occurred. Please try again.",
            status: "error",
        });
    } finally {
        setIsLoading(false);
    }
}; 