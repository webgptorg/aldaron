'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { User, FileText, Sparkles } from 'lucide-react';

interface CreateAvatarModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function CreateAvatarModal({ open, onOpenChange }: CreateAvatarModalProps) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        personality: '',
        expertise: '',
        communicationStyle: '',
        goals: '',
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = () => {
        // Here you would typically send the data to your backend
        console.log('Creating AI Avatar with data:', formData);
        onOpenChange(false);
        setStep(1);
        setFormData({
            name: '',
            personality: '',
            expertise: '',
            communicationStyle: '',
            goals: '',
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Sparkles className="w-5 h-5 text-promptbook-blue" />
                        Create Your AI Avatar
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Progress indicator */}
                    <div className="flex items-center justify-between mb-6">
                        {[1, 2, 3].map((num) => (
                            <div key={num} className="flex items-center">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                        step >= num
                                            ? 'bg-promptbook-blue text-white'
                                            : 'bg-gray-200 text-gray-600'
                                    }`}
                                >
                                    {num}
                                </div>
                                {num < 3 && (
                                    <div
                                        className={`w-12 h-0.5 mx-2 ${
                                            step > num ? 'bg-promptbook-blue' : 'bg-gray-200'
                                        }`}
                                    />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Step 1: Basic Information */}
                    {step === 1 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <User className="w-5 h-5 text-promptbook-blue" />
                                <h3 className="text-lg font-semibold">Basic Information</h3>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="name">Avatar Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g., Alex, My Assistant, Professional Me"
                                    value={formData.name}
                                    onChange={(e) => handleInputChange('name', e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="expertise">Areas of Expertise</Label>
                                <Input
                                    id="expertise"
                                    placeholder="e.g., Marketing, Software Development, Writing"
                                    value={formData.expertise}
                                    onChange={(e) => handleInputChange('expertise', e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 2: Personality & Style */}
                    {step === 2 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <FileText className="w-5 h-5 text-promptbook-blue" />
                                <h3 className="text-lg font-semibold">Personality & Communication Style</h3>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="personality">Personality Traits</Label>
                                <Textarea
                                    id="personality"
                                    placeholder="Describe your personality: Are you formal or casual? Analytical or creative? Detail-oriented or big-picture focused?"
                                    value={formData.personality}
                                    onChange={(e) => handleInputChange('personality', e.target.value)}
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="communicationStyle">Communication Style</Label>
                                <Textarea
                                    id="communicationStyle"
                                    placeholder="How do you prefer to communicate? Professional tone? Friendly and approachable? Use specific phrases or avoid certain words?"
                                    value={formData.communicationStyle}
                                    onChange={(e) => handleInputChange('communicationStyle', e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                    )}

                    {/* Step 3: Goals & Finalization */}
                    {step === 3 && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-promptbook-blue" />
                                <h3 className="text-lg font-semibold">Goals & Purpose</h3>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="goals">Primary Goals</Label>
                                <Textarea
                                    id="goals"
                                    placeholder="What do you want your AI avatar to help you with? Customer support? Content creation? Personal assistance? Be specific about your main use cases."
                                    value={formData.goals}
                                    onChange={(e) => handleInputChange('goals', e.target.value)}
                                    rows={4}
                                />
                            </div>

                            <div className="bg-blue-50 p-4 rounded-lg">
                                <h4 className="font-medium text-promptbook-blue mb-2">Review Your Avatar</h4>
                                <div className="text-sm space-y-1">
                                    <p><strong>Name:</strong> {formData.name || 'Not specified'}</p>
                                    <p><strong>Expertise:</strong> {formData.expertise || 'Not specified'}</p>
                                    <p><strong>Personality:</strong> {formData.personality ? formData.personality.substring(0, 50) + '...' : 'Not specified'}</p>
                                    <p><strong>Goals:</strong> {formData.goals ? formData.goals.substring(0, 50) + '...' : 'Not specified'}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation buttons */}
                    <div className="flex justify-between pt-4">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={step === 1}
                        >
                            Back
                        </Button>
                        
                        {step < 3 ? (
                            <Button
                                onClick={handleNext}
                                className="bg-promptbook-blue hover:bg-promptbook-blue/90"
                            >
                                Next Step
                            </Button>
                        ) : (
                            <Button
                                onClick={handleSubmit}
                                className="bg-promptbook-blue hover:bg-promptbook-blue/90"
                            >
                                Create Avatar
                            </Button>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
