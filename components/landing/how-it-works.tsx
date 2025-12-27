"use client";

import CountUp from "react-countup";

const steps = [
  {
    number: "01",
    title: "Add Your Products",
    description:
      "Paste product URLs from Amazon, Walmart, Target, or Best Buy. Add as many items as you want to track.",
    color: "text-teal-400/30",
  },
  {
    number: "02",
    title: "Set Target Prices",
    description:
      "Tell us your ideal price or enable auto-update for daily monitoring. We'll watch the market for you.",
    color: "text-blue-400/30",
  },
  {
    number: "03",
    title: "Get Notified & Save",
    description:
      "Receive instant email alerts when prices drop. Click through and purchase at your target price.",
    color: "text-emerald-400/30",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16 sm:py-20 md:py-24 bg-neutral-950 text-white">
      <div className="container max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16" data-aos="fade-up">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-3 sm:mb-4 px-4">How It Works</h2>
          <p className="text-slate-400 text-base sm:text-lg px-4">
            Three simple steps to never overpaying again
          </p>
        </div>

        <div className="space-y-10 sm:space-y-12 md:space-y-16">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row gap-6 sm:gap-8 items-start md:items-center"
              data-aos="fade-right"
              data-aos-delay={index * 100}
            >
              <div className="flex-shrink-0">
                <div className={`text-6xl sm:text-7xl md:text-8xl font-bold ${step.color}`}>
                  {step.number}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold mb-2 sm:mb-3">
                  {step.title}
                </h3>
                <p className="text-sm sm:text-base md:text-lg text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden md:block w-16 h-0.5 bg-slate-800"></div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 sm:mt-16 text-center" data-aos="fade-up" data-aos-delay="300">
          <div className="inline-flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-teal-950/30 border border-teal-800/50 rounded-full backdrop-blur-sm">
            <span className="text-sm sm:text-base text-slate-300">
              Average savings:{" "}
              <span className="font-semibold text-teal-400">
                $<CountUp end={247} duration={2.5} enableScrollSpy scrollSpyOnce />/year
              </span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
