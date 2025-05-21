import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { TrustedBy } from "@/components/landing/TrustedBy";
import { Demo } from "@/components/landing/Demo";
import { Features } from "@/components/landing/Features";
import { UseCases } from "@/components/landing/UseCases";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { CallToAction } from "@/components/landing/CallToAction";
import { Footer } from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Hero />
        <TrustedBy />
        <Demo />
        <Features />
        <UseCases />
        <Testimonials />
        <Pricing />
        <CallToAction />
      </main>
      <Footer />
    </div>
  );
}
