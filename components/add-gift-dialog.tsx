"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ImageUpload } from "@/components/image-upload";
import { addGift, fetchProductInfo } from "@/actions/gift-actions";
import { List } from "@/db/schema";
import { useToast } from "@/hooks/use-toast";

interface AddGiftDialogProps {
  lists: List[];
  currentListId?: string;
}

export function AddGiftDialog({ lists, currentListId }: AddGiftDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingInfo, setFetchingInfo] = useState(false);
  const { toast } = useToast();
  const urlTimeoutRef = useRef<NodeJS.Timeout>();

  const [formData, setFormData] = useState({
    listId: currentListId || "",
    name: "",
    url: "",
    imageUrl: "",
    targetPrice: "",
    currentPrice: "",
    recipientName: "",
    priority: "medium" as "low" | "medium" | "high",
    notes: "",
  });

  // Auto-fetch product info when URL changes
  useEffect(() => {
    if (!formData.url || formData.url.length < 10) return;

    // Clear previous timeout
    if (urlTimeoutRef.current) {
      clearTimeout(urlTimeoutRef.current);
    }

    // Debounce URL input
    urlTimeoutRef.current = setTimeout(async () => {
      try {
        // Validate URL
        new URL(formData.url);

        setFetchingInfo(true);

        const result = await fetchProductInfo(formData.url);

        if (result.success) {
          // Only auto-fill empty fields
          setFormData(prev => ({
            ...prev,
            name: prev.name || result.name || prev.name,
            imageUrl: prev.imageUrl || result.imageUrl || prev.imageUrl,
            currentPrice: prev.currentPrice || (result.price ? result.price.toString() : prev.currentPrice),
          }));

          toast({
            title: "Product info loaded! ✨",
            description: `Found: ${result.name || "product"}${result.price ? ` - $${result.price}` : ""}`,
          });
        }
      } catch (error) {
        // Invalid URL or fetch failed - silently ignore
        console.log("Could not fetch product info:", error);
      } finally {
        setFetchingInfo(false);
      }
    }, 1000); // Wait 1 second after user stops typing

    return () => {
      if (urlTimeoutRef.current) {
        clearTimeout(urlTimeoutRef.current);
      }
    };
  }, [formData.url, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addGift(formData);
      setFormData({
        listId: currentListId || "",
        name: "",
        url: "",
        imageUrl: "",
        targetPrice: "",
        currentPrice: "",
        recipientName: "",
        priority: "medium",
        notes: "",
      });
      setOpen(false);
    } catch (error) {
      console.error("Failed to add gift:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          Add Gift
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Gift</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {lists.length > 0 && (
              <div className="space-y-2 col-span-2">
                <Label htmlFor="listId">Add to List *</Label>
                <Select
                  value={formData.listId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, listId: value })
                  }
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a list" />
                  </SelectTrigger>
                  <SelectContent>
                    {lists.map((list) => (
                      <SelectItem key={list.id} value={list.id}>
                        {list.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2 col-span-2">
              <Label htmlFor="name">Gift Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="e.g., Wireless Headphones"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="recipientName">Recipient *</Label>
              <Input
                id="recipientName"
                value={formData.recipientName}
                onChange={(e) =>
                  setFormData({ ...formData, recipientName: e.target.value })
                }
                required
                placeholder="e.g., Mom, Dad, Sarah"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetPrice">Target Price *</Label>
              <Input
                id="targetPrice"
                type="number"
                step="0.01"
                value={formData.targetPrice}
                onChange={(e) =>
                  setFormData({ ...formData, targetPrice: e.target.value })
                }
                required
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentPrice">Current Price</Label>
              <Input
                id="currentPrice"
                type="number"
                step="0.01"
                value={formData.currentPrice}
                onChange={(e) =>
                  setFormData({ ...formData, currentPrice: e.target.value })
                }
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "low" | "medium" | "high") =>
                  setFormData({ ...formData, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label>Product Image</Label>
              <ImageUpload
                value={formData.imageUrl}
                onChange={(value) =>
                  setFormData({ ...formData, imageUrl: value })
                }
              />
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="url" className="flex items-center gap-2">
                Product URL (Optional)
                {fetchingInfo && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Fetching product info...
                  </span>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="url"
                  type="url"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  placeholder="https://amazon.com/product..."
                  className={fetchingInfo ? "pr-10" : ""}
                />
                {fetchingInfo && (
                  <Sparkles className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary animate-pulse" />
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                Paste a product URL to auto-fill name, image, and price ✨
              </p>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Size, color, or other details..."
              />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "Adding..." : "Add Gift"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
