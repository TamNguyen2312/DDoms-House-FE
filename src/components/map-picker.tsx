import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import type { PropertyCreate } from "@/schemas";
import { MapPin, Search, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

// Map Tiles Key dùng cho hiển thị bản đồ
// Nếu không có VITE_GOONG_MAP_TILES, thử dùng REST API Key (một số REST API Key cũng có thể dùng cho tiles)
const GOONG_MAP_TILES_KEY =
  import.meta.env.VITE_GOONG_MAP_TILES ||
  import.meta.env.VITE_GOONG_REST_API ||
  "rTWBUH9ZAn98UxInc79ouAyV1sEonDDTSJAujxBa";
// REST API Key dùng cho Place API và Geocoding API
const GOONG_REST_API_KEY =
  import.meta.env.VITE_GOONG_REST_API ||
  "A0ridgbDnWvQtdKfxFdpz6k3AwncmcKPVuHgObre";

// Declare Goong types
declare global {
  interface Window {
    goongjs: any;
  }
}

interface GeocodingResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

export default function MapPicker() {
  const { control, setValue, watch } = useFormContext<PropertyCreate>();
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [autoSelectFirst, setAutoSelectFirst] = useState(false);
  const [apiKeyUnauthorized, setApiKeyUnauthorized] = useState(false);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerInstanceRef = useRef<any>(null);

  // Tạo unique map ID cho mỗi instance - sử dụng useState để tạo mới mỗi lần component mount
  const [mapId] = useState(
    () => `map-picker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  );

  // Reset mapLoaded khi component mount để đảm bảo map được tạo lại
  useEffect(() => {
    console.log("MapPicker mounting, mapId:", mapId);
    // Reset mapLoaded để trigger map initialization
    setMapLoaded(false);
    // Cleanup refs
    mapInstanceRef.current = null;
    markerInstanceRef.current = null;

    return () => {
      console.log("MapPicker unmounting, cleaning up...");
      // Clear search timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      // Remove marker
      if (markerInstanceRef.current) {
        try {
          markerInstanceRef.current.remove();
        } catch (err) {
          console.error("Error removing marker on unmount:", err);
        }
        markerInstanceRef.current = null;
      }
      // Remove map
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (err) {
          console.error("Error removing map on unmount:", err);
        }
        mapInstanceRef.current = null;
      }
      // Reset states
      setMap(null);
      setMarker(null);
      setMapLoaded(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapId]);

  // Watch latitude và longitude từ form
  const latitude = watch("latitude");
  const longitude = watch("longitude");

  // Debug: Log API keys
  useEffect(() => {
    console.log(
      "GOONG_MAP_TILES_KEY:",
      GOONG_MAP_TILES_KEY ? "✓ Set" : "✗ Missing"
    );
    console.log(
      "GOONG_REST_API_KEY:",
      GOONG_REST_API_KEY ? "✓ Set" : "✗ Missing"
    );
    if (!GOONG_MAP_TILES_KEY) {
      setError("Thiếu GOONG_MAP_TILES_KEY hoặc VITE_GOONG_MAP trong file .env");
    }
    if (!GOONG_REST_API_KEY) {
      setError("Thiếu GOONG_REST_API_KEY hoặc VITE_GOONG_MAP trong file .env");
    }
  }, []);

  // Load Goong Maps từ CDN
  useEffect(() => {
    // Kiểm tra nếu đã load rồi thì không load lại
    if (window.goongjs) {
      console.log("Goong Maps đã được load");
      setMapLoaded(true);
      return;
    }

    console.log("Đang load Goong Maps từ CDN...");

    // Load CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.css";
    document.head.appendChild(link);

    // Load JS
    const script = document.createElement("script");
    script.src =
      "https://cdn.jsdelivr.net/npm/@goongmaps/goong-js@1.0.9/dist/goong-js.js";
    script.onload = () => {
      console.log("Goong Maps script loaded successfully");
      setMapLoaded(true);
    };
    script.onerror = () => {
      console.error("Failed to load Goong Maps script");
      setError("Không thể tải Goong Maps");
    };
    document.head.appendChild(script);

    return () => {
      if (link.parentNode) link.parentNode.removeChild(link);
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  // Khởi tạo map - chỉ chạy một lần khi mapLoaded = true
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

    // Đảm bảo container element đã được render và có đúng ID
    const container = mapContainerRef.current;
    const containerById = document.getElementById(mapId);

    if (!container || !containerById) {
      // Retry với requestAnimationFrame để đảm bảo DOM đã render
      const retryId = requestAnimationFrame(() => {
        const retryContainer = mapContainerRef.current;
        const retryContainerById = document.getElementById(mapId);
        if (retryContainer && retryContainerById) {
          // Trigger lại effect bằng cách set mapLoaded
          setMapLoaded(true);
        } else {
          // Nếu vẫn chưa có, thử lại sau 200ms
          setTimeout(() => {
            setMapLoaded(true);
          }, 200);
        }
      });
      return () => cancelAnimationFrame(retryId);
    }

    // Đảm bảo container có đúng ID
    if (container.id !== mapId) {
      container.id = mapId;
    }

    // Cleanup map và marker cũ trước khi khởi tạo lại
    if (markerInstanceRef.current) {
      try {
        markerInstanceRef.current.remove();
      } catch (err) {
        console.error("Error removing old marker before init:", err);
      }
      markerInstanceRef.current = null;
      setMarker(null);
    }
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch (err) {
        console.error("Error removing old map before init:", err);
      }
      mapInstanceRef.current = null;
      setMap(null);
    }

    console.log("Khởi tạo map với ID:", mapId);

    const defaultLat =
      latitude && !isNaN(Number(latitude))
        ? Number(latitude)
        : 10.796427317494299;
    const defaultLng =
      longitude && !isNaN(Number(longitude))
        ? Number(longitude)
        : 106.72639460578407;

    let checkInterval: ReturnType<typeof setInterval> | null = null;
    let ensureMarkerTimeout: ReturnType<typeof setTimeout> | null = null;

    try {
      // Khởi tạo Goong Map - dùng Map Tiles Key
      window.goongjs.accessToken = GOONG_MAP_TILES_KEY;

      // Đảm bảo container có kích thước
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        container.style.width = "100%";
        container.style.height = "384px";
        container.style.minHeight = "384px";
      }

      const mapInstance = new window.goongjs.Map({
        container: mapId,
        style: "https://tiles.goong.io/assets/goong_map_web.json",
        center: [defaultLng, defaultLat], // Goong dùng [lng, lat]
        zoom: 15,
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
          // Thêm marker mặc định
          const markerInstance = new window.goongjs.Marker({
            draggable: true,
          })
            .setLngLat([defaultLng, defaultLat])
            .addTo(mapInstance);

          // Xử lý kéo marker
          markerInstance.on("dragend", function () {
            const lngLat = markerInstance.getLngLat();
            console.log("Marker dragged to:", lngLat);
            // Convert to number
            setValue("latitude", Number(lngLat.lat.toFixed(6)), {
              shouldValidate: true,
            });
            setValue("longitude", Number(lngLat.lng.toFixed(6)), {
              shouldValidate: true,
            });
          });

          markerInstanceRef.current = markerInstance;
          setMarker(markerInstance);
          console.log("Marker created successfully");
        } catch (err) {
          console.error("Error creating marker:", err);
        }
      };

      // Tạo marker trong event "load" - đảm bảo map đã sẵn sàng
      const onMapLoad = () => {
        console.log("Map loaded successfully");
        if (checkInterval) {
          clearInterval(checkInterval);
          checkInterval = null;
        }
        // Đợi một frame để đảm bảo map đã render xong
        requestAnimationFrame(() => {
          createMarker();
        });
      };

      // Kiểm tra nếu map đã loaded sẵn
      if (mapInstance.loaded()) {
        console.log("Map already loaded, creating marker immediately");
        // Đợi một frame để đảm bảo map đã render xong
        requestAnimationFrame(() => {
          createMarker();
        });
      } else {
        // Tạo marker trong event "load"
        mapInstance.on("load", onMapLoad);
      }

      // Fallback: Nếu map chưa loaded, kiểm tra nhiều lần với interval
      let checkCount = 0;
      const maxChecks = 20; // Tăng lên 20 lần (10 giây) để đảm bảo marker được tạo
      checkInterval = setInterval(() => {
        checkCount++;
        // Kiểm tra nếu map đã loaded và chưa có marker
        if (mapInstance.loaded() && !markerInstanceRef.current) {
          console.log(
            "Map loaded, creating marker now (attempt",
            checkCount,
            ")"
          );
          createMarker();
          if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
          }
        } else if (checkCount >= maxChecks) {
          // Nếu đã check đủ lần mà vẫn chưa có marker, thử tạo lại
          if (!markerInstanceRef.current) {
            console.warn(
              "Map marker creation timeout after",
              maxChecks,
              "attempts, forcing marker creation"
            );
            createMarker();
          }
          if (checkInterval) {
            clearInterval(checkInterval);
            checkInterval = null;
          }
        }
      }, 500); // Kiểm tra mỗi 500ms

      mapInstance.on("error", function (e: any) {
        console.error("Map error:", e);
        // Kiểm tra loại lỗi
        if (
          e.error &&
          e.error.message &&
          e.error.message.includes("Failed to fetch")
        ) {
          setError(
            "Map Tiles Key không hợp lệ hoặc không có quyền truy cập tiles. Vui lòng kiểm tra lại VITE_GOONG_MAP_TILES trong file .env"
          );
        } else {
          setError(
            "Lỗi khởi tạo bản đồ: " +
              (e.error?.message || e.message || "Unknown error")
          );
        }
      });

      // Xử lý double click trên map
      mapInstance.on("dblclick", function (e: any) {
        if (markerInstanceRef.current) {
          console.log("Map double clicked at:", e.lngLat);
          markerInstanceRef.current.setLngLat([e.lngLat.lng, e.lngLat.lat]);
          // Convert to number
          setValue("latitude", Number(e.lngLat.lat.toFixed(6)), {
            shouldValidate: true,
          });
          setValue("longitude", Number(e.lngLat.lng.toFixed(6)), {
            shouldValidate: true,
          });
        } else {
          // Nếu chưa có marker, tạo mới
          try {
            const markerInstance = new window.goongjs.Marker({
              draggable: true,
            })
              .setLngLat([e.lngLat.lng, e.lngLat.lat])
              .addTo(mapInstance);

            markerInstance.on("dragend", function () {
              const lngLat = markerInstance.getLngLat();
              setValue("latitude", Number(lngLat.lat.toFixed(6)), {
                shouldValidate: true,
              });
              setValue("longitude", Number(lngLat.lng.toFixed(6)), {
                shouldValidate: true,
              });
            });

            markerInstanceRef.current = markerInstance;
            setMarker(markerInstance);
          } catch (err) {
            console.error("Error creating marker on double click:", err);
          }
        }
      });

      mapInstanceRef.current = mapInstance;
      setMap(mapInstance);
      console.log("Map instance created");

      // Thêm một setTimeout để đảm bảo marker được tạo sau khi map được render
      // Sử dụng requestAnimationFrame để đảm bảo DOM đã render
      ensureMarkerTimeout = setTimeout(() => {
        requestAnimationFrame(() => {
          if (mapInstance.loaded() && !markerInstanceRef.current) {
            console.log("Map loaded, creating marker via setTimeout fallback");
            createMarker();
          }
        });
      }, 1000);
    } catch (err) {
      console.error("Error creating map:", err);
      setError("Không thể tạo bản đồ: " + (err as Error).message);
    }

    // Cleanup function - chạy khi component unmount hoặc dependencies thay đổi
    return () => {
      // Clear timeout nếu có
      if (ensureMarkerTimeout) {
        clearTimeout(ensureMarkerTimeout);
        ensureMarkerTimeout = null;
      }
      // Clear interval nếu có
      if (checkInterval) {
        clearInterval(checkInterval);
        checkInterval = null;
      }
      // Cleanup khi component unmount
      if (markerInstanceRef.current) {
        try {
          markerInstanceRef.current.remove();
        } catch (err) {
          console.error("Error removing marker on unmount:", err);
        }
        markerInstanceRef.current = null;
        setMarker(null);
      }
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (err) {
          console.error("Error removing map on unmount:", err);
        }
        mapInstanceRef.current = null;
        setMap(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapLoaded, mapId]);

  // useEffect riêng để đảm bảo marker được tạo khi map instance đã sẵn sàng
  // Chạy mỗi khi map state thay đổi hoặc component mount lại
  useEffect(() => {
    if (!map || !mapInstanceRef.current) return;

    const checkAndCreateMarker = () => {
      // Kiểm tra nếu map đã loaded và chưa có marker
      if (
        mapInstanceRef.current &&
        mapInstanceRef.current.loaded() &&
        !markerInstanceRef.current
      ) {
        const defaultLat =
          latitude && !isNaN(Number(latitude))
            ? Number(latitude)
            : 10.796427317494299;
        const defaultLng =
          longitude && !isNaN(Number(longitude))
            ? Number(longitude)
            : 106.72639460578407;

        try {
          console.log("Creating marker via useEffect fallback");
          const markerInstance = new window.goongjs.Marker({
            draggable: true,
          })
            .setLngLat([defaultLng, defaultLat])
            .addTo(mapInstanceRef.current);

          markerInstance.on("dragend", function () {
            const lngLat = markerInstance.getLngLat();
            setValue("latitude", Number(lngLat.lat.toFixed(6)), {
              shouldValidate: true,
            });
            setValue("longitude", Number(lngLat.lng.toFixed(6)), {
              shouldValidate: true,
            });
          });

          markerInstanceRef.current = markerInstance;
          setMarker(markerInstance);
          console.log("Marker created successfully via useEffect");
        } catch (err) {
          console.error("Error creating marker in useEffect:", err);
        }
      }
    };

    // Thử tạo marker ngay lập tức
    checkAndCreateMarker();

    // Nếu map chưa loaded, kiểm tra nhiều lần
    let checkCount = 0;
    const maxChecks = 30; // Tăng lên 30 lần (15 giây)
    const checkInterval = setInterval(() => {
      checkCount++;
      checkAndCreateMarker();

      // Dừng nếu đã có marker hoặc đã check đủ lần
      if (markerInstanceRef.current || checkCount >= maxChecks) {
        clearInterval(checkInterval);
      }
    }, 500);

    return () => {
      clearInterval(checkInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, mapId]);

  // Cập nhật marker khi nhập tọa độ thủ công
  useEffect(() => {
    if (!markerInstanceRef.current || !mapInstanceRef.current) return;

    const lat =
      typeof latitude === "number" ? latitude : parseFloat(String(latitude));
    const lng =
      typeof longitude === "number" ? longitude : parseFloat(String(longitude));

    if (!isNaN(lat) && !isNaN(lng)) {
      console.log("Updating marker to:", lat, lng);
      markerInstanceRef.current.setLngLat([lng, lat]);
      mapInstanceRef.current.flyTo({ center: [lng, lat], zoom: 15 });
    }
  }, [latitude, longitude]);

  // Tìm kiếm địa chỉ với Goong Geocoding API
  const searchAddress = useCallback(async (query: string) => {
    if (!query.trim() || !GOONG_REST_API_KEY) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Nếu đã biết API key không có quyền, không gọi API nữa
    if (apiKeyUnauthorized) {
      return;
    }

    setIsSearching(true);
    try {
      const url = `https://rsapi.goong.io/Place/AutoComplete?api_key=${GOONG_REST_API_KEY}&input=${encodeURIComponent(
        query
      )}&limit=5`;
      // console.log("Fetching from URL:", url.replace(GOONG_API_KEY || "", "***"));

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: { code: "UNKNOWN", message: errorText } };
        }

        console.error("API Error Response:", response.status, errorData);

        if (response.status === 403) {
          setApiKeyUnauthorized(true);
          setError(
            "API Key không có quyền truy cập Place API. Vui lòng sử dụng REST API Key thay vì Map Tiles Key."
          );
          // Không throw error để tránh spam trong console
          return;
        } else {
          setError(
            `Lỗi API: ${response.status} - ${
              errorData.error?.message || errorText
            }`
          );
        }
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Goong AutoComplete response:", data);

      if (data.predictions && Array.isArray(data.predictions)) {
        // Lấy chi tiết cho mỗi prediction để có tọa độ
        const resultsWithGeometry = await Promise.all(
          data.predictions.slice(0, 5).map(async (prediction: any) => {
            try {
              const detailResponse = await fetch(
                `https://rsapi.goong.io/Place/Detail?place_id=${prediction.place_id}&api_key=${GOONG_REST_API_KEY}`
              );
              if (detailResponse.ok) {
                const detailData = await detailResponse.json();
                console.log("Place Detail response:", detailData);

                // Goong API trả về geometry trong result.geometry.location
                const geometry = detailData.result?.geometry;
                return {
                  place_id: prediction.place_id,
                  description: prediction.description,
                  structured_formatting: prediction.structured_formatting || {
                    main_text: prediction.description,
                    secondary_text: "",
                  },
                  geometry: geometry
                    ? {
                        location: {
                          lat: geometry.location?.lat || geometry.lat,
                          lng: geometry.location?.lng || geometry.lng,
                        },
                      }
                    : null,
                };
              }
              return {
                place_id: prediction.place_id,
                description: prediction.description,
                structured_formatting: prediction.structured_formatting || {
                  main_text: prediction.description,
                  secondary_text: "",
                },
                geometry: null,
              };
            } catch (err) {
              console.error("Error fetching place detail:", err);
              return {
                place_id: prediction.place_id,
                description: prediction.description,
                structured_formatting: prediction.structured_formatting || {
                  main_text: prediction.description,
                  secondary_text: "",
                },
                geometry: null,
              };
            }
          })
        );
        setSearchResults(resultsWithGeometry);
        setShowResults(true);
      } else {
        console.warn("No predictions in response:", data);
        setSearchResults([]);
        setShowResults(false);
      }
    } catch (err) {
      console.error("Error searching address:", err);
      setSearchResults([]);
      setShowResults(false);

      // Hiển thị thông báo lỗi cho người dùng
      if (err instanceof Error && err.message.includes("403")) {
        // Lỗi đã được xử lý ở trên với thông báo chi tiết
      } else {
        setError("Không thể tìm kiếm địa chỉ. Vui lòng thử lại sau.");
      }
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Debounce search - đợi 2 giây sau khi người dùng ngừng nhập
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Nếu đang auto-select, không debounce
    if (autoSelectFirst) {
      return;
    }

    searchTimeoutRef.current = setTimeout(() => {
      if (searchQuery.trim()) {
        searchAddress(searchQuery);
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 2000); // Debounce 2 giây - chỉ gợi ý sau khi người dùng ngừng nhập 2 giây

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, searchAddress, autoSelectFirst]);

  // Xử lý chọn địa chỉ từ kết quả tìm kiếm
  const handleSelectAddress = useCallback(
    async (result: GeocodingResult) => {
      // Đóng dropdown ngay lập tức
      setShowResults(false);
      setSearchResults([]);
      setSearchQuery(result.description);

      let finalLat: number | null = null;
      let finalLng: number | null = null;

      if (result.geometry?.location) {
        finalLat = result.geometry.location.lat;
        finalLng = result.geometry.location.lng;
      } else {
        // Nếu không có geometry, gọi API để lấy chi tiết
        try {
          const detailResponse = await fetch(
            `https://rsapi.goong.io/Place/Detail?place_id=${result.place_id}&api_key=${GOONG_REST_API_KEY}`
          );
          if (detailResponse.ok) {
            const detailData = await detailResponse.json();
            if (detailData.result?.geometry?.location) {
              finalLat = detailData.result.geometry.location.lat;
              finalLng = detailData.result.geometry.location.lng;
            }
          }
        } catch (err) {
          console.error("Error getting place details:", err);
        }
      }

      // Cập nhật form và bản đồ
      if (finalLat !== null && finalLng !== null) {
        setValue("latitude", Number(finalLat.toFixed(6)), {
          shouldValidate: true,
        });
        setValue("longitude", Number(finalLng.toFixed(6)), {
          shouldValidate: true,
        });

        // Cập nhật marker và zoom ngay lập tức
        if (markerInstanceRef.current && mapInstanceRef.current) {
          console.log("Updating map to:", finalLat, finalLng);
          markerInstanceRef.current.setLngLat([finalLng!, finalLat!]);
          // Zoom với animation mượt mà
          mapInstanceRef.current.flyTo({
            center: [finalLng!, finalLat!],
            zoom: 16, // Tăng zoom lên 16 để rõ hơn
            duration: 1000, // Animation 1 giây
          });
        } else {
          // Nếu map/marker chưa sẵn sàng, đợi một chút
          console.warn("Map or marker not ready, waiting...");
          const checkInterval = setInterval(() => {
            if (markerInstanceRef.current && mapInstanceRef.current) {
              console.log("Map ready, updating now");
              markerInstanceRef.current.setLngLat([finalLng!, finalLat!]);
              mapInstanceRef.current.flyTo({
                center: [finalLng!, finalLat!],
                zoom: 16,
                duration: 1000,
              });
              clearInterval(checkInterval);
            }
          }, 100);

          // Timeout sau 5 giây
          setTimeout(() => {
            clearInterval(checkInterval);
          }, 5000);
        }
      }
    },
    [marker, map, setValue]
  );

  // Tự động chọn kết quả đầu tiên khi có autoSelectFirst flag
  useEffect(() => {
    if (autoSelectFirst && searchResults.length > 0 && !isSearching) {
      const firstResult = searchResults[0];
      console.log(
        "Auto-selecting first result:",
        firstResult,
        "Has geometry:",
        !!firstResult.geometry
      );
      // Reset flag trước khi gọi để tránh loop
      setAutoSelectFirst(false);
      // Gọi ngay lập tức
      handleSelectAddress(firstResult);
    }
  }, [autoSelectFirst, searchResults, isSearching, handleSelectAddress]);

  // Đóng kết quả tìm kiếm khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Chọn Vị Trí Trên Bản Đồ
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <p className="text-sm text-red-800 dark:text-red-300 font-medium mb-2">
              ⚠️ {error}
            </p>
            {apiKeyUnauthorized && (
              <div className="text-xs text-red-700 dark:text-red-400 mt-2 space-y-1">
                <p className="font-medium">Hướng dẫn khắc phục:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    Bạn cần cấu hình <strong>2 loại API Key</strong> trong file{" "}
                    <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">
                      .env
                    </code>
                    :
                  </li>
                  <li className="ml-4">
                    •{" "}
                    <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">
                      VITE_GOONG_MAP_TILES
                    </code>
                    : Map Tiles Key (cho hiển thị bản đồ)
                  </li>
                  <li className="ml-4">
                    •{" "}
                    <code className="bg-red-100 dark:bg-red-900/30 px-1 rounded">
                      VITE_GOONG_REST_API
                    </code>
                    : REST API Key (cho tìm kiếm địa chỉ)
                  </li>
                  <li>
                    Truy cập{" "}
                    <a
                      href="https://account.goong.io/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-medium"
                    >
                      Goong Account
                    </a>{" "}
                    để tạo cả 2 loại key
                  </li>
                  <li>
                    Nếu chỉ có 1 key, có thể dùng chung cho cả 2 biến (nhưng
                    REST API Key thường không hiển thị được map)
                  </li>
                  <li>
                    Đảm bảo REST API Key có quyền truy cập{" "}
                    <strong>Place API</strong> và <strong>Geocoding API</strong>
                  </li>
                </ul>
                <p className="mt-2 text-xs italic">
                  💡 Trong khi chờ cập nhật API key, bạn vẫn có thể click vào
                  bản đồ hoặc kéo marker để chọn vị trí.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Search Box */}
        <div className="relative" ref={searchContainerRef}>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Tìm kiếm địa chỉ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={async (e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    e.stopPropagation();
                    if (searchQuery.trim()) {
                      // Clear timeout và search ngay với auto-select
                      if (searchTimeoutRef.current) {
                        clearTimeout(searchTimeoutRef.current);
                      }
                      console.log("Enter pressed, query:", searchQuery);
                      setAutoSelectFirst(true);
                      await searchAddress(searchQuery);
                      // useEffect sẽ tự động xử lý auto-select khi searchResults thay đổi
                    }
                  }
                }}
                onFocus={() => {
                  // Khi focus, nếu có kết quả thì hiển thị, nếu có text thì search
                  if (searchResults.length > 0) {
                    setShowResults(true);
                  } else if (searchQuery.trim() && !apiKeyUnauthorized) {
                    // Nếu có text nhưng chưa có kết quả và API key hợp lệ, search ngay
                    if (searchTimeoutRef.current) {
                      clearTimeout(searchTimeoutRef.current);
                    }
                    searchAddress(searchQuery);
                  }
                }}
                disabled={apiKeyUnauthorized}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setSearchResults([]);
                    setShowResults(false);
                  }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button
              type="button"
              onClick={async () => {
                if (searchQuery.trim() && !apiKeyUnauthorized) {
                  // Clear timeout và search ngay với auto-select
                  if (searchTimeoutRef.current) {
                    clearTimeout(searchTimeoutRef.current);
                  }
                  console.log("Search button clicked, query:", searchQuery);
                  setAutoSelectFirst(true);
                  await searchAddress(searchQuery);
                  // useEffect sẽ tự động xử lý auto-select khi searchResults thay đổi
                }
              }}
              disabled={
                !searchQuery.trim() || isSearching || apiKeyUnauthorized
              }
              className="shrink-0"
            >
              <Search className="w-4 h-4 mr-2" />
              Tìm kiếm
            </Button>
          </div>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && !isSearching && (
            <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {isSearching && (
                <div className="p-3 text-sm text-muted-foreground text-center">
                  Đang tìm kiếm...
                </div>
              )}
              {!isSearching &&
                searchResults.map((result, index) => (
                  <button
                    key={result.place_id}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Đóng dropdown ngay lập tức trước khi xử lý
                      setShowResults(false);
                      handleSelectAddress(result);
                    }}
                    className="w-full text-left p-3 hover:bg-accent border-b border-border last:border-b-0 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {result.structured_formatting?.main_text ||
                            result.description}
                        </div>
                        {result.structured_formatting?.secondary_text && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {result.structured_formatting.secondary_text}
                          </div>
                        )}
                      </div>
                      {index === 0 && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                          Đề xuất
                        </span>
                      )}
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>

        {/* Hidden latitude/longitude fields for form validation */}
        <FormField
          control={control}
          name="latitude"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <input type="hidden" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="longitude"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <input type="hidden" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Map */}
        <div className="relative">
          <div
            key={mapId}
            ref={mapContainerRef}
            id={mapId}
            className="w-full h-96 rounded-lg border border-border overflow-hidden bg-gray-200 dark:bg-gray-700"
            style={{ minHeight: "384px" }}
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

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-1">
            💡 Hướng dẫn sử dụng:
          </p>
          <ul className="text-sm text-blue-700 dark:text-blue-400 space-y-1 ml-4">
            <li>• Nhập địa chỉ vào ô tìm kiếm để tự động định vị</li>
            <li>• Double click vào bản đồ để đặt marker</li>
            <li>• Kéo marker để điều chỉnh vị trí</li>
            <li>• Cuộn chuột để zoom, kéo để di chuyển bản đồ</li>
          </ul>
        </div>

        {latitude && longitude && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <p className="text-sm text-green-800 dark:text-green-300">
              ✓ Vị trí đã chọn:{" "}
              <span className="font-mono">
                {(typeof latitude === "number"
                  ? latitude
                  : parseFloat(String(latitude))
                ).toFixed(6)}
                ,{" "}
                {(typeof longitude === "number"
                  ? longitude
                  : parseFloat(String(longitude))
                ).toFixed(6)}
              </span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
