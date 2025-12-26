import Link from "next/link";
import { ChevronLeft, Target, Shield, Zap, Heart } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <div className="container max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-flex items-center text-slate-400 hover:text-teal-400 transition-colors mb-6"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to home
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About PriceFlow
          </h1>
          <p className="text-slate-400 text-xl">
            Helping smart shoppers never overpay
          </p>
        </div>

        {/* Mission Section */}
        <div className="prose prose-invert max-w-none mb-12">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4 text-white">Our Mission</h2>
            <p className="text-slate-300 leading-relaxed">
              In a world where prices fluctuate constantly and deals are hard to track, PriceFlow was born from a simple frustration: missing out on great deals because we weren't checking at the right time.
            </p>
            <p className="text-slate-300 leading-relaxed mt-4">
              We built PriceFlow to solve this problem. Our platform monitors prices 24/7 across major retailers, so you never have to worry about overpaying again. Whether you're shopping for the holidays, tracking tech gear, or planning a big purchase, we've got your back.
            </p>
          </div>
        </div>

        {/* Values Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">What We Stand For</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-teal-600/50 transition-all">
              <div className="w-12 h-12 bg-teal-600/10 rounded-lg flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Transparency</h3>
              <p className="text-slate-400">
                No hidden fees, no tricks. What you see is what you get. We believe in honest pricing and clear communication.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-teal-600/50 transition-all">
              <div className="w-12 h-12 bg-teal-600/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Privacy First</h3>
              <p className="text-slate-400">
                Your data is yours. We don't sell your information, and we use bank-level encryption to keep your data safe.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-teal-600/50 transition-all">
              <div className="w-12 h-12 bg-teal-600/10 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Speed & Accuracy</h3>
              <p className="text-slate-400">
                Real-time price updates, instant alerts. Our technology ensures you never miss a deal when it matters most.
              </p>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-teal-600/50 transition-all">
              <div className="w-12 h-12 bg-teal-600/10 rounded-lg flex items-center justify-center mb-4">
                <Heart className="w-6 h-6 text-teal-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Customer Obsessed</h3>
              <p className="text-slate-400">
                Built by shoppers, for shoppers. Every feature exists because someone like you asked for it.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gradient-to-br from-teal-950/30 to-slate-900/30 border border-teal-900/50 rounded-2xl p-8 mb-12">
          <h2 className="text-2xl font-bold mb-8 text-center">By The Numbers</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-400 mb-1">4</div>
              <div className="text-sm text-slate-400">Major Retailers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-400 mb-1">24/7</div>
              <div className="text-sm text-slate-400">Price Monitoring</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-400 mb-1">$247</div>
              <div className="text-sm text-slate-400">Avg. Yearly Savings</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-teal-400 mb-1">Free</div>
              <div className="text-sm text-slate-400">Forever Plan</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center bg-slate-900/50 border border-slate-800 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">Ready to start saving?</h2>
          <p className="text-slate-400 mb-6 text-lg">
            Join thousands of smart shoppers who track prices with PriceFlow
          </p>
          <Link
            href="/sign-up"
            className="inline-block px-8 py-4 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-full transition-colors shadow-lg shadow-teal-900/40"
          >
            Get Started Free
          </Link>
        </div>
      </div>
    </div>
  );
}
