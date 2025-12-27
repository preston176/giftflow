import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function CTA() {
  return (
    <section id="pricing" className="py-16 sm:py-20 md:py-24 bg-neutral-950 text-white">
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold mb-4 sm:mb-6 px-4"
          data-aos="fade-up"
        >
          Ready to Stop{" "}
          <span className="text-teal-400">
            Overpaying
          </span>
          ?
        </h2>
        <p
          className="text-slate-400 text-base sm:text-lg md:text-xl mb-8 sm:mb-10 max-w-2xl mx-auto px-4"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          Join thousands of smart shoppers who track prices and save money effortlessly.
        </p>

        <Link href="/dashboard" className="inline-block" data-aos="zoom-in" data-aos-delay="200">
          <Button
            size="lg"
            className="w-full sm:w-auto bg-teal-600 hover:bg-teal-500 text-white font-semibold border-none h-12 sm:h-14 px-8 sm:px-10 rounded-full cursor-pointer shadow-lg shadow-teal-900/40 text-base sm:text-lg"
          >
            Start Tracking Free
            <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </Link>

        <p
          className="text-slate-500 text-xs sm:text-sm mt-4 sm:mt-6 px-4"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          Free forever. No credit card required. Cancel anytime.
        </p>

        {/* Feature Pills */}
        <div
          className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-8 sm:mt-12 px-4"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          {["Unlimited Products", "Real-time Alerts", "Multi-marketplace", "Email Notifications"].map(
            (feature) => (
              <div
                key={feature}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900/50 border border-slate-800 rounded-full text-xs sm:text-sm text-slate-400 backdrop-blur-sm"
              >
                {feature}
              </div>
            )
          )}
        </div>
      </div>
    </section>
  );
}
