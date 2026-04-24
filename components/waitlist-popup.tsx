'use client';

import { subscribeToWaitlist } from '@/app/subscription/subscribeToWaitlist';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { defaultPricing } from '@/config/_generic/defaultPricing';
import { useCloseGetStartedModal } from '@/hooks/useCloseGetStartedModal';
import { useGetParam } from '@/hooks/useGetParam';
import { useOptionalGetParam } from '@/hooks/useOptionalGetParam';
import { Mail } from 'lucide-react';
import { useState } from 'react';

interface WaitlistPopupProps {
    /**
     * Name of the place where the popup is triggered (to measure effectiveness)
     */
    placeName: string;
}

export function WaitlistPopup(props: WaitlistPopupProps) {
    const { placeName } = props;
    const [modal] = useGetParam('modal');
    const [plan] = useOptionalGetParam('plan');
    const closeGetStartedModal = useCloseGetStartedModal();
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const selectedPlan = defaultPricing.find((candidate) => candidate.name.toLowerCase().replace(/\s+/g, '-') === plan);
    const selectedPlanName = selectedPlan?.name ?? null;
    const content =
        selectedPlanName === 'Enterprise'
            ? {
                  title: 'Contact Sales',
                  intro: 'Tell us a bit about your team and we will suggest the right next step.',
                  detail: 'We will tailor the follow-up to your use case, team size, and rollout stage.',
                  submitLabel: 'Request a callback',
                  successTitle: 'Thanks, we will be in touch!',
                  successDescription: 'We will reach out shortly with the best next step for your team.',
              }
            : {
                  title: 'Get Started with Promptbook',
                  intro: 'Leave your email and we will help you choose the right next step.',
                  detail: 'Whether you are exploring the free plan or a bigger rollout, we will send the most relevant next step.',
                  submitLabel: 'Get started',
                  successTitle: 'Thanks, we will follow up soon!',
                  successDescription: 'We will reach out with the best next step for your team.',
              };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            setError('Please enter your email address');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const note = selectedPlanName ? `Selected plan: ${selectedPlanName}` : undefined;
            await subscribeToWaitlist(email, placeName, undefined, note);

            setSuccess(true);
            setEmail('');

            // Auto-close after success
            setTimeout(() => {
                closeGetStartedModal();
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
            closeGetStartedModal();
            // Reset form state when closing
            setTimeout(() => {
                setEmail('');
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
                        <Mail className="w-6 h-6 text-primary" />
                        {content.title}
                    </DialogTitle>
                </DialogHeader>

                {success ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                            <Mail className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-semibold text-green-600 mb-2">{content.successTitle}</h3>
                        <p className="text-gray-600">{content.successDescription}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="text-center space-y-2">
                            {selectedPlanName && (
                                <div className="inline-flex max-w-full rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                                    {selectedPlanName}
                                </div>
                            )}
                            <p className="text-gray-600">{content.intro}</p>
                            <p className="text-sm text-gray-500">{content.detail}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="john@awesome-company.com"
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
                                {isSubmitting ? 'Submitting...' : content.submitLabel}
                            </Button>
                        </div>

                        <div className="text-center">
                            <p className="text-xs text-gray-500">We respect your privacy. No spam, just relevant follow-up.</p>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
