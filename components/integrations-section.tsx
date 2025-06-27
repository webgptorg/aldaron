"use client"

import { motion } from 'framer-motion'
import { MessageSquare, Mail, Share2, Phone, Bot, Crown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const integrations = [
  {
    icon: MessageSquare,
    title: "Website Chatbot",
    description: "Embed on your website to answer customer questions 24/7",
    tier: "free",
    features: ["24/7 availability", "Custom responses", "Easy integration"]
  },
  {
    icon: Mail,
    title: "Email Integration",
    description: "Handle email replies and interactions automatically",
    tier: "pro",
    features: ["Auto-replies", "Context awareness", "Email scheduling"]
  },
  {
    icon: Share2,
    title: "Social Media Manager",
    description: "Manage posts and interactions across all platforms",
    tier: "pro",
    features: ["Multi-platform", "Auto-posting", "Engagement tracking"]
  },
  {
    icon: Phone,
    title: "Audio/Video Agent",
    description: "Clients can call and interact with your AI avatar",
    tier: "pro",
    features: ["Voice cloning", "Video calls", "Real-time responses"]
  },
  {
    icon: Bot,
    title: "Agentic Mode",
    description: "Background automation with task execution and reporting",
    tier: "pro",
    features: ["Autonomous tasks", "Activity reports", "Client outreach"]
  }
]

export function IntegrationsSection() {
  console.log("IntegrationsSection rendered")

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
          >
            Integration Options
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            Deploy your AI avatar across all your communication channels
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {integrations.map((integration, index) => {
            const Icon = integration.icon
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
              >
                {/* Tier Badge */}
                <div className="absolute top-4 right-4">
                  {integration.tier === 'pro' ? (
                    <Badge className="bg-gradient-purple text-white">
                      <Crown className="w-3 h-3 mr-1" />
                      Pro
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Free</Badge>
                  )}
                </div>

                <div className="mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center mb-4">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {integration.title}
                  </h3>
                  
                  <p className="text-gray-600">
                    {integration.description}
                  </p>
                </div>

                <div className="space-y-2">
                  {integration.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                      {feature}
                    </div>
                  ))}
                </div>

                {/* Hover Gradient Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}