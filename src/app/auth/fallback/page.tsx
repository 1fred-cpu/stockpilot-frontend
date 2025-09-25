"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../../utils/supabase";
import { Loader2, AlertCircle } from "lucide-react";
import axios from "axios";
import axiosInstance from "../../../../utils/axiosInstance";
import useStore from "../../../../utils/zustand";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ClipLoader } from "react-spinners";
import { email } from "zod";

export default function AuthCallback() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "error">("loading");
  const [message, setMessage] = useState("Signing you in...");
  const { setAppStore } = useStore();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // 1. Get current session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error || !session?.access_token) {
          throw new Error("No valid session found");
        }

        // 2. Get user details
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          throw new Error("No user details found");
        }

        // 3. Send token + user profile to backend
        const res = await axiosInstance.post("/auth/google", {
          email: user.email,
          name: user.user_metadata?.full_name || user.user_metadata?.name,
          //   avatar_url: user.user_metadata?.avatar_url,
        });

        const result = res.data;

        // 4. Redirect based on nextStep
        if (result.nextStep === "REGISTER_BUSINESS") {
          setAppStore({
            user: {
              id: result.user.id,
              email: result.user.email,
              role: result.user.role,
              name: result.user.name,
              businessId: result.user.business_id,
            },
            activeStore: result.activeStore,
          });
          router.replace("/business/register/");
        } else if (result.nextStep === "COMPLETED") {
          setAppStore({
            user: {
              id: result.data.user.id,
              email: result.data.user.email,
              role: result.data.user.role,
              name: result.data.user.name,
              businessId: result.data.user.business_id,
            },
            stores: result.data.stores,
            activeStore: result.data.activeStore,
          });
          router.replace("/dashboard/overview");
        }
      } catch (err: any) {
        setStatus("error");

        if (axios.isAxiosError(err)) {
          setMessage(err.response?.data?.message || "Login failed");
        } else {
          setMessage(err.message || "Something went wrong");
        }
      }
    };

    handleAuth();
  }, [router, supabase]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Card className="bg-white shadow-lg  p-8 max-w-sm w-full text-center">
        {status === "loading" ? (
          <CardContent>
            <ClipLoader size={18} color="#6122f4" />
            <h1 className="mt-4 text-lg font-medium text-gray-900">
              {message}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Please wait while we connect your Google account...
            </p>
          </CardContent>
        ) : (
          <CardContent>
            <AlertCircle className="w-8 h-8 mx-auto text-red-500" />
            <h1 className="mt-4 text-lg font-medium text-gray-900">
              Login failed
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">{message}</p>
            <Button
              onClick={() => router.replace("/auth/signin")}
              className="mt-6 w-full"
            >
              Go back to login
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
