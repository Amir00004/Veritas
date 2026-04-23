import { Navbar1 } from '../components/ui/navbar-1';
import { Component as HeroSection } from '../components/ui/gradient-bar-hero-section';
import FeatureSection from '../components/ui/feature-section';
import Testimonials from '../sections/Testimonials';
import Pricing from '../sections/Pricing';
import FAQ from '../sections/FAQ';
import Footer from '../sections/Footer';

export default function Home() {
  return (
    <div className="overflow-x-hidden w-full">
      <Navbar1 />
      <HeroSection />

      {/* Black sections with ambient side glows */}
      <div className="relative bg-black">
        {/* Glows at z-0 — well below the orb (z-50) */}
        <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
          {/* Left glow */}
          <div
            className="absolute inset-y-0 left-0 w-full"
            style={{
              background:
                'radial-gradient(ellipse 50% 55% at -5% 40%, rgba(249,115,22,0.07) 0%, transparent 70%)',
            }}
          />
          {/* Right glow */}
          <div
            className="absolute inset-y-0 right-0 w-full"
            style={{
              background:
                'radial-gradient(ellipse 40% 45% at 105% 60%, rgba(249,115,22,0.05) 0%, transparent 70%)',
            }}
          />
        </div>

        <div className="relative z-10">
          <FeatureSection />
          <Testimonials />
          <Pricing />
          <FAQ />
          <Footer />
        </div>
      </div>
    </div>
  );
}
