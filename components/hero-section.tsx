'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useYou } from '@/hooks/use-you';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, CheckCircle, Clock, Facebook, Github, Linkedin, Mail } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const platforms = [
    { name: 'Facebook', icon: Facebook, color: 'bg-blue-500', status: 'ready', isPreselected: true },
    { name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-600', status: 'ready', isPreselected: false },
    { name: 'GitHub', icon: Github, color: 'bg-gray-800', status: 'preparing', isPreselected: false },
    { name: 'Google', icon: Mail, color: 'bg-red-500', status: 'preparing', isPreselected: false },
];

export function HeroSection() {
    const router = useRouter();
    const pathname = usePathname();
    const isModalOpen = pathname === '/get-started' || pathname === '/get-started/';

    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [shouldAnimate, setShouldAnimate] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [pendingDeselection, setPendingDeselection] = useState<string | null>(null);
    const [userPreferences, setUserPreferences] = useState<Record<string, 'deselect' | 'import'>>({});

    const you = useYou();

    // Check if animations should play based on session storage
    useEffect(() => {
        const hasSeenAnimations = sessionStorage.getItem('hero-animations-shown');
        if (!hasSeenAnimations) {
            setShouldAnimate(true);
            sessionStorage.setItem('hero-animations-shown', 'true');
        }
    }, []);

    // Load user preferences and initialize selected platforms
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedPreferences = localStorage.getItem('platform-preferences');
            if (savedPreferences) {
                try {
                    const preferences = JSON.parse(savedPreferences);
                    setUserPreferences(preferences);
                } catch (error) {
                    console.error('Failed to parse saved preferences:', error);
                }
            }

            // Initialize selected platforms based on preselected and user preferences
            const initialSelection = platforms
                .filter((platform) => {
                    const savedPref = savedPreferences ? JSON.parse(savedPreferences)[platform.name] : null;
                    if (savedPref === 'deselect') return false;
                    if (savedPref === 'import') return true;
                    return platform.isPreselected;
                })
                .map((p) => p.name);

            setSelectedPlatforms(initialSelection);
        }
    }, []);

    // Save user preferences to localStorage
    const saveUserPreferences = (preferences: Record<string, 'deselect' | 'import'>) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem('platform-preferences', JSON.stringify(preferences));
            setUserPreferences(preferences);
        }
    };

    // Create dynamic hero text
    const heroText = `Reclaim Your Time with AI That Thinks Like You ${you || ''}`;

    console.log('HeroSection rendered', {
        isModalOpen,
        pathname,
        selectedPlatforms,
        isProcessing,
        progress,
        you,
        heroText,
    });

    const togglePlatform = (platform: string) => {
        console.log('Toggling platform:', platform);
        const isCurrentlySelected = selectedPlatforms.includes(platform);

        if (isCurrentlySelected) {
            // Check if user has a saved preference for this platform
            const savedPreference = userPreferences[platform];
            if (savedPreference) {
                // User has a saved preference, apply it directly
                if (savedPreference === 'deselect') {
                    setSelectedPlatforms((prev) => prev.filter((p) => p !== platform));
                } else {
                    // savedPreference === 'import', start import process
                    setSelectedPlatforms([platform]);
                    startProcessing();
                }
            } else {
                // No saved preference, show confirmation dialog
                setPendingDeselection(platform);
                setShowConfirmDialog(true);
            }
        } else {
            // Adding platform - no confirmation needed
            setSelectedPlatforms((prev) => [...prev, platform]);
        }
    };

    const handleConfirmDeselection = (action: 'deselect' | 'import', rememberChoice: boolean) => {
        if (!pendingDeselection) return;

        if (action === 'deselect') {
            setSelectedPlatforms((prev) => prev.filter((p) => p !== pendingDeselection));
        } else {
            // Start import with just this platform
            setSelectedPlatforms([pendingDeselection]);
            setTimeout(() => startProcessing(), 100); // Small delay to ensure state is updated
        }

        if (rememberChoice) {
            const newPreferences = { ...userPreferences, [pendingDeselection]: action };
            saveUserPreferences(newPreferences);
        }

        setShowConfirmDialog(false);
        setPendingDeselection(null);
    };

    const startProcessing = () => {
        console.log('Starting processing with platforms:', selectedPlatforms);

        if (selectedPlatforms.length === 0) {
            return;
        }

        // Convert platform names to lowercase for URL parameters
        const serviceParams = selectedPlatforms.map((platform) => platform.toLowerCase()).join(',');
        const redirectUrl = `https://promptbook.studio/from-social?services=${serviceParams}`;

        console.log('Redirecting to:', redirectUrl);
        window.location.href = redirectUrl;

        // Reset modal state by navigating back to home
        router.push('/');
        setIsProcessing(false);
        setProgress(0);
        setSelectedPlatforms([]);
    };

    return (
        <>
            <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden pt-16">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-purple rounded-full blur-3xl opacity-10"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-green rounded-full blur-3xl opacity-10"></div>
                </div>

                <div className="container mx-auto px-4 py-20 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Column - Content */}
                        <motion.div
                            initial={shouldAnimate ? { opacity: 0, x: -50 } : false}
                            animate={shouldAnimate ? { opacity: 1, x: 0 } : false}
                            transition={{ duration: 0.8 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                                    <Brain className="w-4 h-4" />
                                    Your Personal AI Avatar
                                </div>
                                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                    Reclaim Your{' '}
                                    <span className="bg-gradient-purple bg-clip-text text-transparent">Time</span> with
                                    AI That Thinks Like{' '}
                                    <span className="bg-gradient-purple bg-clip-text text-transparent">You {you}</span>
                                </h1>
                                <p className="text-xl text-gray-600 leading-relaxed">
                                    Stop spending 80% of your time on unimportant tasks. Let your AI avatar handle
                                    emails, meetings, and routine work while you focus on what <b>truly matters</b>.
                                </p>
                            </div>

                            <Button
                                onClick={() => {
                                    console.log('Create avatar button clicked');
                                    router.push('/get-started');
                                }}
                                size="lg"
                                className="bg-gradient-purple hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 rounded-full"
                            >
                                {you ? <>Create Avatar of {you}</> : <>Create Your Avatar</>}

                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>

                            <div className="flex items-center gap-8 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    Open Source
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    Your Data, Your Control
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-green-500" />
                                    Easy Setup
                                </div>
                            </div>

                            {/* Powered by Promptbook */}
                            <div className="flex items-center gap-3 p-4 bg-white/50 backdrop-blur-sm rounded-lg border border-gray-200">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src="/promptbook-logo-blue-256.png" alt="Promptbook" className="w-6 h-6" />
                                <div className="text-sm">
                                    <span className="text-gray-600">Powered by </span>
                                    <a
                                        href="https://www.ptbk.io"
                                        className="font-semibold text-promptbook-blue hover:underline"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        Promptbook
                                    </a>
                                    <span className="text-gray-500 ml-2">• Truly Your AI{you && <>, {you}</>}</span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Right Column - 80/20 Visualization */}
                        <motion.div
                            initial={shouldAnimate ? { opacity: 0, x: 50 } : false}
                            animate={shouldAnimate ? { opacity: 1, x: 0 } : false}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative"
                        >
                            <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
                                <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
                                    Time Allocation Shift
                                </h3>

                                <div className="space-y-8">
                                    {/* Before */}
                                    <div>
                                        <h4 className="text-lg font-semibold mb-4 text-gray-700">Before</h4>
                                        <div className="flex h-12 rounded-lg overflow-hidden">
                                            <motion.div
                                                initial={shouldAnimate ? { width: 0 } : false}
                                                animate={shouldAnimate ? { width: '80%' } : { width: '80%' }}
                                                transition={{ duration: 1, delay: shouldAnimate ? 0.5 : 0 }}
                                                className="bg-red-400 flex items-center justify-center text-white text-sm font-medium"
                                            >
                                                80% Unimportant
                                            </motion.div>
                                            <motion.div
                                                initial={shouldAnimate ? { width: 0 } : false}
                                                animate={shouldAnimate ? { width: '20%' } : { width: '20%' }}
                                                transition={{ duration: 1, delay: shouldAnimate ? 0.7 : 0 }}
                                                className="bg-green-400 flex items-center justify-center text-white text-sm font-medium"
                                            >
                                                20%
                                            </motion.div>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2">Emails • Meetings • Routine Tasks</p>
                                    </div>

                                    {/* After */}
                                    <div>
                                        <h4 className="text-lg font-semibold mb-4 text-gray-700">After</h4>
                                        <div className="flex h-12 rounded-lg overflow-hidden">
                                            <motion.div
                                                initial={shouldAnimate ? { width: 0 } : false}
                                                animate={shouldAnimate ? { width: '20%' } : { width: '20%' }}
                                                transition={{ duration: 1, delay: shouldAnimate ? 1 : 0 }}
                                                className="bg-red-200 flex items-center justify-center text-gray-700 text-sm font-medium"
                                            >
                                                20%
                                            </motion.div>
                                            <motion.div
                                                initial={shouldAnimate ? { width: 0 } : false}
                                                animate={shouldAnimate ? { width: '80%' } : { width: '80%' }}
                                                transition={{ duration: 1, delay: shouldAnimate ? 1.2 : 0 }}
                                                className="bg-gradient-green flex items-center justify-center text-white text-sm font-medium"
                                            >
                                                80% Important
                                            </motion.div>
                                        </div>
                                        <div className="flex mt-2">
                                            <div className="w-[20%]"></div>
                                            <div className="w-[80%]">
                                                <p className="text-sm text-gray-500">
                                                    Family • Creativity • Strategic Work
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Modal */}
            <Dialog
                open={isModalOpen}
                onOpenChange={(open) => {
                    if (!open) {
                        router.push('/');
                    }
                }}
            >
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-center">Create Your AI Avatar</DialogTitle>
                    </DialogHeader>

                    {!isProcessing ? (
                        <div className="space-y-6">
                            <p className="text-center text-gray-600">
                                Select platforms to import your data and create your personalized AI avatar
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                {platforms.map((platform) => {
                                    const Icon = platform.icon;
                                    const isSelected = selectedPlatforms.includes(platform.name);
                                    const isReady = platform.status === 'ready';
                                    const isPreparing = platform.status === 'preparing';

                                    return (
                                        <motion.button
                                            key={platform.name}
                                            whileHover={isReady ? { scale: 1.02 } : {}}
                                            whileTap={isReady ? { scale: 0.98 } : {}}
                                            onClick={() => isReady && togglePlatform(platform.name)}
                                            disabled={!isReady}
                                            className={`p-6 rounded-lg border-2 transition-all duration-300 relative ${
                                                !isReady
                                                    ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                                                    : isSelected
                                                    ? 'border-primary bg-primary/5'
                                                    : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                        >
                                            {/* Checkbox in top right corner */}
                                            <div className="absolute top-3 right-3">
                                                <Checkbox
                                                    checked={isSelected}
                                                    disabled={!isReady}
                                                    className="pointer-events-none"
                                                />
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-12 h-12 rounded-lg ${
                                                        platform.color
                                                    } flex items-center justify-center ${!isReady ? 'opacity-60' : ''}`}
                                                >
                                                    <Icon className="w-6 h-6 text-white" />
                                                </div>
                                                <div className="flex flex-col items-start">
                                                    <span
                                                        className={`font-medium ${
                                                            isReady ? 'text-gray-900' : 'text-gray-500'
                                                        }`}
                                                    >
                                                        {platform.name}
                                                    </span>
                                                    {isPreparing && (
                                                        <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
                                                            <Clock className="w-3 h-3" />
                                                            Preparing...
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.button>
                                    );
                                })}
                            </div>

                            <Button
                                onClick={startProcessing}
                                disabled={selectedPlatforms.length === 0}
                                className="w-full bg-gradient-purple hover:shadow-lg"
                                size="lg"
                            >
                                Import Data & Create Avatar
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-6 py-8">
                            <div className="text-center">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                    className="w-16 h-16 mx-auto mb-4"
                                >
                                    <Brain className="w-16 h-16 text-primary" />
                                </motion.div>
                                <h3 className="text-xl font-semibold mb-2">Creating Your Avatar...</h3>
                                <p className="text-gray-600">Analyzing your data and learning your style</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Progress</span>
                                    <span>{progress}%</span>
                                </div>
                                <Progress value={progress} className="h-2" />
                            </div>

                            <div className="text-center text-sm text-gray-500">This may take a few moments...</div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Confirmation Dialog */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">
                            What would you like to do with {pendingDeselection}?
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4">
                        <p className="text-gray-600">
                            You clicked on {pendingDeselection}. Would you like to:
                        </p>

                        <div className="space-y-3">
                            <Button
                                onClick={() => handleConfirmDeselection('import', false)}
                                className="w-full bg-gradient-purple hover:shadow-lg"
                                size="lg"
                            >
                                Start importing from {pendingDeselection}
                            </Button>

                            <Button
                                onClick={() => handleConfirmDeselection('deselect', false)}
                                variant="outline"
                                className="w-full"
                                size="lg"
                            >
                                Just deselect {pendingDeselection}
                            </Button>
                        </div>

                        <div className="pt-4 border-t">
                            <div className="flex items-center gap-2 mb-3">
                                <Checkbox
                                    id="remember-choice"
                                    onCheckedChange={(checked) => {
                                        // Handle remember choice state if needed
                                    }}
                                />
                                <label
                                    htmlFor="remember-choice"
                                    className="text-sm text-gray-600 cursor-pointer"
                                >
                                    Remember my choice for {pendingDeselection}
                                </label>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    onClick={() => handleConfirmDeselection('import', true)}
                                    className="flex-1 bg-gradient-purple hover:shadow-lg"
                                    size="sm"
                                >
                                    Import & Remember
                                </Button>

                                <Button
                                    onClick={() => handleConfirmDeselection('deselect', true)}
                                    variant="outline"
                                    className="flex-1"
                                    size="sm"
                                >
                                    Deselect & Remember
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
