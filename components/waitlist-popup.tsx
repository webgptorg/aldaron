'use client';

import { subscribeToWaitlist } from '@/app/subscription/subscribeToWaitlist';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Mail } from 'lucide-react';
import { useState } from 'react';

interface WaitlistPopupProps {
    /**
     * Name of the place where the popup is triggered (to measure effectiveness)
     */
    placeName: string;

    /**
     * Whether the popup is open or not
     */
    isOpen: boolean;

    /**
     * Callback when the popup is closed
     */
    onClose: () => void;
}

export function WaitlistPopup(props: WaitlistPopupProps) {
    const { placeName, isOpen, onClose } = props;
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await subscribeToWaitlist(email, placeName);

            setSuccess(true);
            setEmail('');

            // Auto-close after success
            setTimeout(() => {
                onClose();
                setSuccess(false);
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            onClose();
            // Reset form state when closing
            setTimeout(() => {
                setEmail('');
                setError(null);
                setSuccess(false);
            }, 300);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                        <Mail className="w-6 h-6 text-primary" />
                        Join the Waitlist
                    </DialogTitle>
                </DialogHeader>

                {success ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                            <Mail className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-green-600 mb-2">You're on the list!</h3>
                        <p className="text-gray-600">We'll notify you as soon as we're ready to launch.</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="text-center space-y-2">
                            <p className="text-gray-600">We're putting the finishing touches on something amazing.</p>
                            <p className="text-sm text-gray-500">Be the first to know when we launch!</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email address"
                                    className="w-full"
                                    disabled={isSubmitting}
                                    required
                                />
                            </div>

                            {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                            <Button
                                type="submit"
                                disabled={isSubmitting || !email}
                                className="w-full bg-promptbook-blue-dark hover:bg-promptbook-blue-dark/90"
                                size="lg"
                            >
                                {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                            </Button>
                        </div>

                        <div className="text-center">
                            <p className="text-xs text-gray-500">We respect your privacy. No spam, just updates.</p>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
