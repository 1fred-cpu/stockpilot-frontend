"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import { Separator } from "./ui/separator";
import Link from "next/link";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../../utils/supabase";
import { ClipLoader } from "react-spinners";
import { useRouter } from "next/navigation";

import useStore from "../../utils/zustand";
import axiosInstance from "../../utils/axiosInstance";

// ✅ Zod schema for validation
const signUpSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must include an uppercase letter")
    .regex(/[a-z]/, "Must include a lowercase letter")
    .regex(/\d/, "Must include a number"),
  agreeToTerms: z.literal(true, {
    error: () => ({ message: "You must agree to the terms and conditions" }),
  }),
});

// ✅ Types from Zod
type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUpForm() {
  const { setUser, clearAppStore } = useStore();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ useForm with Zod
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  function capitalizeWords(str: string): string {
    return str
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  async function onSubmit(formData: SignUpFormData) {
    try {
      setLoading(true);

      // ----------------- 1️⃣ Backend user creation -----------------
      const response = await axiosInstance.post("/auth/signup", {
        name: `${capitalizeWords(
          `${formData.firstName} ${formData.lastName}`
        )}`,
        email: formData.email,
      });
      const backendUser = response.data.user;

      // Update local state
      setUser({
        id: backendUser.id,
        name: backendUser.name,
        email: backendUser.email,
        role: backendUser.role,
        business_id: backendUser.business_id,
      });

      // ----------------- 2️⃣ Supabase signup -----------------
      const { data: supaUser, error: supaError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: "http://localhost:3000/business/register", // redirect after verification
        },
      });

      if (supaError) {
        // ----------------- 3️⃣ Rollback backend user if Supabase fails -----------------
        try {
          await axiosInstance.delete(`/users/${backendUser.id}`);
          clearAppStore();
        } catch (rollbackError) {
          console.error("Rollback failed:", rollbackError);
        }

        throw supaError; // Let outer catch handle toast
      }

      // ----------------- 4️⃣ Success -----------------
      toast.success("Account created! Check your email to verify.");
      window.localStorage.setItem("step", "VERIFY");
      router.push("/auth/verify");
    } catch (error: any) {
      // ----------------- 5️⃣ Error handling -----------------
      if (error.response) {
        const status = error.response.status;

        if (status === 429) {
          toast.error("Rate limit exceeded. Please try again later.");
        } else if (status === 409) {
          toast.error("Conflict occurred. Email or resource already exists.");
        } else if (status === 500) {
          toast.error(error.response.data?.message ?? "Server error");
        } else {
          toast.error(error.response.data?.message ?? error.message);
        }
      } else {
        // Supabase errors or network issues
        toast.error(error.message ?? "Unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  }

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
      window.localStorage.setItem("step", "REGISTER_BUSINESS");
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        toast.error("Email already in use.");
      } else if (error.code === "auth/too-many-requests") {
        toast.error("Too many requests. Please try again later.");
      } else {
        toast.error("Error signing up: " + error.message);
      }
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-gray-900">
          Create an account
        </h1>
        <p className="text-gray-500 text-sm">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-primary p-0 h-auto">
            Sign in
          </Link>
        </p>
      </div>

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="text-gray-700">
              First Name
            </Label>
            <Input
              id="firstName"
              type="text"
              placeholder="Bardia"
              className={`${
                errors.firstName ? "border-destructive" : "border-gray-200"
              } h-11 shadow-none`}
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs">{errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName" className="text-gray-700">
              Last Name
            </Label>
            <Input
              id="lastName"
              type="text"
              placeholder="Last Name"
              className={`${
                errors.lastName ? "border-destructive" : "border-gray-200"
              } h-11 shadow-none`}
              {...register("lastName")}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs">{errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-gray-700">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="Enter your email"
            className={`${
              errors.email ? "border-destructive" : "border-gray-200"
            } h-11 shadow-none`}
            {...register("email")}
          />
          {errors.email && (
            <p className="text-red-500 text-xs">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-gray-700">
            Enter your password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              className={`h-11 shadow-none ${
                errors.password ? "border-destructive" : "border-gray-200"
              } pr-10"`}
              {...register("password")}
            />
            <button
              type="button"
              title="Show password"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? (
                <EyeIcon className="h-5 w-5" />
              ) : (
                <EyeOffIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-500 text-xs">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Controller
            name="agreeToTerms"
            control={control}
            rules={{ required: "You must agree to the terms" }}
            render={({ field }) => (
              <Checkbox
                id="terms"
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            )}
          />
          <Label htmlFor="terms" className="text-xs text-gray-500">
            I agree to the{" "}
            <Link
              href="/signin"
              className="text-primary p-0 h-auto underline text-xs"
            >
              terms & conditions
            </Link>
          </Label>
        </div>
        {errors.agreeToTerms && (
          <p className="text-red-500 text-xs">{errors.agreeToTerms.message}</p>
        )}

        <Button
          type="submit"
          className="w-full h-11 text-white"
          disabled={loading}
        >
          {loading ? (
            <>
              <ClipLoader size={18} color="#ffffff" /> Creating account
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <Separator className="flex-1" />
        <span className="text-gray-500 text-sm">Or register with</span>
        <Separator className="flex-1" />
      </div>

      {/* Social Login */}
      <div className="grid grid-cols-1 gap-3">
        <Button
          type="button"
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
