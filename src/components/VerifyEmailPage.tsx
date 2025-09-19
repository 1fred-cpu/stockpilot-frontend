"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "../../utils/supabase";
import useStore from "../../utils/zustand";
import { toast } from "sonner";
import { redirect } from "next/navigation";

const step = window.localStorage.getItem("step");

switch (step) {
  case "VERIFY":
    break;
  case "REGISTER_BUSINESS":
    redirect("/business/register");
  default:
    redirect("/auth/signin");
}

export default function VerifyEmailPage() {
  window.localStorage.setItem("step", "REGISTER_BUSINESS");
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const { appStore } = useStore();
  const userEmail = appStore.user?.email;

  const handleResend = async () => {
    try {
      setResending(true);
      setMessage("");
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: userEmail as string,
        options: { emailRedirectTo: "http://localhost:3000/business/register" },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setMessage(
        "Verification email has been resent. Please check your inbox."
      );
    } catch (error: any) {
      setMessage("Failed to resend email. Try again later.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <Card className="w-full max-w-md shadow-lg border ">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="bg-blue-100 p-3 rounded-full">
              <Mail className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-xl font-semibold">
            Verify your email
          </CardTitle>
          <p className="text-sm text-gray-500">
            We’ve sent a verification link to your email address. Please check
            your inbox and click the link to continue.
          </p>
        </CardHeader>

        <Separator />

        <CardContent className="space-y-4 text-center">
          {message && (
            <p className="text-sm text-gray-600 bg-gray-100 p-2 rounded-md">
              {message}
            </p>
          )}

          <Button
            onClick={handleResend}
            className="w-full"
            disabled={resending}
          >
            {resending ? "Resending..." : "Resend Verification Email"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
