"use client";

import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDashboardTour } from "@/hooks/use-dashboard-tour";

export function TourButton() {
  const { startTour } = useDashboardTour();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={startTour}
      className="gap-2 border-muted/40 hover:border-blue-500/50 hover:bg-blue-500/10"
      aria-label="Start tour"
    >
      <HelpCircle className="h-4 w-4" />
      <span className="hidden sm:inline">Tour</span>
    </Button>
  );
}
