'use client';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';

export function CookieSettingsModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
    const [preferences, setPreferences] = useState({
        necessary: true,
        analytics: false,
        marketing: false,
    });

    const handlePreferenceChange = (category: keyof typeof preferences, value: boolean) => {
        setPreferences((prev) => ({ ...prev, [category]: value }));
    };

    const handleSave = () => {
        localStorage.setItem('cookiePreferences', JSON.stringify(preferences));
        localStorage.setItem('cookiesAccepted', 'true');
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Customize Cookie Settings</DialogTitle>
                    <DialogDescription>
                        Manage your cookie preferences. You can enable or disable different types of cookies below.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between">
                        <label htmlFor="necessary-cookies">
                            <strong>Necessary Cookies</strong>
                            <p className="text-sm text-gray-500">
                                These cookies are essential for the website to function properly.
                            </p>
                        </label>
                        <Switch id="necessary-cookies" checked disabled />
                    </div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="analytics-cookies">
                            <strong>Analytics Cookies</strong>
                            <p className="text-sm text-gray-500">
                                These cookies help us understand how visitors interact with our website.
                            </p>
                        </label>
                        <Switch
                            id="analytics-cookies"
                            checked={preferences.analytics}
                            onCheckedChange={(value) => handlePreferenceChange('analytics', value)}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <label htmlFor="marketing-cookies">
                            <strong>Marketing Cookies</strong>
                            <p className="text-sm text-gray-500">
                                These cookies are used to track visitors across websites to display relevant ads.
                            </p>
                        </label>
                        <Switch
                            id="marketing-cookies"
                            checked={preferences.marketing}
                            onCheckedChange={(value) => handlePreferenceChange('marketing', value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={handleSave}>Save Preferences</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
