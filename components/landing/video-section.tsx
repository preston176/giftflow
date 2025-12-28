"use client";

import CountUp from "react-countup";
import { Play } from "lucide-react";

export default function VideoSection() {
  const videoUrl = "https://www.youtube.com/watch?v=xSZDWvrKzfY";
  const videoId = "xSZDWvrKzfY";
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <section id="how-it-works" className="py-16 sm:py-20 md:py-24 bg-neutral-900 text-white">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12" data-aos="fade-up">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold mb-3 sm:mb-4 px-4">
            See{" "}
            <span className="text-teal-400">PriceFlow</span> in Action
          </h2>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto px-4">
            Watch how easy it is to track prices and never overpay again
          </p>
        </div>

        {/* Video Container */}
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="relative block aspect-video max-w-4xl mx-auto rounded-xl sm:rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/50 backdrop-blur-sm group cursor-pointer"
          data-aos="zoom-in"
          data-aos-delay="100"
        >
          {/* Thumbnail */}
          <img
            src={thumbnailUrl}
            alt="PriceFlow Demo Video"
            className="w-full h-full object-cover"
          />

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/30 transition-colors">
            <div className="bg-teal-500 rounded-full p-6 group-hover:bg-teal-400 group-hover:scale-110 transition-all shadow-2xl">
              <Play className="w-12 h-12 text-white fill-white" />
            </div>
          </div>
        </a>

        {/* Optional: Video Features */}
        <div
          className="mt-8 sm:mt-12 grid grid-cols-3 gap-4 sm:gap-6 max-w-3xl mx-auto px-4"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-teal-400 mb-1">
              <CountUp end={2} duration={1.5} enableScrollSpy scrollSpyOnce /> min
            </div>
            <div className="text-xs sm:text-sm text-slate-400">Quick walkthrough</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-teal-400 mb-1">
              <CountUp end={3} duration={1.5} enableScrollSpy scrollSpyOnce /> Steps
            </div>
            <div className="text-xs sm:text-sm text-slate-400">To start saving</div>
          </div>
          <div className="text-center">
            <div className="text-xl sm:text-2xl font-bold text-teal-400 mb-1">
              <CountUp end={0} duration={1.5} enableScrollSpy scrollSpyOnce /> Cost
            </div>
            <div className="text-xs sm:text-sm text-slate-400">Free forever</div>
          </div>
        </div>
      </div>
    </section>
  );
}
