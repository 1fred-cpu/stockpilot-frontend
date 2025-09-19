import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ProductDetailsSkeleton() {
  return (
    <div className="space-y-6 p-6">
      {/* Page Header */}
      <div>
        <Skeleton className="h-8 w-56 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* General Info */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-40" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" /> {/* Product Name */}
          <Skeleton className="h-10 w-1/2" /> {/* Brand */}
          <Skeleton className="h-24 w-full" /> {/* Description */}
          <Skeleton className="h-40 w-40" /> {/* Thumbnail */}
        </CardContent>
      </Card>

      {/* Tags & Attributes */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
          <Skeleton className="h-10 w-full" /> {/* Attribute field */}
        </CardContent>
      </Card>

      {/* Variants */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-36" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="space-y-3 border-b pb-4 last:border-b-0">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12" /> {/* Variant Image */}
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-28" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Save Bar */}
      <div className="sticky bottom-0 border-t bg-white dark:bg-background p-4 flex justify-end gap-3">
        <Skeleton className="h-10 w-24" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  );
}
