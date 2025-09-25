"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ClipLoader } from "react-spinners";
import Link from "next/link";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
} from "firebase/auth";
import { auth, googleProvider } from "../../utils/firebase";
import axiosInstance from "../../utils/axiosInstance";
import useStore from "../../utils/zustand";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { supabase } from "../../utils/supabase";
import Spinner from "./Spinner";

// ✅ Validation schema with Zod
const SignInSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
});

type SignInFormData = z.infer<typeof SignInSchema>;

export default function SignInForm() {
  const { setAppStore } = useStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // ✅ React Hook Form setup
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormData>({
    resolver: zodResolver(SignInSchema),
    mode: "onBlur",
  });

  // 🔹 Email + Password sign in
  async function signInUser(data: SignInFormData) {
    const { email, password } = data;

    try {
      setLoading(true);

      const { data: credentials, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error?.code === "invalid_credentials") {
        toast.error(error.message);
        return;
      } else if (error?.code === "email_not_confirmed") {
        // Send a email verifiation
        const { error: resendError } = await supabase.auth.resend({
          type: "signup",
          email,
          options: {
            emailRedirectTo: "http://localhost:3000/business/register",
          },
        });

        if (resendError) {
          toast.error(resendError.message);
          return;
        }
        // Get users data
        const response = await axiosInstance.post("users/find", { email });
        const data = response.data;
        if (!data) {
          toast.error("No user data provided");
          return;
        }
        // Set user data
        setAppStore({
          user: {
            id: data.id,
            name: data.name,
            email,
            role: data.role,
            businessId: data.user.business_id,
          },
        });

        router.push("/auth/verify");
        return;
      }

      const response = await axiosInstance.post("/auth/users", { email });
      const nextStep = response.data.nextStep;
      const data = response.data;

      // Return users to register business if not registered
      if (nextStep === "REGISTER_BUSINESS") {
        toast.success(data.message);
        setAppStore({
          user: {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            businessId: data.user.business_id,
          },
        });

        router.push("/business/register");
      }
      // Return non admin users who got invite without a business or store to homepage
      else if (nextStep === "WAIT_FOR_ASSIGNMENT") {
        toast.success(data.message);
        setAppStore({
          user: {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            businessId: data.user.business_id,
          },
        });

        router.push("/");
      }
      // Return user to dashboard
      else {
        setAppStore({
          user: {
            id: data.user.id,
            name: data.user.name,
            email: data.user.email,
            role: data.user.role,
            businessId: data.user.business_id,
          },
          stores: data.stores,
          activeStore: data.activeStore,
        });
        router.push("/dashboard/overview");
      }
    } catch (error: any) {
      /** Backend error handle */
      const status = error.response.status;
      if (status === 404) {
        toast.error("Can't find an account with this credentials");
      }
    } finally {
      setLoading(false);
    }
  }

  // 🔹 Google Sign in
  async function signUpWithGoogle() {
    try {
      const { data: user, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: "http://localhost:3000/auth/fallback",
        },
      });

      if (error) {
        toast.error(error.message);
        return;
      }
    } catch (error: any) {
      toast.error("An unexpected error occured");
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">Welcome Back</h1>
        <p className="text-muted-foreground text-sm">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-primary p-0 h-auto">
            Sign up
          </Link>
        </p>
      </div>

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit(signInUser)}>
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            className={`h-11 shadow-none border-gray-200 ${
              errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700">
            Enter your password
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter your password"
            className={`h-11 shadow-none border-gray-200 ${
              errors.password ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
            {...register("password")}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          className="w-full h-11 text-white"
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner /> Sigining in
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-gray-500 text-sm">Or continue with</span>
        <Separator className="flex-1" />
      </div>

      {/* Social Login */}
      <div className="grid grid-cols-1 gap-3">
        <Button
          variant="outline"
          className="flex items-center justify-center gap-2 h-11 border-gray-200 hover:bg-gray-50"
          onClick={signUpWithGoogle}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Continue with Google
        </Button>
      </div>
    </div>
  );
}
