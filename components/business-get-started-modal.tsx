'use client';

import { subscribeToWaitlist } from '@/app/subscription/subscribeToWaitlist';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useGetParam } from '@/hooks/useGetParam';
import { Mail } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import jiriJahn from '../public/people/jiri-jahn-transparent.png';

interface BusinessGetStartedModalProps {
    /**
     * Name of the place where the popup is triggered (to measure effectiveness)
     */
    placeName: string;
}

export function BusinessGetStartedModal(props: BusinessGetStartedModalProps) {
    const { placeName } = props;
    const [modal, setModal] = useGetParam('modal');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email && !phone) {
            setError('Please enter your email or phone number');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            await subscribeToWaitlist(email, placeName, phone);

            setSuccess(true);
            setEmail('');
            setPhone('');

            // Auto-close after success
            setTimeout(() => {
                setModal(null);
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
            setModal(null);
            // Reset form state when closing
            setTimeout(() => {
                setEmail('');
                setPhone('');
                setError(null);
                setSuccess(false);
            }, 300);
        }
    };

    return (
        <Dialog open={modal === 'get-started'} onOpenChange={handleClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                        Ready to Transform Your Business with AI?
                    </DialogTitle>
                </DialogHeader>

                {success ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                            <Mail className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-green-600 mb-2">Request Sent!</h3>
                        <p className="text-gray-600">Our specialist will contact you shortly.</p>
                    </div>
                ) : (
                    <div>
                        <div className="flex flex-col items-center text-center mb-6">
                            <Image className="object-cover mx-auto mb-4" src={jiriJahn} alt="Jiri Jahn" height={150} />
                            <p className="text-xl font-bold text-gray-900 font-pj">Jiří Jahn</p>
                            <p className="text-base text-gray-500">CEO of Promptbook</p>
                            <p className="mt-4 text-gray-600 max-w-sm mx-auto">
                                Schedule a free, no-obligation call to explore how Promptbook can revolutionize your
                                company's knowledge and empower your team.
                            </p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="john@awesome-company.com"
                                        className="w-full"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <Input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="314-159-265"
                                        className="w-full"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                                <Button
                                    type="submit"
                                    disabled={isSubmitting || (!email && !phone)}
                                    className="w-full bg-promptbook-blue-dark hover:bg-promptbook-blue-dark/90"
                                    size="lg"
                                >
                                    {isSubmitting ? 'Sending...' : 'Schedule a Call'}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
