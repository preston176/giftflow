import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export default function FAQsPage() {
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
            Frequently Asked Questions
          </h1>
          <p className="text-slate-400 text-lg">
            Everything you need to know about PriceFlow
          </p>
        </div>

        {/* FAQ Accordion */}
        <Accordion type="single" collapsible className="space-y-4">
          <AccordionItem value="item-1" className="border-slate-800 bg-slate-900/50 rounded-lg px-6">
            <AccordionTrigger className="text-left hover:no-underline hover:text-teal-400">
              What is PriceFlow?
            </AccordionTrigger>
            <AccordionContent className="text-slate-400">
              PriceFlow is an enterprise-grade price tracking platform that monitors prices across Amazon, Walmart, Target, and Best Buy. We help you never overpay by sending instant alerts when prices drop to your target.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2" className="border-slate-800 bg-slate-900/50 rounded-lg px-6">
            <AccordionTrigger className="text-left hover:no-underline hover:text-teal-400">
              How does price tracking work?
            </AccordionTrigger>
            <AccordionContent className="text-slate-400">
              Simply add a product URL from any supported retailer, set your target price, and we'll monitor it 24/7. When the price drops below your target, you'll receive an instant email notification with a direct link to purchase.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3" className="border-slate-800 bg-slate-900/50 rounded-lg px-6">
            <AccordionTrigger className="text-left hover:no-underline hover:text-teal-400">
              Which retailers do you support?
            </AccordionTrigger>
            <AccordionContent className="text-slate-400">
              We currently support four major retailers: Amazon, Walmart, Target, and Best Buy. We're constantly working to add more retailers based on user demand.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4" className="border-slate-800 bg-slate-900/50 rounded-lg px-6">
            <AccordionTrigger className="text-left hover:no-underline hover:text-teal-400">
              What is auto-update and how does it work?
            </AccordionTrigger>
            <AccordionContent className="text-slate-400">
              Auto-update is a premium feature that automatically checks your tracked products daily and sends you comprehensive email reports with price changes, trends, and savings opportunities. Perfect for keeping tabs on multiple items without manual checking.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-5" className="border-slate-800 bg-slate-900/50 rounded-lg px-6">
            <AccordionTrigger className="text-left hover:no-underline hover:text-teal-400">
              Is PriceFlow free?
            </AccordionTrigger>
            <AccordionContent className="text-slate-400">
              Yes! PriceFlow is free forever. You can track unlimited products, get real-time alerts, and access price history for all your tracked items. No credit card required, no hidden fees.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-6" className="border-slate-800 bg-slate-900/50 rounded-lg px-6">
            <AccordionTrigger className="text-left hover:no-underline hover:text-teal-400">
              How accurate is your price tracking?
            </AccordionTrigger>
            <AccordionContent className="text-slate-400">
              We use enterprise-grade APIs and web scraping technology to ensure accuracy. Prices are typically updated within minutes of changes on retailer websites. However, flash sales and limited-time deals may occasionally be missed.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-7" className="border-slate-800 bg-slate-900/50 rounded-lg px-6">
            <AccordionTrigger className="text-left hover:no-underline hover:text-teal-400">
              Can I share my wishlists with others?
            </AccordionTrigger>
            <AccordionContent className="text-slate-400">
              Absolutely! You can share your gift lists via unique link, email, or download as an image. Perfect for holidays, birthdays, or wedding registries. Recipients can view your list and see current prices for all items.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-8" className="border-slate-800 bg-slate-900/50 rounded-lg px-6">
            <AccordionTrigger className="text-left hover:no-underline hover:text-teal-400">
              Do you store my payment information?
            </AccordionTrigger>
            <AccordionContent className="text-slate-400">
              No. PriceFlow never handles payments or stores payment information. When you click through to purchase an item, you're taken directly to the retailer's website where you complete the transaction securely.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-9" className="border-slate-800 bg-slate-900/50 rounded-lg px-6">
            <AccordionTrigger className="text-left hover:no-underline hover:text-teal-400">
              How do I cancel email notifications?
            </AccordionTrigger>
            <AccordionContent className="text-slate-400">
              You can disable auto-update for specific items from your dashboard, or unsubscribe from all notifications using the link at the bottom of any email we send you. You'll always have full control over which notifications you receive.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-10" className="border-slate-800 bg-slate-900/50 rounded-lg px-6">
            <AccordionTrigger className="text-left hover:no-underline hover:text-teal-400">
              How do you make money if it's free?
            </AccordionTrigger>
            <AccordionContent className="text-slate-400">
              When you purchase items through our tracked links, we may earn a small affiliate commission from retailers. This doesn't affect your price – you pay the same amount whether you use PriceFlow or not. This commission helps us keep the service free for everyone.
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* CTA Section */}
        <div className="mt-16 p-8 bg-gradient-to-br from-teal-950/30 to-slate-900/30 border border-teal-900/50 rounded-2xl backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-2">Still have questions?</h2>
          <p className="text-slate-400 mb-4">
            Can't find the answer you're looking for? Feel free to reach out.
          </p>
          <Link
            href="mailto:support@priceflow.com"
            className="inline-block px-6 py-3 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-full transition-colors"
          >
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
