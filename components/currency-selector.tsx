"use client";

import { useState } from "react";
import { DollarSign, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getAllCurrencies, getCurrency } from "@/lib/currency";

interface CurrencySelectorProps {
  currentCurrency: string;
}

export function CurrencySelector({ currentCurrency }: CurrencySelectorProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const currencies = getAllCurrencies();
  const current = getCurrency(currentCurrency);

  const filteredCurrencies = currencies.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = async (currencyCode: string) => {
    setLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem("preferred-currency", currencyCode);

      // Update server-side preference
      const response = await fetch("/api/currency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currency: currencyCode }),
      });

      if (response.ok) {
        setOpen(false);
        window.location.reload(); // Reload to update all prices
      } else {
        throw new Error("Failed to update currency");
      }
    } catch (error) {
      console.error("Failed to update currency:", error);
      // Still reload to apply localStorage changes
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <DollarSign className="h-4 w-4" />
          <span className="hidden sm:inline">{current.code}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Select Currency</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Search currencies..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="h-[300px] border rounded-md overflow-y-auto">
            <div className="p-4 space-y-1">
              {filteredCurrencies.map((currency) => (
                <button
                  key={currency.code}
                  onClick={() => handleSelect(currency.code)}
                  disabled={loading}
                  className={`w-full flex items-center justify-between p-3 rounded-md hover:bg-accent transition-colors ${
                    currency.code === currentCurrency ? "bg-accent" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Check
                      className={`h-4 w-4 ${
                        currency.code === currentCurrency ? "opacity-100" : "opacity-0"
                      }`}
                    />
                    <span className="text-2xl">{currency.symbol}</span>
                    <span>{currency.name}</span>
                  </div>
                  <span className="text-muted-foreground text-sm">{currency.code}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
