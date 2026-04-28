'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useCloseGetStartedModal } from '@/hooks/useCloseGetStartedModal';
import { useGetParam } from '@/hooks/useGetParam';
import { useOptionalGetParam } from '@/hooks/useOptionalGetParam';
import { subscribeToWaitlist } from '@/lib/subscription/subscribeToWaitlist';
import jiriJahn from '@/public/people/jiri-jahn-transparent.png';
import { Mail } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface BusinessGetStartedModalProps {
    /**
     * Name of the place where the popup is triggered (to measure effectiveness)
     */
    placeName: string;
    title?: string;
    requestSent?: string;
    specialistContact?: string;
    ceoOf?: string;
    description?: string;
    emailPlaceholder?: string;
    phonePlaceholder?: string;
    errorNoEmailOrPhone?: string;
    sending?: string;
    scheduleCall?: string;
    genericErrorMessage?: string;
}

export function BusinessGetStartedModal(props: BusinessGetStartedModalProps) {
    const {
        placeName,
        title = 'Ready to Transform Your Business with AI?',
        requestSent = 'Request Sent!',
        specialistContact = 'Our specialist will contact you shortly.',
        ceoOf = 'CEO of Promptbook',
        description = "Schedule a free, no-obligation call to explore how Promptbook can revolutionize your company's knowledge and empower your team.",
        emailPlaceholder = 'john@awesome-company.com',
        phonePlaceholder = '314-159-265',
        errorNoEmailOrPhone = 'Please enter your email or phone number',
        sending = 'Sending...',
        scheduleCall = 'Schedule a Call',
        genericErrorMessage = 'An error occurred',
    } = props;
    const [modal] = useGetParam('modal');
    const [plan] = useOptionalGetParam('plan');
    const closeGetStartedModal = useCloseGetStartedModal();
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const selectedPlanLabel = plan ? plan.replace(/-/g, ' ') : null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email && !phone) {
            setError(errorNoEmailOrPhone);
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const note = selectedPlanLabel ? `Selected plan: ${selectedPlanLabel}` : undefined;
            await subscribeToWaitlist({ email, placeName, phone, note });

            setSuccess(true);
            setEmail('');
            setPhone('');

            // Auto-close after success
            setTimeout(() => {
                closeGetStartedModal();
                setSuccess(false);
            }, 2000);
        } catch (err) {
            setError(err instanceof Error ? err.message : genericErrorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (!isSubmitting) {
            closeGetStartedModal();
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
        <Dialog
            open={modal === 'get-started'}
            onOpenChange={(open) => {
                if (!open) {
                    handleClose();
                }
            }}
        >
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
                        {title}
                    </DialogTitle>
                </DialogHeader>

                {success ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                            <Mail className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-green-600 mb-2">{requestSent}</h3>
                        <p className="text-gray-600">{specialistContact}</p>
                    </div>
                ) : (
                    <div>
                        <div className="flex flex-col items-center text-center mb-6">
                            {selectedPlanLabel && (
                                <div className="mb-3 inline-flex max-w-full rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                    {selectedPlanLabel}
                                </div>
                            )}
                            <Image className="object-cover mx-auto mb-4" src={jiriJahn} alt="Jiri Jahn" height={150} />
                            <p className="text-xl font-bold text-gray-900 font-pj">Jiří Jahn</p>
                            <p className="text-base text-gray-500">{ceoOf}</p>
                            <p className="mt-4 text-gray-600 max-w-sm mx-auto">{description}</p>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={emailPlaceholder}
                                        className="w-full"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <Input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder={phonePlaceholder}
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
                                    {isSubmitting ? sending : scheduleCall}
                                </Button>
                            </div>
                        </form>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
