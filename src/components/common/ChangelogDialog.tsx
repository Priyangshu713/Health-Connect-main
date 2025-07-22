import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Clock, Sparkles, ZapIcon, CheckCircle, Info, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion, AnimatePresence } from 'framer-motion';

// Define the structure of a changelog entry
interface ChangelogItem {
    date: string;
    version: string;
    items: {
        text: string;
        type?: 'feature' | 'improvement' | 'bugfix' | 'announcement';
        link?: {
            text: string;
            url: string;
        };
    }[];
}

// Sample changelog data - this would come from your backend in a real app
const changelogData: ChangelogItem[] = [
    {
        date: 'July 21, 2025',
        version: '5.0.0',
        items: [
            {
                text: 'Added "ScanBar" Feature for to get nutritional value of a food item by scanning it\'s barcode. Available to all Pro users on nutrition page.',
                type: 'feature'
            },
            {
                text: 'Updated previous AI models to new AI models. ',
                type: 'improvement'
            },
            {
                text: 'Slight changes to the UI for a more modern look.',
                type: 'improvement'
            },
            {
                text: 'Fixed minor UI bugs and improved overall user experience.',
                type: 'bugfix'
            }
        ]
    },
    {
        date: 'July 2, 2025',
        version: '4.5.0',
        items: [
            {
                text: 'Added real payment portal for subscription management.',
                type: 'feature'
            },
            {
                text: 'Improved AI model latency and performance.',
                type: 'improvement'
            },
            {
                text: 'Changed backend architecture for improved scalability and performance.',
                type: 'improvement'
            },
            
        ]
    },
    {
        date: 'June 11, 2025',
        version: '4.0.0',
        items: [
            {
                text: 'Fixed well known bugs for a smoother user experience.',
                type: 'bugfix'
            },
            {
                text: 'Models now use less resource for predictions, for faster user experience.',
                type: 'improvement'
            },
        ]
    },
    {
        date: 'May 5, 2025',
        version: '3.5.5',
        items: [
            {
                text: 'Added AI health insights dashboard with personalized recommendations',
                type: 'feature'
            },
            {
                text: 'Improved search functionality with smart filters and spring animations',
                type: 'improvement'
            },
            {
                text: 'Fixed synchronization issues with wearable device data',
                type: 'bugfix'
            }
        ]
    },
    {
        date: 'April 28, 2025',
        version: '3.5.0',
        items: [
            {
                text: 'Added What\'s New changelog feature to keep users updated on platform changes',
                type: 'feature'
            },
            {
                text: 'Enhanced accessibility features throughout the platform',
                type: 'improvement'
            },
            {
                text: 'Fixed loading issues in the appointment scheduler',
                type: 'bugfix'
            }
        ]
    },
    {
        date: 'April 10, 2025',
        version: '3.0.0',
        items: [
            {
                text: 'Introduced telemedicine integration for virtual doctor consultations',
                type: 'feature'
            },
            {
                text: 'Redesigned dashboard for better health metric visualization',
                type: 'improvement'
            },
            {
                text: 'Optimized app performance on mobile devices',
                type: 'improvement'
            }
        ]
    },
    {
        date: 'March 28, 2025',
        version: '2.5.0',
        items: [
            {
                text: 'Added meal generator on nutrition page with customizable options',
                type: 'feature'
            },
            {
                text: 'Integrated new AI models (2.5pro) to Pro and Lite tier subscriptions',
                type: 'feature'
            },
            {
                text: 'Fixed various UI inconsistencies and performance issues',
                type: 'bugfix'
            }
        ]
    },
    {
        date: 'March 25, 2025',
        version: '2.0.0',
        items: [
            {
                text: 'Introduced subscription tiers: Free, Lite, and Pro with differentiated features',
                type: 'feature'
            },
            {
                text: 'Fixed critical bug on profile page not registering gender selection',
                type: 'bugfix'
            },
            {
                text: 'Comprehensive UI improvements across all platform sections',
                type: 'improvement'
            }
        ]
    },
    {
        date: 'March 1, 2025',
        version: '1.0.0',
        items: [
            {
                text: 'Official launch of Health Connect platform',
                type: 'announcement'
            },
            {
                text: 'Integrated health tracking with comprehensive metrics dashboard',
                type: 'feature'
            },
            {
                text: 'Released initial AI models for personalized health insights',
                type: 'feature'
            }
        ]
    }
];

interface ChangelogDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangelogDialog: React.FC<ChangelogDialogProps> = ({ isOpen, onClose }) => {
    // State to track which sections are expanded (by default, all are expanded)
    const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>(() => {
        // Initialize with first section expanded, others collapsed
        const initialState: Record<number, boolean> = {};
        changelogData.forEach((_, index) => {
            initialState[index] = index === 0; // Only first section is expanded by default
        });
        return initialState;
    });

    // Toggle section expanded state
    const toggleSection = (index: number) => {
        setExpandedSections(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    // Function to get the appropriate icon for each type of update
    const getItemIcon = (type?: string) => {
        switch (type) {
            case 'feature':
                return <Sparkles className="h-4 w-4 text-primary" />;
            case 'improvement':
                return <ZapIcon className="h-4 w-4 text-indigo-500" />;
            case 'bugfix':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'announcement':
                return <Info className="h-4 w-4 text-amber-500" />;
            default:
                return <Sparkles className="h-4 w-4 text-primary" />;
        }
    };

    // Function to get the badge text for update type
    const getBadgeText = (type?: string) => {
        switch (type) {
            case 'feature':
                return <Badge variant="default" className="bg-primary hover:bg-primary">New Feature</Badge>;
            case 'improvement':
                return <Badge variant="outline" className="text-indigo-500 border-indigo-500">Improvement</Badge>;
            case 'bugfix':
                return <Badge variant="outline" className="text-green-500 border-green-500">Bug Fix</Badge>;
            case 'announcement':
                return <Badge variant="outline" className="text-amber-500 border-amber-500">Announcement</Badge>;
            default:
                return <Badge variant="secondary">Update</Badge>;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <DialogTitle className="text-xl">What's New in HealthConnect</DialogTitle>
                    </div>
                    <DialogDescription>
                        See the latest updates, improvements, and features we've added to make your health journey better.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {changelogData.map((release, idx) => (
                        <div key={idx} className="overflow-hidden">
                            <div
                                className="flex items-center gap-2 cursor-pointer"
                                onClick={() => toggleSection(idx)}
                            >
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <h3 className="text-lg font-medium">{release.date}</h3>
                                <Badge variant="secondary" className="ml-2">v{release.version}</Badge>
                                <div className="ml-auto">
                                    <motion.div
                                        animate={{ rotate: expandedSections[idx] ? 180 : 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    </motion.div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {expandedSections[idx] && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="space-y-3 ml-6 mt-4 mb-2">
                                            {release.items.map((item, itemIdx) => (
                                                <div key={itemIdx} className="flex items-start gap-3">
                                                    {getItemIcon(item.type)}
                                                    <div className="space-y-1">
                                                        <span className="text-sm">{item.text}</span>
                                                        <div className="flex mt-1">
                                                            {getBadgeText(item.type)}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {idx < changelogData.length - 1 && (
                                <Separator className="my-4" />
                            )}
                        </div>
                    ))}
                </div>

                <DialogFooter className="pt-2">
                    <Button onClick={onClose} className="w-full sm:w-auto">Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ChangelogDialog; 
