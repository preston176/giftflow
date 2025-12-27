import Link from "next/link";
import { Github, Twitter, Linkedin, Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-12 sm:py-16 bg-neutral-950 text-white border-t border-white/10">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-8 sm:mb-12">
          {/* Brand */}
          <div className="md:col-span-1" data-aos="fade-up">
            <div className="flex items-center gap-2 mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-teal-600 rounded-lg blur-md opacity-40" />
                <div className="relative bg-gradient-to-br from-teal-600 to-teal-700 p-2 rounded-lg">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              </div>
              <span className="font-semibold text-base sm:text-lg">PriceFlow</span>
            </div>
            <p className="text-slate-400 text-xs sm:text-sm">
              Never overpay again. Track prices across major retailers and save money effortlessly.
            </p>
          </div>

          {/* Product */}
          <div data-aos="fade-up" data-aos-delay="100">
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Product</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition-colors">
                  Pricing
                </a>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div data-aos="fade-up" data-aos-delay="200">
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Resources</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <Link href="/faqs" className="hover:text-white transition-colors">
                  FAQs
                </Link>
              </li>
              <li>
                <a href="#features" className="hover:text-white transition-colors">
                  Supported Retailers
                </a>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div data-aos="fade-up" data-aos-delay="300">
            <h4 className="font-semibold mb-3 sm:mb-4 text-sm sm:text-base">Company</h4>
            <ul className="space-y-2 text-xs sm:text-sm text-slate-400">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <a href="mailto:support@priceflow.com" className="hover:text-white transition-colors">
                  Contact
                </a>
              </li>
              <li>
                <Link href="/sign-in" className="hover:text-white transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Get Started
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-6 sm:pt-8 border-t border-slate-800">
          <p className="text-slate-500 text-xs sm:text-sm mb-4 md:mb-0">
            © 2025 PriceFlow. All rights reserved.
          </p>
          <div className="flex gap-3 sm:gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 sm:w-10 sm:h-10 border border-slate-800 rounded-full flex items-center justify-center hover:border-teal-600 hover:text-teal-400 transition-colors"
            >
              <Github className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 sm:w-10 sm:h-10 border border-slate-800 rounded-full flex items-center justify-center hover:border-teal-600 hover:text-teal-400 transition-colors"
            >
              <Twitter className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 sm:w-10 sm:h-10 border border-slate-800 rounded-full flex items-center justify-center hover:border-teal-600 hover:text-teal-400 transition-colors"
            >
              <Linkedin className="w-4 h-4 sm:w-5 sm:h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
