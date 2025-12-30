import type { IGetListingResponse } from "@/services/api/listing.service";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

interface PropertyFurnishingsProps {
  listing: IGetListingResponse;
}

export default function PropertyFurnishings({
  listing,
}: PropertyFurnishingsProps) {
  const furnishings = listing.unit?.furnishings || [];

  if (furnishings.length === 0) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Nội thất</h2>
      <div className="bg-card p-6 rounded-lg border">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {furnishings.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Package className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{item.name}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="text-xs">
                    {item.quantity} cái
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

