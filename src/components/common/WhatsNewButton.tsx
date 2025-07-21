import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import ChangelogDialog from './ChangelogDialog';

const WhatsNewButton: React.FC = () => {
    const [showChangelog, setShowChangelog] = useState(false);

    return (
        <>
            <motion.div
                className="fixed bottom-4 right-4 z-40"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, duration: 0.3 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                <Button
                    variant="default"
                    size="icon"
                    className="rounded-full h-10 w-10 shadow-md"
                    onClick={() => setShowChangelog(true)}
                >
                    <Sparkles className="h-5 w-5" />
                    <span className="sr-only">What's New</span>
                </Button>
            </motion.div>

            <ChangelogDialog
                isOpen={showChangelog}
                onClose={() => setShowChangelog(false)}
            />
        </>
    );
};

export default WhatsNewButton; 