import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] px-4">
      {/* Error message card */}
      <Card className="max-w-md w-full shadow ">
        <CardContent className="p-6 flex flex-col items-center text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Product not found</h2>
          <p className="text-sm text-muted-foreground mb-6">
            We couldn’t find the product you’re looking for. It might have been
            removed or is temporarily unavailable.
          </p>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.history.back()}>
              Go Back
            </Button>
            <Button asChild>
              <Link href={`/dashboard/products`}>View Products</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
