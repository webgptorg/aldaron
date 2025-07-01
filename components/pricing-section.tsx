"use client"

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { motion } from 'framer-motion'
import { ArrowRight, Brain, Check, CheckCircle, Clock, Crown, Facebook, Github, Linkedin, Mail, MessageSquare } from 'lucide-react'
import { useState } from 'react'

const platforms = [
    { name: 'Facebook', icon: Facebook, color: 'bg-blue-500', status: 'ready', isPreselected: true },
    { name: 'LinkedIn', icon: Linkedin, color: 'bg-blue-600', status: 'preparing', isPreselected: false },
    { name: 'GitHub', icon: Github, color: 'bg-gray-800', status: 'preparing', isPreselected: false },
    { name: 'Google', icon: Mail, color: 'bg-red-500', status: 'preparing', isPreselected: false },
];

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out your AI avatar",
    features: [
      "Website chatbot integration",
      "Basic avatar training",
      "Community support",
      "Open source access"
    ],
    buttonText: "Get Started",
    popular: false,
    gradient: "from-gray-500 to-gray-600"
  },
  {
    name: "Pro",
    price: "$20",
    period: "per month",
    description: "Complete AI avatar solution for professionals",
    features: [
      "Everything in Free",
      "Email integration",
      "Social media management",
      "Audio/video agent",
      "Agentic background mode",
      "Priority support",
      "Advanced analytics"
    ],
    buttonText: "Start Pro Trial",
    popular: true,
    gradient: "from-purple-500 to-blue-500"
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "contact us",
    description: "Custom solutions for organizations",
    features: [
      "Everything in Pro",
      "Custom integrations",
      "Dedicated support",
      "On-premise deployment",
      "SLA guarantees",
      "Team management",
      "Custom training"
    ],
    buttonText: "Contact Sales",
    popular: false,
    gradient: "from-emerald-500 to-cyan-500"
  }
]

// ROT13 decoder function
const rot13 = (str: string): string => {
    return str.replace(/[a-zA-Z]/g, (char) => {
        const start = char <= 'Z' ? 65 : 97;
        return String.fromCharCode(((char.charCodeAt(0) - start + 13) % 26) + start);
    });
};

export function PricingSection() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(
      platforms.filter((p) => p.isPreselected).map((p) => p.name),
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  console.log("PricingSection rendered", {
      isModalOpen,
      selectedPlatforms,
      isProcessing,
      progress,
  });

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
      window.location.href = redirectUrl;

      // Reset modal state
      setIsModalOpen(false);
      setIsProcessing(false);
      setProgress(0);
      setSelectedPlatforms([]);
  };

  const handleButtonClick = (buttonText: string) => {
      console.log('Button clicked:', buttonText);

      if (buttonText === "Get Started" || buttonText === "Start Pro Trial") {
          setIsModalOpen(true);
      } else if (buttonText === "Contact Sales") {
          // Handle contact sales differently - could open a contact form or redirect
          window.location.href = "mailto:sales@promptbook.studio";
      }
  };

  return (
    <>
    <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
          >
            Simple, Transparent Pricing
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Start free and scale as your AI avatar becomes an integral part of your workflow
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`relative bg-white rounded-2xl p-8 shadow-lg border transition-all duration-300 ${
                plan.popular
                  ? 'border-primary scale-105 shadow-xl'
                  : 'border-gray-100 hover:shadow-xl'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-purple text-white px-4 py-2">
                    <Crown className="w-4 h-4 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="text-center mb-8">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${plan.gradient} flex items-center justify-center mx-auto mb-4`}>
                  <MessageSquare className="w-8 h-8 text-white" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>

                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 ml-2">/{plan.period}</span>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => handleButtonClick(plan.buttonText)}
                className={`w-full ${
                  plan.popular
                    ? 'bg-gradient-purple hover:shadow-lg'
                    : 'bg-gray-900 hover:bg-gray-800'
                }`}
                size="lg"
              >
                {plan.buttonText}
              </Button>

              {/* Subtle gradient overlay for popular plan */}
              {plan.popular && (
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-2xl pointer-events-none"></div>
              )}
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-center mt-12"
        >
          <p className="text-gray-600">
            All plans include our open-source guarantee - your data, your control, always.
          </p>
        </motion.div>
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
  )
}
