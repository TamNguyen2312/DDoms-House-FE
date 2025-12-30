import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function SiteHeader({ className }: { className?: string }) {
  return (
    <div className="bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 mb-6 w-full border-b backdrop-blur">
      <header
        className={cn(
          "container mx-auto px-4 [--header-height:calc(theme(spacing.16))]",
          className
        )}
      >
        <div className="flex h-[--header-height] items-center justify-between">
          <div className="flex items-center gap-1">
            {/* Utility Buttons */}
            <div className="flex h-8 items-center gap-2">
              <Separator orientation="vertical" className="hidden md:block" />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
