'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, CheckCircle, Clock, Facebook, Github, Linkedin, Mail } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

const platforms = [
    { name: 'Facebook', icon: Facebook, color: 'bg-blue-500', status: 'ready', isPreselected: true },
    { name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-600', status: 'preparing', isPreselected: false },
    { name: 'GitHub', icon: Github, color: 'bg-gray-800', status: 'preparing', isPreselected: false },
    { name: 'Google', icon: Mail, color: 'bg-red-500', status: 'preparing', isPreselected: false },
];

export function HeroSection() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
        platforms.filter((p) => p.isPreselected).map((p) => p.name),
    );
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const searchParams = useSearchParams();

    // Get the 'you' parameter from URL
    const youParam = searchParams.get('you');

    // Create dynamic hero text
    const heroText = youParam
        ? `Reclaim Your Time with AI That Thinks Like You ${youParam.charAt(0).toUpperCase() + youParam.slice(1)}`
        : 'Reclaim Your Time with AI That Thinks Like You';

    console.log('HeroSection rendered', { isModalOpen, selectedPlatforms, isProcessing, progress, youParam, heroText });

    const togglePlatform = (platform: string) => {
        console.log('Toggling platform:', platform);
        setSelectedPlatforms((prev) =>
            prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform],
        );
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
        window.open(redirectUrl, '_blank');

        // Reset modal state
        setIsModalOpen(false);
        setIsProcessing(false);
        setProgress(0);
        setSelectedPlatforms([]);
    };

    return (
        <>
            <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 overflow-hidden">
                {/* Background Elements */}
                <div className="absolute inset-0">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-purple rounded-full blur-3xl opacity-10"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-green rounded-full blur-3xl opacity-10"></div>
                </div>

                <div className="container mx-auto px-4 py-20 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Column - Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="space-y-8"
                        >
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                                    <Brain className="w-4 h-4" />
                                    Your Personal AI Avatar
                                </div>
                                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                                    {youParam ? (
                                        <>
                                            Reclaim Your{' '}
                                            <span className="bg-gradient-purple bg-clip-text text-transparent">
                                                Time
                                            </span>{' '}
                                            with AI That Thinks Like{' '}
                                            <span className="bg-gradient-purple bg-clip-text text-transparent">
                                                You {youParam.charAt(0).toUpperCase() + youParam.slice(1)}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            Reclaim Your{' '}
                                            <span className="bg-gradient-purple bg-clip-text text-transparent">
                                                Time
                                            </span>{' '}
                                            with AI That Thinks Like{' '}
                                            <span className="bg-gradient-purple bg-clip-text text-transparent">
                                                You
                                            </span>
                                        </>
                                    )}
                                </h1>
                                <p className="text-xl text-gray-600 leading-relaxed">
                                    Stop spending 80% of your time on unimportant tasks. Let your AI avatar handle
                                    emails, meetings, and routine work while you focus on what <b>truly matters</b>.
                                </p>
                            </div>

                            <Button
                                onClick={() => {
                                    console.log('Create avatar button clicked');
                                    setIsModalOpen(true);
                                }}
                                size="lg"
                                className="bg-gradient-purple hover:shadow-lg transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6 rounded-full"
                            >
                                Create Your Avatar
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
                        </motion.div>

                        {/* Right Column - 80/20 Visualization */}
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
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
                                                initial={{ width: 0 }}
                                                animate={{ width: '80%' }}
                                                transition={{ duration: 1, delay: 0.5 }}
                                                className="bg-red-400 flex items-center justify-center text-white text-sm font-medium"
                                            >
                                                80% Unimportant
                                            </motion.div>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: '20%' }}
                                                transition={{ duration: 1, delay: 0.7 }}
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
                                                initial={{ width: 0 }}
                                                animate={{ width: '20%' }}
                                                transition={{ duration: 1, delay: 1 }}
                                                className="bg-red-200 flex items-center justify-center text-gray-700 text-sm font-medium"
                                            >
                                                20%
                                            </motion.div>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: '80%' }}
                                                transition={{ duration: 1, delay: 1.2 }}
                                                className="bg-gradient-green flex items-center justify-center text-white text-sm font-medium"
                                            >
                                                80% Important
                                            </motion.div>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Family • Creativity • Strategic Work
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
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
        </>
    );
}
