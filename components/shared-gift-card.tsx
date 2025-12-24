import Image from "next/image";
import { ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Gift } from "@/db/schema";

interface SharedGiftCardProps {
  gift: Gift;
}

export function SharedGiftCard({ gift }: SharedGiftCardProps) {
  const getPriorityBadge = (priority: string) => {
    const colors = {
      high: "bg-red-500/20 text-red-500",
      medium: "bg-yellow-500/20 text-yellow-500",
      low: "bg-blue-500/20 text-blue-500",
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg border-l-4 border-primary">
      {gift.imageUrl && (
        <div className="relative aspect-video w-full overflow-hidden bg-muted">
          <Image
            src={gift.imageUrl}
            alt={gift.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold line-clamp-1">{gift.name}</h3>
            <p className="text-sm text-muted-foreground">
              For: {gift.recipientName}
            </p>
          </div>
          {gift.url && (
            <a
              href={gift.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="text-2xl font-bold">
            {formatCurrency(gift.targetPrice)}
          </span>
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityBadge(
              gift.priority
            )}`}
          >
            {gift.priority}
          </span>
        </div>
        {gift.notes && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {gift.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
