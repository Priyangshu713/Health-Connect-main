import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Clock, RefreshCw } from 'lucide-react';
import ChangelogDialog from '../common/ChangelogDialog';
import UpdateNotification from '../common/UpdateNotification';
import WhatsNewButton from '../common/WhatsNewButton';

const ChangelogDemo: React.FC = () => {
    const [showChangelog, setShowChangelog] = useState(false);
    const [demoNotification, setDemoNotification] = useState(false);
    const [showFloatingButton, setShowFloatingButton] = useState(false);

    // Force show update notification for demo purposes
    const handleShowNotification = () => {
        // First remove existing localStorage entry to enable notification
        localStorage.removeItem('healthconnect_last_seen_version');
        setDemoNotification(true);
    };

    const handleResetDemos = () => {
        setDemoNotification(false);
        setShowFloatingButton(false);
        setShowChangelog(false);
        localStorage.removeItem('healthconnect_last_seen_version');
    };

    return (
        <div className="container mx-auto py-8 px-4">
            <Card className="max-w-xl mx-auto">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        Changelog System Demo
                    </CardTitle>
                    <CardDescription>
                        Explore different ways to show users what's new in your application
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                    <div>
                        <h3 className="text-lg font-medium mb-2">Changelog Dialog</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            A detailed changelog dialog showing version history and new features
                        </p>
                        <Button
                            onClick={() => setShowChangelog(true)}
                            className="flex items-center gap-2"
                        >
                            <Clock className="h-4 w-4" />
                            Open Changelog
                        </Button>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-lg font-medium mb-2">Update Notification</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            A notification that appears when new updates are available
                        </p>
                        <Button
                            onClick={handleShowNotification}
                            variant="secondary"
                            className="flex items-center gap-2"
                        >
                            <Sparkles className="h-4 w-4" />
                            Trigger Update Notification
                        </Button>
                    </div>

                    <Separator />

                    <div>
                        <h3 className="text-lg font-medium mb-2">Floating What's New Button</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            A persistent button to access changelog at any time
                        </p>
                        <Button
                            onClick={() => setShowFloatingButton(!showFloatingButton)}
                            variant={showFloatingButton ? "destructive" : "outline"}
                            className="flex items-center gap-2"
                        >
                            {showFloatingButton ? "Hide" : "Show"} What's New Button
                        </Button>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button
                        onClick={handleResetDemos}
                        variant="ghost"
                        className="flex items-center gap-2"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Reset All Demos
                    </Button>
                </CardFooter>
            </Card>

            {/* Dialogs and components */}
            <ChangelogDialog
                isOpen={showChangelog}
                onClose={() => setShowChangelog(false)}
            />

            {demoNotification && <UpdateNotification forceShow={true} />}
            {showFloatingButton && <WhatsNewButton />}
        </div>
    );
};

export default ChangelogDemo; 