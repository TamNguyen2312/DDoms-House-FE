import { Card, CardContent } from "@/components/ui/card";
import { useListingPublic } from "@/hooks/useListing";
import type { IGetListingResponse } from "@/services/api/listing.service";
import { formatVietnamMoney } from "@/utils/formatters";
import { DollarSign, MapPin, Square } from "lucide-react";
import { useMemo } from "react";
import { Link } from "react-router-dom";
import LoadingSpinner from "../common/loading-spinner";

interface RelatedListingsProps {
  currentListingId?: number;
}

export default function RelatedListings({
  currentListingId,
}: RelatedListingsProps) {
  const { data, isLoading } = useListingPublic({ page: 0, size: 10 });

  // Filter out current listing and limit to 3 items
  const relatedListings = useMemo(() => {
    // Check response structure - API returns ApiResponse<IGetListingResponse[]>
    // but the actual data structure might be different
    const listings = data?.data || data?.content || [];

    if (!Array.isArray(listings) || listings.length === 0) return [];

    return listings
      .filter((listing) => listing.listingId !== currentListingId)
      .slice(0, 5);
  }, [data, currentListingId]);

  if (isLoading) {
    return (
      <div>
        <h3 className="text-lg font-bold mb-4">Tin Liên Quan</h3>
        <LoadingSpinner />
      </div>
    );
  }

  if (relatedListings.length === 0) {
    return null;
  }
  console.log(relatedListings);

  return (
    <div className="mt-6">
      <h3 className="text-lg font-bold mb-4">Tin Liên Quan</h3>
      <div className="space-y-4">
        {relatedListings.map((listing: IGetListingResponse) => (
          <Link key={listing.listingId} to={`/phong/${listing.listingId}`}>
            <Card className="overflow-hidden hover:shadow-md transition-shadow pt-0 mt-4">
              <div className="relative">
                <img
                  src={
                    listing.media?.[0]?.filePath ||
                    "/images/room/room-rental-modern.jpg"
                  }
                  alt={listing.title}
                  className="w-full h-32 object-cover rounded-t-lg"
                />
              </div>
              <CardContent className="p-3">
                <h4 className="font-semibold text-sm line-clamp-2 mb-2">
                  {listing.title}
                </h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span className="line-clamp-1">
                      {`${listing.addressLine}, ${listing.ward}, ${listing.city}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-1 text-primary font-bold">
                      <DollarSign className="w-3 h-3" />
                      {formatVietnamMoney(listing.listedPrice)}/ tháng
                    </div>
                    <div className="flex items-center gap-1">
                      <Square className="w-3 h-3" />
                      {listing.areaSqM}m²
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
