// src/App.tsx
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import "./App.css";
import { ErrorBoundary } from "./components/common/error-boundary";
import { router } from "./routes";
import { initializeStore } from "./store";
function App() {
  useEffect(() => {
    // Initialize store on app mount
    initializeStore();
  }, []);

  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors closeButton />
    </ErrorBoundary>
  );
}

export default App;
