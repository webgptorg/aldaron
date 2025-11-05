'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { CookieSettingsModal } from './cookie-settings-modal';

export function CookiesBar() {
    const [isVisible, setIsVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // Check if the user has already accepted the cookies
        const cookiesAccepted = localStorage.getItem('cookiesAccepted');
        if (!cookiesAccepted) {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        // Store the user's choice in localStorage
        localStorage.setItem('cookiesAccepted', 'true');
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <>
            <div className="fixed bottom-4 right-4 w-full max-w-md p-4 bg-promptbook-dark-gray text-white rounded-lg shadow-lg z-50">
                <div className="flex flex-col gap-4">
                    <div>
                        <h3 className="font-bold text-lg">Cookie Settings</h3>
                        <p className="text-sm text-gray-300">
                            We use cookies to enhance your browsing experience, serve personalized ads or content, and
                            analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                        </p>
                    </div>
                    <div className="flex justify-end gap-4">
                        <Button variant="outline" onClick={() => setIsModalOpen(true)}>
                            Customize
                        </Button>
                        <Button onClick={handleAccept}>Accept All</Button>
                    </div>
                </div>
            </div>
            <CookieSettingsModal open={isModalOpen} onOpenChange={setIsModalOpen} />
        </>
    );
}
