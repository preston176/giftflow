"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { completeOnboarding } from "@/actions/profile-actions";
import { Sparkles } from "lucide-react";

const COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
  "France",
  "Spain",
  "Italy",
  "Netherlands",
  "Belgium",
  "Sweden",
  "Norway",
  "Denmark",
  "Finland",
  "Ireland",
  "New Zealand",
  "Japan",
  "South Korea",
  "Singapore",
  "India",
  "Kenya",
  "Nigeria",
  "South Africa",
  "Brazil",
  "Mexico",
  "Argentina",
  "Other",
];

const REFERRAL_SOURCES = [
  "Search Engine (Google, Bing, etc.)",
  "Social Media (Twitter, Facebook, etc.)",
  "Friend or Colleague",
  "Blog or Article",
  "YouTube or Video",
  "Product Hunt",
  "Reddit",
  "Newsletter",
  "Advertisement",
  "Other",
];

interface OnboardingDialogProps {
  open: boolean;
}

export function OnboardingDialog({ open }: OnboardingDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    country: "",
    referralSource: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.country || !formData.referralSource) {
      return;
    }

    setLoading(true);
    try {
      await completeOnboarding(formData);
      router.refresh();
    } catch (error) {
      console.error("Failed to complete onboarding:", error);
    } finally {
      setLoading(false);
    }
  };

  const isValid = formData.country && formData.referralSource;

  return (
    <Dialog open={open} modal>
      <DialogContent className="sm:max-w-md" hideClose>
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 bg-gradient-to-br from-teal-600 to-teal-700 rounded-lg flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <DialogTitle className="text-2xl">Welcome to PriceFlow!</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            Let's get to know you better. This helps us improve your experience.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label htmlFor="country" className="text-sm font-medium">
              Where are you from? <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.country}
              onValueChange={(value) =>
                setFormData({ ...formData, country: value })
              }
            >
              <SelectTrigger id="country">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {COUNTRIES.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="referral" className="text-sm font-medium">
              How did you hear about us? <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.referralSource}
              onValueChange={(value) =>
                setFormData({ ...formData, referralSource: value })
              }
            >
              <SelectTrigger id="referral">
                <SelectValue placeholder="Select an option" />
              </SelectTrigger>
              <SelectContent>
                {REFERRAL_SOURCES.map((source) => (
                  <SelectItem key={source} value={source}>
                    {source}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={!isValid || loading}
            className="w-full bg-teal-600 hover:bg-teal-500"
          >
            {loading ? "Getting Started..." : "Get Started"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
