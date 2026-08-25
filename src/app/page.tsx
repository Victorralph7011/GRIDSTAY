import Header from "@/components/landing/Header";
import HeroSection from "@/components/landing/HeroSection";
import PhilosophySection from "@/components/landing/PhilosophySection";
import ShowcaseGrid from "@/components/landing/ShowcaseGrid";
import ServicesSection from "@/components/landing/ServicesSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <HeroSection />
        <PhilosophySection />
        <ShowcaseGrid />
        <ServicesSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
