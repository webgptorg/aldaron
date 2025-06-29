import { Suspense } from 'react'
import { HeroSection } from '@/components/hero-section'
import { BenefitsSection } from '@/components/benefits-section'
import { IntegrationsSection } from '@/components/integrations-section'
import { PricingSection } from '@/components/pricing-section'
import { Footer } from '@/components/footer'

export default function Home() {
  console.log("Home page rendered")
  
  return (
    <main className="min-h-screen">
      <Suspense fallback={<div>Loading...</div>}>
        <HeroSection />
      </Suspense>
      <BenefitsSection />
      <IntegrationsSection />
      <PricingSection />
      <Footer />
    </main>
  );
}
