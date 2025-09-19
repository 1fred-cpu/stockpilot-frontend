import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import React from "react";

export default function NotifyPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-gray-200">
      <Card className="w-full max-w-120 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-lg">
            Account Verification
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center text-gray-700 leading-relaxed">
          Thank you for signing up! To complete your account setup and ensure
          the security of your information, we have sent a verification link to
          your email address. Please check your inbox and click on the link to
          verify your account.
        </CardContent>
      </Card>
    </main>
  );
}
