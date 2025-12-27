"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ExternalLink,
  Trash2,
  Check,
  AlertCircle,
  RefreshCw,
  Star,
} from "lucide-react";
import { MarketplaceProduct } from "@/db/schema";
import {
  removeMarketplaceProduct,
  setPrimaryMarketplace,
  syncMarketplacePrices,
} from "@/actions/marketplace-actions";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface MarketplaceComparisonProps {
  giftId: string;
  giftName: string;
  products: MarketplaceProduct[];
  currentPrimaryMarketplace?: string | null;
}

const MARKETPLACE_COLORS: Record<string, string> = {
  amazon: "bg-orange-500",
  walmart: "bg-blue-500",
  target: "bg-red-500",
  bestbuy: "bg-yellow-500",
};

const MARKETPLACE_NAMES: Record<string, string> = {
  amazon: "Amazon",
  walmart: "Walmart",
  target: "Target",
  bestbuy: "Best Buy",
};

const getMarketplaceSearchUrl = (marketplace: string, productName: string): string => {
  const searchQuery = encodeURIComponent(productName);

  switch (marketplace.toLowerCase()) {
    case "amazon":
      return `https://www.amazon.com/s?k=${searchQuery}`;
    case "walmart":
      return `https://www.walmart.com/search?q=${searchQuery}`;
    case "target":
      return `https://www.target.com/s?searchTerm=${searchQuery}`;
    case "bestbuy":
      return `https://www.bestbuy.com/site/searchpage.jsp?st=${searchQuery}`;
    default:
      return `https://www.google.com/search?q=${searchQuery}`;
  }
};

export function MarketplaceComparison({
  giftId,
  giftName,
  products,
  currentPrimaryMarketplace,
}: MarketplaceComparisonProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const { toast } = useToast();

  if (!products || products.length === 0) {
    return null;
  }

  // Find best price
  const bestPrice = Math.min(
    ...products
      .filter((p) => p.currentPrice)
      .map((p) => parseFloat(p.currentPrice!))
  );

  const handleRemove = async (marketplace: string) => {
    setLoading(marketplace);
    try {
      const result = await removeMarketplaceProduct(giftId, marketplace);

      if (result.success) {
        toast({
          title: "Marketplace removed",
          description: `Removed ${MARKETPLACE_NAMES[marketplace] || marketplace} from tracking`,
        });
      } else {
        toast({
          title: "Failed to remove",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove marketplace",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleSetPrimary = async (marketplace: string) => {
    setLoading(marketplace);
    try {
      const result = await setPrimaryMarketplace(giftId, marketplace);

      if (result.success) {
        toast({
          title: "Primary marketplace updated",
          description: `${MARKETPLACE_NAMES[marketplace] || marketplace} is now the primary source`,
        });
      } else {
        toast({
          title: "Failed to update",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update primary marketplace",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const handleSyncPrices = async () => {
    setSyncing(true);
    try {
      const result = await syncMarketplacePrices(giftId);

      if (result.success) {
        // Show success with details about failures
        if (result.updated > 0 && result.errors.length > 0) {
          // Partial success
          toast({
            title: `${result.updated} of ${result.updated + result.errors.length} marketplace${result.updated + result.errors.length !== 1 ? 's' : ''} updated`,
            description: `✓ Synced ${result.updated}, ✗ Failed ${result.errors.length}. ${result.errors.length > 0 ? `Failed: ${result.errors.join(", ")}` : ''}`,
          });
        } else if (result.updated > 0) {
          // Full success
          toast({
            title: "All prices synced!",
            description: `Successfully updated ${result.updated} marketplace${result.updated !== 1 ? 's' : ''}`,
          });
        } else {
          // All failed
          toast({
            title: "Sync failed",
            description: result.errors.join(", "),
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: "Sync failed",
          description: result.error,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync prices",
        variant: "destructive",
      });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Header with sync button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
        <h3 className="text-xs sm:text-sm font-medium text-muted-foreground">
          {products.length} marketplace{products.length !== 1 ? "s" : ""} tracked
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSyncPrices}
          disabled={syncing}
          className="w-full sm:w-auto"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${syncing ? "animate-spin" : ""}`} />
          <span className="text-xs sm:text-sm">Sync Prices</span>
        </Button>
      </div>

      {/* Marketplace list - single column, horizontal layout */}
      <div className="space-y-3">
        {products.map((product) => {
          const price = product.currentPrice
            ? parseFloat(product.currentPrice)
            : null;
          const isBestPrice = price !== null && price === bestPrice;
          const isPrimary = product.marketplace === currentPrimaryMarketplace;
          const confidence = product.confidenceScore
            ? parseFloat(product.confidenceScore)
            : null;

          // Determine confidence level
          const confidenceLevel =
            confidence !== null
              ? confidence >= 0.85
                ? "high"
                : confidence >= 0.7
                ? "medium"
                : "low"
              : null;

          return (
            <Card
              key={product.id}
              className={`relative ${isBestPrice ? "ring-2 ring-green-500" : ""} ${
                !product.inStock ? "opacity-60" : ""
              }`}
            >
              <CardContent className="p-4">
                {/* Single row layout */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Left: Marketplace info and badges */}
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div
                      className={`w-3 h-3 rounded-full flex-shrink-0 ${
                        MARKETPLACE_COLORS[product.marketplace] || "bg-gray-500"
                      }`}
                    />
                    <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                      <span className="font-semibold text-sm sm:text-base">
                        {MARKETPLACE_NAMES[product.marketplace] || product.marketplace}
                      </span>

                      {/* Badges */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {isPrimary && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            Primary
                          </Badge>
                        )}
                        {isBestPrice && (
                          <Badge className="bg-green-500 text-white text-xs">
                            Best Price
                          </Badge>
                        )}
                        {confidenceLevel && (
                          <Badge
                            variant={
                              confidenceLevel === "high"
                                ? "default"
                                : confidenceLevel === "medium"
                                ? "secondary"
                                : "destructive"
                            }
                            className="text-xs"
                          >
                            {confidence && Math.round(confidence * 100)}% match
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Center: Price and stock */}
                  <div className="flex items-center gap-4">
                    <div className="text-center sm:text-right">
                      {price !== null ? (
                        <div className="text-2xl font-bold">
                          ${price.toFixed(2)}
                        </div>
                      ) : (
                        <div className="text-base text-muted-foreground">
                          No price
                        </div>
                      )}
                      <div className="flex items-center justify-center sm:justify-end gap-1 text-xs mt-1">
                        {product.inStock ? (
                          <>
                            <Check className="h-3 w-3 text-green-500" />
                            <span className="text-green-600">In Stock</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="h-3 w-3 text-red-500" />
                            <span className="text-red-600">Out of Stock</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9"
                      asChild
                    >
                      <a
                        href={getMarketplaceSearchUrl(product.marketplace, giftName)}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={`Search on ${MARKETPLACE_NAMES[product.marketplace] || product.marketplace}`}
                      >
                        <ExternalLink className="h-4 w-4 sm:mr-1.5" />
                        <span className="hidden sm:inline">View</span>
                      </a>
                    </Button>

                    {!isPrimary && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSetPrimary(product.marketplace)}
                        disabled={loading === product.marketplace}
                        title="Set as primary"
                        className="h-9 px-2"
                      >
                        <Star className="h-4 w-4" />
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(product.marketplace)}
                      disabled={loading === product.marketplace}
                      className="text-destructive hover:text-destructive h-9 px-2"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Bottom: Last updated and warnings */}
                <div className="mt-3 flex flex-col gap-2">
                  {product.lastPriceCheck && (
                    <div className="text-xs text-muted-foreground">
                      Updated {formatDistanceToNow(new Date(product.lastPriceCheck), { addSuffix: true })}
                    </div>
                  )}

                  {confidenceLevel === "low" && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-2">
                      <p className="text-xs text-yellow-800 dark:text-yellow-200">
                        Low match confidence - verify this is the same product
                      </p>
                    </div>
                  )}

                  {confidenceLevel === "medium" && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md p-2">
                      <p className="text-xs text-blue-800 dark:text-blue-200">
                        Possible match - please review
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      {products.length > 1 && bestPrice && (
        <div className="bg-muted/50 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs sm:text-sm font-medium">Best Deal</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                {products.find(
                  (p) => p.currentPrice && parseFloat(p.currentPrice) === bestPrice
                )?.marketplace &&
                  MARKETPLACE_NAMES[
                    products.find(
                      (p) =>
                        p.currentPrice && parseFloat(p.currentPrice) === bestPrice
                    )!.marketplace
                  ]}{" "}
                has the lowest price
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                ${bestPrice.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
