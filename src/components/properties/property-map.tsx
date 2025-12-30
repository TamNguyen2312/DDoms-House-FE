import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// Map Tiles Key dùng cho hiển thị bản đồ
const GOONG_MAP_TILES_KEY =
  import.meta.env.VITE_GOONG_MAP_TILES ||
  import.meta.env.VITE_GOONG_REST_API ||
  "rTWBUH9ZAn98UxInc79ouAyV1sEonDDTSJAujxBa";

// Declare Goong types
declare global {
  interface Window {
    goongjs: any;
  }
}

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  address?: string;
}

export default function PropertyMap({
  latitude,
  longitude,
  address,
}: PropertyMapProps) {
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string>("");
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);
  const mapIdRef = useRef<string | null>(null);

  // Tạo mapId mới mỗi lần component mount - sử dụng useState để đảm bảo reset khi remount
  const [mapId] = useState(
    () =>
      `property-map-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );

  // Lưu mapId vào ref và cleanup khi unmount
  useEffect(() => {
    mapIdRef.current = mapId;

    return () => {
      // Cleanup khi unmount
      if (markerInstanceRef.current) {
        try {
          markerInstanceRef.current.remove();
        } catch (err) {
          console.error("Error removing marker on unmount:", err);
        }
        markerInstanceRef.current = null;
      }
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (err) {
          console.error("Error removing map on unmount:", err);
        }
        mapInstanceRef.current = null;
      }
    };
  }, [mapId]);

  // Load Goong Maps từ CDN hoặc check nếu đã được load
  useEffect(() => {
    // Kiểm tra ngay lập tức xem Goong Maps đã được load chưa
    if (window.goongjs) {
      setMapLoaded(true);
      return;
    }

    // Kiểm tra xem script đã được thêm vào DOM chưa (từ component khác)
    const existingScript = document.querySelector('script[src*="goong-js.js"]');

    if (existingScript) {
      // Nếu script đã có, đợi nó load xong
      existingScript.addEventListener("load", () => {
        setMapLoaded(true);
      });
      // Nếu đã load rồi, set ngay
      if ((existingScript as HTMLScriptElement).complete) {
        setMapLoaded(true);
      }
      return;
    }

    // Tạo script và link mới
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.js";
    script.onload = () => {
      setMapLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Goong Maps script");
      setError("Không thể tải Goong Maps");
    };
    document.head.appendChild(script);
  }, []);

  // Khởi tạo map và marker
  useEffect(() => {
    // Kiểm tra window.goongjs trực tiếp, không chỉ dựa vào mapLoaded state
    // vì khi component remount, mapLoaded có thể reset về false trong khi goongjs vẫn còn
    if (!window.goongjs) {
      return;
    }

    // Nếu mapLoaded là false nhưng goongjs đã có, set mapLoaded = true
    if (!mapLoaded) {
      setMapLoaded(true);
      // Return để chờ state update, effect sẽ chạy lại
      return;
    }

    if (!latitude || !longitude) {
      return;
    }

    const lat =
      typeof latitude === "number" ? latitude : parseFloat(String(latitude));
    const lng =
      typeof longitude === "number" ? longitude : parseFloat(String(longitude));

    if (isNaN(lat) || isNaN(lng)) {
      console.warn("Invalid coordinates:", latitude, longitude);
      setError("Tọa độ không hợp lệ");
      return;
    }

    // Tạo map mới - luôn tạo mới, không reuse
    const containerId = mapId;
    const container = document.getElementById(containerId);

    if (!container) {
      // Container chưa render, retry sau 100ms
      const retryTimeout = setTimeout(() => {
        const retryContainer = document.getElementById(containerId);
        if (!retryContainer) {
          console.error("Map container not found:", containerId);
        }
      }, 100);
      return () => clearTimeout(retryTimeout);
    }

    // Luôn remove map cũ trước khi tạo mới (không reuse)
    if (mapInstanceRef.current) {
      try {
        if (markerInstanceRef.current) {
          markerInstanceRef.current.remove();
          markerInstanceRef.current = null;
        }
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMap(null);
        setMarker(null);
      } catch (err) {
        console.error("Error removing existing map:", err);
      }
    }

    try {
      window.goongjs.accessToken = GOONG_MAP_TILES_KEY;

      // Đảm bảo container có kích thước
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        container.style.width = "100%";
        container.style.height = "384px";
        container.style.minHeight = "384px";
      }

      const mapInstance = new window.goongjs.Map({
        container: containerId,
        style: "https://tiles.goong.io/assets/goong_map_web.json",
        center: [lng, lat],
        zoom: 16,
      });

      // Hàm tạo marker - sử dụng chung cho cả "load" event và fallback
      const createMarker = () => {
        // Remove marker cũ nếu có
        if (markerInstanceRef.current) {
          try {
            markerInstanceRef.current.remove();
          } catch (err) {
            console.error("Error removing old marker:", err);
          }
          markerInstanceRef.current = null;
          setMarker(null);
        }

        try {
          // Tạo marker mới
          const markerInstance = new window.goongjs.Marker({
            draggable: false,
          })
            .setLngLat([lng, lat])
            .addTo(mapInstance);

          markerInstanceRef.current = markerInstance;
          setMarker(markerInstance);
        } catch (err) {
          console.error("Error creating marker:", err);
        }
      };

      // Tạo marker trong event "load"
      mapInstance.on("load", function () {
        createMarker();
      });

      // Fallback: Nếu map đã loaded sẵn, kiểm tra sau 300ms
      setTimeout(() => {
        if (mapInstance.loaded() && !markerInstanceRef.current) {
          createMarker();
        }
      }, 300);

      mapInstance.on("error", function (e: any) {
        console.error("Map error:", e);
        if (
          e.error &&
          e.error.message &&
          e.error.message.includes("Failed to fetch")
        ) {
          setError(
            "Map Tiles Key không hợp lệ hoặc không có quyền truy cập tiles."
          );
        } else {
          setError(
            "Lỗi khởi tạo bản đồ: " +
              (e.error?.message || e.message || "Unknown error")
          );
        }
      });

      setMap(mapInstance);
      mapInstanceRef.current = mapInstance;
    } catch (err) {
      console.error("Error creating map:", err);
      setError("Không thể tạo bản đồ: " + (err as Error).message);
    }

    // Cleanup khi unmount hoặc khi tọa độ thay đổi
    return () => {
      if (markerInstanceRef.current) {
        try {
          markerInstanceRef.current.remove();
        } catch (err) {
          console.error("Error removing marker:", err);
        }
        markerInstanceRef.current = null;
        setMarker(null);
      }
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (err) {
          console.error("Error removing map:", err);
        }
        mapInstanceRef.current = null;
        setMap(null);
      }
    };
  }, [mapLoaded, latitude, longitude, mapId]);

  // Kiểm tra tọa độ hợp lệ trước khi render
  const lat =
    typeof latitude === "number" ? latitude : parseFloat(String(latitude));
  const lng =
    typeof longitude === "number" ? longitude : parseFloat(String(longitude));

  if (!latitude || !longitude || isNaN(lat) || isNaN(lng)) {
    return null;
  }

  return (
    <Card className="gap-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Vị Trí
        </CardTitle>
      </CardHeader>
      <CardContent>
        {address && (
          <p className="text-sm text-muted-foreground mb-4">{address}</p>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:bg-red-800 rounded-lg p-3 mb-4">
            <p className="text-sm text-red-800 dark:text-red-300">⚠️ {error}</p>
          </div>
        )}

        <div className="relative rounded-lg overflow-hidden">
          <div
            key={mapId}
            id={mapId}
            ref={mapContainerRef}
            className="w-full h-96 rounded-lg border border-border bg-gray-200 dark:bg-gray-700"
            style={{
              minHeight: "384px",
              position: "relative",
              overflow: "hidden",
            }}
          />

          {!mapLoaded && !error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
              <p className="text-muted-foreground">Đang tải bản đồ...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
              <p className="text-red-500">Không thể tải bản đồ</p>
            </div>
          )}
        </div>

        <div className="mt-3 text-xs text-muted-foreground">
          <span className="font-mono">
            {latitude.toFixed(6)}, {longitude.toFixed(6)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
