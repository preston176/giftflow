"use client";

import { useEffect, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

const TOUR_COMPLETED_KEY = "priceflow-tour-completed";

export function useDashboardTour(autoStart: boolean = false) {
  const [tourCompleted, setTourCompleted] = useState(true);

  useEffect(() => {
    // Check if tour has been completed
    const completed = localStorage.getItem(TOUR_COMPLETED_KEY) === "true";
    setTourCompleted(completed);

    // Auto-start tour if requested and not completed
    if (autoStart && !completed) {
      // Delay to ensure DOM is ready
      setTimeout(() => {
        startTour();
      }, 1000);
    }
  }, [autoStart]);

  const startTour = () => {
    const driverObj = driver({
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      steps: [
        {
          element: "body",
          popover: {
            title: "Welcome to PriceFlow!",
            description:
              "Let's take a quick tour to help you get started with tracking prices and managing your gift lists.",
            side: "over",
            align: "center",
          },
        },
        {
          element: '[data-tour="list-selector"]',
          popover: {
            title: "Gift Lists",
            description:
              "Organize your gifts into different lists. You can create multiple lists for different occasions like holidays, birthdays, or special events.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: '[data-tour="budget-card"]',
          popover: {
            title: "Budget Tracking",
            description:
              "Set a budget for your list and track your spending in real-time. We'll help you stay on track with visual progress indicators.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: '[data-tour="stats-cards"]',
          popover: {
            title: "Quick Stats",
            description:
              "Get an overview of your total gifts and potential savings. We'll alert you when items drop below your target price!",
            side: "left",
            align: "start",
          },
        },
        {
          element: '[data-tour="add-gift"]',
          popover: {
            title: "Add Gifts",
            description:
              "Click here to add new gifts to your list. You can paste product URLs and we'll automatically fetch details and track prices for you.",
            side: "left",
            align: "start",
          },
        },
        {
          element: '[data-tour="feedback-button"]',
          popover: {
            title: "Send Feedback",
            description:
              "Have suggestions or found a bug? Use this button to send us feedback. We're always working to improve your experience!",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: '[data-tour="theme-toggle"]',
          popover: {
            title: "Customize Appearance",
            description:
              "Switch between light and dark themes to match your preference.",
            side: "bottom",
            align: "start",
          },
        },
        {
          element: "body",
          popover: {
            title: "You're All Set!",
            description:
              "You're ready to start tracking prices and saving money. Add your first gift to get started!",
            side: "over",
            align: "center",
          },
        },
      ],
      onDestroyStarted: () => {
        // Mark tour as completed when user closes it
        localStorage.setItem(TOUR_COMPLETED_KEY, "true");
        setTourCompleted(true);
        driverObj.destroy();
      },
    });

    driverObj.drive();
  };

  return { startTour, tourCompleted };
}
