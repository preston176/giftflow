import Navbar from "./navbar";
import Hero from "./hero";
import VideoSection from "./video-section";
import Features from "./features";
import HowItWorks from "./how-it-works";
import CTA from "./cta";
import Footer from "./footer";

export function LandingPage() {
  return (
    <div className="min-h-screen relative">
      <Navbar />
      <Hero />
      <VideoSection />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </div>
  );
}
