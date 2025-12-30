import { Component, type ErrorInfo, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}
export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="flex justify-center">
              <div className="rounded-full bg-destructive/10 p-6">
                <AlertTriangle className="h-16 w-16 text-destructive" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Đã xảy ra lỗi</h1>
              <p className="text-muted-foreground">
                Ứng dụng gặp lỗi không mong muốn. Vui lòng thử lại.
              </p>
              {this.state.error && (
                <details className="text-sm text-left mt-4">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Chi tiết lỗi
                  </summary>
                  <pre className="mt-2 p-4 bg-muted rounded-md overflow-auto">
                    {this.state.error.toString()}
                  </pre>
                </details>
              )}
            </div>

            <Button onClick={this.handleReset}>Về trang chủ</Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
