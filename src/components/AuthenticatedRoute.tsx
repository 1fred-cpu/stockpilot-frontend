"use client";
import React, { useEffect, Fragment } from "react";
import { auth } from "../../utils/firebase";
import { useRouter } from "next/navigation";
export default function AuthenticatedRoute({
  children,
  redirectUrl,
}: {
  children: React.ReactNode;
  redirectUrl?: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push(redirectUrl || "/signin");
      }
    });

    return () => unsubscribe();
  }, [router]);

  return <>{children}</>;
}
