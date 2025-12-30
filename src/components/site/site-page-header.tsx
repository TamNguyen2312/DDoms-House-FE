import { cn } from "@/lib/utils";

function SitePageHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <section
      className={cn(
        "border-grid border-b border-dashed pb-2 md:mb-3 md:pb-3 lg:mb-4 lg:pb-4",
        className
      )}
      {...props}
    >
      <div className="container-wrapper">
        <div className="flex flex-col items-start gap-1 ">{children}</div>
      </div>
    </section>
  );
}

function SitePageHeaderHeading({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h1
      className={cn(
        "text-lg sm:text-xl md:text-2xl font-bold leading-tight tracking-tighter lg:leading-[1.1]",
        className
      )}
      {...props}
    />
  );
}

function SitePageHeaderDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-foreground max-w-4xl text-balance text-sm sm:text-base font-light",
        className
      )}
      {...props}
    />
  );
}

function SitePageActions({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex w-full justify-end gap-2 pt-2", className)}
      {...props}
    />
  );
}

export {
  SitePageActions,
  SitePageHeader,
  SitePageHeaderDescription,
  SitePageHeaderHeading,
};
