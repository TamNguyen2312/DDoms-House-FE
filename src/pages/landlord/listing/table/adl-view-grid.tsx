import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BadgeStatusListing } from "@/components/listing/badge-status-listing";
import { getBestImageUrl, getFallbackImageUrl, handleImageError } from "@/utils/image-handler";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Eye } from "lucide-react";
import type { Table } from "@tanstack/react-table";
import React from "react";

type ListingMediaItem = {
  id: number;
  ownerType: string;
  ownerId: number;
  fileId: number;
  sortOrder: number;
  filePath: string;
  thumbnailUrl: string;
  mimeType: string;
  sizeBytes: number;
};

type Unit = {
  id: number;
  propertyId: number;
  code: string;
  areaSqM: number;
  bedrooms: number;
  bathrooms: number;
  baseRent: number;
  status?: string;
};

type ListingData = {
  id: number | string;
  title: string;
  description: string;
  listedPrice: number;
  isPublic: boolean;
  status: string;
  createdAt: string;
  unitId: number | { id: string; code: string } | string | Unit;
  landlordId: number | { id: string; display_name?: string } | string;
  unit?: Unit;
  media?: ListingMediaItem[];
  [key: string]: unknown;
};

interface ADOViewGridProps {
  table: Table<ListingData>;
  actions?: (row: ListingData) => React.ReactNode;
  onView?: (listingId: number | string) => void;
}

export function ADOViewGrid({ table, actions, onView }: ADOViewGridProps) {
  const rows = table.getRowModel().rows;

  if (!rows || rows.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-lg border border-dashed">
        Không tìm thấy kết quả phù hợp với tìm kiếm.
      </div>
    );
  }


  // Strip HTML tags from description
  const stripHtml = (html: string) => {
    if (!html) return "";
    // Remove HTML tags
    const stripped = html.replace(/<[^>]*>/g, "");
    // Decode HTML entities
    const decoded = stripped
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&apos;/g, "'");
    return decoded.trim();
  };

  // Get first image from media
  const getFirstImageUrl = (listing: ListingData) => {
    if (!listing.media || listing.media.length === 0) {
      return getFallbackImageUrl();
    }

    // Sort media by sortOrder
    const sortedMedia = [...listing.media].sort(
      (a, b) => a.sortOrder - b.sortOrder
    );

    const firstMedia = sortedMedia[0];
    const imageUrl = getBestImageUrl(
      firstMedia.thumbnailUrl,
      firstMedia.filePath,
      undefined,
      true // isImage
    );

    return imageUrl || getFallbackImageUrl();
  };

  // Get fallback URL for error handling
  const getFallbackUrl = (listing: ListingData, currentUrl: string) => {
    if (!listing.media || listing.media.length === 0) return null;
    const sortedMedia = [...listing.media].sort(
      (a, b) => a.sortOrder - b.sortOrder
    );
    const firstMedia = sortedMedia[0];
    // If we're using thumbnailUrl, fallback to filePath
    if (
      firstMedia.thumbnailUrl &&
      currentUrl === firstMedia.thumbnailUrl &&
      firstMedia.filePath
    ) {
      return firstMedia.filePath;
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 gap-4 p-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {rows.map((row) => {
        const listing = row.original;
        const imageUrl = getFirstImageUrl(listing);
        const fallbackUrl = getFallbackUrl(listing, imageUrl);

        return (
          <Card key={listing.id} className="flex flex-col hover:shadow-md transition-shadow overflow-hidden">
            {/* Image */}
            <div className="relative w-full h-48 overflow-hidden">
              <img
                src={imageUrl}
                alt={listing.title}
                className="w-full h-full object-cover"
                onError={(e) => handleImageError(e, fallbackUrl)}
              />
            </div>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base font-semibold line-clamp-2 flex-1">
                  {listing.title}
                </CardTitle>
                {actions && (
                  <div className="flex-shrink-0">{actions(listing)}</div>
                )}
              </div>
            </CardHeader>
            <CardContent className="flex-1 space-y-3">
              <div className="text-sm text-muted-foreground line-clamp-2">
                {stripHtml(listing.description) || "Không có mô tả"}
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Giá thuê</div>
                  <div className="text-lg font-bold text-primary">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(listing.listedPrice)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {(["PENDING", "APPROVED", "REJECTED"].includes(listing.status.toUpperCase()) ? (
                  <BadgeStatusListing value={listing.status.toUpperCase() as "PENDING" | "APPROVED" | "REJECTED"} />
                ) : (
                  <Badge variant="outline">{listing.status}</Badge>
                ))}
                {listing.isPublic ? (
                  <Badge variant="default" className="text-xs">Công khai</Badge>
                ) : (
                  <Badge variant="secondary" className="text-xs">Riêng tư</Badge>
                )}
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                {/* Unit Information */}
                {listing.unit ? (
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">Mã phòng: {listing.unit.code}</div>
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                      {listing.unit.areaSqM && (
                        <div>Diện tích: {listing.unit.areaSqM}m²</div>
                      )}
                      {listing.unit.bedrooms !== undefined && (
                        <div>Phòng ngủ: {listing.unit.bedrooms}</div>
                      )}
                      {listing.unit.bathrooms !== undefined && (
                        <div>Phòng tắm: {listing.unit.bathrooms}</div>
                      )}
                    </div>
                  </div>
                ) : typeof listing.unitId === "object" && listing.unitId && "code" in listing.unitId ? (
                  <div>Mã phòng: {listing.unitId.code}</div>
                ) : (
                  <div>Mã phòng: #{listing.unitId}</div>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Tạo: {format(new Date(listing.createdAt), "dd/MM/yyyy", { locale: vi })}
              </div>
            </CardContent>
            <CardFooter className="pt-3 border-t">
              {onView && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => onView(listing.id)}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </Button>
              )}
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
