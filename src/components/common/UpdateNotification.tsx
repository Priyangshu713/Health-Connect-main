import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import ChangelogDialog from './ChangelogDialog';

// Current app version - this would be dynamically determined in a real app
const CURRENT_VERSION = '2.5.0';

interface UpdateNotificationProps {
    forceShow?: boolean;
}

const UpdateNotification: React.FC<UpdateNotificationProps> = ({ forceShow = false }) => {
    const [showNotification, setShowNotification] = useState(forceShow);
    const [showDialog, setShowDialog] = useState(false);

    useEffect(() => {
        // If forceShow is true, always show the notification
        if (forceShow) {
            setShowNotification(true);
            return;
        }

        // Otherwise, check if user has seen the latest version
        const checkVersion = () => {
            const lastSeenVersion = localStorage.getItem('healthconnect_last_seen_version');

            // If no version is stored, or the stored version is different from current
            // Show the notification
            if (!lastSeenVersion || lastSeenVersion !== CURRENT_VERSION) {
                // Wait a bit before showing the notification to not disrupt initial user experience
                setTimeout(() => {
                    setShowNotification(true);
                }, 5000);
            }
        };

        checkVersion();
    }, [forceShow]);

    // Handle opening the changelog dialog
    const handleOpenChangelog = () => {
        setShowDialog(true);
        setShowNotification(false);

        // Mark this version as seen (but not when in demo mode)
        if (!forceShow) {
            localStorage.setItem('healthconnect_last_seen_version', CURRENT_VERSION);
        }
    };

    // Dismiss notification without opening changelog
    const handleDismiss = () => {
        setShowNotification(false);

        // Mark this version as seen (but not when in demo mode)
        if (!forceShow) {
            localStorage.setItem('healthconnect_last_seen_version', CURRENT_VERSION);
        }
    };

    return (
        <>
            <AnimatePresence>
                {showNotification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 25
                        }}
                        className="fixed bottom-4 right-4 z-50"
                    >
                        <div className="bg-white dark:bg-gray-900 shadow-lg rounded-lg p-4 border border-primary/20 max-w-sm">
                            <div className="flex items-start gap-3">
                                <div className="bg-primary/10 rounded-full p-2">
                                    <Sparkles className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-medium text-sm">New updates available!</h3>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Check out the latest features and improvements we've added to HealthConnect.
                                    </p>

                                    <div className="flex justify-end gap-2 mt-3">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={handleDismiss}
                                        >
                                            Dismiss
                                        </Button>
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={handleOpenChangelog}
                                        >
                                            See What's New
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Changelog dialog */}
            <ChangelogDialog
                isOpen={showDialog}
                onClose={() => setShowDialog(false)}
            />
        </>
    );
};

export default UpdateNotification; 