"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useEffect, useState } from "react";

import currency from "currency-codes";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import axios from "axios";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../utils/firebase";
import { useRouter } from "next/navigation";
import { ClipLoader } from "react-spinners";

const allCurrencies = currency.codes().map((code) => {
  const c = currency.code(code);
  return {
    code: c?.code,
    currency: c?.currency,
    number: c?.number,
    countries: c?.countries,
  };
});

type FormData = {
  storeName: string;
  businessType: string;
  contactPhone: string;
  location: string;
  contactEmail: string;
  currency: string;
};

export default function OnboardingPage() {
  const [ownerId, setOwnerId] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>(""); // ✅ preview cache
  const [formData, setFormData] = useState<FormData>({
    storeName: "",
    businessType: "",
    contactPhone: "",
    location: "",
    contactEmail: "",
    currency: "USD",
  });
  const router = useRouter();

  // ✅ Only run once, don’t attach listener on every render
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setOwnerId(user.uid);
    });
    return () => unsubscribe();
  }, []);

  function handleInputOnChange(event: React.ChangeEvent<HTMLInputElement>) {
    setFormData((prev) => ({
      ...prev,
      [event.target.name]: event.target.value,
    }));
  }

  function formValidation() {
    const storeNameRegex = /^[a-zA-Z0-9\s\-']{2,}$/;
    const businessTypeRegex = /^[a-zA-Z\s\-']{2,}$/;
    const locationRegex = /^[a-zA-Z0-9\s,\-']{2,}$/;
    const phoneRegex = /^\+?\d{7,15}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    let isValid = true;

    if (!formData.currency) {
      toast.error("Currency is required.");
      isValid = false;
    }
    if (!file) {
      toast.error("Logo file is required.");
      isValid = false;
    }
    if (!emailRegex.test(formData.contactEmail)) {
      toast.error("Invalid email format.");
      isValid = false;
    }
    if (!storeNameRegex.test(formData.storeName)) {
      toast.error("Invalid store name format.");
      isValid = false;
    }
    if (!businessTypeRegex.test(formData.businessType)) {
      toast.error("Invalid business type format.");
      isValid = false;
    }
    if (!locationRegex.test(formData.location)) {
      toast.error("Invalid location format.");
      isValid = false;
    }
    if (!phoneRegex.test(formData.contactPhone)) {
      toast.error("Invalid contact phone format.");
      isValid = false;
    }

    return isValid;
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    setLoading(true);
    event.preventDefault();

    if (!formValidation()) {
      setLoading(false);
      return;
    }

    handleStoreCreation(formData);
  }

  async function handleStoreCreation(formData: FormData) {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/stores`,
        {
          formData: {
            ...formData,
            ownerId,
            finishedOnboarding: true,
          },
          file,
        },
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const data = response.data;
      if (data) {
        setLoading(false);
        router.push("/dashboard/overview");
      }
    } catch (error: any) {
      setLoading(false);
      if (error.response?.status === 409) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 400) {
        toast.error(error.response.data.message);
      } else if (error.response?.status === 500) {
        toast.error(
          error.response?.data.message ||
            "An error occurred while creating the store."
        );
      } else {
        toast.error(error.message || "An unexpected error occurred.");
      }
    }
  }

  // ✅ Handles file selection + preview
  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0];
    const ONE_MB = 1 * 1024 * 1024;

    if (selectedFile && selectedFile.size > ONE_MB) {
      toast.error("File size exceeds 1MB.");
      return;
    }

    setFile(selectedFile || null);

    if (selectedFile) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);

      // cleanup old blob url
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl("");
    }
  }

  return (
    <main className="p-4 flex items-center justify-center min-h-screen bg-gray-200">
      <Card className="w-full max-w-2xl border-0 shadow-none">
        <CardHeader className="mb-4">
          <CardTitle>
            <h1 className="text-2xl text-center">Set up your store</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {/* Upload logo field */}
            <div className="flex items-center gap-4 mb-8">
              <Avatar className="w-18 h-18">
                <AvatarImage
                  src={previewUrl}
                  loading="lazy"
                  className="object-cover"
                />
                <AvatarFallback>DD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2.5">
                <Label
                  htmlFor="upload"
                  className="bg-accent rounded-md w-fit p-2 hover:bg-accent/80 cursor-pointer border"
                >
                  Upload logo
                </Label>
                <Input
                  type="file"
                  className="hidden"
                  id="upload"
                  onChange={handleFileChange}
                />
                <span className="text-xs text-gray-500">
                  JPG, PNG or GIF. Max size 1MB.
                </span>
              </div>
            </div>

            {/* Store name field */}
            <div className="flex flex-col gap-3">
              <Label>Store name</Label>
              <Input
                type="text"
                required
                autoFocus
                name="storeName"
                onChange={handleInputOnChange}
                placeholder="Enter your store name"
                className="text-sm h-12 shadow-none"
              />
            </div>

            {/* Business type field */}
            <div className="flex flex-col gap-3 mt-6">
              <Label>Business Type</Label>
              <Input
                type="text"
                required
                name="businessType"
                onChange={handleInputOnChange}
                placeholder="Enter business type"
                className="text-sm h-12 shadow-none"
              />
            </div>

            {/* Email field */}
            <div className="flex flex-col gap-3 mt-6">
              <Label>Contact email</Label>
              <Input
                type="email"
                required
                name="contactEmail"
                onChange={handleInputOnChange}
                placeholder="Enter your email"
                className="text-sm h-12 shadow-none"
              />
            </div>

            {/* Contact phone field */}
            <div className="flex flex-col gap-3 mt-6">
              <Label>Contact phone</Label>
              <Input
                type="tel"
                required
                name="contactPhone"
                pattern="^\+?\d{7,15}$"
                onChange={handleInputOnChange}
                placeholder="e.g. +12345678901"
                className="text-sm h-12 shadow-none"
                inputMode="tel"
                autoComplete="tel"
              />
            </div>

            {/* Location field */}
            <div className="flex flex-col gap-3 mt-6">
              <Label>Location</Label>
              <Input
                type="text"
                required
                name="location"
                onChange={handleInputOnChange}
                placeholder="Enter your location"
                className="text-sm h-12 shadow-none"
              />
            </div>

            {/* Currency field */}
            <div className="flex flex-col gap-3 mt-6">
              <Label>Currency</Label>
              <Select
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, currency: value }))
                }
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="USD" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {allCurrencies.map((currency) => (
                      <SelectItem
                        key={currency.code}
                        value={currency.code ?? ""}
                      >
                        {currency.code}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="flex mt-6 md:justify-end">
              <Button
                className="w-full md:w-fit"
                type="submit"
                disabled={loading}
              >
                {loading ? <ClipLoader size={18} color="white" /> : "Continue"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
