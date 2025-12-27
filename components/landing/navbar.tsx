"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="py-3 sm:py-4 bg-neutral-950 text-white sticky top-0 z-50 border-b border-white/10">
      <nav className="container max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-3 border border-white/15 rounded-full h-14 sm:h-16 items-center px-3 sm:px-4 backdrop-blur-sm bg-neutral-950/80">
          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2">
            <div className="relative">
              <div className="absolute inset-0 bg-teal-600 rounded-lg blur-md opacity-40" />
            </div>
            <span className="font-semibold text-white text-base sm:text-lg">PriceFlow</span>
          </Link>

          {/* LINKS */}
          <div className="hidden lg:flex justify-center items-center">
            <div className="flex gap-6 font-medium text-white/80 text-sm">
              {navLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="hover:text-white transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="flex justify-end items-center gap-2 sm:gap-3">
            <button
              className="lg:hidden w-6 h-6 cursor-pointer"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <SignedOut>
              <Link href="/dashboard" className="hidden sm:block">
                <Button className="bg-teal-600 hover:bg-teal-500 text-white font-semibold border-none h-10 sm:h-12 px-4 sm:px-6 rounded-full cursor-pointer shadow-lg shadow-teal-900/50 text-sm">
                  Get Started
                </Button>
              </Link>
            </SignedOut>

            <SignedIn>
              <Link href="/dashboard" className="hidden sm:block">
                <Button
                  variant="outline"
                  className="hidden md:block bg-transparent hover:bg-white/5 text-white font-semibold border-white/20 h-10 sm:h-12 px-4 sm:px-6 rounded-full cursor-pointer text-sm"
                >
                  Dashboard
                </Button>
              </Link>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 border border-white/15 rounded-2xl backdrop-blur-sm bg-neutral-950/95 overflow-hidden">
            <div className="flex flex-col py-4">
              {navLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="px-6 py-3 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="border-t border-white/10 my-2" />
              <SignedOut>
                <Link
                  href="/dashboard"
                  className="mx-4 my-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Button className="w-full bg-teal-600 hover:bg-teal-500 text-white font-semibold border-none h-11 rounded-full">
                    Get Started
                  </Button>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="px-6 py-3 text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              </SignedIn>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
