"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-neutral-950 text-white">
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold text-center leading-tight text-white"
          data-aos="fade-up"
        >
          Never Overpay{" "}
          <span className="text-teal-400">
            Ever Again
          </span>
        </h1>

        <p
          className="text-center text-base sm:text-lg md:text-xl text-white/70 mt-4 sm:mt-6 max-w-3xl mx-auto px-4"
          data-aos="fade-up"
          data-aos-delay="100"
        >
          Enterprise-grade price tracking across Amazon, Walmart, Target & Best Buy.
          Get instant alerts when deals are actually worth it.
        </p>

        <div
          className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mt-8 sm:mt-10 px-4"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-500 text-white font-semibold border-none h-12 sm:h-14 px-6 sm:px-8 rounded-full cursor-pointer shadow-lg shadow-teal-900/40"
            >
              Start Tracking Free
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </Link>
          <a href="#how-it-works" className="w-full sm:w-auto">
            <Button
              variant="outline"
              size="lg"
              className="w-full sm:w-auto bg-transparent hover:bg-white/5 text-white font-semibold border-slate-700 hover:border-teal-600 h-12 sm:h-14 px-6 sm:px-8 rounded-full cursor-pointer"
            >
              See How It Works
            </Button>
          </a>
        </div>

        <p
          className="text-center text-xs sm:text-sm text-white/50 mt-4 sm:mt-6 px-4"
          data-aos="fade-up"
          data-aos-delay="300"
        >
          No credit card needed. Start saving in under 2 minutes.
        </p>

        {/* Trust Indicators */}
        <div
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 mt-8 sm:mt-12 pt-8 sm:pt-12 border-t border-slate-800 px-4"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          <div className="text-center min-w-[100px]">
            <div className="text-2xl sm:text-3xl font-bold text-teal-400">
              4 Markets
            </div>
            <div className="text-xs sm:text-sm text-slate-400 mt-1">Supported</div>
          </div>
          <div className="text-center min-w-[100px]">
            <div className="text-2xl sm:text-3xl font-bold text-blue-400">
              Real-time
            </div>
            <div className="text-xs sm:text-sm text-slate-400 mt-1">Price Updates</div>
          </div>
          <div className="text-center min-w-[100px]">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-400">
              Instant
            </div>
            <div className="text-xs sm:text-sm text-slate-400 mt-1">Email Alerts</div>
          </div>
        </div>
      </div>
    </section>
  );
}
