"use client";

import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingDown, TrendingUp, Minus, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPriceHistory, checkPriceNow } from "@/actions/price-actions";
import { PriceHistory } from "@/db/schema";
import { formatCurrency } from "@/lib/utils";

interface PriceHistoryChartProps {
  giftId: string;
  giftName: string;
  currentPrice?: string | null;
  targetPrice: string;
}

export function PriceHistoryChart({
  giftId,
  giftName,
  currentPrice,
  targetPrice,
}: PriceHistoryChartProps) {
  const [history, setHistory] = useState<PriceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    loadHistory();
  }, [giftId]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      const data = await getPriceHistory(giftId);
      setHistory(data);
    } catch (error) {
      console.error("Failed to load price history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckNow = async () => {
    setChecking(true);
    try {
      await checkPriceNow(giftId);
      await loadHistory();
    } catch (error) {
      console.error("Failed to check price:", error);
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">Loading price history...</div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Price History</span>
            <Button onClick={handleCheckNow} disabled={checking} size="sm" variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${checking ? "animate-spin" : ""}`} />
              Check Now
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No price history yet. Click "Check Now" to track the current price.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for chart
  const chartData = history
    .slice()
    .reverse()
    .map((item) => ({
      date: new Date(item.checkedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      price: parseFloat(item.price),
    }));

  // Calculate price trend
  const firstPrice = parseFloat(history[history.length - 1].price);
  const lastPrice = parseFloat(history[0].price);
  const priceDiff = lastPrice - firstPrice;
  const priceChangePercent = ((priceDiff / firstPrice) * 100).toFixed(1);

  const trend =
    priceDiff < -0.01 ? "down" : priceDiff > 0.01 ? "up" : "stable";

  const target = parseFloat(targetPrice);
  const current = currentPrice ? parseFloat(currentPrice) : lastPrice;
  const isBelowTarget = current < target;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Price History</span>
          <Button onClick={handleCheckNow} disabled={checking} size="sm" variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${checking ? "animate-spin" : ""}`} />
            Check Now
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-2xl font-bold">{formatCurrency(current)}</p>
              <p className="text-sm text-muted-foreground">Current Price</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                {trend === "down" && (
                  <TrendingDown className="h-5 w-5 text-green-500" />
                )}
                {trend === "up" && (
                  <TrendingUp className="h-5 w-5 text-red-500" />
                )}
                {trend === "stable" && (
                  <Minus className="h-5 w-5 text-muted-foreground" />
                )}
                <span
                  className={`text-sm font-medium ${
                    trend === "down"
                      ? "text-green-500"
                      : trend === "up"
                      ? "text-red-500"
                      : "text-muted-foreground"
                  }`}
                >
                  {priceDiff > 0 ? "+" : ""}
                  {priceChangePercent}%
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {history.length} price checks
              </p>
            </div>
          </div>

          {isBelowTarget && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mb-4">
              <p className="text-sm text-green-600 font-medium">
                🎉 Below target price! Save {formatCurrency(target - current)}
              </p>
            </div>
          )}

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
              />
              <YAxis
                stroke="#9ca3af"
                fontSize={12}
                tickLine={false}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "6px",
                  color: "#f3f4f6",
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, "Price"]}
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Target Price:</span>
            <span className="font-medium">{formatCurrency(target)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Lowest Ever:</span>
            <span className="font-medium text-green-500">
              {formatCurrency(Math.min(...chartData.map((d) => d.price)))}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Highest Ever:</span>
            <span className="font-medium text-red-500">
              {formatCurrency(Math.max(...chartData.map((d) => d.price)))}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
