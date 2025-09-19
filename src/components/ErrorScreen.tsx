import React from "react";
import { Card, CardContent } from "./ui/card";
import { AlertCircle } from "lucide-react";
import { Button } from "./ui/button";

type ErrorProps = {
  handleRetry: () => void;
  height?: string | number;
};
export default function ErrorScreen({ handleRetry, height }: ErrorProps) {
  return (
    <div className={`w-full ${height ? height : "h-auto"} flex `}>
      <Card className="w-full flex-1">
        <CardContent className="flex-1 flex flex-col items-center justify-center text-center p-8">
          {/* Error Icon */}
          <div className="mb-4 bg-red-50 dark:bg-neutral-800 p-3 rounded-full">
            <AlertCircle className="w-6 h-6 lg:w-8 lg:h-8 text-red-500" />
          </div>

          {/* Error Title */}
          <h2 className="text-red-700 dark:text-red-500 text-lg lg:text-xl font-semibold mb-2">
            Oops! Something went wrong
          </h2>

          {/* Error Message */}
          <p className="text-gray-600 dark:text-gray-300 text-sm lg:text-base mb-6">
            We couldn’t fetch the data. Please check your connection or try
            again.
          </p>

          {/* Retry Button */}
          <Button
            variant="destructive"
            className="font-medium  text-white"
            onClick={handleRetry}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
