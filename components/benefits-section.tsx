"use client"

import { motion } from 'framer-motion'
import { Brain, Globe, Shield, FileText, Zap, Users } from 'lucide-react'

const benefits = [
  {
    icon: Brain,
    title: "Truly YOUR AI Agent",
    description: "Speaks your language, has your voice, your style, your way of thinking, and your decision-making process. Not vanilla generic content.",
    gradient: "from-purple-500 to-pink-500"
  },
  {
    icon: Globe,
    title: "Universal Integration",
    description: "Use everywhere - emails, social media, programming tools, video calls. Runs in background performing tasks and providing reports.",
    gradient: "from-blue-500 to-cyan-500"
  },
  {
    icon: Shield,
    title: "Full Control & Transparency",
    description: "See all interactions, all data. Fine-tune to your liking. Create, control, and adjust behavior as needed.",
    gradient: "from-green-500 to-emerald-500"
  },
  {
    icon: FileText,
    title: "100% Human Language",
    description: "Everything based on plain human language, not JSONs or complex configurations. Built with our special 'Book' technology and PromptBook Engine.",
    gradient: "from-orange-500 to-red-500"
  },
  {
    icon: Zap,
    title: "Extremely Easy Start",
    description: "Import your data from LinkedIn, Facebook, Google, or GitHub. Or create manually by filling out a simple form.",
    gradient: "from-yellow-500 to-orange-500"
  },
  {
    icon: Users,
    title: "Open Source Freedom",
    description: "Everything is open source and in plain text. Run it on your own server or take your data anywhere you want.",
    gradient: "from-indigo-500 to-purple-500"
  }
]

export function BenefitsSection() {
  console.log("BenefitsSection rendered")

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4"
          >
            Why Choose Our AI Avatar?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-xl text-gray-600 max-w-3xl mx-auto"
          >
            More than just another AI tool - it's your digital twin that truly understands and represents you
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${benefit.gradient} flex items-center justify-center mb-6`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {benefit.title}
                </h3>
                
                <p className="text-gray-600 leading-relaxed">
                  {benefit.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}