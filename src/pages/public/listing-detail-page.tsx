import EmptyData from "@/components/common/empty-data";
import LoadingCard from "@/components/common/loading-card";
import PropertyContact from "@/components/properties/property-contact";
import PropertyFurnishings from "@/components/properties/property-furnishings";
import PropertyGallery from "@/components/properties/property-gallery";
import PropertyInfo from "@/components/properties/property-info";
import PropertyMap from "@/components/properties/property-map";
import RelatedListings from "@/components/properties/related-listings";
import { useUnitConfirmedAppointments } from "@/hooks/useAppointment";
import { useListingDetail } from "@/hooks/useListing";
import type { IGetListingResponse } from "@/services/api/listing.service";
import { useAuth } from "@/store";
import { sanitizeHtml } from "@/utils/formatters";
import { getBestImageUrl, getFallbackImageUrl } from "@/utils/image-handler";
import { MapPin } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";

// Wrapper component để force remount khi id thay đổi
function ListingDetailPageContent({ id }: { id: string }) {
  const { user } = useAuth();
  const { data, isLoading } = useListingDetail(id as string);
  const [listing, setListing] = useState<IGetListingResponse | null>(null);

  // Get confirmed appointments for the unit (only when listing has unitId)
  const unitId = listing?.unit?.id;
  const { data: confirmedAppointments } = useUnitConfirmedAppointments(
    unitId || 0
  );

  // Reset state khi id thay đổi để đảm bảo component reset hoàn toàn
  useEffect(() => {
    console.log("ListingDetailPage: id changed to", id);
    setListing(null);
  }, [id]);

  // Check if current user is the owner of this listing
  const isOwner = useMemo(() => {
    if (!user || !listing || !listing.landlord) return false;
    // Convert both to string for comparison (user.id might be string, landlord.id is number)
    return String(user.id) === String(listing.landlord.id);
  }, [user, listing]);

  useEffect(() => {
    if (data?.data) {
      console.log("setListing", data.data);
      // Reset listing state trước khi set data mới để đảm bảo component reset
      setListing(null);
      // Set data mới sau một tick để đảm bảo component reset
      setTimeout(() => {
        setListing(data.data);
      }, 0);
    }
  }, [data, id]); // Thêm id vào dependency để reset khi id thay đổi

  // Get images from listing.media or use default
  const listingImages = useMemo(() => {
    if (listing?.media && listing.media.length > 0) {
      // Sort by sortOrder and get best URL for each item
      const images = listing.media
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => {
          const url = getBestImageUrl(
            item.thumbnailUrl,
            item.filePath,
            undefined,
            true // isImage
          );
          return url;
        })
        .filter((url): url is string => !!url); // Filter out null URLs

      // Return images if we have valid URLs, otherwise fallback to default
      if (images.length > 0) {
        return images;
      }
    }
    // Default images if no media from API
    const defaultImage = getFallbackImageUrl();
    return [defaultImage, defaultImage, defaultImage, defaultImage];
  }, [listing]);

  if (isLoading)
    return (
      <div>
        <LoadingCard />
      </div>
    );
  if (!listing)
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <EmptyData />
      </div>
    );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Header section */}
          <div className="mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />

                    <span>
                      {listing.addressLine +
                        ", " +
                        listing.ward +
                        ", " +
                        listing.city}
                    </span>
                  </div>
                  <span>•</span>
                  <span>
                    Đăng ngày:{" "}
                    {new Date(listing.createdAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left column - gallery and details */}
            <div className="lg:col-span-2">
              <PropertyGallery images={listingImages} />
              {/* Price display */}

              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Chi tiết bài đăng</h2>
                <PropertyInfo property={listing} />
              </div>

              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">Mô Tả Chi Tiết</h2>
                <div className="bg-card p-6 rounded-lg border">
                  {listing.description ? (
                    <div
                      className="text-foreground leading-relaxed prose prose-sm max-w-none [&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_li]:my-1 [&_strong]:font-semibold [&_em]:italic"
                      dangerouslySetInnerHTML={{
                        __html: sanitizeHtml(listing.description),
                      }}
                    />
                  ) : (
                    <p className="text-muted-foreground">Chưa có mô tả</p>
                  )}
                </div>
              </div>

              {/* Furnishings */}
              <PropertyFurnishings listing={listing} />

              {/* Map */}
              {(() => {
                const lat = listing?.property?.latitude;
                const lng = listing?.property?.longitude;

                // Kiểm tra tọa độ hợp lệ
                if (!lat || !lng) return null;
                if (typeof lat !== "number" || typeof lng !== "number")
                  return null;
                if (isNaN(lat) || isNaN(lng)) return null;
                if (lat === 0 && lng === 0) return null;

                // Hiển thị map nếu có tọa độ hợp lệ (bỏ check tọa độ mặc định)
                // Sử dụng id từ URL + listingId + tọa độ làm key để đảm bảo component remount mỗi khi chuyển listing
                const listingId = listing.listingId || listing.id;
                return (
                  <div className="mt-8" key={`map-wrapper-${id}-${listingId}`}>
                    <PropertyMap
                      key={`map-${id}-${listingId}-${lat}-${lng}`}
                      latitude={lat}
                      longitude={lng}
                      address={`${listing.addressLine}, ${listing.ward}, ${listing.city}`}
                    />
                  </div>
                );
              })()}
            </div>

            {/* Right column - contact and info */}
            <div>
              <PropertyContact
                listing={listing}
                isOwner={isOwner}
                confirmedAppointments={confirmedAppointments || []}
              />
              <RelatedListings
                currentListingId={listing.listingId || listing.id}
              />
            </div>
          </div>
        </div>
      </main>

      {/* <Footer /> */}
    </div>
  );
}

// Main component với key dựa trên pathname để force remount khi route thay đổi
export default function ListingDetailPage() {
  const { id } = useParams();
  const location = useLocation();

  // Sử dụng key dựa trên pathname để force remount khi route thay đổi
  return <ListingDetailPageContent key={location.pathname} id={id as string} />;
}
