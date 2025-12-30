import { Button } from "@/components/ui/button";
import { handleImageError, getFallbackImageUrl } from "@/utils/image-handler";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";

interface PropertyGalleryProps {
  images: string[];
}

export default function PropertyGallery({ images }: PropertyGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleImageErrorLocal = (index: number) => {
    setImageErrors((prev) => new Set(prev).add(index));
  };

  const getImageSrc = (index: number) => {
    if (imageErrors.has(index)) {
      return getFallbackImageUrl();
    }
    return images[index] || getFallbackImageUrl();
  };

  // Filter out invalid images
  const validImages = images.filter((img) => img && img.trim() !== "");

  if (validImages.length === 0) {
    return (
      <div className="relative bg-muted rounded-lg overflow-hidden mb-4">
        <div className="aspect-video bg-gray-200 flex items-center justify-center">
          <img
            src="/images/room/room-rental-modern.jpg"
            alt="Default property image"
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Main image display */}
      <div className="relative bg-muted rounded-lg overflow-hidden mb-4">
        <div className="aspect-video bg-gray-200 flex items-center justify-center">
          <img
            src={getImageSrc(currentIndex)}
            alt={`Property image ${currentIndex + 1}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              handleImageErrorLocal(currentIndex);
              handleImageError(e, null);
            }}
          />
        </div>

        {validImages.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </>
        )}

        {/* Image counter */}
        <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {currentIndex + 1} / {validImages.length}
        </div>
      </div>

      {/* Thumbnail grid */}
      {validImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {validImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`aspect-video rounded-md overflow-hidden border-2 transition-colors ${
                currentIndex === index ? "border-primary" : "border-border"
              }`}
            >
              <img
                src={getImageSrc(index)}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  handleImageErrorLocal(index);
                  handleImageError(e, null);
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
