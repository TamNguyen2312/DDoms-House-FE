/**
 * Utility functions for handling images with Firebase URL expiration
 */

/**
 * Check if URL is from Firebase Storage
 */
export const isFirebaseUrl = (url?: string | null): boolean => {
  if (!url) return false;
  return (
    url.includes("storage.googleapis.com") || url.includes("firebasestorage")
  );
};

/**
 * Check if URL is from Cloudinary
 */
export const isCloudinaryUrl = (url?: string | null): boolean => {
  if (!url) return false;
  return url.includes("res.cloudinary.com");
};

/**
 * Check if URL might be expired (Firebase URLs with Expires parameter)
 */
export const isUrlExpired = (url?: string | null): boolean => {
  if (!url || !isFirebaseUrl(url)) return false;

  try {
    const urlObj = new URL(url);
    const expiresParam = urlObj.searchParams.get("Expires");
    if (!expiresParam) return false;

    const expiresTimestamp = parseInt(expiresParam, 10);
    if (isNaN(expiresTimestamp)) return false;

    // Check if expired (with 5 minute buffer)
    const now = Math.floor(Date.now() / 1000);
    return expiresTimestamp < now - 300; // 5 minutes buffer
  } catch {
    return false;
  }
};

/**
 * Get fallback image URL
 */
export const getFallbackImageUrl = (): string => {
  return "/images/room/room-rental-modern.jpg";
};

/**
 * Handle image error with fallback logic
 * Automatically handles expired Firebase URLs by using system default image
 * @param e - Error event
 * @param fallbackUrl - Fallback URL to try
 * @param onError - Optional callback when all fallbacks fail
 */
export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  fallbackUrl?: string | null,
  onError?: () => void
) => {
  const target = e.target as HTMLImageElement;
  const currentSrc = target.src;
  const defaultFallback = getFallbackImageUrl();

  // Check if current URL is expired Firebase URL
  const isExpiredFirebase =
    isFirebaseUrl(currentSrc) && isUrlExpired(currentSrc);

  // If Firebase URL is expired, skip to default fallback immediately
  if (isExpiredFirebase) {
    if (
      currentSrc !== defaultFallback &&
      !currentSrc.includes(defaultFallback)
    ) {
      target.src = defaultFallback;
      return;
    }
  }

  // If we have a fallback URL and haven't tried it yet, use it
  // But check if fallback is also expired Firebase URL
  if (
    fallbackUrl &&
    currentSrc !== fallbackUrl &&
    !currentSrc.includes(defaultFallback)
  ) {
    // If fallback is expired Firebase, skip to default
    if (isFirebaseUrl(fallbackUrl) && isUrlExpired(fallbackUrl)) {
      target.src = defaultFallback;
      return;
    }
    target.src = fallbackUrl;
    return;
  }

  // If fallback URL also failed or not available, use default system image
  if (currentSrc !== defaultFallback && !currentSrc.includes(defaultFallback)) {
    target.src = defaultFallback;
    return;
  }

  // All fallbacks failed, hide image and call error callback
  target.style.display = "none";
  if (onError) {
    onError();
  }
};

/**
 * Get the best image URL from multiple sources
 * Prioritizes filePath for original quality, then thumbnailUrl
 * Automatically checks if Firebase URLs are expired and uses fallback
 */
export const getBestImageUrl = (
  thumbnailUrl?: string | null,
  filePath?: string | null,
  fileUrl?: string | null,
  isImage: boolean = true
): string | null => {
  // Helper to check and return valid URL (not expired)
  const getValidUrl = (url: string | null | undefined): string | null => {
    if (!url || url.trim() === "") return null;
    const trimmed = url.trim();
    // If Firebase URL is expired, return null to trigger fallback
    if (isUrlExpired(trimmed)) {
      return null;
    }
    return trimmed;
  };

  // For images, prefer filePath (original quality)
  if (isImage) {
    const validFilePath = getValidUrl(filePath);
    if (validFilePath) {
      return validFilePath;
    }

    // Fallback to thumbnailUrl
    const validThumbnail = getValidUrl(thumbnailUrl);
    if (validThumbnail) {
      return validThumbnail;
    }
  }

  // For non-images, also prefer filePath
  if (!isImage) {
    const validFilePath = getValidUrl(filePath);
    if (validFilePath) {
      return validFilePath;
    }
  }

  // Fallback to fileUrl
  const validFileUrl = getValidUrl(fileUrl);
  if (validFileUrl) {
    return validFileUrl;
  }

  // Last resort: thumbnailUrl for non-images
  if (!isImage) {
    const validThumbnail = getValidUrl(thumbnailUrl);
    if (validThumbnail) {
      return validThumbnail;
    }
  }

  return null;
};
