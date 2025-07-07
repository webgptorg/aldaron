'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Facebook, Github, Mail, Linkedin, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface CreateAvatarModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

interface PlatformOption {
    id: string;
    name: string;
    icon: React.ReactNode;
    available: boolean;
    preparing?: boolean;
}

export function CreateAvatarModal({ open, onOpenChange }: CreateAvatarModalProps) {
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const [deepScrapingMode, setDeepScrapingMode] = useState(false);

    const platforms: PlatformOption[] = [
        {
            id: 'facebook',
            name: 'Facebook',
            icon: <Facebook className="w-5 h-5" />,
            available: true,
        },
        {
            id: 'linkedin',
            name: 'LinkedIn',
            icon: <Linkedin className="w-5 h-5" />,
            available: false,
            preparing: true,
        },
        {
            id: 'github',
            name: 'GitHub',
            icon: <Github className="w-5 h-5" />,
            available: false,
            preparing: true,
        },
        {
            id: 'google',
            name: 'Google',
            icon: <Mail className="w-5 h-5" />,
            available: false,
            preparing: true,
        },
    ];

    const handlePlatformToggle = (platformId: string) => {
        const platform = platforms.find(p => p.id === platformId);
        if (!platform?.available) return;

        setSelectedPlatforms(prev =>
            prev.includes(platformId)
                ? prev.filter(id => id !== platformId)
                : [...prev, platformId]
        );
    };

    const handleImportData = () => {
        if (selectedPlatforms.length === 0) return;

        const services = selectedPlatforms.join(',');
        const scrapingMode = deepScrapingMode ? 'DEEP' : 'QUICK';
        const url = `https://promptbook.studio/from-social?services=${services}&scrapingMode=${scrapingMode}`;

        // Open the URL in a new tab
        window.open(url, '_blank');

        // Close the modal
        onOpenChange(false);
        setSelectedPlatforms([]);
        setDeepScrapingMode(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-center">
                        Create Your AI Avatar
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    <p className="text-center text-gray-600 text-sm">
                        Select platforms to import your data and create your personalized AI avatar
                    </p>

                    {/* Platform Selection Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        {platforms.map((platform) => (
                            <div
                                key={platform.id}
                                className={`
                                    relative border-2 rounded-lg p-4 cursor-pointer transition-all
                                    ${selectedPlatforms.includes(platform.id) && platform.available
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }
                                    ${!platform.available ? 'opacity-50 cursor-not-allowed' : ''}
                                `}
                                onClick={() => handlePlatformToggle(platform.id)}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className={`
                                        p-2 rounded-lg
                                        ${platform.id === 'facebook' ? 'bg-blue-100 text-blue-600' : ''}
                                        ${platform.id === 'linkedin' ? 'bg-blue-100 text-blue-700' : ''}
                                        ${platform.id === 'github' ? 'bg-gray-100 text-gray-700' : ''}
                                        ${platform.id === 'google' ? 'bg-red-100 text-red-600' : ''}
                                    `}>
                                        {platform.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium">{platform.name}</h3>
                                        {platform.preparing && (
                                            <p className="text-xs text-orange-600">⏳ Preparing</p>
                                        )}
                                    </div>
                                </div>

                                {selectedPlatforms.includes(platform.id) && platform.available && (
                                    <div className="absolute top-2 right-2">
                                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Deep Scraping Mode Checkbox */}
                    <div className="border-t pt-4">
                        <div className="flex items-start space-x-3">
                            <Checkbox
                                id="deep-scraping"
                                checked={deepScrapingMode}
                                onCheckedChange={(checked) => setDeepScrapingMode(checked as boolean)}
                            />
                            <div className="space-y-1">
                                <Label
                                    htmlFor="deep-scraping"
                                    className="text-sm font-medium cursor-pointer"
                                >
                                    Enable Deep Scraping Mode
                                </Label>
                                <p className="text-xs text-gray-600">
                                    Deep mode provides more comprehensive data extraction but takes longer to process.
                                    Quick mode (default) provides faster results with essential information.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Button */}
                    <Button
                        onClick={handleImportData}
                        disabled={selectedPlatforms.length === 0}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Import Data & Create Avatar
                    </Button>

                    {selectedPlatforms.length === 0 && (
                        <p className="text-center text-sm text-gray-500">
                            Please select at least one platform to continue
                        </p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
