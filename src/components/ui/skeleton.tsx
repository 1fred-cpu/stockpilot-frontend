import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 dark:bg-gradient-to-r dark:from-neutral-700 dark:via-neutral-800 dark:to-neutral-700 animate-pulse rounded-md",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
