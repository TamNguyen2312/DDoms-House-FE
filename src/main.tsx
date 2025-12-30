import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: 0, // Dữ liệu luôn được coi là stale, không cache
      gcTime: 0, // Không giữ cache (trước đây là cacheTime)
      refetchOnWindowFocus: false,
      refetchOnMount: true, // Luôn refetch khi component mount
      refetchOnReconnect: true, // Refetch khi reconnect
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
);
