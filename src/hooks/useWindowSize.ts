import { useEffect, useState } from "react";

export function useWindowSize() {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    // Chỉ chạy ở client
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setSize({ width: window.innerWidth, height: window.innerHeight });
    };

    // Gọi 1 lần khi mount
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return size;
}
