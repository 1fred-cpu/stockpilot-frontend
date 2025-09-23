"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import Spinner from "./Spinner";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import axiosInstance from "../../utils/axiosInstance";
import { toast } from "sonner";

/// ✅ Validation schema
const schema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Please enter a valid email"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must include at least one uppercase letter")
    .regex(/[0-9]/, "Password must include at least one number")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must include at least one special character"
    ),
});

type FormData = z.infer<typeof schema>;

export default function AcceptInvitePage() {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const params = useSearchParams();
  const token = params.get("token");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    if (!token) {
      console.log(params);
      toast.error("Invalid or missing token");
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.post(
        `/stores/accept-invite?token=${token}`,
        data
      );
      if (response.status === 201) {
        // Redirect to login or dashboard after successful account setup
        router.push("/auth/signin");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to accept invite");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[url('/images/warehouse-manager-calling-logistics-office-asking-about-inventory-report-african-american-storehouse-workers-team-looking-stock-information-tablet-talking-telephone.jpg')] bg-cover bg-center bg-no-repeat px-4">
      {/* 🔹 Dark backdrop filter overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.8,
          ease: [0.25, 0.1, 0.25, 1], // smooth cubic bezier
          delay: 0.5,
        }}
        className="relative z-10 w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold text-foreground">
              Welcome to StockPilot
            </CardTitle>
            <CardDescription>
              Complete your account setup to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoFocus
                  placeholder="john@example.com"
                  {...register("email")}
                  className="mt-2"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Name */}
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Appleseed"
                  {...register("name")}
                  className="mt-2"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-2">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Submit */}
              <Button type="submit" disabled={loading} className="w-full mt-4">
                {loading ? (
                  <>
                    <Spinner /> Setting up...
                  </>
                ) : (
                  "Set Up Account"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
